import React from 'react'
import { useZoomScale } from '@/contexts/ZoomContext'
import { cn } from '@/lib/utils'

interface ZoomResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  baseWidth?: number
  baseHeight?: number
  scaleContent?: boolean
  maintainAspectRatio?: boolean
  style?: React.CSSProperties
}

export function ZoomResponsiveContainer({
  children,
  className,
  baseWidth,
  baseHeight,
  scaleContent = true,
  maintainAspectRatio = true,
  style = {},
}: ZoomResponsiveContainerProps) {
  const { zoom, getContainerStyles } = useZoomScale()

  const containerStyles = scaleContent 
    ? getContainerStyles(baseWidth, baseHeight)
    : {}

  const finalStyles = {
    ...containerStyles,
    ...style,
    ...(maintainAspectRatio && baseWidth && baseHeight ? {
      aspectRatio: `${baseWidth} / ${baseHeight}`
    } : {})
  }

  return (
    <div 
      className={cn(
        'zoom-responsive-frame transition-all duration-300 overflow-hidden',
        scaleContent && 'model-container',
        className
      )}
      style={finalStyles}
      data-zoom={zoom}
    >
      {children}
    </div>
  )
}

// Specialized component for 3D models
export function ZoomResponsive3DModel({
  children,
  className,
  width = 400,
  height = 300,
  ...props
}: Omit<ZoomResponsiveContainerProps, 'baseWidth' | 'baseHeight'> & {
  width?: number
  height?: number
}) {
  return (
    <ZoomResponsiveContainer
      {...props}
      className={cn('zoom-responsive-3d three-container', className)}
      baseWidth={width}
      baseHeight={height}
      scaleContent={true}
      maintainAspectRatio={true}
    >
      {children}
    </ZoomResponsiveContainer>
  )
}

// Specialized component for canvas elements
export function ZoomResponsiveCanvas({
  children,
  className,
  width = 400,
  height = 300,
  ...props
}: Omit<ZoomResponsiveContainerProps, 'baseWidth' | 'baseHeight'> & {
  width?: number
  height?: number
}) {
  return (
    <ZoomResponsiveContainer
      {...props}
      className={cn('webgl-container', className)}
      baseWidth={width}
      baseHeight={height}
      scaleContent={true}
      maintainAspectRatio={true}
    >
      <div className="canvas-wrapper">
        {children}
      </div>
    </ZoomResponsiveContainer>
  )
}