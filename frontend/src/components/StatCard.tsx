import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  progress?: number
  icon: LucideIcon
  className?: string
  valueClassName?: string
  titleClassName?: string
  subtitleClassName?: string
  iconClassName?: string
  onClick?: () => void
  ariaLabel?: string
  tooltipText?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  progress,
  icon: Icon,
  className,
  valueClassName,
  titleClassName,
  subtitleClassName,
  iconClassName,
  onClick,
  ariaLabel,
  tooltipText,
}: StatCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const isInteractive = !!onClick

  const cardContent = (
    <motion.div
      whileHover={isInteractive ? { 
        y: -3,
        transition: { duration: 0.2, ease: "easeInOut" }
      } : {}}
      whileTap={isInteractive ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      onHoverStart={() => isInteractive && setIsHovered(true)}
      onHoverEnd={() => isInteractive && setIsHovered(false)}
      className="h-full"
    >
      <Card 
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={(e) => {
          if (isInteractive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onClick()
          }
        }}
        className={cn(
          "overflow-hidden h-full relative transition-all duration-200 ease-in-out",
          isInteractive && "cursor-pointer hover:border-primary/40 hover:bg-muted/10 hover:shadow-md",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className={cn(
            "text-sm font-medium transition-colors duration-150", 
            isHovered && isInteractive ? "text-white" : titleClassName
          )}>{title}</CardTitle>
          <Icon className={cn(
            "size-4 transition-colors duration-150",
            iconClassName,
            isHovered && isInteractive ? "text-white" : "text-muted-foreground"
          )} />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className={cn(
            "text-2xl font-bold transition-colors duration-150",
            valueClassName,
            isHovered && isInteractive ? "text-white" : ""
          )}>
            {value}
          </div>
          <p className={cn(
            "text-xs mt-0.5 transition-colors duration-150", 
            isHovered && isInteractive ? "text-white/80" : (subtitleClassName || "text-muted-foreground")
          )}>{subtitle}</p>
          {progress !== undefined && (
            <div className="mt-2.5">
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
          
          <AnimatePresence>
            {isInteractive && isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-2 right-4 text-[10px] font-medium text-white flex items-center gap-1"
              >
                View Details →
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        {isInteractive && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/0 transition-colors group-hover:bg-primary/20" />
        )}
      </Card>
    </motion.div>
  )

  if (isInteractive && tooltipText) {
    return (
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return cardContent
}
