import React from 'react'
import { cn } from '@/lib/utils'

interface HospitalPageWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper component for hospital pages to ensure consistent spacing
 * and proper header clearance across all zoom levels
 */
export function HospitalPageWrapper({ children, className }: HospitalPageWrapperProps) {
  return (
    <div className={cn(
      "hospital-page-content space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Header component for hospital pages with consistent styling
 */
interface HospitalPageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function HospitalPageHeader({ 
  title, 
  description, 
  icon, 
  actions, 
  className 
}: HospitalPageHeaderProps) {
  return (
    <div className={cn(
      "hospital-page-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
      className
    )}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

export default HospitalPageWrapper