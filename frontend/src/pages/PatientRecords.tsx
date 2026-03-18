import * as React from "react"
import { useParams } from "react-router-dom"
import { StatCard } from "@/components/StatCard"
import { SeverityBadge } from "@/components/SeverityBadge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { QRCodeSVG } from 'qrcode.react'
import { 
  FileText, 
  Search, 
  ExternalLink, 
  User, 
  Calendar, 
  Clock, 
  HeartPulse, 
  Thermometer,
  Microscope,
  Pill,
  ClipboardCheck,
  QrCode,
  Camera,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react"

// Patient API types
interface PatientData {
  id: string
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: string
  age: number
  gender: string
  bloodType?: string
  phoneNumber?: string
  email?: string
  address?: string
  city?: string
  medicalRecordNumber: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  allergies?: string
  chronicConditions?: string
  currentMedications?: string
  status: 'ACTIVE' | 'INACTIVE'
  isEmergencyAccessEnabled: boolean
  qrCodeId: string
  createdAt: string
  updatedAt: string
  totalVisits: number
  lastVisitDate?: string
  lastVisitType?: string
}

interface PatientStats {
  totalPatients: number
  activePatients: number
  inactivePatients: number
  emergencyAccessEnabled: number
}

export default function PatientRecords() {
  const { user } = useAuth()
  const [search, setSearch] = React.useState("")
  const [selectedPatient, setSelectedPatient] = React.useState<PatientData | null>(null)
  const [patients, setPatients] = React.useState<PatientData[]>([])
  const [stats, setStats] = React.useState<PatientStats | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [qrScannerOpen, setQrScannerOpen] = React.useState(false)
  const [qrCodeInput, setQrCodeInput] = React.useState("")
  const [addPatientOpen, setAddPatientOpen] = React.useState(false)
  const [addingPatient, setAddingPatient] = React.useState(false)
  const [newPatient, setNewPatient] = React.useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    nationalId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    allergies: "",
    chronicConditions: "",
    currentMedications: "",
    medicalNotes: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceGroupNumber: "",
    isEmergencyAccessEnabled: true,
    // New Indian healthcare fields (UI only)
    abhaId: "",
    ayushmanBharatId: "",
    village: "",
    district: "",
    pincode: "",
    govScheme: "",
    schemeAuthId: "",
    coverageRemaining: "",
    approvalStatus: ""
  })

  // Get hospital ID from URL params or user context
  const { hospitalId: urlHospitalId } = useParams<{ hospitalId: string }>()
  const API_BASE = 'http://localhost:8080/api'
  const hospitalId = urlHospitalId || user?.hospitalId

  // Enhanced dialog scroll handling
  React.useEffect(() => {
    if (!addPatientOpen) return

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
  }, [addPatientOpen])

  // Fetch patient statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/statistics`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/patients?size=50`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data.content || [])
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  // Search patients
  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      fetchPatients()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/patients/search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data.content || [])
      }
    } catch (error) {
      console.error('Failed to search patients:', error)
      toast.error('Failed to search patients')
    } finally {
      setLoading(false)
    }
  }

  // Get patient by QR code
  const getPatientByQR = async (qrCode: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/patients/qr/${encodeURIComponent(qrCode)}`)
      
      if (response.ok) {
        const patient = await response.json()
        setSelectedPatient(patient)
        toast.success(`Patient found: ${patient.fullName}`)
        setQrScannerOpen(false)
        setQrCodeInput("")
      } else if (response.status === 404) {
        toast.error('Patient not found with this QR code')
      } else {
        toast.error('Failed to retrieve patient')
      }
    } catch (error) {
      console.error('Failed to get patient by QR:', error)
      toast.error('Failed to scan QR code')
    } finally {
      setLoading(false)
    }
  }

  // Handle QR code scan
  const handleQRScan = () => {
    if (qrCodeInput.trim()) {
      getPatientByQR(qrCodeInput.trim())
    }
  }

  // Create new patient
  const createPatient = async () => {
    try {
      setAddingPatient(true)
      
      // Validate required fields
      if (!newPatient.firstName || !newPatient.lastName || !newPatient.dateOfBirth || !newPatient.gender) {
        toast.error('Please fill in all required fields')
        return
      }

      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPatient,
          dateOfBirth: newPatient.dateOfBirth,
          gender: newPatient.gender.toUpperCase(),
          bloodType: newPatient.bloodType || null,
        })
      })

      if (response.ok) {
        const createdPatient = await response.json()
        toast.success(`Patient ${createdPatient.fullName} created successfully`)
        setAddPatientOpen(false)
        resetNewPatientForm()
        fetchPatients() // Refresh the list
        fetchStats() // Refresh stats
      } else {
        const errorData = await response.text()
        toast.error(`Failed to create patient: ${errorData}`)
      }
    } catch (error) {
      console.error('Failed to create patient:', error)
      toast.error('Failed to create patient')
    } finally {
      setAddingPatient(false)
    }
  }

  // Reset form
  const resetNewPatientForm = () => {
    setNewPatient({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      bloodType: "",
      phoneNumber: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      nationalId: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      allergies: "",
      chronicConditions: "",
      currentMedications: "",
      medicalNotes: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceGroupNumber: "",
      isEmergencyAccessEnabled: true,
      // New Indian healthcare fields (UI only)
      abhaId: "",
      ayushmanBharatId: "",
      village: "",
      district: "",
      pincode: "",
      govScheme: "",
      schemeAuthId: "",
      coverageRemaining: "",
      approvalStatus: ""
    })
  }

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        searchPatients(search)
      } else {
        fetchPatients()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Load initial data
  React.useEffect(() => {
    fetchStats()
    fetchPatients()
  }, [])

  const filteredPatients = patients

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            📄 Patient Records
          </h2>
          <p className="text-muted-foreground">Access secure electronic health records and diagnostic data.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setAddPatientOpen(true)}
            className="gap-2"
          >
            <UserPlus className="size-4" />
            Add Patient
          </Button>
          <Button 
            onClick={() => setQrScannerOpen(true)}
            className="gap-2"
            variant="outline"
          >
            <QrCode className="size-4" />
            Scan QR Code
          </Button>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or MRN..."
              className="pl-9 h-10 border-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients?.toString() || "0"}
          subtitle="Registered patients"
          icon={User}
        />
        <StatCard
          title="Active Patients"
          value={stats?.activePatients?.toString() || "0"}
          subtitle="Currently active"
          icon={HeartPulse}
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Emergency Access"
          value={stats?.emergencyAccessEnabled?.toString() || "0"}
          subtitle="QR enabled patients"
          icon={QrCode}
          className="border-l-4 border-l-primary"
        />
        <StatCard
          title="Inactive Patients"
          value={stats?.inactivePatients?.toString() || "0"}
          subtitle="Inactive records"
          icon={ClipboardCheck}
          className="border-l-4 border-l-gray-400"
        />
      </div>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin mr-2" />
              Loading patients...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Patient Name</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="group hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold text-xs">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </div>
                          <span className="font-semibold text-slate-900">{patient.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {patient.medicalRecordNumber}
                      </TableCell>
                      <TableCell className="text-sm">{patient.age}</TableCell>
                      <TableCell className="text-sm">{patient.gender}</TableCell>
                      <TableCell className="text-sm">{patient.bloodType || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{patient.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className={patient.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <QrCode className="size-3" />
                          {patient.qrCodeId}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <ExternalLink className="size-4 mr-2" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Dialog */}
      <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="size-5" />
              Scan Patient QR Code
            </DialogTitle>
            <DialogDescription>
              Enter the QR code ID to quickly access patient records
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code ID</label>
              <Input
                placeholder="Enter QR code (e.g., QR4EBA617B9950)"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleQRScan} 
                disabled={!qrCodeInput.trim() || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" />
                    Find Patient
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setQrScannerOpen(false)
                  setQrCodeInput("")
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              💡 Tip: You can test with QR code "QR4EBA617B9950" for the sample patient Rahul Sharma
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Detail Sheet */}
      <Sheet open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col overflow-hidden">
          {selectedPatient && (
            <div className="flex-1 overflow-y-auto pr-4 dialog-scroll" style={{ maxHeight: 'calc(100vh - 100px)', minHeight: '400px' }}>
              <div className="space-y-8 py-4 pb-8">
              <SheetHeader>
                <div className="flex items-center gap-4 mb-2">
                  <Badge variant="outline" className="border-primary/50 text-primary">Patient Record</Badge>
                  <Badge 
                    variant={selectedPatient.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={selectedPatient.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {selectedPatient.status}
                  </Badge>
                  {selectedPatient.isEmergencyAccessEnabled && (
                    <Badge variant="outline" className="border-red-500 text-red-600">
                      Emergency Access
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-3xl font-bold">{selectedPatient.fullName}</SheetTitle>
                <SheetDescription className="flex items-center gap-4 text-xs">
                  <span>MRN: {selectedPatient.medicalRecordNumber}</span>
                  <span>|</span>
                  <span>Age: {selectedPatient.age}</span>
                  <span>|</span>
                  <span>Gender: {selectedPatient.gender}</span>
                  {selectedPatient.bloodType && (
                    <>
                      <span>|</span>
                      <span>Blood: {selectedPatient.bloodType}</span>
                    </>
                  )}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-50 border-none shadow-none">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Calendar className="size-5 text-primary mb-2" />
                        <div className="text-sm text-muted-foreground">Date of Birth</div>
                        <div className="text-lg font-bold">{selectedPatient.dateOfBirth}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-none shadow-none">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <FileText className="size-5 text-blue-500 mb-2" />
                        <div className="text-sm text-muted-foreground">Total Visits</div>
                        <div className="text-lg font-bold">{selectedPatient.totalVisits}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedPatient.lastVisitDate && (
                    <Card className="border-dashed">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Last Visit</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm pb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4" />
                          {selectedPatient.lastVisitDate} - {selectedPatient.lastVisitType || 'General'}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="contact" className="pt-4 space-y-4">
                  <div className="space-y-3">
                    {selectedPatient.phoneNumber && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                        <Phone className="size-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Phone</div>
                          <div className="text-sm text-muted-foreground">{selectedPatient.phoneNumber}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPatient.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                        <Mail className="size-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Email</div>
                          <div className="text-sm text-muted-foreground">{selectedPatient.email}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPatient.address && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                        <MapPin className="size-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Address</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedPatient.address}
                            {selectedPatient.city && `, ${selectedPatient.city}`}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPatient.emergencyContactName && (
                      <div className="border-t pt-3">
                        <div className="text-sm font-medium mb-2 text-red-600">Emergency Contact</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="size-4" />
                            <span className="text-sm">{selectedPatient.emergencyContactName}</span>
                          </div>
                          {selectedPatient.emergencyContactPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="size-4" />
                              <span className="text-sm">{selectedPatient.emergencyContactPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="pt-4 space-y-4">
                  {selectedPatient.allergies && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                          <AlertTriangle className="size-4" />
                          Allergies
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm pb-4 text-red-700">
                        {selectedPatient.allergies}
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedPatient.chronicConditions && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm text-orange-800">Chronic Conditions</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm pb-4 text-orange-700">
                        {selectedPatient.chronicConditions}
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedPatient.currentMedications && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                          <Pill className="size-4" />
                          Current Medications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm pb-4 text-blue-700">
                        {selectedPatient.currentMedications}
                      </CardContent>
                    </Card>
                  )}
                  
                  {!selectedPatient.allergies && !selectedPatient.chronicConditions && !selectedPatient.currentMedications && (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <Microscope className="size-8 mb-2 opacity-20" />
                      <p className="text-xs">No medical information available</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="qr" className="pt-4 space-y-4">
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-8 text-center">
                      {/* Display actual scannable QR code */}
                      <div className="mb-6 flex justify-center">
                        <div className="bg-white p-6 rounded-xl shadow-2xl border-4 border-primary/20">
                          <QRCodeSVG
                            value={`${window.location.origin}/patient-qr/${selectedPatient.qrCodeId}`}
                            size={280}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2323B5D3'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E",
                              height: 40,
                              width: 40,
                              excavate: true,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-2 font-mono tracking-wider">{selectedPatient.qrCodeId}</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Emergency QR Code for {selectedPatient.fullName}
                      </div>
                      <Badge 
                        variant={selectedPatient.isEmergencyAccessEnabled ? 'default' : 'secondary'}
                        className={selectedPatient.isEmergencyAccessEnabled ? 'bg-green-100 text-green-800 text-sm py-1 px-3' : 'text-sm py-1 px-3'}
                      >
                        {selectedPatient.isEmergencyAccessEnabled ? '✓ Emergency Access Enabled' : 'Emergency Access Disabled'}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  {/* Download Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API_BASE}/patients/${selectedPatient.id}/pdf`;
                        link.download = `${selectedPatient.fullName.replace(/\s+/g, '_')}_medical_report.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success('PDF report downloaded');
                      }}
                    >
                      <FileText className="size-4" />
                      Download PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        // Download QR code as PNG
                        const svg = document.querySelector('svg[width="280"]') as SVGElement;
                        if (svg) {
                          const svgData = new XMLSerializer().serializeToString(svg);
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          
                          canvas.width = 400;
                          canvas.height = 400;
                          
                          img.onload = () => {
                            ctx?.drawImage(img, 0, 0, 400, 400);
                            canvas.toBlob((blob) => {
                              if (blob) {
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `QR_${selectedPatient.qrCodeId}_${selectedPatient.fullName.replace(/\s+/g, '_')}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                                toast.success('QR code downloaded');
                              }
                            });
                          };
                          
                          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                        }
                      }}
                    >
                      <QrCode className="size-4" />
                      Download QR
                    </Button>
                  </div>
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-xs text-blue-900 space-y-2">
                        <p className="font-semibold flex items-center gap-2">
                          <span className="text-blue-600">ℹ️</span> How to use this QR Code:
                        </p>
                        <ul className="space-y-1 ml-6 list-disc">
                          <li>Scan with any smartphone camera or QR reader app</li>
                          <li>Provides instant access to patient emergency records</li>
                          <li>Works offline - QR contains patient ID: {selectedPatient.qrCodeId}</li>
                          <li>High error correction - works even if partially damaged</li>
                        </ul>
                        <div className="pt-2 border-t border-blue-200 mt-3">
                          <p className="text-[10px] text-blue-700">
                            <strong>URL:</strong> {window.location.origin}/patient-qr/{selectedPatient.qrCodeId}
                          </p>
                          <p className="text-[10px] text-blue-700">
                            <strong>Created:</strong> {new Date(selectedPatient.createdAt).toLocaleDateString()} | 
                            <strong> Updated:</strong> {new Date(selectedPatient.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `${API_BASE}/patients/${selectedPatient.id}/pdf`;
                    link.download = `${selectedPatient.fullName.replace(/\s+/g, '_')}_medical_report.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Complete medical report downloaded');
                  }}
                >
                  <FileText className="size-4" />
                  Download Report
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <ExternalLink className="size-4" />
                  View History
                </Button>
              </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Patient Dialog */}
      <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter patient information to create a new medical record.
            </DialogDescription>
          </DialogHeader>
          
          <div 
            className="flex-1 min-h-0 overflow-y-auto px-6 py-4 dialog-scroll force-scroll" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            <div className="grid gap-6 pb-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={newPatient.bloodType} onValueChange={(value) => setNewPatient({...newPatient, bloodType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A_POSITIVE">A+</SelectItem>
                      <SelectItem value="A_NEGATIVE">A-</SelectItem>
                      <SelectItem value="B_POSITIVE">B+</SelectItem>
                      <SelectItem value="B_NEGATIVE">B-</SelectItem>
                      <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                      <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                      <SelectItem value="O_POSITIVE">O+</SelectItem>
                      <SelectItem value="O_NEGATIVE">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">Aadhaar Number *</Label>
                  <Input
                    id="nationalId"
                    value={newPatient.nationalId}
                    onChange={(e) => setNewPatient({...newPatient, nationalId: e.target.value})}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={12}
                  />
                </div>
              </div>
            </div>

            {/* Government Health Scheme Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🏛️ Government Health Scheme Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="abhaId">ABHA ID (Ayushman Bharat Health Account)</Label>
                  <Input
                    id="abhaId"
                    value={newPatient.abhaId}
                    onChange={(e) => setNewPatient({...newPatient, abhaId: e.target.value})}
                    placeholder="XX-XXXX-XXXX-XXXX"
                    maxLength={17}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ayushmanBharatId">Ayushman Bharat Scheme ID</Label>
                  <Input
                    id="ayushmanBharatId"
                    value={newPatient.ayushmanBharatId}
                    onChange={(e) => setNewPatient({...newPatient, ayushmanBharatId: e.target.value})}
                    placeholder="Enter PMJAY ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="govScheme">Government Scheme</Label>
                  <Select value={newPatient.govScheme} onValueChange={(value) => setNewPatient({...newPatient, govScheme: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PMJAY">Ayushman Bharat (PMJAY)</SelectItem>
                      <SelectItem value="CGHS">Central Government Health Scheme</SelectItem>
                      <SelectItem value="ESI">Employee State Insurance</SelectItem>
                      <SelectItem value="STATE_HEALTH">State Health Insurance</SelectItem>
                      <SelectItem value="NONE">No Government Scheme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schemeAuthId">Scheme Authorization ID</Label>
                  <Input
                    id="schemeAuthId"
                    value={newPatient.schemeAuthId}
                    onChange={(e) => setNewPatient({...newPatient, schemeAuthId: e.target.value})}
                    placeholder="Enter authorization ID"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📞 Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Mobile Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newPatient.phoneNumber}
                    onChange={(e) => setNewPatient({...newPatient, phoneNumber: e.target.value})}
                    placeholder="+91-9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    placeholder="patient@gmail.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">House/Street Address</Label>
                  <Input
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    placeholder="House No., Street, Locality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village/Area</Label>
                  <Input
                    id="village"
                    value={newPatient.village}
                    onChange={(e) => setNewPatient({...newPatient, village: e.target.value})}
                    placeholder="Village or Area name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City/Town</Label>
                  <Input
                    id="city"
                    value={newPatient.city}
                    onChange={(e) => setNewPatient({...newPatient, city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={newPatient.district}
                    onChange={(e) => setNewPatient({...newPatient, district: e.target.value})}
                    placeholder="Enter district"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={newPatient.state} onValueChange={(value) => setNewPatient({...newPatient, state: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={newPatient.pincode}
                    onChange={(e) => setNewPatient({...newPatient, pincode: e.target.value})}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newPatient.country || "India"}
                    onChange={(e) => setNewPatient({...newPatient, country: e.target.value})}
                    placeholder="India"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🚨 Emergency Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContactName"
                    value={newPatient.emergencyContactName}
                    onChange={(e) => setNewPatient({...newPatient, emergencyContactName: e.target.value})}
                    placeholder="Full name of emergency contact"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={newPatient.emergencyContactPhone}
                    onChange={(e) => setNewPatient({...newPatient, emergencyContactPhone: e.target.value})}
                    placeholder="+91-9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Relationship *</Label>
                  <Select value={newPatient.emergencyContactRelation} onValueChange={(value) => setNewPatient({...newPatient, emergencyContactRelation: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Spouse">Spouse/Partner</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
                    placeholder="List any known allergies..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                  <Textarea
                    id="chronicConditions"
                    value={newPatient.chronicConditions}
                    onChange={(e) => setNewPatient({...newPatient, chronicConditions: e.target.value})}
                    placeholder="List any chronic conditions..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    value={newPatient.currentMedications}
                    onChange={(e) => setNewPatient({...newPatient, currentMedications: e.target.value})}
                    placeholder="List current medications..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalNotes">Medical Notes</Label>
                  <Textarea
                    id="medicalNotes"
                    value={newPatient.medicalNotes}
                    onChange={(e) => setNewPatient({...newPatient, medicalNotes: e.target.value})}
                    placeholder="Additional medical notes..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Insurance Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={newPatient.insuranceProvider}
                    onChange={(e) => setNewPatient({...newPatient, insuranceProvider: e.target.value})}
                    placeholder="Insurance company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={newPatient.insurancePolicyNumber}
                    onChange={(e) => setNewPatient({...newPatient, insurancePolicyNumber: e.target.value})}
                    placeholder="Policy number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceGroupNumber">Group Number</Label>
                  <Input
                    id="insuranceGroupNumber"
                    value={newPatient.insuranceGroupNumber}
                    onChange={(e) => setNewPatient({...newPatient, insuranceGroupNumber: e.target.value})}
                    placeholder="Group number"
                  />
                </div>
              </div>
            </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-6 py-4 border-t bg-white flex-shrink-0">
              <Button 
                onClick={createPatient} 
                disabled={addingPatient}
                className="flex-1"
              >
                {addingPatient ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Creating Patient...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-2" />
                    Create Patient
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setAddPatientOpen(false)
                  resetNewPatientForm()
                }}
                disabled={addingPatient}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
