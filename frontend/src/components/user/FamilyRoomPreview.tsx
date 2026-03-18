import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { mockUser, mockFamilyMembers, type FamilyMember, getPermissionLabel } from "@/data/userData"

// ─── Avatar Positions (compact room) ────────────────────────────────
const POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 65, y: 55 }],
  2: [{ x: 35, y: 55 }, { x: 70, y: 55 }],
  3: [{ x: 25, y: 55 }, { x: 75, y: 55 }, { x: 50, y: 32 }],
  4: [{ x: 20, y: 52 }, { x: 42, y: 60 }, { x: 62, y: 60 }, { x: 80, y: 52 }],
  5: [{ x: 18, y: 50 }, { x: 35, y: 60 }, { x: 65, y: 60 }, { x: 82, y: 50 }, { x: 50, y: 30 }],
}

const TIER_BORDER: Record<string, string> = {
  "notify": "border-gray-400/60",
  "tracking": "border-green-400/60",
  "full-access": "border-[#064E3B]",
}

function AvatarTooltip({ member }: { member: FamilyMember }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border border-border rounded-lg p-2 shadow-xl z-30 w-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <p className="text-[11px] font-semibold">{member.name}</p>
      <p className="text-[10px] text-muted-foreground">{member.relationship}</p>
      <div className="h-px bg-border my-1" />
      <div className="flex items-center gap-1.5">
        <span className={`size-1.5 rounded-full ${member.verificationStatus === "verified" ? "bg-green-500" : "bg-amber-500"}`} />
        <span className="text-[10px] capitalize">{member.verificationStatus}</span>
      </div>
      <p className="text-[10px] text-[#064E3B] font-medium mt-0.5">{getPermissionLabel(member.permissionTier)}</p>
    </div>
  )
}

function RoomAvatar({
  member,
  x, y,
  isUser,
}: {
  member?: FamilyMember
  x: number
  y: number
  isUser?: boolean
}) {
  const name = isUser ? mockUser.firstName : member!.name.split(" ")[0]
  const avatarSrc = isUser ? mockUser.avatarImage : member!.avatarImage
  const size = isUser ? 52 : 44

  return (
    <div
      className="absolute group flex flex-col items-center"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      {member && <AvatarTooltip member={member} />}

      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[10px] font-medium text-white drop-shadow-md">{name}</span>
        {isUser ? (
          <span className="size-1.5 rounded-full bg-green-500" />
        ) : (
          <span className={`size-1.5 rounded-full ${member!.verificationStatus === "verified" ? "bg-green-500" : "bg-amber-500"}`} />
        )}
      </div>

      <img
        src={avatarSrc}
        alt={name}
        className="transition-transform group-hover:scale-110 object-contain drop-shadow-md"
        style={{ width: size, height: size }}
      />

      {member && (
        <span className="text-[9px] text-white/80 mt-0.5 drop-shadow-sm">{member.relationship}</span>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export default function FamilyRoomPreview() {
  const navigate = useNavigate()
  const members = mockFamilyMembers
  const count = members.length
  const positions = POSITIONS[count] || []
  const verified = members.filter((m) => m.verificationStatus === "verified").length

  return (
    <div className="bg-card rounded-lg border border-primary/50 overflow-hidden animate-teal-glow shadow-lg shadow-primary/10">
      {/* Room visualization */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(220px, 32vw, 320px)" }}
      >
        {/* Background image */}
        <img
          src="/room-bg.png"
          alt="Family room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/20" />

        {/* User avatar (center) */}
        <RoomAvatar isUser x={50} y={55} />

        {/* Family members */}
        {members.map((member, i) => (
          positions[i] && (
            <RoomAvatar key={member.id} member={member} x={positions[i].x} y={positions[i].y} />
          )
        ))}

        {/* Add Member button */}
        {count < 5 && (
          <button
            onClick={() => navigate("/user/family")}
            className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#064E3B] text-white rounded-full pl-1.5 pr-2.5 py-1 text-[10px] font-medium hover:bg-[#001a12] transition-colors shadow-lg z-10"
          >
            <Plus className="size-3" />
            <span className="hidden sm:inline">Add</span>
          </button>
        )}

        {/* Empty state */}
        {count === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
            <p className="text-sm text-white/80 mb-1">Your family room is empty</p>
            <p className="text-xs text-white/60 mb-3">Add your first member!</p>
            <button
              onClick={() => navigate("/user/family")}
              className="text-xs font-medium bg-[#064E3B] text-white px-4 py-2 rounded-md hover:bg-[#001a12] transition-colors"
            >
              + Add Member
            </button>
          </div>
        )}
      </div>

      {/* Summary line */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {count} of 5 members · {verified} verified
        </span>
        <button onClick={() => navigate("/user/family")} className="text-[11px] text-[#064E3B] font-medium hover:underline">
          Manage Family →
        </button>
      </div>
    </div>
  )
}
