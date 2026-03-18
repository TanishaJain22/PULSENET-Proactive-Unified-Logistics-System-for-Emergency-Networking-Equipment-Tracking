import * as React from "react"
import { StatCard } from "@/components/StatCard"
import { SeverityBadge } from "@/components/SeverityBadge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Activity, 
  Bed, 
  Stethoscope, 
  Users, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { emergencies, transfers, resources } from "@/data/mock"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { HospitalBedHero } from "@/components/HospitalBedHero"
import { useNavigate, useParams } from "react-router-dom"
import axios from 'axios'

// Define interfaces directly in the component
interface HospitalDashboardData {
  resourceSummary: {
    erCapacityPercentage: number;
    availableBeds: number;
    totalBeds: number;
    icuBeds: number;
    ventilators: number;
  };
  activeEmergencies: {
    id: string;
    patientName: string;
    condition: string;
    severity: 'critical' | 'moderate' | 'minor';
    eta: string;
    currentLocation: string;
    type: 'incoming' | 'dispatched';
  }[];
  pendingTransfers: {
    id: string;
    patientName: string;
    fromHospital: string;
    toHospital: string;
    reason: string;
    status: 'in-transit' | 'approved' | 'pending';
    eta: string;
    type: 'incoming' | 'outgoing';
  }[];
  staffSummary: {
    totalStaff: number;
    physicians: number;
    nurses: number;
    onDuty: number;
  };
  aiInsight: {
    message: string;
    type: 'prediction' | 'alert' | 'recommendation';
    confidencePercentage: number;
  };
}

// API service functions
const API_BASE_URL = 'http://localhost:8080/api';

const hospitalDashboardService = {
  async getDashboardData(hospitalId: string): Promise<HospitalDashboardData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hospital-dashboard/${hospitalId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  async testConnection(): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hospital-dashboard/test`);
      return response.data;
    } catch (error) {
      console.error('Error testing dashboard API:', error);
      throw error;
    }
  }
};

export default function HospitalDashboard() {
  const navigate = useNavigate()
  const { hospitalId } = useParams<{ hospitalId: string }>()
  const [showEmergency, setShowEmergency] = React.useState(false)
  const [acknowledged, setAcknowledged] = React.useState(false)
  const [dashboardData, setDashboardData] = React.useState<HospitalDashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!hospitalId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await hospitalDashboardService.getDashboardData(hospitalId)
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data')
      // Fallback to mock data
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadDashboardData()
  }, [hospitalId])

  // Auto-refresh data every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadDashboardData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [hospitalId, loading])

  // Auto-trigger emergency dialog after 5 seconds if not yet acknowledged
  React.useEffect(() => {
    if (!acknowledged) {
      const timer = setTimeout(() => {
        setShowEmergency(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [acknowledged])

  const handleAcknowledge = () => {
    setShowEmergency(false)
    setAcknowledged(true)
    toast.success("Emergency acknowledged. Medical team notified.")
  }

  // Use dynamic data if available, otherwise fallback to mock data
  const currentData = dashboardData || {
    resourceSummary: { erCapacityPercentage: 84, availableBeds: 12, totalBeds: 50, icuBeds: 8, ventilators: 15 },
    activeEmergencies: emergencies.filter(e => e.type === "incoming").map(e => ({
      id: e.id,
      patientName: e.patientName || "Unknown Patient",
      condition: e.condition,
      severity: e.severity as 'critical' | 'moderate' | 'minor',
      eta: e.eta,
      currentLocation: e.currentLocation,
      type: e.type as 'incoming' | 'dispatched'
    })),
    pendingTransfers: transfers.filter(t => t.status !== "completed").map(t => ({
      id: t.id,
      patientName: t.patient,
      fromHospital: t.fromHospital,
      toHospital: t.toHospital,
      reason: t.reason,
      status: t.status as 'in-transit' | 'approved' | 'pending',
      eta: t.eta,
      type: t.type as 'incoming' | 'outgoing'
    })),
    staffSummary: { totalStaff: 42, physicians: 8, nurses: 34, onDuty: 42 },
    aiInsight: { 
      message: "Current surge predicted to increase by 15% over the next 3 hours. Recommend notifying trauma shift staff.",
      type: "prediction" as const,
      confidencePercentage: 87
    }
  }

  const incomingEmergencies = currentData.activeEmergencies
  const activeTransfers = currentData.pendingTransfers

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HospitalBedHero />
      
      {/* Loading/Error State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading dashboard data...</span>
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">{error} - Using cached data</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDashboardData}
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="ER Capacity"
          value={`${currentData.resourceSummary.erCapacityPercentage}%`}
          subtitle={`${currentData.resourceSummary.availableBeds} beds available`}
          progress={currentData.resourceSummary.erCapacityPercentage}
          icon={Bed}
          className="border-l-4 border-l-[#064E3B] bg-[#C7FBEE] hover:bg-[#064E3B] hover:border-transparent"
          titleClassName="text-[#064E3B]"
          valueClassName="text-[#064E3B]"
          subtitleClassName="text-[#064E3B]/80"
          iconClassName="text-[#064E3B]"
          onClick={() => navigate(`/hospital/${hospitalId}/resources`)}
          tooltipText="Go to Resource Management →"
          ariaLabel={`View Resource Management — ER Capacity at ${currentData.resourceSummary.erCapacityPercentage}%`}
        />
        <StatCard
          title="Active Emergencies"
          value={incomingEmergencies.length}
          subtitle={`${incomingEmergencies.filter(e => e.severity === 'critical').length} Critical, ${incomingEmergencies.filter(e => e.severity === 'moderate').length} Moderate`}
          icon={Activity}
          className="border-l-4 border-l-[#C93213] bg-[#FFCABF] hover:bg-[#C93213] hover:border-transparent"
          titleClassName="text-[#C93213]"
          valueClassName="text-[#C93213]"
          subtitleClassName="text-[#C93213]/80"
          iconClassName="text-[#C93213]"
          onClick={() => navigate(`/hospital/${hospitalId}/emergencies`)}
          tooltipText="Go to Emergencies →"
          ariaLabel={`View Emergencies — ${incomingEmergencies.length} Active Emergencies`}
        />
        <StatCard
          title="Pending Transfers"
          value={activeTransfers.length}
          subtitle={activeTransfers.length > 0 ? `From ${activeTransfers[0].fromHospital}` : "No pending transfers"}
          icon={ArrowRightLeft}
          className="border-l-4 border-l-[#CD6B0F] bg-[#FFD3AA] hover:bg-[#CD6B0F] hover:border-transparent"
          titleClassName="text-[#CD6B0F]"
          valueClassName="text-[#CD6B0F]"
          subtitleClassName="text-[#CD6B0F]/80"
          iconClassName="text-[#CD6B0F]"
          onClick={() => navigate(`/hospital/${hospitalId}/transfers`)}
          tooltipText="Go to Transfers →"
          ariaLabel={`View Transfers — ${activeTransfers.length} Pending Transfers`}
        />
        <StatCard
          title="Staff on Duty"
          value={currentData.staffSummary.totalStaff.toString()}
          subtitle={`${currentData.staffSummary.physicians} physicians, ${currentData.staffSummary.nurses} nurses`}
          icon={Users}
          className="border-l-4 border-l-[#2B59C3] bg-[#CBDBFF] hover:bg-[#2B59C3] hover:border-transparent"
          titleClassName="text-[#2B59C3]"
          valueClassName="text-[#2B59C3]"
          subtitleClassName="text-[#2B59C3]/80"
          iconClassName="text-[#2B59C3]"
          onClick={() => navigate(`/hospital/${hospitalId}/resources?tab=staff`)}
          tooltipText="Go to Staff Overview →"
          ariaLabel={`View Staff on Duty — ${currentData.staffSummary.totalStaff} staff members`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Incoming Emergencies Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Incoming Emergencies</CardTitle>
                <CardDescription>Live trauma and ambulance arrivals</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowEmergency(true)} className="gap-2">
                <AlertTriangle className="size-4 text-destructive" />
                Trigger Alert
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingEmergencies.map((e) => (
                  <TableRow key={e.id} className="group cursor-pointer">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-destructive animate-pulse" />
                        {e.patientName || "Unknown Patient"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={e.severity} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="size-3 text-muted-foreground" />
                        {e.eta}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="size-3 text-muted-foreground" />
                        {e.currentLocation}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="group-hover:text-primary">
                        <ExternalLink className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Resource summary / Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Status</CardTitle>
              <CardDescription>Critical care essentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.slice(0, 4).map((r) => (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{r.name}</span>
                    <span className={cn(
                      "font-bold",
                      r.available / r.total < 0.2 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {r.available}/{r.total}
                    </span>
                  </div>
                  <Progress 
                    value={(r.available / r.total) * 100} 
                    className={cn(
                      "h-1.5",
                      r.available / r.total < 0.2 ? "[&>div]:bg-destructive" : ""
                    )}
                  />
                </div>
              ))}
              <Button variant="link" className="w-full text-xs h-auto p-0 pt-2">View all resources</Button>
            </CardContent>
          </Card>

            <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <TrendingUp className="size-4" />
                AI Insight
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              {currentData.aiInsight.message}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  Confidence: {currentData.aiInsight.confidencePercentage}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {currentData.aiInsight.type}
                </Badge>
              </div>
              <Button className="w-full mt-4 h-8 text-xs bg-primary hover:bg-primary/90">Acknowledge Prediction</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Emergency Modal - Cannot be dismissed easily */}
      <Dialog open={showEmergency} onOpenChange={(open) => {
        if (!open && !acknowledged) return; // Prevent closing if not acknowledged
        setShowEmergency(open);
      }}>
        <DialogContent className="sm:max-w-[500px] border-destructive border-t-8 shadow-2xl p-6 emergency-alert-dialog" showCloseButton={false}>
          <DialogHeader className="space-y-4">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-bounce">
              <AlertTriangle className="size-6" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold uppercase tracking-tight text-destructive">
              Incoming Trauma Alert
            </DialogTitle>
            <DialogDescription className="text-center text-lg font-medium text-foreground">
              ETA: <span className="text-destructive font-bold">3 Minutes</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="rounded-lg bg-muted p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">Patient:</span>
                <span className="font-bold text-right">Unidentified Male (Approx. 35y)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">Condition:</span>
                <span className="font-bold text-destructive text-right">Severe Blunt Trauma</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">Vital Signs:</span>
                <Badge variant="destructive" className="animate-pulse">BP 90/60 | HR 125</Badge>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-3">
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase flex items-center gap-2">
                <span className="size-2 bg-blue-500 rounded-full animate-pulse"></span>
                AI Recommended Prep:
              </div>
              <ul className="text-sm space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Clear Bay 4 immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Prepare Type O- blood packets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Notify Surgical Team B</span>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button 
                variant="destructive" 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-destructive/20 focus:ring-4 focus:ring-destructive/30"
                onClick={handleAcknowledge}
            >
              ACKNOWLEDGE & PREPARE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
