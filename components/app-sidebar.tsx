"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Megaphone,
  Cog,
  LogOut,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const baseMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campaign",
    url: "/dashboard/campaign",
    icon: Megaphone,
  },
]

const adminMenuItems = [
  {
    title: "Configurações",
    url: "/dashboard/configurations",
    icon: Cog,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  
  const isAdmin = session?.user?.role === "admin"
  const menuItems = isAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <Sidebar className="border-r border-purple-500/20">
      <SidebarHeader className="border-b border-purple-500/10 px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Develop</p>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className={`rounded-lg transition-all px-3 py-2.5 ${
                      pathname === item.url 
                        ? "bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white shadow-lg shadow-purple-500/20 font-semibold" 
                        : "text-foreground hover:bg-purple-500/10 hover:text-foreground"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-purple-500/10 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-purple-500/10 px-3 py-2.5 h-auto rounded-lg">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start text-left min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.name || "Usuário"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
