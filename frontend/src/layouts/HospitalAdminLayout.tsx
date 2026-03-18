import * as React from "react"
import { NavLink, useLocation, useParams, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Boxes,
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  Bell,
  Menu,
  Sparkles,
  ChevronRight,
  Users,
  User,
  ClipboardCheck,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { ZoomProvider } from "@/contexts/ZoomContext"
import { toast } from "sonner"
import { useZoom } from "@/hooks/useZoom"
import { ZoomControls } from "@/components/ZoomControls"

interface SidebarLinkProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onClick?: () => void
}

function SidebarLink({ to, icon: IconComponent, children, onClick }: SidebarLinkProps) {
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
      <IconComponent className="size-4 shrink-0" />
      <span>{children}</span>
      <ChevronRight className="ml-auto size-3 opacity-0 transition-opacity group-hover:opacity-100" />
    </NavLink>
  )
}

export default function HospitalAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [currentHospitalName, setCurrentHospitalName] = React.useState("Loading...")
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const hospitalId = params.hospitalId
  const { user, logout } = useAuth()
  const { zoom, zoomPercentage, increaseZoom, decreaseZoom, resetZoom, canIncrease, canDecrease } = useZoom()

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    navigate("/login")
  }
  // Fetch hospital details
  React.useEffect(() => {
    if (hospitalId) {
      fetch(`http://localhost:8080/api/hospitals/${hospitalId}`)
        .then(response => {
          if (response.ok) {
            return response.json()
          }
          throw new Error('Failed to fetch hospital details')
        })
        .then((hospital: any) => {
          // The API returns the Hospital entity directly
          setCurrentHospitalName(hospital.name || "Unknown Hospital")
        })
        .catch(error => {
          console.error('Error fetching hospital details:', error)
          setCurrentHospitalName("Unknown Hospital")
        })
    }
  }, [hospitalId])

  // If no hospitalId in URL, show error
  if (!hospitalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">Hospital ID not found in URL</p>
        </div>
      </div>
    )
  }

  // Map route to title
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes("dashboard")) return "Hospital Dashboard"
    if (path.includes("resources")) return "Resource Management"
    if (path.includes("emergencies")) return "Active Emergencies"
    if (path.includes("transfers")) return "Transfer Tracking"
    if (path.includes("records")) return "Patient Records"
    if (path.includes("doctors")) return "Doctors Management"
    if (path.includes("profile")) return "Hospital Profile"
    if (path.includes("notifications")) return "Notifications"
    if (path.includes("application-status")) return "Application Status"
    return "PulseNet"
  }

  const sidebarContent = (
    <div className="flex h-full flex-col gap-4 bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg font-bold">🏥</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-tight">PulseNet</span>
          <span className="text-[10px] text-sidebar-foreground/60 leading-none">{currentHospitalName}</span>
        </div>
      </div>

      <Separator className="bg-sidebar-border opacity-50 mx-4 w-auto" />

      <nav className="flex-1 space-y-1 px-3">
        <SidebarLink to={`/hospital/${hospitalId}/dashboard`} icon={LayoutDashboard} onClick={() => setIsMobileOpen(false)}>
          Dashboard
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/resources`} icon={Boxes} onClick={() => setIsMobileOpen(false)}>
          Resources
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/doctors`} icon={Users} onClick={() => setIsMobileOpen(false)}>
          Doctors
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/emergencies`} icon={AlertTriangle} onClick={() => setIsMobileOpen(false)}>
          Emergencies
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/transfers`} icon={ArrowLeftRight} onClick={() => setIsMobileOpen(false)}>
          Transfers
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/records`} icon={FileText} onClick={() => setIsMobileOpen(false)}>
          Patient Records
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/notifications`} icon={Bell} onClick={() => setIsMobileOpen(false)}>
          Notifications
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/profile`} icon={User} onClick={() => setIsMobileOpen(false)}>
          Profile
        </SidebarLink>
        <SidebarLink to={`/hospital/${hospitalId}/application-status`} icon={ClipboardCheck} onClick={() => setIsMobileOpen(false)}>
          Application Status
        </SidebarLink>
      </nav>

      <div className="px-3 pb-4">
        <Separator className="bg-sidebar-border opacity-50 mb-4" />
        <Button
          variant="ghost"
          onClick={() => {
            handleLogout()
            setIsMobileOpen(false)
          }}
          className="w-full justify-start gap-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Logout</span>
        </Button>
      </div>

      <div className="p-4">
        <div className="rounded-lg bg-sidebar-accent p-3 text-sidebar-accent-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-3 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Demo Mode</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            This is a functional prototype of the Healthcare Coordination Platform.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <ZoomProvider value={{ zoom, zoomPercentage, increaseZoom, decreaseZoom, resetZoom, canIncrease, canDecrease }}>
      <div className="relative min-h-screen w-full bg-background hospital-admin-layout">
        {/* Desktop Sidebar - fixed to allow root scroll */}
        <aside className="fixed left-0 top-0 hidden h-full w-[240px] border-r border-sidebar-border bg-sidebar md:block z-40">
          {sidebarContent}
        </aside>

        <div className="flex flex-1 flex-col md:pl-[240px]">
          {/* Top Bar - fixed positioning to prevent movement during zoom/scroll */}
          <header className="fixed top-0 right-0 left-0 md:left-[240px] z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-6 shadow-sm" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%` }}>
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
              <ZoomControls
                zoom={zoom}
                zoomPercentage={zoomPercentage}
                onIncrease={increaseZoom}
                onDecrease={decreaseZoom}
                onReset={resetZoom}
                canIncrease={canIncrease}
                canDecrease={canDecrease}
                className="hidden sm:flex"
              />
              <Badge variant="outline" className="hidden sm:flex border-primary text-primary bg-primary/5 px-2 py-0.5 animate-pulse">
                LIVE SYSTEM
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
                  <p className="text-xs font-medium leading-none">{user?.email || "HA User"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Hospital Admin</p>
                </div>
                <Avatar className="size-9 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">HA</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="size-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content - with proper spacing to account for fixed header */}
          <main className="flex-1 bg-slate-50/50 dark:bg-zinc-950" style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: 'top left', 
            width: `${100 / zoom}%`, 
            minHeight: `${100 / zoom}vh`,
            paddingTop: `${Math.max(64 / zoom + 24, 88)}px`, // Ensure minimum 88px top padding
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingBottom: '1.5rem'
          }}>
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ZoomProvider>
  )
}
