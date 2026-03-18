import * as React from "react"
import { useParams } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Stethoscope,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Doctor {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  hireDate: string;
  yearsOfExperience: number;
  specialties: string[];
  qualifications: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    specialization: string;
  }>;
  availabilityStatus: 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE';
  shiftStartTime?: string;
  shiftEndTime?: string;
  notes?: string;
  isActive: boolean;
}

interface CreateDoctorForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  specialties: string[];
  qualifications: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    specialization: string;
  }>;
  initialStatus: 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE';
  shiftStartTime?: string;
  shiftEndTime?: string;
  notes?: string;
  // New Indian healthcare fields (UI only)
  medicalCouncilRegNo: string;
  department: string;
  dutyShift: string;
  languagesSpoken: string[];
  yearsOfExperience: number;
  onCallAvailable: boolean;
}

const SPECIALTIES = [
  "Cardiology", "Emergency Medicine", "Neurology", "Pediatrics", "Orthopedics",
  "Radiology", "Anesthesiology", "Surgery", "Internal Medicine", "Psychiatry",
  "Dermatology", "Oncology", "Gynecology", "Urology", "Ophthalmology"
]

const AVAILABILITY_STATUS_COLORS = {
  ON_DUTY: "bg-green-500 hover:bg-green-600",
  OFF_DUTY: "bg-gray-500 hover:bg-gray-600", 
  ON_LEAVE: "bg-yellow-500 hover:bg-yellow-600"
}

const AVAILABILITY_STATUS_ICONS = {
  ON_DUTY: UserCheck,
  OFF_DUTY: UserX,
  ON_LEAVE: Clock
}

export default function DoctorsManagement() {
  const [doctors, setDoctors] = React.useState<Doctor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [editingDoctor, setEditingDoctor] = React.useState<Doctor | null>(null)
  const [formData, setFormData] = React.useState<CreateDoctorForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    specialties: [],
    qualifications: [],
    initialStatus: "OFF_DUTY",
    notes: "",
    // New Indian healthcare fields (UI only)
    medicalCouncilRegNo: "",
    department: "",
    dutyShift: "",
    languagesSpoken: [],
    yearsOfExperience: 0,
    onCallAvailable: false
  })

  // Get hospital ID from URL params
  const { hospitalId } = useParams<{ hospitalId: string }>()

  // Enhanced dialog scroll handling
  React.useEffect(() => {
    if (!isAddDialogOpen) return

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
  }, [isAddDialogOpen])

  React.useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/doctors`)
      if (response.ok) {
        const data = await response.json()
        // Transform backend data to match frontend interface
        const transformedDoctors = data.map((doctor: any) => ({
          ...doctor,
          fullName: doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
          specialties: doctor.specialization ? doctor.specialization.split(',').map((s: string) => s.trim()) : [],
          qualifications: doctor.qualifications ? (typeof doctor.qualifications === 'string' ? JSON.parse(doctor.qualifications) : doctor.qualifications) : [],
          yearsOfExperience: doctor.experience ? parseInt(doctor.experience) || 0 : 0,
          availabilityStatus: doctor.availabilityStatus || 'OFF_DUTY',
          phone: doctor.phone || '',
          email: doctor.email || ''
        }))
        setDoctors(transformedDoctors)
      } else {
        throw new Error('Failed to fetch doctors')
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
      toast.error('Failed to load doctors')
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDoctor = async () => {
    try {
      // Convert array fields to strings for backend compatibility
      const doctorData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: Array.isArray(formData.specialties) ? formData.specialties.join(', ') : formData.specialties,
        qualifications: Array.isArray(formData.qualifications) ? JSON.stringify(formData.qualifications) : formData.qualifications,
        languages: Array.isArray(formData.languagesSpoken) ? formData.languagesSpoken.join(',') : formData.languagesSpoken,
        experience: `${formData.yearsOfExperience} years`,
        availabilityStatus: formData.initialStatus,
        hospitalId: hospitalId
      }
      
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Doctor added successfully')
          setIsAddDialogOpen(false)
          resetForm()
          fetchDoctors()
        } else {
          toast.error(result.message || 'Failed to create doctor')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.message || 'Failed to create doctor')
      }
    } catch (error: any) {
      console.error('Error creating doctor:', error)
      toast.error(error.message || 'Failed to add doctor')
    }
  }

  const handleUpdateAvailability = async (doctorId: string, newStatus: Doctor['availabilityStatus'], notes?: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/doctors/${doctorId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Availability updated successfully')
          fetchDoctors()
        } else {
          throw new Error(result.message)
        }
      } else {
        throw new Error('Failed to update availability')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability')
    }
  }

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to remove this doctor?')) return

    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/doctors/${doctorId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Doctor removed successfully')
          fetchDoctors()
        } else {
          throw new Error(result.message)
        }
      } else {
        throw new Error('Failed to delete doctor')
      }
    } catch (error) {
      console.error('Error deleting doctor:', error)
      toast.error('Failed to remove doctor')
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      specialties: [],
      qualifications: [],
      initialStatus: "OFF_DUTY",
      notes: "",
      // New Indian healthcare fields (UI only)
      medicalCouncilRegNo: "",
      department: "",
      dutyShift: "",
      languagesSpoken: [],
      yearsOfExperience: 0,
      onCallAvailable: false
    })
    setEditingDoctor(null)
  }

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: "", institution: "", graduationYear: new Date().getFullYear(), specialization: "" }]
    }))
  }

  const updateQualification = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map((qual, i) => 
        i === index ? { ...qual, [field]: value } : qual
      )
    }))
  }

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }))
  }

  const filteredDoctors = doctors.filter(doctor => 
    (doctor.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (doctor.specialties || []).some(s => s?.toLowerCase().includes(search.toLowerCase())) ||
    (doctor.employeeId?.toLowerCase() || '').includes(search.toLowerCase())
  )

  const onDutyCount = doctors.filter(d => d.availabilityStatus === 'ON_DUTY').length
  const offDutyCount = doctors.filter(d => d.availabilityStatus === 'OFF_DUTY').length
  const onLeaveCount = doctors.filter(d => d.availabilityStatus === 'ON_LEAVE').length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            👨‍⚕️ Doctors & Staff Management
          </h2>
          <p className="text-muted-foreground">Manage medical staff, specialties, and availability status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchDoctors} disabled={loading}>
            <RotateCcw className={cn("size-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
                <DialogTitle>Add New Doctor</DialogTitle>
              </DialogHeader>
              <div 
                className="flex-1 min-h-0 overflow-y-auto px-6 py-4 dialog-scroll force-scroll" 
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  transform: 'translate3d(0, 0, 0)'
                }}
              >
                <div className="space-y-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91-9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Professional Registration Details */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    👨‍⚕️ Professional Registration Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medicalCouncilRegNo">Medical Council Registration Number *</Label>
                      <Input
                        id="medicalCouncilRegNo"
                        value={formData.medicalCouncilRegNo}
                        onChange={(e) => setFormData(prev => ({ ...prev, medicalCouncilRegNo: e.target.value }))}
                        placeholder="MCI/State Council Reg. No."
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                          <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                          <SelectItem value="Surgery">Surgery</SelectItem>
                          <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="Obstetrics & Gynecology">Obstetrics & Gynecology</SelectItem>
                          <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Neurology">Neurology</SelectItem>
                          <SelectItem value="Radiology">Radiology</SelectItem>
                          <SelectItem value="Anesthesiology">Anesthesiology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dutyShift">Duty Shift</Label>
                      <Select value={formData.dutyShift} onValueChange={(value) => setFormData(prev => ({ ...prev, dutyShift: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning (6 AM - 2 PM)</SelectItem>
                          <SelectItem value="Evening">Evening (2 PM - 10 PM)</SelectItem>
                          <SelectItem value="Night">Night (10 PM - 6 AM)</SelectItem>
                          <SelectItem value="Rotating">Rotating Shifts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="onCallAvailable"
                        checked={formData.onCallAvailable}
                        onChange={(e) => setFormData(prev => ({ ...prev, onCallAvailable: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="onCallAvailable">On-call Availability</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="languagesSpoken">Languages Spoken</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu'].map((lang) => (
                        <label key={lang} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={formData.languagesSpoken.includes(lang)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, languagesSpoken: [...prev.languagesSpoken, lang] }))
                              } else {
                                setFormData(prev => ({ ...prev, languagesSpoken: prev.languagesSpoken.filter(l => l !== lang) }))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Specialties</Label>
                  <Select 
                    key={formData.specialties.length} // Reset component after each selection
                    onValueChange={(value) => {
                      if (!formData.specialties.includes(value)) {
                        setFormData(prev => ({ ...prev, specialties: [...prev.specialties, value] }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => {
                        setFormData(prev => ({ ...prev, specialties: prev.specialties.filter((_, i) => i !== index) }))
                      }}>
                        {specialty} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Qualifications</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addQualification}>
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mb-2 p-2 border rounded">
                      <Input
                        placeholder="Degree"
                        value={qual.degree}
                        onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                      />
                      <Input
                        placeholder="Institution"
                        value={qual.institution}
                        onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Year"
                        value={qual.graduationYear}
                        onChange={(e) => updateQualification(index, 'graduationYear', parseInt(e.target.value))}
                      />
                      <div className="flex gap-1">
                        <Input
                          placeholder="Specialization"
                          value={qual.specialization}
                          onChange={(e) => updateQualification(index, 'specialization', e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQualification(index)}>
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="initialStatus">Initial Availability Status</Label>
                  <Select value={formData.initialStatus} onValueChange={(value: any) => setFormData(prev => ({ ...prev, initialStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON_DUTY">On Duty</SelectItem>
                      <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t bg-white flex-shrink-0">
                  <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDoctor}>
                    Add Doctor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                <p className="text-2xl font-bold">{doctors.length}</p>
              </div>
              <Users className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold text-green-600">{onDutyCount}</p>
              </div>
              <UserCheck className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Off Duty</p>
                <p className="text-2xl font-bold text-gray-600">{offDutyCount}</p>
              </div>
              <UserX className="size-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">{onLeaveCount}</p>
              </div>
              <Clock className="size-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Medical Staff Directory</CardTitle>
              <CardDescription>Manage doctor information and availability status</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="size-8 mx-auto mb-4 animate-spin rounded-full border-2 border-primary/80 border-t-transparent"></div>
              <p className="text-muted-foreground">Loading doctors...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => {
                  const StatusIcon = AVAILABILITY_STATUS_ICONS[doctor.availabilityStatus]
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{doctor.fullName}</p>
                            <p className="text-sm text-muted-foreground">{doctor.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(doctor.specialties || []).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Stethoscope className="size-3 mr-1" />
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span className="font-mono">{doctor.yearsOfExperience} years</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={doctor.availabilityStatus} 
                          onValueChange={(value: Doctor['availabilityStatus']) => handleUpdateAvailability(doctor.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="size-4" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ON_DUTY">
                              <div className="flex items-center gap-2">
                                <UserCheck className="size-4 text-green-600" />
                                On Duty
                              </div>
                            </SelectItem>
                            <SelectItem value="OFF_DUTY">
                              <div className="flex items-center gap-2">
                                <UserX className="size-4 text-gray-600" />
                                Off Duty
                              </div>
                            </SelectItem>
                            <SelectItem value="ON_LEAVE">
                              <div className="flex items-center gap-2">
                                <Clock className="size-4 text-yellow-600" />
                                On Leave
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="size-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{doctor.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="size-3 text-muted-foreground" />
                            <span>{doctor.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingDoctor(doctor)}>
                            <Edit className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDoctor(doctor.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}