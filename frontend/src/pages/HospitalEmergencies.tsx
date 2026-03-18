import * as React from "react"
import { StatCard } from "@/components/StatCard"
import { SeverityBadge } from "@/components/SeverityBadge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Ambulance, 
  Phone,
  Radio,
  Navigation,
  CheckCircle2,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  User,
  Calendar,
  FileText,
  Pill,
  AlertCircle
} from "lucide-react"
import { emergencies } from "@/data/mock"
import { cn } from "@/lib/utils"

export default function HospitalEmergencies() {
  const [selectedEmergency, setSelectedEmergency] = React.useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = React.useState(false)
  
  const incoming = emergencies.filter(e => e.type === "incoming")
  const recent = emergencies.filter(e => e.type === "dispatched")

  const handleDetailsClick = (emergency: any) => {
    setSelectedEmergency(emergency)
    setShowDetailsModal(true)
  }

  // Mock detailed patient data - in real app this would come from API
  const getDetailedEmergencyData = (emergency: any) => {
    const mockDetails = {
      'E-001': {
        vitals: {
          heartRate: 125,
          bloodPressure: '90/60',
          oxygenSaturation: 88,
          temperature: 98.6,
          respiratoryRate: 22
        },
        medicalHistory: ['Hypertension', 'Previous MI (2023)', 'Type 2 Diabetes'],
        allergies: ['Penicillin', 'Shellfish'],
        currentMedications: ['Metformin 500mg', 'Lisinopril 10mg', 'Aspirin 81mg'],
        injuryDetails: 'Witnessed collapse at workplace. CPR initiated by bystanders.',
        treatmentTimeline: [
          { time: '14:32', action: 'Emergency call received' },
          { time: '14:35', action: 'Ambulance dispatched' },
          { time: '14:38', action: 'Patient stabilized on scene' },
          { time: '14:40', action: 'En route to hospital' }
        ]
      },
      'E-002': {
        vitals: {
          heartRate: 98,
          bloodPressure: '110/70',
          oxygenSaturation: 95,
          temperature: 99.2,
          respiratoryRate: 18
        },
        medicalHistory: ['No significant history'],
        allergies: ['None known'],
        currentMedications: ['Birth control'],
        injuryDetails: 'Motor vehicle accident. Conscious and alert. Possible internal injuries.',
        treatmentTimeline: [
          { time: '14:25', action: 'Accident reported' },
          { time: '14:28', action: 'First responders on scene' },
          { time: '14:35', action: 'Patient extracted from vehicle' },
          { time: '14:38', action: 'Transport initiated' }
        ]
      },
      'E-003': {
        vitals: {
          heartRate: 82,
          bloodPressure: '120/80',
          oxygenSaturation: 98,
          temperature: 98.4,
          respiratoryRate: 16
        },
        medicalHistory: ['Previous fracture (2020)'],
        allergies: ['Latex'],
        currentMedications: ['Ibuprofen as needed'],
        injuryDetails: 'Fall from ladder. Suspected ankle fracture. Stable condition.',
        treatmentTimeline: [
          { time: '14:15', action: 'Emergency call received' },
          { time: '14:18', action: 'Ambulance dispatched' },
          { time: '14:25', action: 'Patient assessed on scene' },
          { time: '14:30', action: 'Transport to hospital' }
        ]
      }
    }
    
    return mockDetails[emergency.id as keyof typeof mockDetails] || mockDetails['E-001']
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-destructive">Active Emergencies</h2>
          <p className="text-muted-foreground">Real-time trauma intake and ambulance tracking.</p>
        </div>
        <Button variant="destructive" className="gap-2 font-bold ring-offset-background transition-shadow hover:ring-2 hover:ring-destructive hover:ring-offset-2">
          <Radio className="size-4 animate-pulse" />
          OPEN EMERGENCY CHANNEL
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Avg. Intake ETA"
          value="6.4m"
          subtitle="Down from 8.2m average"
          icon={Clock}
          className="bg-destructive/5 border-destructive/20"
        />
        <StatCard
          title="Active Ambulances"
          value="4"
          subtitle="2 en-route, 2 returning"
          icon={Ambulance}
        />
        <StatCard
          title="Critical Alerts"
          value="2"
          subtitle="High priority triage required"
          icon={AlertTriangle}
          className="border-l-4 border-l-destructive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Tracking Column */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inbound Trauma Tracking</CardTitle>
            <CardDescription>Live telemetry from dispatched units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incoming.map((e) => (
                <div key={e.id} className="relative flex items-start gap-4 rounded-xl border p-6 transition-all hover:bg-muted/50 emergency-card">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <Ambulance className="size-5" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold truncate">{e.patientName || "Unit AR-204 Intake"}</h4>
                      <SeverityBadge severity={e.severity} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3 flex-shrink-0" />
                        <span className="truncate">{e.currentLocation}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-destructive">
                        <Clock className="size-3 flex-shrink-0" />
                        <span>ETA: {e.eta}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-destructive transition-all duration-1000" style={{ width: '65%' }}></div>
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={() => handleDetailsClick(e)}
                    >
                      Details
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                       <Navigation className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dispatch Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Logs</CardTitle>
            <CardDescription>Recent medical unit activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y">
                {recent.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-5 hover:bg-muted/30 emergency-log-item">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-sm font-medium">Unit {e.id.slice(-4)}</div>
                      <div className="text-xs text-muted-foreground">Intake completed at 14:22</div>
                    </div>
                    <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-600 bg-emerald-50 flex-shrink-0 ml-3">
                      <CheckCircle2 className="size-3 mr-1" />
                      SECURE
                    </Badge>
                  </div>
                ))}
             </div>
             <div className="p-5 border-t">
                <Button variant="ghost" className="w-full text-xs" size="sm">View Full History</Button>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] dialog-scroll force-scroll p-0">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Ambulance className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold">Emergency Details</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {selectedEmergency?.patientName || "Unknown Patient"} • ID: {selectedEmergency?.id}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={selectedEmergency?.severity || 'moderate'} />
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground">ETA</div>
                    <div className="text-lg font-bold text-destructive">{selectedEmergency?.eta}</div>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Scrollable Content */}
          <div className="px-6 pb-6 space-y-6">
            {selectedEmergency && (
              <>
                {/* Current Status & Patient Info - Compact Row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-l-4 border-l-destructive">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <AlertTriangle className="size-4" />
                        Current Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Condition</div>
                          <div className="font-semibold text-sm">{selectedEmergency.condition}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Location</div>
                          <div className="font-medium text-sm">{selectedEmergency.currentLocation}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                        <User className="size-4" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Name</div>
                          <div className="font-semibold text-sm">{selectedEmergency.patientName || "Unknown"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Age/Gender</div>
                          <div className="font-medium text-sm">Est. 35-40y • Male</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vital Signs - Enhanced Layout */}
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                      <Activity className="size-5" />
                      Current Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                      {(() => {
                        const details = getDetailedEmergencyData(selectedEmergency)
                        const vitals = [
                          { icon: Heart, value: details.vitals.heartRate, unit: 'BPM', label: 'Heart Rate', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-600' },
                          { icon: Droplets, value: details.vitals.bloodPressure, unit: 'mmHg', label: 'Blood Pressure', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-600' },
                          { icon: Activity, value: `${details.vitals.oxygenSaturation}%`, unit: 'SpO2', label: 'Oxygen Sat.', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-600' },
                          { icon: Thermometer, value: `${details.vitals.temperature}°F`, unit: 'Temp', label: 'Temperature', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-600' },
                          { icon: Activity, value: details.vitals.respiratoryRate, unit: 'RR/min', label: 'Respiratory', color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-600' }
                        ]
                        
                        return vitals.map((vital, index) => (
                          <div key={index} className={`text-center p-4 rounded-xl ${vital.bgColor} border-2 ${vital.borderColor} transition-all hover:shadow-md`}>
                            <vital.icon className={`size-6 ${vital.textColor} mx-auto mb-2`} />
                            <div className={`text-2xl font-bold ${vital.textColor} mb-1`}>{vital.value}</div>
                            <div className={`text-xs font-medium ${vital.textColor} opacity-80`}>{vital.unit}</div>
                            <div className="text-xs text-muted-foreground mt-1">{vital.label}</div>
                          </div>
                        ))
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History and Medications - Improved Layout */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                        <FileText className="size-4" />
                        Medical History & Allergies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const details = getDetailedEmergencyData(selectedEmergency)
                        return (
                          <>
                            <div>
                              <div className="text-sm font-semibold mb-3 text-muted-foreground">Previous Conditions</div>
                              <div className="flex flex-wrap gap-2">
                                {details.medicalHistory.map((condition, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {condition}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-600">
                                <AlertCircle className="size-4" />
                                Critical Allergies
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {details.allergies.map((allergy, index) => (
                                  <Badge key={index} variant="destructive" className="px-3 py-1 font-medium">
                                    {allergy}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center gap-2 text-green-600">
                        <Pill className="size-4" />
                        Current Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const details = getDetailedEmergencyData(selectedEmergency)
                        return (
                          <div className="space-y-3">
                            {details.currentMedications.map((medication, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                                  <Pill className="size-4 text-green-600" />
                                </div>
                                <span className="font-medium text-sm">{medication}</span>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* Injury Details and Timeline - Side by Side */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base text-orange-600">Incident Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm leading-relaxed">
                          {getDetailedEmergencyData(selectedEmergency).injuryDetails}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                        <Clock className="size-4" />
                        Treatment Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getDetailedEmergencyData(selectedEmergency).treatmentTimeline.map((event, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0 pb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {event.time}
                                </div>
                              </div>
                              <div className="text-sm font-medium">{event.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

          {/* Fixed Footer with Action Buttons */}
          <div className="sticky bottom-0 bg-background border-t px-6 py-4">
            <div className="flex gap-3">
              <Button className="flex-1" variant="destructive" size="lg">
                <AlertTriangle className="size-4 mr-2" />
                Prepare Emergency Bay
              </Button>
              <Button className="flex-1" variant="outline" size="lg">
                <Phone className="size-4 mr-2" />
                Contact Ambulance
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="size-4 mr-2" />
                Print Summary
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
