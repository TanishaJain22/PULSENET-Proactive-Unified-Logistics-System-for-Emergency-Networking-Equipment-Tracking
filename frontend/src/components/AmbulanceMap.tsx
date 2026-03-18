import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock,
  Phone,
  AlertTriangle,
  X,
  Maximize2,
  Minimize2,
  Route,
  Zap
} from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom ambulance icon
const ambulanceIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc3545" width="32" height="32">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-1.08-6.01zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      <path d="M12 8h2v2h-2zm-2 0h2v2h-2z" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// Destination icon
const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#28a745" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      <path d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// Emergency icon
const emergencyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff6b6b" width="32" height="32">
      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

interface AmbulanceMapProps {
  ambulanceId: string
  onClose: () => void
}

interface LocationData {
  latitude: number
  longitude: number
  timestamp: string
  speed?: number
  heading?: number
}

interface AmbulanceData {
  id: string
  vehicleNumber: string
  driverName?: string
  driverContact?: string
  status: string
  currentLocation?: LocationData
  destination?: {
    latitude: number
    longitude: number
    address: string
  }
  patientName?: string
  estimatedArrival?: string
}

interface RouteData {
  distanceKm: number
  estimatedTimeMinutes: number
  routePoints: Array<{latitude: number, longitude: number}>
}

interface EmergencyAlert {
  type: string
  message: string
  timestamp: string
  location?: {latitude: number, longitude: number}
}

export default function AmbulanceMap({ ambulanceId, onClose }: AmbulanceMapProps) {
  const [ambulanceData, setAmbulanceData] = React.useState<AmbulanceData | null>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [locationHistory, setLocationHistory] = React.useState<LocationData[]>([])
  const [websocket, setWebsocket] = React.useState<WebSocket | null>(null)
  const [routeData, setRouteData] = React.useState<RouteData | null>(null)
  const [emergencyAlerts, setEmergencyAlerts] = React.useState<EmergencyAlert[]>([])
  const [showGeofences, setShowGeofences] = React.useState(true)
  const mapRef = React.useRef<HTMLDivElement>(null)

  // WebSocket connection for real-time updates
  React.useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws')
    
    ws.onopen = () => {
      console.log('WebSocket connected for ambulance tracking')
      // Subscribe to ambulance-specific updates
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channel: `ambulance/${ambulanceId}/location`
      }))
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'LOCATION_UPDATE' && data.ambulanceId === ambulanceId) {
        const newLocation: LocationData = {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
          speed: data.speed,
          heading: data.heading
        }
        
        setAmbulanceData(prev => prev ? { ...prev, currentLocation: newLocation } : null)
        setLocationHistory(prev => [...prev.slice(-50), newLocation])
      } else if (data.type === 'EMERGENCY_ALERT' && data.ambulanceId === ambulanceId) {
        const alert: EmergencyAlert = {
          type: data.alertType || 'EMERGENCY',
          message: data.message,
          timestamp: data.timestamp,
          location: data.location
        }
        setEmergencyAlerts(prev => [...prev.slice(-10), alert])
      } else if (data.type === 'STATUS_UPDATE' && data.ambulanceId === ambulanceId) {
        setAmbulanceData(prev => prev ? { ...prev, status: data.status } : null)
      }
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }
    
    setWebsocket(ws)
    
    return () => {
      ws.close()
    }
  }, [ambulanceId])

  // Fetch initial ambulance data
  React.useEffect(() => {
    const fetchAmbulanceData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/ambulances/${ambulanceId}`)
        if (response.ok) {
          const data = await response.json()
          
          const ambulanceData: AmbulanceData = {
            id: data.id,
            vehicleNumber: data.vehicleNumber,
            driverName: data.driverName,
            driverContact: data.driverContact,
            status: data.status,
            currentLocation: data.currentLocation ? {
              latitude: data.currentLocation.latitude,
              longitude: data.currentLocation.longitude,
              timestamp: data.currentLocation.timestamp,
              speed: data.currentLocation.speed,
              heading: data.currentLocation.heading
            } : {
              latitude: data.currentLatitude || 28.6139,
              longitude: data.currentLongitude || 77.2090,
              timestamp: new Date().toISOString(),
              speed: 0
            },
            destination: data.activeRequest ? {
              latitude: data.activeRequest.destinationLatitude,
              longitude: data.activeRequest.destinationLongitude,
              address: data.activeRequest.destinationLocation
            } : undefined,
            patientName: data.activeRequest?.patientName,
            estimatedArrival: data.activeRequest?.estimatedArrivalTime ? 
              new Date(data.activeRequest.estimatedArrivalTime).toLocaleTimeString() : undefined
          }
          
          setAmbulanceData(ambulanceData)
          
          if (ambulanceData.currentLocation) {
            setLocationHistory([ambulanceData.currentLocation])
          }
        }
      } catch (error) {
        console.error('Error fetching ambulance data:', error)
      }
    }
    
    fetchAmbulanceData()
  }, [ambulanceId])

  // Fetch route data when destination is available
  React.useEffect(() => {
    const fetchRouteData = async () => {
      if (ambulanceData?.currentLocation && ambulanceData?.destination) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/ambulances/${ambulanceId}/route?destLat=${ambulanceData.destination.latitude}&destLng=${ambulanceData.destination.longitude}`
          )
          if (response.ok) {
            const route = await response.json()
            setRouteData(route)
          }
        } catch (error) {
          console.error('Error fetching route data:', error)
        }
      }
    }

    fetchRouteData()
  }, [ambulanceId, ambulanceData?.currentLocation, ambulanceData?.destination])

  const handleCallDriver = () => {
    if (ambulanceData?.driverContact) {
      window.open(`tel:${ambulanceData.driverContact}`)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!ambulanceData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading ambulance data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : ''} transition-all duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {ambulanceData.vehicleNumber}
            </CardTitle>
            <Badge className="bg-orange-100 text-orange-800">
              {ambulanceData.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid md:grid-cols-3 gap-0">
          {/* Map Area */}
          <div className="md:col-span-2 relative">
            <div 
              ref={mapRef}
              className={`${
                isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
              }`}
            >
              {ambulanceData?.currentLocation ? (
                <MapContainer
                  center={[ambulanceData.currentLocation.latitude, ambulanceData.currentLocation.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Ambulance marker */}
                  <Marker 
                    position={[ambulanceData.currentLocation.latitude, ambulanceData.currentLocation.longitude]}
                    icon={ambulanceIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>{ambulanceData.vehicleNumber}</strong><br/>
                        Driver: {ambulanceData.driverName}<br/>
                        Status: {ambulanceData.status}<br/>
                        {ambulanceData.currentLocation.speed && (
                          <>Speed: {ambulanceData.currentLocation.speed.toFixed(1)} km/h<br/></>
                        )}
                        Last Update: {new Date(ambulanceData.currentLocation.timestamp).toLocaleTimeString()}
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Destination marker */}
                  {ambulanceData.destination && (
                    <Marker 
                      position={[ambulanceData.destination.latitude, ambulanceData.destination.longitude]}
                      icon={destinationIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong>Destination</strong><br/>
                          {ambulanceData.destination.address}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  
                  {/* Route line from route calculation */}
                  {routeData && routeData.routePoints.length > 1 && (
                    <Polyline
                      positions={routeData.routePoints.map(point => [point.latitude, point.longitude])}
                      color="#007bff"
                      weight={4}
                      opacity={0.8}
                      dashArray="10, 5"
                    />
                  )}
                  
                  {/* Location history trail */}
                  {locationHistory.length > 1 && (
                    <Polyline
                      positions={locationHistory.map(loc => [loc.latitude, loc.longitude])}
                      color="#17a2b8"
                      weight={2}
                      opacity={0.6}
                    />
                  )}

                  {/* Geofences */}
                  {showGeofences && ambulanceData.destination && (
                    <>
                      {/* Arrival geofence around destination */}
                      <Circle
                        center={[ambulanceData.destination.latitude, ambulanceData.destination.longitude]}
                        radius={100} // 100 meters
                        color="#28a745"
                        fillColor="#28a745"
                        fillOpacity={0.1}
                        weight={2}
                        dashArray="5, 5"
                      />
                      {/* Nearby geofence around destination */}
                      <Circle
                        center={[ambulanceData.destination.latitude, ambulanceData.destination.longitude]}
                        radius={500} // 500 meters
                        color="#ffc107"
                        fillColor="#ffc107"
                        fillOpacity={0.05}
                        weight={1}
                        dashArray="10, 10"
                      />
                    </>
                  )}

                  {/* Emergency alert markers */}
                  {emergencyAlerts.map((alert, index) => 
                    alert.location && (
                      <Marker 
                        key={index}
                        position={[alert.location.latitude, alert.location.longitude]}
                        icon={emergencyIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong className="text-red-600">🚨 EMERGENCY ALERT</strong><br/>
                            Type: {alert.type}<br/>
                            Message: {alert.message}<br/>
                            Time: {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                        </Popup>
                      </Marker>
                    )
                  )}
                </MapContainer>
              ) : (
                <div className="bg-gray-100 flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Loading Map...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Speed and Direction Overlay */}
            {ambulanceData.currentLocation && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-4 text-sm">
                  {ambulanceData.currentLocation.speed && (
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{ambulanceData.currentLocation.speed.toFixed(1)} km/h</span>
                    </div>
                  )}
                  {ambulanceData.estimatedArrival && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">ETA: {ambulanceData.estimatedArrival}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Info Panel */}
          <div className="bg-gray-50 p-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Ambulance Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Driver:</span>
                  <span>{ambulanceData.driverName}</span>
                </div>
                {ambulanceData.patientName && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Patient:</span>
                    <span>{ambulanceData.patientName}</span>
                  </div>
                )}
              </div>
            </div>
            
            {ambulanceData.destination && (
              <div>
                <h4 className="font-semibold mb-2">Destination</h4>
                <div className="flex items-start gap-2 text-sm">
                  <Navigation className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span>{ambulanceData.destination.address}</span>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-2">Location Updates</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {locationHistory.slice(-5).reverse().map((location, index) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border">
                    <div className="font-medium">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </div>
                    <div className="text-gray-500">
                      {new Date(location.timestamp).toLocaleTimeString()}
                      {location.speed && ` • ${location.speed.toFixed(1)} km/h`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={handleCallDriver} 
                  className="flex-1"
                  disabled={!ambulanceData.driverContact}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Driver
                </Button>
                <Button 
                  onClick={() => setShowGeofences(!showGeofences)}
                  variant="outline"
                  size="sm"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {showGeofences ? 'Hide' : 'Show'} Zones
                </Button>
              </div>
              
              {/* Route Information */}
              {routeData && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Route Info</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Distance: {routeData.distanceKm.toFixed(1)} km</div>
                    <div>Est. Time: {routeData.estimatedTimeMinutes} min</div>
                  </div>
                </div>
              )}

              {/* Emergency Alerts */}
              {emergencyAlerts.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-red-800">Recent Alerts</span>
                  </div>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {emergencyAlerts.slice(-3).reverse().map((alert, index) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border-l-2 border-red-400">
                        <div className="font-medium text-red-700">{alert.type}</div>
                        <div className="text-gray-600">{alert.message}</div>
                        <div className="text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}