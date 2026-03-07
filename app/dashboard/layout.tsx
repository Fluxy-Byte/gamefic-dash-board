"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { AppProvider, useAppContext } from "@/app/services/context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
             {children}
          </div>
        </AppProvider>
      </SidebarProvider>
    </AuthProvider>
  )
}
