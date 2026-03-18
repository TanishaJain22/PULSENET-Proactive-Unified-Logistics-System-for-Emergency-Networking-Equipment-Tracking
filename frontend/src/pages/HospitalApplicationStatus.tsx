import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Upload,
  Download,
  RefreshCw,
  MessageSquare
} from "lucide-react"
import { toast } from "sonner"

interface ApplicationStep {
  id: string
  title: string
  description: string
  status: "completed" | "in_progress" | "pending" | "rejected"
  completedAt?: string
  comments?: string
}

export default function HospitalApplicationStatus() {
  const [loading, setLoading] = React.useState(false)
  
  // Mock application data - replace with actual API call
  const [applicationData] = React.useState({
    applicationId: "APP-2024-001",
    hospitalName: "City General Hospital",
    submittedDate: "2024-01-15",
    lastUpdated: "2024-01-20",
    currentStatus: "under_review",
    overallProgress: 60,
    estimatedCompletion: "2024-01-25",
    assignedReviewer: "Dr. Admin Singh",
    reviewerContact: "admin.singh@pulsenet.gov.in"
  })

  const [applicationSteps] = React.useState<ApplicationStep[]>([
    {
      id: "1",
      title: "Application Submitted",
      description: "Initial application form and basic information submitted",
      status: "completed",
      completedAt: "2024-01-15 10:30 AM"
    },
    {
      id: "2",
      title: "Document Verification",
      description: "Hospital license, clinical certificates, and other documents under review",
      status: "completed",
      completedAt: "2024-01-17 02:15 PM",
      comments: "All documents verified successfully. License valid until 2026."
    },
    {
      id: "3",
      title: "Infrastructure Assessment",
      description: "Review of hospital infrastructure, bed capacity, and medical equipment",
      status: "in_progress",
      comments: "Site inspection scheduled for January 22, 2024. Please ensure all facilities are accessible."
    },
    {
      id: "4",
      title: "Technical Integration",
      description: "System integration testing and API connectivity setup",
      status: "pending"
    },
    {
      id: "5",
      title: "Final Approval",
      description: "Final review and approval by system administrator",
      status: "pending"
    }
  ])

  const [documents] = React.useState([
    {
      id: "1",
      name: "Hospital License Certificate",
      status: "approved",
      uploadedDate: "2024-01-15",
      comments: "Valid license, expires 2026-12-31"
    },
    {
      id: "2",
      name: "Clinical Establishment Certificate",
      status: "approved",
      uploadedDate: "2024-01-15",
      comments: "All clinical standards met"
    },
    {
      id: "3",
      name: "Infrastructure Report",
      status: "pending",
      uploadedDate: "2024-01-16",
      comments: "Awaiting site inspection report"
    },
    {
      id: "4",
      name: "Equipment Inventory",
      status: "under_review",
      uploadedDate: "2024-01-16",
      comments: "Additional ventilator specifications required"
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in_progress": return <Clock className="w-5 h-5 text-blue-600" />
      case "pending": return <Clock className="w-5 h-5 text-gray-400" />
      case "rejected": return <AlertCircle className="w-5 h-5 text-red-600" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200"
      case "approved": return "bg-green-100 text-green-800 border-green-200"
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200"
      case "under_review": return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending": return "bg-gray-100 text-gray-800 border-gray-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleRefreshStatus = async () => {
    setLoading(true)
    try {
      // API call to refresh application status
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      toast.success("Application status refreshed")
    } catch (error) {
      toast.error("Failed to refresh status")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDocument = (docName: string) => {
    toast.info(`Downloading ${docName}`)
  }

  const handleContactReviewer = () => {
    toast.info(`Opening email to ${applicationData.reviewerContact}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Status</h1>
          <p className="text-muted-foreground">
            Track your hospital registration application progress
          </p>
        </div>
        <Button onClick={handleRefreshStatus} disabled={loading}>
          {loading ? (
            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Status
        </Button>
      </div>

      {/* Application Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Application Overview</CardTitle>
          <CardDescription>
            Application ID: {applicationData.applicationId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hospital Name</p>
              <p className="text-lg font-semibold">{applicationData.hospitalName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Status</p>
              <Badge className={getStatusColor(applicationData.currentStatus)}>
                {applicationData.currentStatus.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitted Date</p>
              <p>{applicationData.submittedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p>{applicationData.lastUpdated}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Completion</p>
              <p>{applicationData.estimatedCompletion}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned Reviewer</p>
              <div className="flex items-center gap-2">
                <p>{applicationData.assignedReviewer}</p>
                <Button variant="ghost" size="sm" onClick={handleContactReviewer}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{applicationData.overallProgress}%</span>
            </div>
            <Progress value={applicationData.overallProgress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Application Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <CardDescription>
            Track each step of your application review process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {applicationSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {getStatusIcon(step.status)}
                  {index < applicationSteps.length - 1 && (
                    <div className={`w-px h-12 mt-2 ${
                      step.status === "completed" ? "bg-green-300" : "bg-gray-300"
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{step.title}</h3>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  {step.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      Completed: {step.completedAt}
                    </p>
                  )}
                  {step.comments && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-sm">{step.comments}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Status */}
      <Card>
        <CardHeader>
          <CardTitle>Document Status</CardTitle>
          <CardDescription>
            Status of all submitted documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {doc.uploadedDate}
                    </p>
                    {doc.comments && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.comments}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status.replace("_", " ")}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
              <div>
                <p className="font-medium">Site Inspection</p>
                <p className="text-sm text-muted-foreground">
                  Prepare for the scheduled site inspection on January 22, 2024. Ensure all facilities are accessible and documentation is ready.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
              <div>
                <p className="font-medium">Equipment Specifications</p>
                <p className="text-sm text-muted-foreground">
                  Submit additional ventilator specifications as requested by the review team.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
              <div>
                <p className="font-medium">System Integration Testing</p>
                <p className="text-sm text-muted-foreground">
                  Once infrastructure assessment is complete, technical team will begin system integration testing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}