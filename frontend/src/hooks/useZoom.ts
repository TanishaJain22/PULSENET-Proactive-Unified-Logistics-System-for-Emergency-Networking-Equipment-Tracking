import { useState, useEffect } from 'react'

const ZOOM_STEP = 0.03 // 3% per click
const MIN_ZOOM = 0.80 // 80%
const MAX_ZOOM = 1.30 // 130%
const DEFAULT_ZOOM = 1.00 // 100%
const STORAGE_KEY = 'hospital-dashboard-zoom'

export function useZoom() {
  const [zoom, setZoom] = useState<number>(() => {
    // Load zoom from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = parseFloat(stored)
      if (!isNaN(parsed) && parsed >= MIN_ZOOM && parsed <= MAX_ZOOM) {
        return parsed
      }
    }
    return DEFAULT_ZOOM
  })

  // Apply zoom to document root
  useEffect(() => {
    document.documentElement.style.setProperty('--zoom-scale', zoom.toString())
    localStorage.setItem(STORAGE_KEY, zoom.toString())
  }, [zoom])

  const increaseZoom = () => {
    setZoom(prev => {
      const newZoom = prev + ZOOM_STEP
      return newZoom <= MAX_ZOOM ? newZoom : prev
    })
  }

  const decreaseZoom = () => {
    setZoom(prev => {
      const newZoom = prev - ZOOM_STEP
      return newZoom >= MIN_ZOOM ? newZoom : prev
    })
  }

  const resetZoom = () => {
    setZoom(DEFAULT_ZOOM)
  }

  const canIncrease = zoom < MAX_ZOOM
  const canDecrease = zoom > MIN_ZOOM
  const zoomPercentage = Math.round(zoom * 100)

  return {
    zoom,
    zoomPercentage,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    canIncrease,
    canDecrease
  }
}
