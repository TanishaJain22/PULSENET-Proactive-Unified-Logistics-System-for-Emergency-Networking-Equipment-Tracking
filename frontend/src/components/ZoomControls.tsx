import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ZoomControlsProps {
  zoom: number
  zoomPercentage: number
  onIncrease: () => void
  onDecrease: () => void
  onReset: () => void
  canIncrease: boolean
  canDecrease: boolean
  className?: string
}

export function ZoomControls({
  zoom,
  zoomPercentage,
  onIncrease,
  onDecrease,
  onReset,
  canIncrease,
  canDecrease,
  className
}: ZoomControlsProps) {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onDecrease}
              disabled={!canDecrease}
              className="h-9 w-9 rounded-full gradient-button-variant transition-all hover:scale-105"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease size (80% min)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-9 px-3 rounded-full gradient-button-variant transition-all hover:scale-105 font-mono text-xs"
            >
              {zoomPercentage}%
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset to 100%</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onIncrease}
              disabled={!canIncrease}
              className="h-9 w-9 rounded-full gradient-button-variant transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase size (130% max)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
