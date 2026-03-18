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
  Boxes, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Bed,
  Activity,
  Stethoscope,
  Syringe,
  RotateCcw,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Resource {
  id: string
  name: string
  type: 'BED' | 'VENTILATOR' | 'ICU_BED' | 'OXYGEN_CYLINDER' | 'AMBULANCE' | 'EQUIPMENT'
  total: number
  available: number
  inUse: number
  underMaintenance: number
  status: 'AVAILABLE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE'
}

interface CreateResourceForm {
  name: string
  type: string
  total: number
  available: number
  location: string
  notes: string
}

const RESOURCE_TYPES = [
  { value: 'BED', label: 'General Bed', icon: Bed },
  { value: 'ICU_BED', label: 'ICU Bed', icon: Activity },
  { value: 'VENTILATOR', label: 'Ventilator', icon: Stethoscope },
  { value: 'OXYGEN_CYLINDER', label: 'Oxygen Cylinder', icon: Syringe },
  { value: 'AMBULANCE', label: 'Ambulance', icon: Activity },
  { value: 'EQUIPMENT', label: 'Medical Equipment', icon: Boxes }
]

const STATUS_COLORS = {
  AVAILABLE: "bg-green-500 hover:bg-green-600",
  LOW: "bg-yellow-500 hover:bg-yellow-600",
  CRITICAL: "bg-red-500 hover:bg-red-600",
  UNAVAILABLE: "bg-gray-500 hover:bg-gray-600"
}

export default function ResourceManagement() {
  const [resources, setResources] = React.useState<Resource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<CreateResourceForm>({
    name: "",
    type: "",
    total: 0,
    available: 0,
    location: "",
    notes: ""
  })

  // Import the dialog scroll hook
  const scrollRef = React.useRef<HTMLDivElement>(null)

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

  // Get hospital ID from URL params (from route: /hospital/:hospitalId/resources)
  const { hospitalId } = useParams<{ hospitalId: string }>()
  
  if (!hospitalId) {
    return <div>Error: Hospital ID not found in URL</div>
  }

  React.useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/resources`)
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      } else {
        throw new Error('Failed to fetch resources')
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      toast.error('Failed to load resources')
      // Mock data for demo
      setResources([
        {
          id: "1",
          name: "General Ward Beds",
          type: "BED",
          total: 50,
          available: 12,
          inUse: 35,
          underMaintenance: 3,
          status: "LOW"
        },
        {
          id: "2",
          name: "ICU Beds",
          type: "ICU_BED",
          total: 20,
          available: 3,
          inUse: 17,
          underMaintenance: 0,
          status: "CRITICAL"
        },
        {
          id: "3",
          name: "Ventilators",
          type: "VENTILATOR",
          total: 15,
          available: 8,
          inUse: 7,
          underMaintenance: 0,
          status: "AVAILABLE"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateResource = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Resource added successfully')
        setIsAddDialogOpen(false)
        resetForm()
        fetchResources()
      } else {
        throw new Error('Failed to create resource')
      }
    } catch (error) {
      console.error('Error creating resource:', error)
      toast.error('Failed to add resource')
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch(`http://localhost:8080/api/hospitals/${hospitalId}/resources/${resourceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Resource deleted successfully')
        fetchResources()
      } else {
        throw new Error('Failed to delete resource')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      total: 0,
      available: 0,
      location: "",
      notes: ""
    })
  }

  const filteredResources = resources.filter(resource => 
    resource.name.toLowerCase().includes(search.toLowerCase()) ||
    resource.type.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: Resource['status']) => {
    const colors = {
      AVAILABLE: "bg-green-100 text-green-800",
      LOW: "bg-yellow-100 text-yellow-800",
      CRITICAL: "bg-red-100 text-red-800",
      UNAVAILABLE: "bg-gray-100 text-gray-800"
    }
    return colors[status]
  }

  const getResourceIcon = (type: Resource['type']) => {
    const iconMap = {
      BED: Bed,
      ICU_BED: Activity,
      VENTILATOR: Stethoscope,
      OXYGEN_CYLINDER: Syringe,
      AMBULANCE: Activity,
      EQUIPMENT: Boxes
    }
    const Icon = iconMap[type] || Boxes
    return <Icon className="size-5" />
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            📦 Resource Management
          </h2>
          <p className="text-muted-foreground">Manage hospital resources, beds, equipment, and availability.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchResources} disabled={loading}>
            <RotateCcw className={cn("size-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
                <DialogTitle>Add New Resource</DialogTitle>
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
                  <div>
                    <Label htmlFor="name">Resource Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter resource name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Resource Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOURCE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="size-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="total">Total Quantity</Label>
                      <Input
                        id="total"
                        type="number"
                        min="0"
                        value={formData.total}
                        onChange={(e) => setFormData(prev => ({ ...prev, total: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="available">Available Quantity</Label>
                      <Input
                        id="available"
                        type="number"
                        min="0"
                        max={formData.total}
                        value={formData.available}
                        onChange={(e) => setFormData(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Ward 3, Floor 2"
                    />
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

                  {/* Additional fields for demonstration */}
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      placeholder="Equipment manufacturer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model">Model Number</Label>
                    <Input
                      id="model"
                      placeholder="Model/Serial number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                    />
                  </div>

                  <div>
                    <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                    <Input
                      id="warrantyExpiry"
                      type="date"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maintenanceSchedule">Maintenance Schedule</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select maintenance frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assignedDepartment">Assigned Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                        <SelectItem value="general">General Ward</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="responsiblePerson">Responsible Person</Label>
                    <Input
                      id="responsiblePerson"
                      placeholder="Name of person responsible"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      placeholder="+91-9876543210"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-white flex-shrink-0">
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateResource}>
                  Add Resource
                </Button>
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
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
              <Boxes className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {resources.reduce((sum, r) => sum + r.available, 0)}
                </p>
              </div>
              <Activity className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Use</p>
                <p className="text-2xl font-bold text-blue-600">
                  {resources.reduce((sum, r) => sum + r.inUse, 0)}
                </p>
              </div>
              <Stethoscope className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {resources.reduce((sum, r) => sum + r.underMaintenance, 0)}
                </p>
              </div>
              <AlertTriangle className="size-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Table */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Hospital Resources</CardTitle>
              <CardDescription>Manage and track all hospital resources</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
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
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Resource Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>In Use</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {getResourceIcon(resource.type)}
                        </div>
                        <span className="font-semibold">{resource.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{resource.type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{resource.total}</TableCell>
                    <TableCell className="font-mono text-green-600">{resource.available}</TableCell>
                    <TableCell className="font-mono text-blue-600">{resource.inUse}</TableCell>
                    <TableCell className="font-mono text-yellow-600">{resource.underMaintenance}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(resource.status)}>
                        {resource.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
