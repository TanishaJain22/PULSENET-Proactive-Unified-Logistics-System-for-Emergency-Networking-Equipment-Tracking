import { useState, useRef, createRef } from "react"
import FamilyRoomFull from "@/components/user/FamilyRoomFull"
import FamilyMemberCard from "@/components/user/FamilyMemberCard"
import AddMemberFlow from "@/components/user/AddMemberFlow"
import { mockFamilyMembers, mockActivityLog } from "@/data/userData"
import { Link } from "react-router-dom"

export default function FamilyNetwork() {
  const [showAddFlow, setShowAddFlow] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const addFlowRef = useRef<HTMLDivElement>(null)
  const members = mockFamilyMembers

  // Create refs for each member card
  const cardRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({})
  members.forEach((m) => {
    if (!cardRefs.current[m.id]) {
      cardRefs.current[m.id] = createRef<HTMLDivElement>()
    }
  })

  const handleMemberClick = (id: string) => {
    setHighlightedId(id)
    const ref = cardRefs.current[id]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    setTimeout(() => setHighlightedId(null), 2000)
  }

  const handleAddClick = () => {
    setShowAddFlow(true)
    setTimeout(() => {
      addFlowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  // Family medical conditions
  const familyConditions = members
    .filter((m) => m.medicalConditions && m.medicalConditions.length > 0)
    .map((m) => ({ name: m.name, relationship: m.relationship, conditions: m.medicalConditions! }))

  return (
    <div className="space-y-4">
      {/* ── Section A: Family Room Visualization ──────────── */}
      <FamilyRoomFull
        onMemberClick={handleMemberClick}
        onAddClick={handleAddClick}
      />

      {/* ── Section B: Family Member Detail Cards ────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Family Members</h3>
          <span className="text-xs text-muted-foreground">{members.length} of 5 added</span>
        </div>

        {/* Add member flow (inline, pushes cards down) */}
        {showAddFlow && (
          <div ref={addFlowRef} className="scroll-mt-6">
            <AddMemberFlow onClose={() => setShowAddFlow(false)} />
          </div>
        )}

        <div className="space-y-2 mt-4">
          {members.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              highlighted={highlightedId === member.id}
              cardRef={cardRefs.current[member.id]}
            />
          ))}
        </div>

        {members.length === 0 && !showAddFlow && (
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">No family members added yet</p>
            <button
              onClick={() => setShowAddFlow(true)}
              className="text-xs font-medium bg-[#064E3B] text-white px-4 py-1.5 rounded-md hover:bg-[#001a12] transition-colors"
            >
              + Add First Member
            </button>
          </div>
        )}
      </div>

      {/* ── Section C: Family Health Overview ─────────────── */}
      <div className="bg-card rounded-lg border border-border p-3">
        <h3 className="text-sm font-semibold mb-2">Family Health Snapshot</h3>
        {familyConditions.length > 0 ? (
          <>
            <div className="space-y-1.5 mb-2">
              {familyConditions.map((fc) => (
                <div key={fc.name} className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-medium text-muted-foreground w-16 shrink-0">{fc.relationship}:</span>
                  {fc.conditions.map((c) => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{c}</span>
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-2">
              Heart disease appears in your family history — ensure regular health screenings.{" "}
              <span className="text-[#064E3B]">Contact your doctor for guidance →</span>
            </p>
            {/* Schemes for family */}
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Schemes for Family:</span>{" "}
                Father may qualify for Ayushman Bharat (Cardiac).{" "}
                <Link to="/user/schemes" className="text-[#064E3B] hover:underline">View →</Link>
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Add family medical history for health insights.{" "}
            <span className="text-[#064E3B]">Contact support for assistance →</span>
          </p>
        )}
      </div>

      {/* ── Section D: Family Activity Log ───────────────── */}
      <div className="bg-card rounded-lg border border-border p-3">
        <h3 className="text-[13px] font-semibold mb-2">Recent Activity</h3>
        <div className="space-y-1.5">
          {mockActivityLog.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{entry.message}</span>
              <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-2">{entry.relativeTime}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
