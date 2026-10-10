import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useLogin } from '@/api/generated/endpoints/user/user'
import { LoginBody } from '@/api/generated/zod/user/user.zod'
import { ApiError } from '@/api/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/auth'
import logo from '@/assets/kowabunga.png'

// Generated from the OpenAPI spec, tightened for the form.
const LoginForm = LoginBody.pick({ email: true, password: true }).extend({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof LoginForm>

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: ({ search }) => {
    if (auth.isAuthenticated()) throw redirect({ to: search.redirect ?? '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect: next } = Route.useSearch()
  const form = useForm<LoginForm>({ resolver: zodResolver(LoginForm) })
  const login = useLogin({
    mutation: {
      // login errors are shown inline, not as a toast
      meta: { silent: true },
      onSuccess: (creds) => {
        if (!creds.jwt) return
        auth.login(creds.jwt)
        navigate({ to: next ?? '/' })
      },
    },
  })

  const error =
    // Kahuna answers 404 for unknown users: report every credential failure the same way
    login.error instanceof ApiError && [401, 403, 404].includes(login.error.status)
      ? 'Invalid email or password.'
      : login.error?.message

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img src={logo} alt="" className="mx-auto mb-2 size-14" />
          <CardTitle className="text-xl">Kowabunga</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((data) => login.mutate({ data }))}
            noValidate
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" {...form.register('email')} />
              <FieldError message={form.formState.errors.email?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
              <FieldError message={form.formState.errors.password?.message} />
            </div>
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}
