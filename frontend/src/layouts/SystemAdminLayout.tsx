import * as React from "react"
import { NavLink, Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Hospital,
  AlertCircle,
  ArrowLeftRight,
  Activity,
  ClipboardList,
  Bell,
  Menu,
  ShieldCheck,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface SidebarLinkProps {
  to: string
  icon: React.ComponentType<any>
  children: React.ReactNode
  onClick?: () => void
}

function SidebarLink({ to, icon: Icon, children, onClick }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-[#23B5D3] text-white shadow-md hover:bg-[#1A86A0] hover:text-white"
            : "text-sidebar-foreground"
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span>{children}</span>
      <ChevronRight className="ml-auto size-3 opacity-0 transition-opacity group-hover:opacity-100" />
    </NavLink>
  )
}

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const location = useLocation()

  // Map route to title
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes("overview")) return "System Overview"
    if (path.includes("hospitals")) return "Hospitals Network"
    if (path.includes("emergencies")) return "Global Emergency Monitor"
    if (path.includes("transfers")) return "Inter-Hospital Transfers"
    if (path.includes("capacity")) return "Regional Capacity"
    if (path.includes("logs")) return "AI Intervention Logs"
    return "PulseNet Admin"
  }

  const sidebarContent = (
    <div className="flex h-full flex-col gap-4 bg-sidebar text-sidebar-foreground">
      <Link 
        to="/" 
        className="flex h-16 items-center gap-2 px-4 hover:opacity-80 transition-opacity cursor-pointer group/logo"
      >
        <img src="/logo.png" alt="PulseNet Logo" className="h-10 w-auto object-contain group-hover/logo:scale-105 transition-transform mix-blend-multiply" />
      </Link>

      <Separator className="bg-sidebar-border opacity-50 mx-4 w-auto" />

      <nav className="flex-1 space-y-1 px-3">
        <SidebarLink to="/admin/overview" icon={LayoutDashboard} onClick={() => setIsMobileOpen(false)}>
          Overview
        </SidebarLink>
        <SidebarLink to="/admin/hospitals" icon={Hospital} onClick={() => setIsMobileOpen(false)}>
          Hospitals
        </SidebarLink>
        <SidebarLink to="/admin/emergencies" icon={AlertCircle} onClick={() => setIsMobileOpen(false)}>
          Emergencies
        </SidebarLink>
        <SidebarLink to="/admin/transfers" icon={ArrowLeftRight} onClick={() => setIsMobileOpen(false)}>
          Transfers
        </SidebarLink>
        <SidebarLink to="/admin/capacity" icon={Activity} onClick={() => setIsMobileOpen(false)}>
          Capacity
        </SidebarLink>
        <SidebarLink to="/admin/logs" icon={ClipboardList} onClick={() => setIsMobileOpen(false)}>
          AI Logs
        </SidebarLink>
      </nav>

      <div className="p-4">
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-primary">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-3" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Admin Mode</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90 text-primary font-medium">
            System-level access granted. Global data is visible.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Desktop Sidebar - fixed to allow root scroll */}
      <aside className="fixed left-0 top-0 hidden h-full w-[240px] border-r border-sidebar-border bg-sidebar md:block z-40">
        {sidebarContent}
      </aside>

      <div className="flex flex-1 flex-col md:pl-[240px]">
        {/* Top Bar - sticky to stay at top during scroll */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[240px]">
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex border-primary/20 text-primary bg-primary/10 px-2 py-0.5 animate-pulse">
              SYSTEM OVERRIDE ACTIVE
            </Badge>
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-destructive"></span>
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-medium leading-none">SA Admin</p>
                <p className="text-[10px] text-muted-foreground mt-1 text-primary font-bold">Root Account</p>
              </div>
              <Avatar className="size-9 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">SA</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content - no overflow-y-auto to allow root scrolling */}
        <main className="flex-1 p-6 bg-slate-50/50 dark:bg-zinc-950 min-h-[calc(100vh-64px)]">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
