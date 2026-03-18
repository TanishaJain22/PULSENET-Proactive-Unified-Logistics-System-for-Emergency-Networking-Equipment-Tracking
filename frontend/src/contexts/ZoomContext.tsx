import React, { createContext, useContext } from 'react'

interface ZoomContextType {
  zoom: number
  zoomPercentage: number
  increaseZoom: () => void
  decreaseZoom: () => void
  resetZoom: () => void
  canIncrease: boolean
  canDecrease: boolean
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined)

export function ZoomProvider({ 
  children, 
  value 
}: { 
  children: React.ReactNode
  value: ZoomContextType 
}) {
  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  )
}

export function useZoomContext() {
  const context = useContext(ZoomContext)
  if (context === undefined) {
    throw new Error('useZoomContext must be used within a ZoomProvider')
  }
  return context
}

// Hook for components that need to scale with zoom
export function useZoomScale() {
  const { zoom } = useZoomContext()
  
  return {
    zoom,
    // Helper function to get scaled dimensions
    getScaledSize: (baseSize: number) => baseSize * zoom,
    // Helper function to get CSS transform for scaling
    getScaleTransform: () => `scale(${zoom})`,
    // Helper function to get container styles that account for scaling
    getContainerStyles: (baseWidth?: number, baseHeight?: number) => ({
      transform: `scale(${zoom})`,
      transformOrigin: 'center center',
      width: baseWidth ? `${baseWidth}px` : '100%',
      height: baseHeight ? `${baseHeight}px` : '100%',
    }),
  }
}