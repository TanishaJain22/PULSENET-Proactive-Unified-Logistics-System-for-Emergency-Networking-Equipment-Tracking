import * as React from "react"
import { useParams } from "react-router-dom"
import { StatCard } from "@/components/StatCard"
import { SeverityBadge } from "@/components/SeverityBadge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Severity } from "@/types"
import { 
  ArrowRightLeft, 
  ChevronRight, 
  MapPin, 
  Plus, 
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Settings2,
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Stethoscope,
  Brain,
  Users,
  Hospital,
  Navigation,
  Timer,
  CheckCircle,
  XCircle,
  Truck,
  Star,
  TrendingUp,
  Eye
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Transfer {
  id: string;
  patientId: string;
  patientName: string;
  fromHospitalId: string;
  fromHospitalName: string;
  toHospitalId?: string;
  toHospitalName?: string;
  status: TransferStatus;
  statusDescription: string;
  requiredSpecialty: string;
  severityLevel: number;
  transferReason: string;
  reasonDescription: string;
  aiRecommendationScore?: number;
  aiReasoning?: string;
  requestedAt: string;
  acceptedAt?: string;
  dispatchedAt?: string;
  estimatedArrival?: string;
  arrivedAt?: string;
  completedAt?: string;
  estimatedTravelTime?: number;
  ambulanceId?: string;
  notes?: string;
  rejectionReason?: string;
  contactPhone?: string;
  emergencyContact?: string;
}

interface HospitalRecommendation {
  hospitalId: string;
  hospitalName: string;
  distanceKm: number;
  travelTimeMinutes: number;
  aiScore: number;
  reasoning: string;
  icuBedsAvailable: number;
  generalBedsAvailable: number;
  ventilatorsAvailable: number;
  specialistAvailable: boolean;
  isAcceptingTransfers: boolean;
  hospitalLoadPercentage: number;
  loadStatus: string;
  hasRequiredSpecialty: boolean;
  specialistCount: number;
  hasRequiredEquipment: boolean;
  isHospitalFull: boolean;
  criticalNoICU: boolean;
  contactPhone?: string;
  emergencyContact?: string;
}

interface TransferRequest {
  patientId: string;
  patientName: string;
  heartRate: number;
  oxygenLevel: number;
  temperature: number;
  bpSystolic: number;
  bpDiastolic: number;
  respiratoryRate: number;
  supplementalO2: boolean;
  consciousnessLevel: ConsciousnessLevel;
  severityLevel: number;
  requiredSpecialty: string;
  trafficCondition: TrafficCondition;
  estimatedTravelTime: number;
  transferReason: TransferReason;
  reasonDescription: string;
  notes: string;
  requestedHospitalId?: string;
}

type TransferStatus = 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'AMBULANCE_DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
type ConsciousnessLevel = 'ALERT' | 'VOICE' | 'PAIN' | 'UNRESPONSIVE';
type TrafficCondition = 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE';
type TransferReason = 'NO_SPECIALIST_AVAILABLE' | 'ICU_CAPACITY_FULL' | 'REQUIRED_EQUIPMENT_UNAVAILABLE' | 'PATIENT_CONDITION_DETERIORATED' | 'HIGHER_LEVEL_CARE_NEEDED' | 'SPECIALIST_CONSULTATION_REQUIRED' | 'SURGICAL_INTERVENTION_NEEDED' | 'DIAGNOSTIC_EQUIPMENT_UNAVAILABLE' | 'OTHER';

const SPECIALTIES = [
  "Cardiology", "Neurology", "Emergency Medicine", "Surgery", "Pediatrics", 
  "Orthopedics", "Oncology", "Radiology", "Anesthesiology", "Internal Medicine"
];

const TRANSFER_REASONS = [
  { value: 'NO_SPECIALIST_AVAILABLE', label: 'No Specialist Available' },
  { value: 'ICU_CAPACITY_FULL', label: 'ICU Capacity Full' },
  { value: 'REQUIRED_EQUIPMENT_UNAVAILABLE', label: 'Required Equipment Unavailable' },
  { value: 'PATIENT_CONDITION_DETERIORATED', label: 'Patient Condition Deteriorated' },
  { value: 'HIGHER_LEVEL_CARE_NEEDED', label: 'Higher Level Care Needed' },
  { value: 'SPECIALIST_CONSULTATION_REQUIRED', label: 'Specialist Consultation Required' },
  { value: 'SURGICAL_INTERVENTION_NEEDED', label: 'Surgical Intervention Needed' },
  { value: 'DIAGNOSTIC_EQUIPMENT_UNAVAILABLE', label: 'Diagnostic Equipment Unavailable' },
  { value: 'OTHER', label: 'Other' }
];

const STATUS_COLORS = {
  REQUESTED: "bg-yellow-500 hover:bg-yellow-600",
  ACCEPTED: "bg-green-500 hover:bg-green-600",
  REJECTED: "bg-red-500 hover:bg-red-600",
  AMBULANCE_DISPATCHED: "bg-blue-500 hover:bg-blue-600",
  EN_ROUTE: "bg-purple-500 hover:bg-purple-600 animate-pulse",
  ARRIVED: "bg-indigo-500 hover:bg-indigo-600",
  COMPLETED: "bg-emerald-500 hover:bg-emerald-600",
  CANCELLED: "bg-gray-500 hover:bg-gray-600"
};

export default function HospitalTransfers() {
  const [outgoingTransfers, setOutgoingTransfers] = React.useState<Transfer[]>([])
  const [incomingTransfers, setIncomingTransfers] = React.useState<Transfer[]>([])
  const [pendingTransfers, setPendingTransfers] = React.useState<Transfer[]>([])
  const [activeTransfers, setActiveTransfers] = React.useState<Transfer[]>([])
  const [recommendations, setRecommendations] = React.useState<HospitalRecommendation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = React.useState(false)
  const [isRecommendationsDialogOpen, setIsRecommendationsDialogOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("outgoing")
  const [selectedTransfer, setSelectedTransfer] = React.useState<Transfer | null>(null)
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [acceptanceNotes, setAcceptanceNotes] = React.useState("")
  const [statistics, setStatistics] = React.useState({
    totalOutgoing: 0,
    totalIncoming: 0,
    activeTransfers: 0,
    pendingRequests: 0,
    acceptanceRate: 0
  })

  const [transferRequest, setTransferRequest] = React.useState<TransferRequest>({
    patientId: "",
    patientName: "",
    heartRate: 80,
    oxygenLevel: 98,
    temperature: 37.0,
    bpSystolic: 120,
    bpDiastolic: 80,
    respiratoryRate: 16,
    supplementalO2: false,
    consciousnessLevel: "ALERT",
    severityLevel: 1,
    requiredSpecialty: "",
    trafficCondition: "MODERATE",
    estimatedTravelTime: 30,
    transferReason: "NO_SPECIALIST_AVAILABLE",
    reasonDescription: "",
    notes: "",
    requestedHospitalId: undefined
  })

  // Enhanced dialog scroll handling
  React.useEffect(() => {
    if (!isRequestDialogOpen) return

    const handleDialogScroll = () => {
      // Find the dialog content
      const dialogContent = document.querySelector('[data-slot="dialog-content"]') as HTMLElement
      if (!dialogContent) return

      // Find the scrollable area
      const scrollArea = dialogContent.querySelector('.dialog-scroll') as HTMLElement
      if (!scrollArea) return

      // Ensure proper scrolling
      scrollArea.style.overflowY = 'scroll'
      ;(scrollArea.style as any).WebkitOverflowScrolling = 'touch'
      scrollArea.style.touchAction = 'pan-y'
      scrollArea.style.transform = 'translate3d(0, 0, 0)'

      // Handle wheel events
      const handleWheel = (e: WheelEvent) => {
        const { deltaY } = e
        const { scrollTop, scrollHeight, clientHeight } = scrollArea
        
        if (
          (deltaY < 0 && scrollTop > 0) ||
          (deltaY > 0 && scrollTop < scrollHeight - clientHeight)
        ) {
          e.stopPropagation()
        }
      }

      // Handle touch events
      let startY = 0
      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].clientY
        e.stopPropagation()
      }

      const handleTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0].clientY
        const deltaY = startY - currentY
        const { scrollTop, scrollHeight, clientHeight } = scrollArea
        
        if (
          (deltaY < 0 && scrollTop > 0) ||
          (deltaY > 0 && scrollTop < scrollHeight - clientHeight)
        ) {
          e.stopPropagation()
        }
      }

      scrollArea.addEventListener('wheel', handleWheel, { passive: false })
      scrollArea.addEventListener('touchstart', handleTouchStart, { passive: true })
      scrollArea.addEventListener('touchmove', handleTouchMove, { passive: false })

      return () => {
        scrollArea.removeEventListener('wheel', handleWheel)
        scrollArea.removeEventListener('touchstart', handleTouchStart)
        scrollArea.removeEventListener('touchmove', handleTouchMove)
      }
    }

    // Wait for dialog to render
    const timer = setTimeout(handleDialogScroll, 100)
    return () => clearTimeout(timer)
  }, [isRequestDialogOpen])

  // Get hospital ID from URL parameters
  const { hospitalId } = useParams<{ hospitalId: string }>()
  
  if (!hospitalId) {
    return <div>Error: Hospital ID not found in URL</div>
  }

  React.useEffect(() => {
    fetchAllTransferData()
  }, [])

  const fetchAllTransferData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchOutgoingTransfers(),
        fetchIncomingTransfers(),
        fetchPendingTransfers(),
        fetchActiveTransfers(),
        fetchStatistics()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchOutgoingTransfers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/outgoing`)
      if (response.ok) {
        const data = await response.json()
        setOutgoingTransfers(data)
      }
    } catch (error) {
      console.error('Failed to fetch outgoing transfers:', error)
      setOutgoingTransfers([])
    }
  }

  const fetchIncomingTransfers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/incoming`)
      if (response.ok) {
        const data = await response.json()
        setIncomingTransfers(data)
      }
    } catch (error) {
      console.error('Failed to fetch incoming transfers:', error)
      setIncomingTransfers([])
    }
  }

  const fetchPendingTransfers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/incoming/pending`)
      if (response.ok) {
        const data = await response.json()
        setPendingTransfers(data)
      }
    } catch (error) {
      console.error('Failed to fetch pending transfers:', error)
      setPendingTransfers([])
    }
  }

  const fetchActiveTransfers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/active`)
      if (response.ok) {
        const data = await response.json()
        setActiveTransfers(data)
      }
    } catch (error) {
      console.error('Failed to fetch active transfers:', error)
      setActiveTransfers([])
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/statistics`)
      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  }

  const getHospitalRecommendations = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferRequest)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRecommendations(result.recommendations)
          setIsRecommendationsDialogOpen(true)
        } else {
          throw new Error(result.message)
        }
      } else {
        throw new Error('Failed to get recommendations')
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
      toast.error('Failed to get hospital recommendations')
    }
  }

  const createTransferRequest = async (selectedHospitalId?: string) => {
    try {
      const requestData = {
        ...transferRequest,
        requestedHospitalId: selectedHospitalId
      }

      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Transfer request created successfully')
          setIsRequestDialogOpen(false)
          setIsRecommendationsDialogOpen(false)
          resetTransferRequest()
          fetchAllTransferData()
        } else {
          throw new Error(result.message)
        }
      } else {
        throw new Error('Failed to create transfer request')
      }
    } catch (error) {
      console.error('Error creating transfer request:', error)
      toast.error('Failed to create transfer request')
    }
  }

  const acceptTransfer = async (transferId: string, notes?: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/${transferId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Transfer accepted successfully')
          fetchAllTransferData()
        } else {
          throw new Error(result.message)
        }
      } else {
        throw new Error('Failed to accept transfer')
      }
    } catch (error) {
      console.error('Error accepting transfer:', error)
      toast.error('Failed to accept transfer')
    }
  }

  const rejectTransfer = async (transferId: string, rejectionReason: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/transfers/${transferId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Transfer rejected')
          fetchAllTransferData()
        } else {
          throw new Error(result.message)
        }
      } else {
        throw new Error('Failed to reject transfer')
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error)
      toast.error('Failed to reject transfer')
    }
  }

  const resetTransferRequest = () => {
    setTransferRequest({
      patientId: "",
      patientName: "",
      heartRate: 80,
      oxygenLevel: 98,
      temperature: 37.0,
      bpSystolic: 120,
      bpDiastolic: 80,
      respiratoryRate: 16,
      supplementalO2: false,
      consciousnessLevel: "ALERT",
      severityLevel: 1,
      requiredSpecialty: "",
      trafficCondition: "MODERATE",
      estimatedTravelTime: 30,
      transferReason: "NO_SPECIALIST_AVAILABLE",
      reasonDescription: "",
      notes: "",
      requestedHospitalId: undefined
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-smooth">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transfer Management</h2>
          <p className="text-muted-foreground">AI-assisted inter-hospital patient transfers with real-time tracking.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchAllTransferData}>
            <RotateCcw className="size-4" />
          </Button>
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                New Transfer Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col transfer-modal">
              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
                <DialogTitle>Create Transfer Request</DialogTitle>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 dialog-scroll force-scroll" style={{ 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                transform: 'translate3d(0, 0, 0)'
              }}>
                <div className="space-y-6 pb-4">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="size-5" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Patient ID</Label>
                      <Input
                        id="patientId"
                        value={transferRequest.patientId}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, patientId: e.target.value }))}
                        placeholder="Enter patient ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input
                        id="patientName"
                        value={transferRequest.patientName}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, patientName: e.target.value }))}
                        placeholder="Enter patient name"
                      />
                    </div>
                  </div>
                </div>

                {/* Patient Vitals */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="size-5" />
                    Patient Vitals
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                      <Input
                        id="heartRate"
                        type="number"
                        value={transferRequest.heartRate}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, heartRate: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxygenLevel">Oxygen Level (%)</Label>
                      <Input
                        id="oxygenLevel"
                        type="number"
                        step="0.1"
                        value={transferRequest.oxygenLevel}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, oxygenLevel: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={transferRequest.temperature}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bpSystolic">BP Systolic</Label>
                      <Input
                        id="bpSystolic"
                        type="number"
                        value={transferRequest.bpSystolic}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bpDiastolic">BP Diastolic</Label>
                      <Input
                        id="bpDiastolic"
                        type="number"
                        value={transferRequest.bpDiastolic}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, bpDiastolic: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        value={transferRequest.respiratoryRate}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, respiratoryRate: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consciousnessLevel">Consciousness Level (AVPU)</Label>
                      <Select 
                        value={transferRequest.consciousnessLevel} 
                        onValueChange={(value: ConsciousnessLevel) => setTransferRequest(prev => ({ ...prev, consciousnessLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALERT">Alert (A) - Fully conscious</SelectItem>
                          <SelectItem value="VOICE">Voice (V) - Responds to voice</SelectItem>
                          <SelectItem value="PAIN">Pain (P) - Responds to pain only</SelectItem>
                          <SelectItem value="UNRESPONSIVE">Unresponsive (U) - No response</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplementalO2" className="block">Supplemental O2 (Oxygen Support)</Label>
                      <div className="flex items-center space-x-2 h-10">
                        <input
                          type="checkbox"
                          id="supplementalO2"
                          checked={transferRequest.supplementalO2}
                          onChange={(e) => setTransferRequest(prev => ({ ...prev, supplementalO2: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="supplementalO2" className="text-sm">Yes, patient requires oxygen support</Label>
                      </div>
                    </div>
                  </div>

                  {/* NEWS2 Score Display */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Stethoscope className="size-4" />
                      NEWS2 Clinical Score
                    </h4>
                    <NEWS2ScoreDisplay 
                      heartRate={transferRequest.heartRate}
                      oxygenLevel={transferRequest.oxygenLevel}
                      temperature={transferRequest.temperature}
                      bpSystolic={transferRequest.bpSystolic}
                      respiratoryRate={transferRequest.respiratoryRate}
                      supplementalO2={transferRequest.supplementalO2}
                      consciousnessLevel={transferRequest.consciousnessLevel}
                    />
                  </div>
                </div>

                {/* Transfer Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Hospital className="size-5" />
                    Transfer Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requiredSpecialty">Required Specialty</Label>
                      <Select 
                        value={transferRequest.requiredSpecialty} 
                        onValueChange={(value) => setTransferRequest(prev => ({ ...prev, requiredSpecialty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map(specialty => (
                            <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transferReason">Transfer Reason</Label>
                      <Select 
                        value={transferRequest.transferReason} 
                        onValueChange={(value: TransferReason) => setTransferRequest(prev => ({ ...prev, transferReason: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSFER_REASONS.map(reason => (
                            <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trafficCondition">Traffic Condition</Label>
                      <Select 
                        value={transferRequest.trafficCondition} 
                        onValueChange={(value: TrafficCondition) => setTransferRequest(prev => ({ ...prev, trafficCondition: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LIGHT">Light</SelectItem>
                          <SelectItem value="MODERATE">Moderate</SelectItem>
                          <SelectItem value="HEAVY">Heavy</SelectItem>
                          <SelectItem value="SEVERE">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedTravelTime">Est. Travel Time (min)</Label>
                      <Input
                        id="estimatedTravelTime"
                        type="number"
                        value={transferRequest.estimatedTravelTime}
                        onChange={(e) => setTransferRequest(prev => ({ ...prev, estimatedTravelTime: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reasonDescription">Reason Description</Label>
                    <Input
                      id="reasonDescription"
                      value={transferRequest.reasonDescription}
                      onChange={(e) => setTransferRequest(prev => ({ ...prev, reasonDescription: e.target.value }))}
                      placeholder="Detailed reason for transfer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Input
                      id="notes"
                      value={transferRequest.notes}
                      onChange={(e) => setTransferRequest(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional information"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={getHospitalRecommendations} className="flex-1">
                    <Brain className="size-4 mr-2" />
                    Get AI Recommendations
                  </Button>
                  <Button variant="outline" onClick={() => createTransferRequest()}>
                    Create Without Recommendations
                  </Button>
                </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-white flex-shrink-0">
                <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <StatCard
          title="Outgoing Transfers"
          value={statistics.totalOutgoing.toString()}
          subtitle="Requests sent"
          icon={ArrowUpRight}
          className="border-l-4 border-l-blue-500"
        />
        <StatCard
          title="Incoming Transfers"
          value={statistics.totalIncoming.toString()}
          subtitle="Requests received"
          icon={ArrowDownLeft}
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Active Transfers"
          value={statistics.activeTransfers.toString()}
          subtitle="In progress"
          icon={ArrowRightLeft}
          className="border-l-4 border-l-primary"
        />
        <StatCard
          title="Pending Requests"
          value={statistics.pendingRequests.toString()}
          subtitle="Awaiting response"
          icon={Clock}
          className="border-l-4 border-l-yellow-500"
        />
        <StatCard
          title="Acceptance Rate"
          value={`${statistics.acceptanceRate}%`}
          subtitle="Success rate"
          icon={CheckCircle2}
          className="border-l-4 border-l-emerald-500"
        />
      </div>

      {/* Transfer Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Management</CardTitle>
          <CardDescription>Monitor and manage all transfer requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="outgoing" className="flex items-center gap-2">
                <ArrowUpRight className="size-4" />
                Outgoing ({outgoingTransfers.length})
              </TabsTrigger>
              <TabsTrigger value="incoming" className="flex items-center gap-2">
                <ArrowDownLeft className="size-4" />
                Incoming ({incomingTransfers.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="size-4" />
                Pending ({pendingTransfers.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Activity className="size-4" />
                Active ({activeTransfers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outgoing" className="mt-6">
              <TransferTable 
                transfers={outgoingTransfers} 
                type="outgoing" 
                onViewDetails={setSelectedTransfer}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="incoming" className="mt-6">
              <TransferTable 
                transfers={incomingTransfers} 
                type="incoming" 
                onViewDetails={setSelectedTransfer}
                onAccept={(transfer) => {
                  setSelectedTransfer(transfer)
                  setAcceptanceNotes("")
                }}
                onReject={(transfer) => {
                  setSelectedTransfer(transfer)
                  setRejectionReason("")
                }}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <TransferTable 
                transfers={pendingTransfers} 
                type="pending" 
                onViewDetails={setSelectedTransfer}
                onAccept={(transfer) => {
                  setSelectedTransfer(transfer)
                  setAcceptanceNotes("")
                }}
                onReject={(transfer) => {
                  setSelectedTransfer(transfer)
                  setRejectionReason("")
                }}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <TransferTable 
                transfers={activeTransfers} 
                type="active" 
                onViewDetails={setSelectedTransfer}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Hospital Recommendations Dialog */}
      <Dialog open={isRecommendationsDialogOpen} onOpenChange={setIsRecommendationsDialogOpen}>
        <DialogContent 
          className="max-w-6xl max-h-[90vh] flex flex-col"
          onWheel={(e) => e.stopPropagation()}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Brain className="size-5" />
              AI Hospital Recommendations
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overscroll-contain">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recommendations available
              </div>
            ) : (
              recommendations.map((hospital, index) => (
                <Card key={hospital.hospitalId} className="relative hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{hospital.hospitalName}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {hospital.distanceKm} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="size-3" />
                              {hospital.travelTimeMinutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="size-3" />
                              AI Score: {hospital.aiScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={hospital.isAcceptingTransfers ? "default" : "secondary"}>
                          {hospital.isAcceptingTransfers ? "Accepting" : "Not Accepting"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{hospital.icuBedsAvailable}</div>
                        <div className="text-xs text-muted-foreground">ICU Beds</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{hospital.generalBedsAvailable}</div>
                        <div className="text-xs text-muted-foreground">General Beds</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{hospital.ventilatorsAvailable}</div>
                        <div className="text-xs text-muted-foreground">Ventilators</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{hospital.specialistCount}</div>
                        <div className="text-xs text-muted-foreground">Specialists</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Hospital Load</span>
                        <span className="font-medium">{hospital.hospitalLoadPercentage}% - {hospital.loadStatus}</span>
                      </div>
                      <Progress value={hospital.hospitalLoadPercentage} className="h-2" />
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <div className="text-sm font-medium mb-1">AI Reasoning:</div>
                      <div className="text-sm text-muted-foreground">{hospital.reasoning}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {hospital.hasRequiredSpecialty && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="size-3 mr-1" />
                            Has Specialty
                          </Badge>
                        )}
                        {hospital.hasRequiredEquipment && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <CheckCircle className="size-3 mr-1" />
                            Has Equipment
                          </Badge>
                        )}
                        {hospital.isHospitalFull && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <AlertTriangle className="size-3 mr-1" />
                            Hospital Full
                          </Badge>
                        )}
                      </div>
                      <Button 
                        onClick={() => createTransferRequest(hospital.hospitalId)}
                        disabled={!hospital.isAcceptingTransfers}
                      >
                        Select Hospital
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Details Dialog */}
      {selectedTransfer && (
        <Dialog open={!!selectedTransfer} onOpenChange={() => setSelectedTransfer(null)}>
          <DialogContent 
            className="max-w-2xl max-h-[90vh] flex flex-col"
            onWheel={(e) => e.stopPropagation()}
          >
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Transfer Details</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overscroll-contain">
              <TransferDetailsView 
                transfer={selectedTransfer}
                onAccept={acceptTransfer}
                onReject={rejectTransfer}
                acceptanceNotes={acceptanceNotes}
                setAcceptanceNotes={setAcceptanceNotes}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Transfer Table Component
interface TransferTableProps {
  transfers: Transfer[]
  type: 'outgoing' | 'incoming' | 'pending' | 'active'
  onViewDetails: (transfer: Transfer) => void
  onAccept?: (transfer: Transfer) => void
  onReject?: (transfer: Transfer) => void
  loading: boolean
}

function TransferTable({ transfers, type, onViewDetails, onAccept, onReject, loading }: TransferTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {type} transfers found
      </div>
    )
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto rounded-md border dialog-scroll">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className="bg-muted/30">
            <TableHead>Patient</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {transfers.map((transfer) => {
          const StatusIcon = getStatusIcon(transfer.status)
          return (
            <TableRow key={transfer.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell>
                <div className="font-semibold">{transfer.patientName}</div>
                <div className="text-sm text-muted-foreground">ID: {transfer.patientId}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {type === 'outgoing' ? transfer.toHospitalName || 'Pending Assignment' : transfer.fromHospitalName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {type === 'outgoing' ? 'To' : 'From'}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{transfer.requiredSpecialty}</Badge>
              </TableCell>
              <TableCell>
                <SeverityBadge severity={getSeverityFromLevel(transfer.severityLevel)} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIcon className="size-4" />
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize", STATUS_COLORS[transfer.status])}
                  >
                    {transfer.status.replace('_', ' ').toLowerCase()}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <div>{formatDateTime(transfer.requestedAt)}</div>
                {transfer.estimatedArrival && (
                  <div className="text-muted-foreground">
                    ETA: {formatDateTime(transfer.estimatedArrival)}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(transfer)}>
                    <Eye className="size-4" />
                  </Button>
                  {type === 'pending' && transfer.status === 'REQUESTED' && onAccept && onReject && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => onAccept(transfer)}
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onReject(transfer)}
                      >
                        <XCircle className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
    </div>
  )
}

// Transfer Details View Component
interface TransferDetailsViewProps {
  transfer: Transfer
  onAccept: (transferId: string, notes?: string) => void
  onReject: (transferId: string, reason: string) => void
  acceptanceNotes: string
  setAcceptanceNotes: (notes: string) => void
  rejectionReason: string
  setRejectionReason: (reason: string) => void
}

function TransferDetailsView({ 
  transfer, 
  onAccept, 
  onReject, 
  acceptanceNotes, 
  setAcceptanceNotes,
  rejectionReason,
  setRejectionReason
}: TransferDetailsViewProps) {
  const [showAcceptForm, setShowAcceptForm] = React.useState(false)
  const [showRejectForm, setShowRejectForm] = React.useState(false)

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Patient Information</h3>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">Name:</span> {transfer.patientName}</div>
            <div><span className="font-medium">ID:</span> {transfer.patientId}</div>
            <div><span className="font-medium">Specialty:</span> {transfer.requiredSpecialty}</div>
            <div><span className="font-medium">Severity:</span> <SeverityBadge severity={getSeverityFromLevel(transfer.severityLevel)} /></div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Transfer Details</h3>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">From:</span> {transfer.fromHospitalName}</div>
            <div><span className="font-medium">To:</span> {transfer.toHospitalName || 'Pending'}</div>
            <div><span className="font-medium">Reason:</span> {transfer.transferReason}</div>
            <div><span className="font-medium">Status:</span> 
              <Badge className={cn("ml-2", STATUS_COLORS[transfer.status])}>
                {transfer.status.replace('_', ' ').toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="font-semibold mb-2">Timeline</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>Requested: {formatDateTime(transfer.requestedAt)}</span>
          </div>
          {transfer.acceptedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-600" />
              <span>Accepted: {formatDateTime(transfer.acceptedAt)}</span>
            </div>
          )}
          {transfer.dispatchedAt && (
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-blue-600" />
              <span>Dispatched: {formatDateTime(transfer.dispatchedAt)}</span>
            </div>
          )}
          {transfer.arrivedAt && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-purple-600" />
              <span>Arrived: {formatDateTime(transfer.arrivedAt)}</span>
            </div>
          )}
          {transfer.completedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Completed: {formatDateTime(transfer.completedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {transfer.notes && (
        <div>
          <h3 className="font-semibold mb-2">Notes</h3>
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            {transfer.notes}
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      {transfer.aiRecommendationScore && (
        <div>
          <h3 className="font-semibold mb-2">AI Recommendation</h3>
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="size-4" />
              <span className="font-medium">Score: {transfer.aiRecommendationScore.toFixed(1)}</span>
            </div>
            {transfer.aiReasoning && <div>{transfer.aiReasoning}</div>}
          </div>
        </div>
      )}

      {/* Actions for pending transfers */}
      {transfer.status === 'REQUESTED' && (
        <div className="flex gap-2 pt-4 border-t">
          {!showAcceptForm && !showRejectForm && (
            <>
              <Button onClick={() => setShowAcceptForm(true)} className="flex-1">
                <CheckCircle className="size-4 mr-2" />
                Accept Transfer
              </Button>
              <Button variant="outline" onClick={() => setShowRejectForm(true)} className="flex-1">
                <XCircle className="size-4 mr-2" />
                Reject Transfer
              </Button>
            </>
          )}

          {showAcceptForm && (
            <div className="w-full space-y-3">
              <div>
                <Label htmlFor="acceptanceNotes">Acceptance Notes (Optional)</Label>
                <Input
                  id="acceptanceNotes"
                  value={acceptanceNotes}
                  onChange={(e) => setAcceptanceNotes(e.target.value)}
                  placeholder="Any notes for the requesting hospital"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => onAccept(transfer.id, acceptanceNotes)} className="flex-1">
                  Confirm Accept
                </Button>
                <Button variant="outline" onClick={() => setShowAcceptForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showRejectForm && (
            <div className="w-full space-y-3">
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Input
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => onReject(transfer.id, rejectionReason)} 
                  className="flex-1"
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Reject
                </Button>
                <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper functions
function formatDateTime(dateString?: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

function getSeverityFromLevel(level: number): Severity {
  if (level >= 7) return 'critical'
  if (level >= 4) return 'moderate'
  return 'stable'
}

// Helper function to get status icon (moved outside component to avoid re-creation)
function getStatusIcon(status: TransferStatus) {
  switch (status) {
    case 'REQUESTED': return Clock
    case 'ACCEPTED': return CheckCircle
    case 'REJECTED': return XCircle
    case 'AMBULANCE_DISPATCHED': return Truck
    case 'EN_ROUTE': return Navigation
    case 'ARRIVED': return MapPin
    case 'COMPLETED': return CheckCircle2
    case 'CANCELLED': return XCircle
    default: return Clock
  }
}

// NEWS2 Score Display Component
interface NEWS2ScoreProps {
  heartRate?: number
  oxygenLevel?: number
  temperature?: number
  bpSystolic?: number
  respiratoryRate?: number
  supplementalO2?: boolean
  consciousnessLevel?: ConsciousnessLevel
}

function NEWS2ScoreDisplay({ 
  heartRate, 
  oxygenLevel, 
  temperature, 
  bpSystolic, 
  respiratoryRate, 
  supplementalO2, 
  consciousnessLevel 
}: NEWS2ScoreProps) {
  const calculateNEWS2Score = () => {
    let score = 0;
    
    // Respiratory Rate (12-20 normal)
    if (respiratoryRate) {
      if (respiratoryRate <= 8) score += 3;
      else if (respiratoryRate <= 11) score += 1;
      else if (respiratoryRate >= 25) score += 3;
      else if (respiratoryRate >= 21) score += 2;
    }
    
    // Oxygen Saturation
    if (oxygenLevel) {
      if (supplementalO2) {
        // On oxygen
        if (oxygenLevel <= 83) score += 3;
        else if (oxygenLevel <= 85) score += 2;
        else if (oxygenLevel <= 87) score += 1;
      } else {
        // Room air
        if (oxygenLevel <= 91) score += 3;
        else if (oxygenLevel <= 93) score += 2;
        else if (oxygenLevel <= 95) score += 1;
      }
    }
    
    // Supplemental Oxygen
    if (supplementalO2) score += 2;
    
    // Blood Pressure
    if (bpSystolic) {
      if (bpSystolic <= 90) score += 3;
      else if (bpSystolic <= 100) score += 2;
      else if (bpSystolic <= 110) score += 1;
      else if (bpSystolic >= 220) score += 3;
    }
    
    // Heart Rate
    if (heartRate) {
      if (heartRate <= 40) score += 3;
      else if (heartRate <= 50) score += 1;
      else if (heartRate >= 131) score += 3;
      else if (heartRate >= 111) score += 2;
      else if (heartRate >= 91) score += 1;
    }
    
    // Consciousness Level
    if (consciousnessLevel && consciousnessLevel !== 'ALERT') {
      score += 3;
    }
    
    // Temperature
    if (temperature) {
      if (temperature <= 35.0) score += 3;
      else if (temperature <= 36.0) score += 1;
      else if (temperature >= 39.1) score += 2;
      else if (temperature >= 38.1) score += 1;
    }
    
    return score;
  };

  const getRiskCategory = (score: number) => {
    if (score === 0) return { level: 'LOW', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 4) return { level: 'LOW', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 6) return { level: 'MEDIUM', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'HIGH', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getClinicalResponse = (score: number) => {
    if (score === 0) return 'Routine monitoring';
    if (score <= 4) return 'Hourly monitoring required';
    if (score <= 6) return 'Urgent clinical response';
    return 'Emergency response required';
  };

  const score = calculateNEWS2Score();
  const risk = getRiskCategory(score);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("px-3 py-1 rounded-full text-sm font-bold", risk.bg, risk.color)}>
            NEWS2 Score: {score}
          </div>
          <Badge variant="outline" className={cn("font-medium", risk.color)}>
            {risk.level} RISK
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {getClinicalResponse(score)}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="font-medium">Respiratory</div>
          <div className="text-muted-foreground">{respiratoryRate || '--'} /min</div>
        </div>
        <div className="text-center">
          <div className="font-medium">SpO2</div>
          <div className="text-muted-foreground">
            {oxygenLevel || '--'}% {supplementalO2 ? '(O2)' : '(Air)'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium">Consciousness</div>
          <div className="text-muted-foreground">{consciousnessLevel || 'ALERT'}</div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        NEWS2 (National Early Warning Score) helps identify deteriorating patients requiring urgent clinical attention.
      </div>
    </div>
  );
}