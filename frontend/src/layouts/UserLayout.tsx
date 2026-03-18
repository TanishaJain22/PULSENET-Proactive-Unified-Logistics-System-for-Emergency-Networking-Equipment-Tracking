import * as React from "react"
import { NavLink, Link, useLocation, Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Brain,
  Heart,
  AlertTriangle,
  Syringe,
  Sparkles,
  FileText,
  CreditCard,
  Search,
  Watch,
  Activity,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mockUser, mockFamilyMembers, mockSchemes } from "@/data/userData"
import { useAuth } from "@/contexts/AuthContext"
import { ZoomProvider } from "@/contexts/ZoomContext"
import { useZoom } from "@/hooks/useZoom"
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog"

// ─── Profile Progress Ring ─────────────────────────────────────────
function ProgressRing({ percent, size = 28 }: { percent: number; size?: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color = percent > 80 ? "#22c55e" : percent >= 50 ? "#f59e0b" : "#ef4444"

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border opacity-30" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-500"
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-foreground" style={{ fontSize: "8px", fontWeight: 600 }}>
        {percent}%
      </text>
    </svg>
  )
}

// ─── Sidebar Nav Link ──────────────────────────────────────────────
interface SidebarLinkProps {
  to: string
  icon: React.ComponentType<any>
  children: React.ReactNode
  badge?: React.ReactNode
  tinted?: boolean
}

function SidebarNavLink({ to, icon: Icon, children, badge, tinted }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative",
          isActive
            ? "bg-[#064E3B] text-white shadow-md hover:bg-[#001a12] hover:text-white"
            : "text-sidebar-foreground",
          tinted && !isActive && "bg-[#064E3B]/8"
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{children}</span>
      {badge}
    </NavLink>
  )
}

// ─── Mobile Bottom Tab ─────────────────────────────────────────────
function BottomTab({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<any>; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-medium transition-colors",
          isActive ? "text-[#064E3B]" : "text-muted-foreground"
        )
      }
    >
      <Icon className="size-5" />
      <span>{label}</span>
    </NavLink>
  )
}

// ─── Main Layout ───────────────────────────────────────────────────
export default function UserLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const { zoom, zoomPercentage, increaseZoom, decreaseZoom, resetZoom, canIncrease, canDecrease } = useZoom()
  const user = mockUser
  const familyCount = mockFamilyMembers.length
  const newSchemes = mockSchemes.filter((s) => s.isNew).length

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutDialog(false)
    navigate("/login")
  }

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false)
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes("dashboard")) return "Dashboard"
    if (path.includes("family")) return "My Family Network"
    if (path.includes("schemes")) return "Gov Health Schemes"
    if (path.includes("settings")) return "Settings"
    if (path.includes("ai-health")) return "AI Health"
    if (path.includes("health-3d")) return "3D Heart Analytics"
    if (path.includes("mindspace")) return "Mental Wellness"
    if (path.includes("emergency")) return "Emergency"
    if (path.includes("vaccination")) return "Vaccination"
    if (path.includes("lab-results")) return "Lab Results"
    if (path.includes("insurance")) return "Insurance"
    if (path.includes("doctors")) return "Find Doctors"
    if (path.includes("wearable")) return "Wearable Devices"
    if (path.includes("fitness")) return "Fitness Hub"
    return "User Portal"
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Profile block */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-sidebar-border">
        <div className="size-9 rounded-full bg-[#064E3B]/20 flex items-center justify-center text-[#064E3B] font-bold text-sm shrink-0">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{user.firstName} {user.lastName}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Patient</p>
        </div>
        <ProgressRing percent={user.profileCompletion} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 pt-3">
        <SidebarNavLink to="/user/dashboard" icon={LayoutDashboard}>
          Dashboard
        </SidebarNavLink>

        <SidebarNavLink
          to="/user/family"
          icon={Users}
          tinted
          badge={
            familyCount === 0 ? (
              <span className="size-2 rounded-full bg-red-500 absolute top-2 right-2" />
            ) : undefined
          }
        >
          My Family Network
        </SidebarNavLink>

        <SidebarNavLink
          to="/user/schemes"
          icon={Shield}
          badge={
            newSchemes > 0 ? (
              <span className="ml-auto inline-flex items-center justify-center size-5 rounded-full bg-[#064E3B] text-white text-[10px] font-bold">
                {newSchemes}
              </span>
            ) : undefined
          }
        >
          Gov Health Schemes
        </SidebarNavLink>



        <SidebarNavLink to="/user/lab-results" icon={FileText}>
          Lab Results
        </SidebarNavLink>

        <SidebarNavLink to="/user/vaccination" icon={Syringe}>
          Vaccination
        </SidebarNavLink>

        <SidebarNavLink to="/user/insurance" icon={CreditCard}>
          Insurance
        </SidebarNavLink>

        <SidebarNavLink to="/user/doctors" icon={Search}>
          Find Doctors
        </SidebarNavLink>

        <SidebarNavLink to="/user/ai-health" icon={Brain}>
          AI Health
        </SidebarNavLink>

        <SidebarNavLink to="/user/health-3d" icon={Heart}>
          3D Heart Analytics
        </SidebarNavLink>

        <SidebarNavLink to="/user/mindspace" icon={Sparkles}>
          Mental Wellness
        </SidebarNavLink>

        <SidebarNavLink to="/user/wearable" icon={Watch}>
          Wearable Devices
        </SidebarNavLink>

        <SidebarNavLink to="/user/fitness" icon={Activity}>
          Fitness Hub
        </SidebarNavLink>

        <SidebarNavLink to="/user/emergency" icon={AlertTriangle}>
          Emergency
        </SidebarNavLink>
      </nav>

      {/* Settings and Logout at bottom */}
      <div className="border-t border-sidebar-border px-3 py-2 space-y-1">
        <SidebarNavLink to="/user/settings" icon={Settings}>
          Settings
        </SidebarNavLink>
        
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 text-sidebar-foreground w-full text-left"
        >
          <LogOut className="size-4 shrink-0" />
          <span className="flex-1">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <ZoomProvider value={{ zoom, zoomPercentage, increaseZoom, decreaseZoom, resetZoom, canIncrease, canDecrease }}>
      <div className="relative min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-[240px] border-r border-sidebar-border bg-sidebar md:block z-40">
        {sidebarContent}
      </aside>

      <div className="flex flex-1 flex-col md:pl-[240px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-5 shadow-sm">
          <h1 className="text-sm font-semibold tracking-tight">{getPageTitle()}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="size-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-5 bg-slate-50/50 dark:bg-zinc-950 min-h-[calc(100vh-48px)] pb-20 md:pb-5">
          <div className="mx-auto max-w-7xl" style={{ zoom: 1.1 }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <BottomTab to="/user/dashboard" icon={LayoutDashboard} label="Home" />
        <BottomTab to="/user/doctors" icon={Search} label="Doctors" />
        <BottomTab to="/user/emergency" icon={AlertTriangle} label="Emergency" />
        <BottomTab to="/user/ai-health" icon={Brain} label="AI Health" />
        <BottomTab to="/user/settings" icon={Settings} label="Settings" />
      </nav>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </div>
    </ZoomProvider>
  )
}
