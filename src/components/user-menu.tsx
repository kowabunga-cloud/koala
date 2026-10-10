import { useQueryClient } from '@tanstack/react-query'
import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { jwtDecode } from 'jwt-decode'
import { useLogout } from '@/api/generated/endpoints/user/user'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { auth } from '@/lib/auth'

export function UserMenu() {
  const { token, role } = useAuth()
  const { setTheme } = useTheme()
  const queryClient = useQueryClient()
  const email = token ? (jwtDecode<{ email?: string }>(token).email ?? '') : ''

  const logout = useLogout({
    mutation: {
      meta: { silent: true },
      // invalidate the server-side session, then drop the local one whatever happened
      onSettled: () => {
        auth.logout()
        queryClient.clear()
      },
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account">
          <Avatar className="size-8">
            <AvatarFallback>{email.slice(0, 2).toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate text-sm font-medium">{email}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('light')}><Sun /> Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}><Moon /> Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}><Monitor /> System</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate()}><LogOut /> Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
