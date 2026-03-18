import { useState } from "react"
import { Pencil, Shield, Trash2 } from "lucide-react"
import {
  type FamilyMember,
  type PermissionTier,
  getPermissionLabel,
  getPermissionDots,
} from "@/data/userData"
import { GradientButton } from "@/components/ui/gradient-button"

const PERMISSION_DESC: Record<PermissionTier, string> = {
  "notify": "Receives alerts when emergency triggered. Cannot view medical details.",
  "tracking": "Everything in Notify + live ambulance tracking during emergencies.",
  "full-access": "Everything in Tracking + can view profile and trigger SOS on your behalf.",
}

export default function FamilyMemberCard({
  member,
  highlighted,
  cardRef,
}: {
  member: FamilyMember
  highlighted?: boolean
  cardRef?: React.RefObject<HTMLDivElement | null>
}) {
  const [showPermissions, setShowPermissions] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PermissionTier>(member.permissionTier)
  const dots = getPermissionDots(member.permissionTier)

  return (
    <div
      ref={cardRef}
      className={`bg-card rounded-lg border border-border p-3 transition-all duration-500 ${
        highlighted ? "border-l-[3px] border-l-[#064E3B] shadow-lg shadow-[#064E3B]/10" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Left zone — avatar + name */}
        <div className="flex items-center gap-2.5 w-[20%] min-w-[120px] shrink-0">
          <img
            src={member.avatarImage}
            alt={member.name}
            className="size-10 rounded-full bg-card border border-border object-cover"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate">{member.name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-block mt-0.5 ${
              member.relationship === "Spouse" ? "bg-pink-500/15 text-pink-400" :
              member.relationship === "Father" || member.relationship === "Mother" ? "bg-purple-500/15 text-purple-400" :
              "bg-blue-500/15 text-blue-400"
            }`}>
              {member.relationship}
            </span>
          </div>
        </div>

        {/* Middle zone — contact + verification + permission */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{member.phone} · {member.email}</p>
          <div className="flex items-center gap-3 mt-1">
            {/* Verification badge */}
            <span className={`text-[11px] flex items-center gap-1 ${
              member.verificationStatus === "verified" ? "text-green-500" : "text-amber-500"
            }`}>
              {member.verificationStatus === "verified" ? "✓ Verified" : "⏳ Pending"}
              {member.verificationStatus === "pending" && (
                <button className="text-[10px] text-[#064E3B] hover:underline ml-1">Resend</button>
              )}
            </span>

            {/* Permission dots */}
            <div className="flex items-center gap-1">
              {dots.map((active, i) => (
                <span
                  key={i}
                  className={`size-2 rounded-full ${active ? "bg-[#064E3B]" : "bg-muted"}`}
                />
              ))}
              <span className="text-[11px] text-muted-foreground ml-1">{getPermissionLabel(member.permissionTier)}</span>
            </div>
          </div>
        </div>

        {/* Right zone — actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {member.permissionTier === "full-access" && (
            <span className="text-[10px] text-[#064E3B] mr-1 hidden lg:inline">Can trigger SOS</span>
          )}
          <button className="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors" title="Edit">
            <Pencil className="size-3 text-muted-foreground" />
          </button>
          <button
            className="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
            title="Change Permission"
            onClick={() => setShowPermissions(!showPermissions)}
          >
            <Shield className="size-3 text-muted-foreground" />
          </button>
          <button className="size-7 rounded-md border border-border flex items-center justify-center hover:bg-red-500/10 transition-colors" title="Remove">
            <Trash2 className="size-3 text-red-400" />
          </button>
        </div>
      </div>

      {/* Inline permission edit */}
      {showPermissions && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-2">
            {(["notify", "tracking", "full-access"] as PermissionTier[]).map((tier) => (
              <label
                key={tier}
                className={`flex-1 cursor-pointer rounded-md border p-2 transition-colors ${
                  selectedTier === tier ? "border-[#064E3B] bg-[#064E3B]/5" : "border-border hover:bg-accent/30"
                }`}
                onClick={() => setSelectedTier(tier)}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`size-3 rounded-full border-2 flex items-center justify-center ${
                    selectedTier === tier ? "border-[#064E3B]" : "border-muted-foreground"
                  }`}>
                    {selectedTier === tier && <span className="size-1.5 rounded-full bg-[#064E3B]" />}
                  </span>
                  <span className="text-[11px] font-semibold">{getPermissionLabel(tier)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{PERMISSION_DESC[tier]}</p>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <GradientButton 
              variant="variant" 
              className="w-auto h-8 text-xs min-w-0 px-4 py-0 flex items-center justify-center font-bold"
            >
              Update
            </GradientButton>
            <button className="text-xs text-muted-foreground hover:underline" onClick={() => setShowPermissions(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
