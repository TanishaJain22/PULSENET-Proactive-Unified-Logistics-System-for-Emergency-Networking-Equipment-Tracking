import { type GovernmentScheme, formatCurrency } from "@/data/userData"

// Color themes matching the hospital dashboard stat cards
const SCHEME_COLORS = [
  { bg: "bg-[#C7FBEE]", border: "border-[#064E3B]", text: "text-[#064E3B]", textSub: "text-[#064E3B]/70", hoverBg: "hover:bg-[#064E3B]" },
  { bg: "bg-[#FFCABF]", border: "border-[#C93213]", text: "text-[#C93213]", textSub: "text-[#C93213]/70", hoverBg: "hover:bg-[#C93213]" },
  { bg: "bg-[#FFD3AA]", border: "border-[#CD6B0F]", text: "text-[#CD6B0F]", textSub: "text-[#CD6B0F]/70", hoverBg: "hover:bg-[#CD6B0F]" },
  { bg: "bg-[#CBDBFF]", border: "border-[#2B59C3]", text: "text-[#2B59C3]", textSub: "text-[#2B59C3]/70", hoverBg: "hover:bg-[#2B59C3]" },
]

export default function SchemeCard({ 
  scheme, 
  index = 0,
  onClick 
}: { 
  scheme: GovernmentScheme; 
  index?: number;
  onClick?: (scheme: GovernmentScheme) => void;
}) {
  const colors = SCHEME_COLORS[index % SCHEME_COLORS.length]
  const glowClass = scheme.isEligible ? "shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-green-500/50" : ""

  return (
    <div
      onClick={() => onClick?.(scheme)}
      className={`group relative rounded-xl border-l-[6px] border ${colors.border} ${glowClass} ${colors.bg} p-3.5 cursor-pointer transition-all duration-300 ${colors.hoverBg} hover:shadow-lg overflow-hidden`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2.5">
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-sm font-bold truncate leading-tight transition-colors duration-200 group-hover:text-white ${colors.text}`}>
              {scheme.name}
            </h3>
            {scheme.isNew && (
              <span className="relative flex h-5 items-center px-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#064E3B] opacity-20"></span>
                <span className="relative inline-flex rounded-full bg-[#064E3B] px-2 py-0.5 text-[9px] font-black text-white">NEW</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide transition-colors duration-200 ${
              scheme.bodyType === "central" 
                ? "bg-blue-500/15 text-blue-600 group-hover:bg-white/20 group-hover:text-white" 
                : "bg-orange-500/15 text-orange-600 group-hover:bg-white/20 group-hover:text-white"
            }`}>
              {scheme.governmentBody}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors duration-200 group-hover:bg-white/10 group-hover:text-white/90 bg-black/5 ${colors.text}`}>
              {scheme.category}
            </span>
            {scheme.isEligible && (
              <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-500/20 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-colors">
                ✓ Eligible for you
              </span>
            )}
            <span className={`text-[10px] italic transition-colors duration-200 group-hover:text-white/80 ${colors.textSub}`}>
              4/5 criteria matched
            </span>
          </div>
          
          <p className={`text-[11px] line-clamp-2 transition-colors duration-200 group-hover:text-white/90 ${colors.textSub}`}>
            {scheme.description}
          </p>
        </div>
        
        <div className="text-left sm:text-right shrink-0">
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors duration-200 group-hover:text-white/70 ${colors.textSub}`}>
            Coverage Amount
          </p>
          <p className={`text-lg font-black leading-none transition-colors duration-200 group-hover:text-white ${colors.text}`}>
            {formatCurrency(scheme.coverageAmount)}
          </p>
          {scheme.hospitalAccepted && (
            <p className={`text-[11px] font-medium mt-1.5 transition-colors duration-200 group-hover:text-white/80 ${colors.textSub}`}>
              ✓ Accepted at {scheme.hospitalAccepted}
            </p>
          )}
        </div>
        
      </div>
      
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-black/5 group-hover:border-white/10 transition-colors">
        <span className={`text-[11px] font-bold transition-colors duration-200 group-hover:text-white/90 ${colors.textSub}`}>
          3 of your family eligible
        </span>
        <span className={`text-xs font-bold transition-colors duration-200 group-hover:text-white ${colors.text} flex items-center gap-1`}>
          View Details <span className="text-[14px] leading-none">→</span>
        </span>
      </div>
    </div>
  )
}
