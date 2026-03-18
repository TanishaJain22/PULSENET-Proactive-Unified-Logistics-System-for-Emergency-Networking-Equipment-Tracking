import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { mockUser, mockFamilyMembers, type FamilyMember, getPermissionLabel } from "@/data/userData"

// ─── Avatar Positions (full-size room, more space) ──────────────
const POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 65, y: 56 }],
  2: [{ x: 32, y: 56 }, { x: 68, y: 56 }],
  3: [{ x: 28, y: 58 }, { x: 72, y: 58 }, { x: 50, y: 35 }],
  4: [{ x: 22, y: 54 }, { x: 40, y: 62 }, { x: 60, y: 62 }, { x: 78, y: 54 }],
  5: [{ x: 18, y: 52 }, { x: 35, y: 62 }, { x: 65, y: 62 }, { x: 82, y: 52 }, { x: 50, y: 32 }],
}

const TIER_BORDER: Record<string, string> = {
  "notify": "border-gray-400/60 shadow-gray-400/20",
  "tracking": "border-green-400/60 shadow-green-400/20",
  "full-access": "border-[#064E3B] shadow-[#064E3B]/30",
}

function AvatarTooltip({ member }: { member: FamilyMember }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border border-border rounded-lg p-2.5 shadow-xl z-30 w-48 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <p className="text-xs font-semibold">{member.name}</p>
      <p className="text-[10px] text-muted-foreground">{member.relationship}</p>
      <div className="h-px bg-border my-1.5" />
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground">{member.phone}</p>
        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${member.verificationStatus === "verified" ? "bg-green-500" : "bg-amber-500"}`} />
          <span className="text-[10px] capitalize">{member.verificationStatus}</span>
        </div>
        <p className="text-[10px] text-[#064E3B] font-medium">{getPermissionLabel(member.permissionTier)}</p>
      </div>
    </div>
  )
}

function RoomAvatar({
  member,
  x, y,
  isUser,
  onMemberClick,
}: {
  member?: FamilyMember
  x: number
  y: number
  isUser?: boolean
  onMemberClick?: (id: string) => void
}) {
  const name = isUser ? mockUser.firstName : member!.name.split(" ")[0]
  const avatarSrc = isUser ? mockUser.avatarImage : member!.avatarImage
  const size = isUser ? 72 : 60

  return (
    <div
      className="absolute group cursor-pointer flex flex-col items-center"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      onClick={() => member && onMemberClick?.(member.id)}
    >
      {member && <AvatarTooltip member={member} />}

      <div className="flex items-center gap-1 mb-1">
        <span className="text-[13px] font-medium text-white drop-shadow-md">{name}</span>
        {isUser ? (
          <span className="size-2 rounded-full bg-green-500" />
        ) : (
          <span className={`size-2 rounded-full ${member!.verificationStatus === "verified" ? "bg-green-500" : "bg-amber-500"}`} />
        )}
      </div>

      <img
        src={avatarSrc}
        alt={name}
        className="transition-transform group-hover:scale-110 object-contain drop-shadow-md"
        style={{ width: size, height: size }}
      />

      {member && (
        <span className="text-[11px] text-white/90 mt-1 drop-shadow-sm font-medium">{member.relationship}</span>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export default function FamilyRoomFull({ onMemberClick, onAddClick }: { onMemberClick?: (id: string) => void; onAddClick?: () => void }) {
  const navigate = useNavigate()
  const members = mockFamilyMembers
  const count = members.length
  const positions = POSITIONS[count] || []

  return (
    <div className="bg-card rounded-lg border border-primary/50 overflow-hidden animate-teal-glow shadow-lg shadow-primary/10">
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(300px, 45vw, 450px)" }}>
        
        {/* Background image */}
        <img
          src="/room-bg.png"
          alt="Family room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/30" />

        {/* User avatar */}
        <RoomAvatar isUser x={50} y={56} />

        {/* Family members */}
        {members.map((member, i) => (
          positions[i] && (
            <RoomAvatar key={member.id} member={member} x={positions[i].x} y={positions[i].y} onMemberClick={onMemberClick} />
          )
        ))}

        {/* Add Member button */}
        {count < 5 && (
          <button
            onClick={onAddClick}
            className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#064E3B] text-white rounded-full px-4 py-2 text-xs font-semibold hover:bg-[#001a12] transition-colors shadow-xl z-10"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Member</span>
          </button>
        )}

        {/* Empty state */}
        {count === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
            <p className="text-base text-white/90 mb-2 font-medium">Your family room is empty</p>
            <p className="text-sm text-white/70 mb-4">Add your first member to connect their health profile</p>
            <button
              onClick={onAddClick}
              className="text-sm font-semibold bg-[#064E3B] text-white px-5 py-2.5 rounded-lg hover:bg-[#001a12] transition-colors shadow-lg"
            >
              + Add Member
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
