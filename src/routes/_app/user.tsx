import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { jwtDecode } from 'jwt-decode'
import { getReadUserQueryKey, useReadUser, useUpdateUser } from '@/api/generated/endpoints/user/user'
import { UpdateUserBody } from '@/api/generated/zod/user/user.zod'
import { Field, PageTitle } from '@/components/resource'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/_app/user')({
  component: AccountPage,
})

// Only email and notifications are editable by the user; the rest is sent back unchanged.
const AccountForm = UpdateUserBody.pick({ email: true, notifications: true }).extend({
  email: z.email('Enter a valid email address'),
  notifications: z.boolean(),
})
type AccountForm = z.infer<typeof AccountForm>

function AccountPage() {
  const { token } = useAuth()
  const uid = token ? (jwtDecode<{ uid?: string }>(token).uid ?? '') : ''
  const queryClient = useQueryClient()
  const { data: user, isPending } = useReadUser(uid, { query: { enabled: !!uid } })

  const form = useForm<AccountForm>({ resolver: zodResolver(AccountForm), defaultValues: { email: '', notifications: false } })
  useEffect(() => {
    if (user) form.reset({ email: user.email, notifications: user.notifications ?? false })
  }, [user, form])

  const update = useUpdateUser({
    mutation: {
      onSuccess: (updated) => {
        queryClient.setQueryData(getReadUserQueryKey(uid), updated)
        toast.success('Account updated')
      },
    },
  })

  return (
    <div className="grid min-w-0 gap-4">
      <PageTitle>Account</PageTitle>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 break-all">
            {isPending ? <Skeleton className="h-5 w-40" /> : user?.name}
            {user && <Badge variant="secondary">{user.role}</Badge>}
          </CardTitle>
          {user?.description && <CardDescription className="break-all">{user.description}</CardDescription>}
        </CardHeader>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => user && update.mutate({ userId: uid, data: { ...user, ...values } }))}
        >
          <CardContent className="grid gap-4">
            <dl>
              <Field label="User ID">
                <span className="font-mono text-xs break-all">{uid || '—'}</span>
              </Field>
            </dl>
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" autoComplete="email" disabled={!user} {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <label className="flex items-center justify-between gap-4 rounded-md border p-3">
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">Email notifications</span>
                <span className="text-xs text-muted-foreground">Get notified about events on your resources.</span>
              </span>
              <input type="checkbox" className="size-4 accent-primary" disabled={!user} {...form.register('notifications')} />
            </label>
          </CardContent>
          <CardFooter className="mt-4 justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={!form.formState.isDirty || update.isPending}
              onClick={() => user && form.reset({ email: user.email, notifications: user.notifications ?? false })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!user || !form.formState.isDirty || update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
