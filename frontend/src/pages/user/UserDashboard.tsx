import { useNavigate, Link } from "react-router-dom"
import FamilyRoomPreview from "@/components/user/FamilyRoomPreview"
import SchemeCard from "@/components/user/SchemeCard"
import { HeartWidget } from "@/components/HeartWidget"
import {
  mockUser,
  mockSchemes,
  schemeCategories,
} from "@/data/userData"

export default function UserDashboard() {
  const navigate = useNavigate()
  const eligibleSchemes = mockSchemes.filter((s) => s.isEligible)
  const newSchemesCount = mockSchemes.filter((s) => s.isNew).length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Welcome Strip ────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div>
          <span className="text-3xl font-bold tracking-tight">Welcome back, {mockUser.firstName}</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* ── Hero Row: Two Columns ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Family Room */}
        <div>
          <FamilyRoomPreview />
        </div>

        {/* Right — Government Schemes */}
        <div className="bg-card rounded-lg border border-border p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold tracking-tight">Schemes For You</h3>
            <button onClick={() => navigate("/user/schemes")} className="text-[11px] text-[#064E3B] font-medium hover:underline">
              View All →
            </button>
          </div>

          {mockUser.profileCompletion >= 50 ? (
            <>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1" style={{ scrollbarWidth: "thin" }}>
                {eligibleSchemes.slice(0, 3).map((scheme, i) => (
                  <SchemeCard key={scheme.id} scheme={scheme} index={i} />
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground">
                  🆕 {newSchemesCount} new scheme{newSchemesCount !== 1 ? "s" : ""} this month ·{" "}
                  <button onClick={() => navigate("/user/schemes")} className="text-[#064E3B] hover:underline">See updates →</button>
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <p className="text-[13px] font-medium mb-1">Discover eligible schemes</p>
              <p className="text-[11px] text-muted-foreground mb-3 max-w-[240px]">
                Profile completion required to match with government health schemes
              </p>
              <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#064E3B] rounded-full" style={{ width: `${mockUser.profileCompletion}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Contact support for profile assistance</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Four Compact Widgets ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1 — Health Summary */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h4 className="text-sm font-semibold mb-2">Health Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profile Status:</span>
              <span className="font-semibold text-green-600">{mockUser.profileCompletion}% Complete</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Sections:</span>
              <span className="font-semibold">{mockUser.completedSections}/{mockUser.totalSections}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Health data managed securely</p>
        </div>

        {/* Widget 2 — Health Insights */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h4 className="text-sm font-semibold mb-2">Health Insights</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">AI Health Score:</span>
              <span className="font-semibold text-blue-600">85/100</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Risk Level:</span>
              <span className="font-semibold text-green-600">Low</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/user/ai-health")} 
            className="text-xs text-[#064E3B] font-medium hover:underline mt-2"
          >
            View Details →
          </button>
        </div>

        {/* Widget 3 — 3D Heart Analytics */}
        <div className="cursor-pointer" onClick={() => navigate("/user/health-3d")}>
          <HeartWidget heartRate={72} />
        </div>

        {/* Widget 4 — Doctor Consultation */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h4 className="text-sm font-semibold mb-2">🩺 Doctor Consultation</h4>
          <p className="text-xs text-muted-foreground mb-2">Find top doctors in Indore</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Available now:</span>
              <span className="font-semibold text-green-600">20+ doctors</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Video consultation:</span>
              <span className="font-semibold text-blue-600">✓ Available</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/user/doctors")} 
            className="w-full mt-3 text-xs font-medium px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Find Doctors →
          </button>
        </div>
      </div>
    </div>
  )
}
