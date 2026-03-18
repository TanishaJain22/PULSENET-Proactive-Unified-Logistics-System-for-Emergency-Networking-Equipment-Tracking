import { Badge } from "@/components/ui/badge"
import type { Severity } from "@/types"
import { cn } from "@/lib/utils"

interface SeverityBadgeProps {
  severity: Severity
  className?: string
  large?: boolean
}

export function SeverityBadge({ severity, className, large }: SeverityBadgeProps) {
  const configs = {
    critical: {
      label: "Critical",
      className: "bg-destructive text-destructive-foreground border-destructive",
    },
    moderate: {
      label: "Moderate",
      className: "bg-secondary text-secondary-foreground border-secondary",
    },
    stable: {
      label: "Stable",
      className: "bg-primary text-primary-foreground border-primary",
    },
  }

  const config = configs[severity]

  return (
    <Badge
      className={cn(
        "font-semibold uppercase tracking-wider",
        large ? "px-3 py-1 text-[10px]" : "px-2 py-0.5 text-[9px]",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
