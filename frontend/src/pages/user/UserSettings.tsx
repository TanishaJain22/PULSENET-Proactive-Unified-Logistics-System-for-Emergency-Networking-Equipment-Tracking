import { Settings, Bell, Lock, Palette, Globe, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog"

export default function UserSettings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

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

  const settingGroups = [
    { icon: Bell, title: "Notifications", description: "Manage alert preferences and notification channels" },
    { icon: Lock, title: "Privacy & Security", description: "Password, two-factor authentication, data sharing" },
    { icon: Palette, title: "Appearance", description: "Theme, language, and display preferences" },
    { icon: Globe, title: "Language & Region", description: "Set your preferred language and region" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your account preferences</p>
      </div>

      <div className="grid gap-2">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-card rounded-lg border border-border p-3.5 flex items-center gap-3 hover:bg-accent/30 transition-colors cursor-pointer">
            <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <group.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{group.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
            </div>
            <span className="text-muted-foreground text-xs">→</span>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <Settings className="size-8 text-muted-foreground mx-auto mb-2 opacity-50 animate-spin" style={{ animationDuration: "8s" }} />
        <p className="text-sm text-muted-foreground">Detailed settings coming soon</p>
      </div>

      {/* Logout Section */}
      <div className="bg-card rounded-lg border border-red-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <LogOut className="size-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-900">Logout</p>
              <p className="text-xs text-red-600 mt-0.5">Sign out of your account</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  )
}
