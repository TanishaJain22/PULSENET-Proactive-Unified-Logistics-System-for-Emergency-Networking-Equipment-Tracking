import * as React from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Trash2,
  Mail,
  MailOpen,
  Filter,
  Search,
  RefreshCw,
  Loader2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: "EMERGENCY" | "INFO" | "SUCCESS" | "WARNING"
  isRead: boolean
  priority: "HIGH" | "MEDIUM" | "LOW"
  category: "SYSTEM" | "EMERGENCY" | "TRANSFER" | "RESOURCE" | "MAINTENANCE" | "AMBULANCE" | "PATIENT" | "DOCTOR" | "CAPACITY"
  createdAt: string
  timeAgo: string
  relatedEntityId?: string
  relatedEntityType?: string
  actionUrl?: string
  actionText?: string
}

interface NotificationStats {
  unreadCount: number
  emergencyCount: number
  warningCount: number
  infoCount: number
  highPriorityUnread: number
}

export default function HospitalNotifications() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [stats, setStats] = React.useState<NotificationStats>({
    unreadCount: 0,
    emergencyCount: 0,
    warningCount: 0,
    infoCount: 0,
    highPriorityUnread: 0
  })
  
  // Get hospital ID from URL params
  const { hospitalId } = useParams<{ hospitalId: string }>()
  const API_BASE = 'http://localhost:8080/api'
  
  // Fetch notifications from API
  const fetchNotifications = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true)
      else setLoading(true)
      
      const params = new URLSearchParams({
        hospitalId: hospitalId || '',
        page: '0',
        size: '50'
      })
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory.toUpperCase())
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      
      if (showUnreadOnly) {
        params.append('unreadOnly', 'true')
      }
      
      const response = await fetch(`${API_BASE}/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.content || [])
      } else {
        toast.error('Failed to load notifications')
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  // Fetch notification statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/stats?hospitalId=${hospitalId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error)
    }
  }
  
  // Auto-refresh notifications every 30 seconds
  React.useEffect(() => {
    fetchNotifications()
    fetchStats()
    
    const interval = setInterval(() => {
      fetchNotifications(true)
      fetchStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Refetch when filters change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [selectedCategory, searchTerm, showUnreadOnly])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "EMERGENCY": return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "WARNING": return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case "SUCCESS": return <CheckCircle className="w-5 h-5 text-green-600" />
      case "INFO": return <Info className="w-5 h-5 text-blue-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "EMERGENCY": return "border-l-red-500 bg-red-50"
      case "WARNING": return "border-l-orange-500 bg-orange-50"
      case "SUCCESS": return "border-l-green-500 bg-green-50"
      case "INFO": return "border-l-blue-500 bg-blue-50"
      default: return "border-l-gray-500 bg-gray-50"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH": return <Badge variant="destructive">High</Badge>
      case "MEDIUM": return <Badge variant="secondary">Medium</Badge>
      case "LOW": return <Badge variant="outline">Low</Badge>
      default: return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AMBULANCE": return "🚑"
      case "TRANSFER": return "🏥"
      case "EMERGENCY": return "🚨"
      case "PATIENT": return "👤"
      case "DOCTOR": return "👨‍⚕️"
      case "RESOURCE": return "📊"
      case "CAPACITY": return "⚠️"
      case "MAINTENANCE": return "🔧"
      case "SYSTEM": return "💻"
      default: return "📢"
    }
  }

  const filteredNotifications = notifications

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        )
        toast.success("Notification marked as read")
        fetchStats() // Refresh stats
      } else {
        toast.error("Failed to mark notification as read")
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}/unread`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, isRead: false } : notification
          )
        )
        toast.success("Notification marked as unread")
        fetchStats() // Refresh stats
      } else {
        toast.error("Failed to mark notification as unread")
      }
    } catch (error) {
      console.error('Failed to mark as unread:', error)
      toast.error("Failed to mark notification as unread")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
        toast.success("Notification deleted")
        fetchStats() // Refresh stats
      } else {
        toast.error("Failed to delete notification")
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error("Failed to delete notification")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all?hospitalId=${hospitalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })))
        toast.success("All notifications marked as read")
        fetchStats() // Refresh stats
      } else {
        toast.error("Failed to mark all notifications as read")
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error("Failed to mark all notifications as read")
    }
  }

  const handleRefresh = () => {
    fetchNotifications(true)
    fetchStats()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important alerts and system messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.unreadCount > 0 && (
            <Badge variant="destructive">{stats.unreadCount} unread</Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button onClick={handleMarkAllAsRead} disabled={stats.unreadCount === 0}>
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold">{stats.emergencyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold">{stats.warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Info className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Info</p>
                <p className="text-2xl font-bold">{stats.infoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-4 w-4 text-gray-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{stats.unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="emergency">Emergency</option>
              <option value="ambulance">Ambulance</option>
              <option value="transfer">Transfer</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="resource">Resource</option>
              <option value="capacity">Capacity</option>
              <option value="system">System</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Unread Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && !refreshing ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {showUnreadOnly 
                  ? "No unread notifications at the moment." 
                  : "Try adjusting your search criteria or filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-l-4 ${getNotificationColor(notification.type)} ${
                !notification.isRead ? "shadow-md" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </h3>
                        {getPriorityBadge(notification.priority)}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{notification.timeAgo}</span>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(notification.category)} {notification.category.toLowerCase()}
                        </Badge>
                        {notification.actionUrl && notification.actionText && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => {
                              // Navigate to action URL
                              window.location.href = notification.actionUrl!
                            }}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {notification.isRead ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsUnread(notification.id)}
                        title="Mark as unread"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <MailOpen className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}