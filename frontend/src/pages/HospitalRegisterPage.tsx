import * as React from "react"
import { useNavigate } from "react-router-dom"
import { 
  Building2, 
  MapPin, 
  Activity, 
  Stethoscope, 
  Syringe, 
  Phone, 
  FileBox, 
  ShieldCheck,
  Upload,
  ChevronLeft
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { OptimizedAuroraBackground } from "@/components/ui/optimized-aurora-background"
import { LoginNavbar } from "@/components/ui/login-navbar"
import { hospitalApi } from "@/lib/api"

export default function HospitalRegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [location, setLocation] = React.useState({ lat: "", lng: "" })
  const [uploadedFiles, setUploadedFiles] = React.useState<{[key: string]: File}>({})
  
  // Form state
  const [formData, setFormData] = React.useState({
    // Basic Information
    name: "",
    registrationNumber: "",
    type: "",
    ownership: "",
    yearEstablished: "",
    
    // Location
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    
    // Infrastructure
    totalBeds: 0,
    icuBeds: 0,
    emergencyBeds: 0,
    ventilators: 0,
    operatingRooms: 0,
    
    // Specialties
    specialties: [] as string[],
    
    // Equipment
    equipment: {
      ctScan: false,
      mri: false,
      bloodBank: false,
      dialysis: false,
      ecmo: false
    },
    
    // Contact
    emergencyContact: "",
    controlRoomContact: "",
    email: "",
    adminContactPerson: "",
    adminPhone: "",
    
    // Admin Account
    adminEmail: "",
    adminPassword: "",
    confirmPassword: ""
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipment]: checked
      }
    }))
  }

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleFileUpload = (type: string, file: File | null) => {
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [type]: file
      }))
      toast.success(`${type} document uploaded`)
    }
  }

  const handleMapClick = () => {
    // Simulate getting location - in real app, you'd use geolocation API or map picker
    const lat = (28.6139 + (Math.random() - 0.5) * 0.1).toFixed(4)
    const lng = (77.2090 + (Math.random() - 0.5) * 0.1).toFixed(4)
    
    setLocation({ lat, lng })
    handleInputChange("latitude", lat)
    handleInputChange("longitude", lng)
    toast.success("Location pinned successfully")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    if (!location.lat || !location.lng) {
      toast.error("Please pin your hospital location on the map")
      return
    }
    
    if (!uploadedFiles.license || !uploadedFiles.clinical) {
      toast.error("Please upload required documents (License and Clinical Certificate)")
      return
    }
    
    setLoading(true)
    
    try {
      // Prepare hospital data for backend
      const hospitalData = {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        type: formData.type.toUpperCase(),
        ownership: formData.ownership.toUpperCase(),
        yearEstablished: parseInt(formData.yearEstablished) || null,
        
        // Location
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        coordinates: {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lng)
        },
        
        // Infrastructure
        infrastructure: {
          totalBeds: formData.totalBeds,
          icuBeds: formData.icuBeds,
          emergencyBeds: formData.emergencyBeds,
          ventilators: formData.ventilators,
          operatingRooms: formData.operatingRooms
        },
        
        // Specialties
        specialties: formData.specialties,
        
        // Equipment
        equipment: formData.equipment,
        
        // Contact Information
        emergencyContact: formData.emergencyContact,
        controlRoomContact: formData.controlRoomContact,
        email: formData.email,
        adminContactPerson: formData.adminContactPerson,
        adminPhone: formData.adminPhone,
        
        // Admin Account
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      }
      
      // Register hospital
      const registeredHospital = await hospitalApi.register(hospitalData)
      
      // Upload documents
      if (registeredHospital.id) {
        await hospitalApi.uploadDocuments(registeredHospital.id, uploadedFiles)
      }
      
      toast.success("Hospital Registration Submitted Successfully!", {
        description: "Status: Pending Verification"
      })
      
      navigate("/login")
    } catch (error) {
      console.error("Registration failed:", error)
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleDraft = () => {
    toast.info("Draft saved successfully")
  }

  return (
    <>
      <LoginNavbar />
      <OptimizedAuroraBackground>
      <div className="relative z-10 w-full max-w-[800px] pt-24 pb-12 animate-in fade-in zoom-in-95 duration-1000 ease-out px-4">
        
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={() => navigate("/login")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          <div className="text-white/80 text-sm font-medium tracking-wide text-right">
            PULSENET
          </div>
        </div>

        <Card className="border-white/60 bg-white/70 backdrop-blur-md shadow-[var(--shadow-login)] rounded-[18px] overflow-hidden transition-all duration-500">
          <CardHeader className="space-y-1 p-8 pb-6 border-b border-white/40 bg-white/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                  Hospital Registration
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500/80 mt-1">
                  Join the integrated healthcare network
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <form id="registration-form" onSubmit={handleSubmit} className="divide-y divide-slate-200/50">
              
              {/* Section 1: Basic Information */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                  <Building2 className="w-5 h-5" />
                  <h3>1. Basic Hospital Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input 
                      id="hospitalName" 
                      placeholder="Enter full hospital name" 
                      required 
                      className="bg-white/50"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNo">Hospital Registration No</Label>
                    <Input 
                      id="registrationNo" 
                      placeholder="Registration number" 
                      required 
                      className="bg-white/50"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalType">Hospital Type</Label>
                    <Select required value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearEstablished">Year Est.</Label>
                      <Input id="yearEstablished" type="number" placeholder="YYYY" className="bg-white/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownershipType">Ownership</Label>
                      <Select>
                        <SelectTrigger className="bg-white/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="society">Society</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Location Details */}
              <div className="p-8 space-y-6 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <MapPin className="w-5 h-5" />
                    <h3>2. Hospital Location</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-200/50 px-2 py-1 rounded">Crucial for ambulance routing</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" placeholder="Street address, block, area" required className="bg-white/50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="City" required className="bg-white/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="State" required className="bg-white/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" placeholder="PIN/Zip" required className="bg-white/50" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="mb-2 block">Location on Map</Label>
                    <div 
                      onClick={handleMapClick}
                      className="w-full h-[200px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden"
                    >
                      {location.lat ? (
                        <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center">
                          <div className="text-center">
                            <MapPin className="w-8 h-8 text-primary mx-auto mb-2 drop-shadow-md" />
                            <p className="text-sm font-semibold text-slate-700">Location Pinned</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <MapPin className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors mb-2" />
                          <p className="text-sm font-medium text-slate-500 group-hover:text-slate-700">Click to pin hospital location</p>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Latitude</Label>
                        <Input value={location.lat} readOnly placeholder="Auto-filled" className="bg-slate-100/50 text-slate-600 font-mono text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Longitude</Label>
                        <Input value={location.lng} readOnly placeholder="Auto-filled" className="bg-slate-100/50 text-slate-600 font-mono text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Emergency Infrastructure */}
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Activity className="w-5 h-5" />
                    <h3>3. Infrastructure Capacity</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-200/50 px-2 py-1 rounded">Feeds AI recommendation system</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icuBeds" className="text-xs line-clamp-1">ICU Beds</Label>
                    <Input id="icuBeds" type="number" min="0" defaultValue="0" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genBeds" className="text-xs line-clamp-1">General Beds</Label>
                    <Input id="genBeds" type="number" min="0" defaultValue="0" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergBeds" className="text-xs line-clamp-1">Emergency Beds</Label>
                    <Input id="emergBeds" type="number" min="0" defaultValue="0" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vents" className="text-xs line-clamp-1">Ventilators</Label>
                    <Input id="vents" type="number" min="0" defaultValue="0" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ors" className="text-xs line-clamp-1">Operating Rooms</Label>
                    <Input id="ors" type="number" min="0" defaultValue="0" required className="bg-white/50" />
                  </div>
                </div>
              </div>

              {/* Section 4: Medical Specialties */}
              <div className="p-8 space-y-6 bg-slate-50/30">
                <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                  <Stethoscope className="w-5 h-5" />
                  <h3>4. Medical Specialties</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "Cardiology", "Neurology", "Trauma Surgery", "Emergency Medicine",
                    "Orthopedics", "Pediatrics", "General Surgery"
                  ].map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox id={`spec-${spec}`} />
                      <Label htmlFor={`spec-${spec}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {spec}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Critical Equipment */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                  <Syringe className="w-5 h-5" />
                  <h3>5. Critical Equipment Availability</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    { id: "ct", label: "CT Scan Available" },
                    { id: "mri", label: "MRI Available" },
                    { id: "blood", label: "Blood Bank Available" },
                    { id: "dialysis", label: "Dialysis Unit Available" },
                    { id: "ecmo", label: "ECMO Support" }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 bg-white/40">
                      <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                      <Switch id={item.id} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Emergency Contact */}
              <div className="p-8 space-y-6 bg-slate-50/30">
                <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                  <Phone className="w-5 h-5" />
                  <h3>6. Emergency Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emContact">Emergency Contact Number</Label>
                    <Input id="emContact" type="tel" placeholder="+91" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctrlRoom">Control Room Number</Label>
                    <Input id="ctrlRoom" type="tel" placeholder="+91" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospEmail">Hospital Email</Label>
                    <Input id="hospEmail" type="email" placeholder="contact@hospital.com" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPerson">Admin Contact Person</Label>
                    <Input id="adminPerson" placeholder="Full Name" required className="bg-white/50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="adminPhone">Admin Phone Number</Label>
                    <Input id="adminPhone" type="tel" placeholder="+91" required className="bg-white/50 md:w-1/2 md:pr-3" />
                  </div>
                </div>
              </div>

              {/* Section 7: Document Upload */}
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <FileBox className="w-5 h-5" />
                    <h3>7. Upload Documents</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-200/50 px-2 py-1 rounded">For verification process</span>
                </div>

                <div className="space-y-4">
                  {[
                    { id: "license", label: "Hospital License Certificate", required: true },
                    { id: "clinical", label: "Clinical Establishment Certificate", required: true },
                    { id: "accreditation", label: "Accreditation Certificate", required: false, optional: true }
                  ].map((doc) => (
                    <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/60 bg-white/40">
                      <div>
                        <Label htmlFor={`file-${doc.id}`} className="text-sm font-semibold text-slate-800">
                          {doc.label} {doc.optional && <span className="text-slate-400 font-normal">(Optional)</span>}
                        </Label>
                        <p className="text-xs text-slate-500 mt-0.5">PDF, JPG, or PNG (Max. 5MB)</p>
                      </div>
                      <div className="shrink-0 relative">
                        <Input 
                          id={`file-${doc.id}`} 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required={doc.required}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(doc.id, file)
                            }
                          }}
                        />
                        <Button type="button" variant="outline" className="w-full md:w-auto pointer-events-none bg-white/80">
                          <Upload className="w-4 h-4 mr-2 text-slate-400" />
                          {uploadedFiles[doc.id] ? uploadedFiles[doc.id].name : "Choose File"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 8: Admin Account Setup */}
              <div className="p-8 space-y-6 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <ShieldCheck className="w-5 h-5" />
                    <h3>8. Admin Account Setup</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-200/50 px-2 py-1 rounded">Creates hospital dashboard login</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="setupEmail">Admin Email (Login ID)</Label>
                    <Input 
                      id="setupEmail" 
                      type="email" 
                      placeholder="admin@hospital.com" 
                      required 
                      className="bg-white/50"
                      value={formData.adminEmail}
                      onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupPassword">Password</Label>
                    <Input 
                      id="setupPassword" 
                      type="password" 
                      required 
                      className="bg-white/50"
                      value={formData.adminPassword}
                      onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupConfirm">Confirm Password</Label>
                    <Input 
                      id="setupConfirm" 
                      type="password" 
                      required 
                      className="bg-white/50"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>
              </div>

            </form>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-end gap-4 p-8 bg-white/60 border-t border-slate-200/50">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto bg-white/80" 
              onClick={handleDraft}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button 
              type="submit" 
              form="registration-form" 
              className="w-full sm:w-auto shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="size-4 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent"></div>
                  Submitting Registration...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </OptimizedAuroraBackground>
    </>
  )
}
