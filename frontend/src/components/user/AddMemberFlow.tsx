import { useState } from "react"
import { type PermissionTier, getPermissionLabel, getAvatarForRelationship } from "@/data/userData"
import { GradientButton } from "@/components/ui/gradient-button"

type Step = 1 | 2 | 3

const PERMISSION_DESC: Record<PermissionTier, string> = {
  "notify": "Receives alerts when emergency triggered. Cannot view medical details.",
  "tracking": "Everything in Notify + live ambulance tracking during emergencies.",
  "full-access": "Everything in Tracking + can view profile and trigger SOS on your behalf.",
}

const RELATIONSHIPS = ["Father", "Mother", "Spouse", "Brother", "Sister", "Son", "Daughter", "Other"]

export default function AddMemberFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<PermissionTier>("notify")

  const canNext1 = name.trim() && relationship && phone.trim()

  return (
    <div className="bg-card rounded-lg border-2 border-[#064E3B]/30 p-4 mb-4 shadow-lg shadow-[#064E3B]/5" id="add-member-flow">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-4">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === s ? "bg-[#064E3B] text-white" :
              step > s ? "bg-[#064E3B]/20 text-[#064E3B]" :
              "bg-muted text-muted-foreground"
            }`}>
              {step > s ? "✓" : s}
            </span>
            <span className={`text-[11px] font-medium ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
              {s === 1 ? "Details" : s === 2 ? "Permissions" : "Confirm"}
            </span>
            {s < 3 && <span className="text-muted-foreground mx-1">→</span>}
          </div>
        ))}
        <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={onClose}>✕</button>
      </div>

      {/* Step 1 — Details */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Full Name *</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-input px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Relationship *</label>
            <select
              value={relationship} onChange={(e) => setRelationship(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-input px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
            >
              <option value="">Select...</option>
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Phone *</label>
            <input
              value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-input px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Email</label>
            <input
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-input px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
              placeholder="email@gmail.com"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end pt-1">
            <GradientButton
              variant="variant"
              disabled={!canNext1}
              onClick={() => setStep(2)}
              className="w-auto h-8 text-xs min-w-0 px-6 py-0 flex items-center justify-center font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </GradientButton>
          </div>
        </div>
      )}

      {/* Step 2 — Permissions */}
      {step === 2 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            {(["notify", "tracking", "full-access"] as PermissionTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => setPermission(tier)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  permission === tier ? "border-[#064E3B] bg-[#064E3B]/5" : "border-border hover:bg-accent/30"
                }`}
              >
                <p className="text-xs font-semibold mb-1">{getPermissionLabel(tier)}</p>
                <p className="text-[10px] text-muted-foreground leading-snug">{PERMISSION_DESC[tier]}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            <span className="font-medium text-foreground">{name}</span> will be able to: {PERMISSION_DESC[permission].toLowerCase()}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:underline">← Back</button>
            <GradientButton 
              variant="variant" 
              onClick={() => setStep(3)} 
              className="w-auto h-8 text-xs min-w-0 px-6 py-0 flex items-center justify-center font-bold"
            >
              Next →
            </GradientButton>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
            <div>
              <span className="text-[10px] text-muted-foreground">Name</span>
              <p className="text-xs font-medium">{name}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Relationship</span>
              <p className="text-xs font-medium">{relationship}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Phone</span>
              <p className="text-xs font-medium">{phone}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Email</span>
              <p className="text-xs font-medium">{email || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Permission</span>
              <p className="text-xs font-medium text-[#064E3B]">{getPermissionLabel(permission)}</p>
            </div>
            <div className="flex items-end">
              <img
                src={getAvatarForRelationship(relationship, "male")}
                alt="Avatar preview"
                className="size-10 rounded-full bg-card border border-border object-cover"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(2)} className="text-xs text-muted-foreground hover:underline">← Back</button>
            <GradientButton
              variant="variant"
              onClick={onClose}
              className="w-auto h-8 text-xs min-w-0 px-6 py-0 flex items-center justify-center font-bold"
            >
              Send Invite
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  )
}
