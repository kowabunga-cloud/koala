import { Navigate, Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { ScopeSwitcher } from '@/components/scope-switcher'
import { UserMenu } from '@/components/user-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { auth } from '@/lib/auth'

// Authenticated shell: every route under _app/ requires a valid session.
export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location }) => {
    if (!auth.isAuthenticated()) throw redirect({ to: '/login', search: { redirect: location.href } })
  },
  component: AppLayout,
})

function AppLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex min-h-14 flex-wrap items-center gap-2 border-b bg-background px-4 py-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <ScopeSwitcher />
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
