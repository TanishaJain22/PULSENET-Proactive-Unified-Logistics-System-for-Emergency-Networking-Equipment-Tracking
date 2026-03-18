import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Bed, 
  Activity,
  Edit,
  Save,
  X
} from "lucide-react"
import { toast } from "sonner"

export default function HospitalProfile() {
  const [isEditing, setIsEditing] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  
  // Mock hospital data - replace with actual API call
  const [hospitalData, setHospitalData] = React.useState({
    name: "City General Hospital",
    type: "Government",
    status: "Active",
    registrationNumber: "REG-2023-001",
    address: "123 Healthcare Avenue, Medical District",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    phone: "+91-11-2345-6789",
    email: "admin@citygeneral.gov.in",
    emergencyContact: "+91-11-2345-6700",
    totalBeds: 500,
    icuBeds: 50,
    emergencyBeds: 30,
    ventilators: 25,
    operatingRooms: 12,
    specialties: ["Cardiology", "Neurology", "Emergency Medicine", "General Surgery"],
    yearEstablished: 1985
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // API call to update hospital profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      toast.success("Hospital profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data if needed
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Profile</h1>
          <p className="text-muted-foreground">
            Manage your hospital information and settings
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input
                id="hospitalName"
                value={hospitalData.name}
                disabled={!isEditing}
                onChange={(e) => setHospitalData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Badge variant="secondary">{hospitalData.type}</Badge>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge variant="default">{hospitalData.status}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input value={hospitalData.registrationNumber} disabled />
            </div>
            <div className="space-y-2">
              <Label>Year Established</Label>
              <Input value={hospitalData.yearEstablished} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={hospitalData.phone}
                disabled={!isEditing}
                onChange={(e) => setHospitalData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={hospitalData.email}
                disabled={!isEditing}
                onChange={(e) => setHospitalData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                value={hospitalData.emergencyContact}
                disabled={!isEditing}
                onChange={(e) => setHospitalData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={hospitalData.address}
                disabled={!isEditing}
                onChange={(e) => setHospitalData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={hospitalData.city}
                  disabled={!isEditing}
                  onChange={(e) => setHospitalData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={hospitalData.state}
                  disabled={!isEditing}
                  onChange={(e) => setHospitalData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">PIN Code</Label>
              <Input
                id="pincode"
                value={hospitalData.pincode}
                disabled={!isEditing}
                onChange={(e) => setHospitalData(prev => ({ ...prev, pincode: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="w-5 h-5" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalBeds">Total Beds</Label>
                <Input
                  id="totalBeds"
                  type="number"
                  value={hospitalData.totalBeds}
                  disabled={!isEditing}
                  onChange={(e) => setHospitalData(prev => ({ ...prev, totalBeds: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icuBeds">ICU Beds</Label>
                <Input
                  id="icuBeds"
                  type="number"
                  value={hospitalData.icuBeds}
                  disabled={!isEditing}
                  onChange={(e) => setHospitalData(prev => ({ ...prev, icuBeds: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyBeds">Emergency Beds</Label>
                <Input
                  id="emergencyBeds"
                  type="number"
                  value={hospitalData.emergencyBeds}
                  disabled={!isEditing}
                  onChange={(e) => setHospitalData(prev => ({ ...prev, emergencyBeds: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ventilators">Ventilators</Label>
                <Input
                  id="ventilators"
                  type="number"
                  value={hospitalData.ventilators}
                  disabled={!isEditing}
                  onChange={(e) => setHospitalData(prev => ({ ...prev, ventilators: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatingRooms">Operating Rooms</Label>
              <Input
                id="operatingRooms"
                type="number"
                value={hospitalData.operatingRooms}
                disabled={!isEditing}
                onChange={(e) => setHospitalData(prev => ({ ...prev, operatingRooms: parseInt(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Medical Specialties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hospitalData.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline">
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}