import { Link } from '@tanstack/react-router'
import {
  AtSign,
  Cloud,
  Copy,
  Database,
  LayoutDashboard,
  Server,
  Shuffle,
  User,
  type LucideIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import type { Role } from '@/lib/auth'
import logo from '@/assets/kowabunga.png'

type NavItem = { title: string; to: string; icon: LucideIcon }

// Add new pages here.
const NAV: { label: string; roles: Role[]; items: NavItem[] }[] = [
  {
    label: 'Overview',
    roles: ['user', 'projectAdmin', 'superAdmin'],
    items: [
      { title: 'Dashboard', to: '/', icon: LayoutDashboard },
      { title: 'Account', to: '/user', icon: User },
    ],
  },
  {
    label: 'Project',
    roles: ['user', 'projectAdmin', 'superAdmin'],
    items: [
      { title: 'Kompute Instances', to: '/kompute', icon: Copy },
      { title: 'Kylo Elastic Volumes', to: '/kylo', icon: Database },
      { title: 'Kawaii Gateways', to: '/kawaii', icon: Cloud },
      { title: 'Konvey Load Balancers', to: '/konvey', icon: Shuffle },
      { title: 'Kiwi DNS Records', to: '/records', icon: AtSign },
    ],
  },
  {
    label: 'Infrastructure',
    roles: ['superAdmin'],
    items: [{ title: 'Kaktus Hypervisors', to: '/kaktus', icon: Server }],
  },
]

export function AppSidebar() {
  const { role } = useAuth()
  // on small screens the sidebar is an overlay: close it once a page is picked
  const { isMobile, setOpenMobile } = useSidebar()
  const closeOnMobile = () => isMobile && setOpenMobile(false)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" onClick={closeOnMobile}>
                <img src={logo} alt="" className="size-8" />
                <span className="font-semibold">Kowabunga</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV.filter((g) => g.roles.includes(role)).map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        to={item.to}
                        activeOptions={{ exact: true }}
                        activeProps={{ 'data-active': true }}
                        onClick={closeOnMobile}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
