import * as React from "react"
import { StatCard } from "@/components/StatCard"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  Activity, 
  Users, 
  Zap, 
  Map, 
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  BarChart3,
  Globe
} from "lucide-react"
import { hospitals, summaries } from "@/data/mock"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

export default function AdminOverview() {
  const chartData = [
    { name: '08:00', admissions: 45, transfers: 12 },
    { name: '10:00', admissions: 52, transfers: 15 },
    { name: '12:00', admissions: 78, transfers: 22 },
    { name: '14:00', admissions: 64, transfers: 18 },
    { name: '16:00', admissions: 90, transfers: 25 },
    { name: '18:00', admissions: 70, transfers: 20 },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Badge className="bg-primary hover:bg-primary/90 border-none px-1.5 py-0">ADMIN</Badge>
             <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
          </div>
          <p className="text-muted-foreground">Regional coordination and resource distribution analytics.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
              <Globe className="size-4" />
              Regional View
           </Button>
           <GradientButton variant="variant" className="gap-2 text-white px-4">
            <Zap className="size-4" />
            Execute Redistribution
          </GradientButton>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Hospitals"
          value={hospitals.length}
          subtitle="2 Active Hubs, 1 Satellite"
          icon={Building2}
          className="border-l-4 border-l-primary"
        />
        <StatCard
          title="System Load"
          value="72%"
          subtitle="Moderate - High Surge"
          progress={72}
          icon={Activity}
        />
        <StatCard
          title="Active Patients"
          value="4,210"
          subtitle="Across entire network"
          icon={Users}
        />
        <StatCard
          title="AI Optimizations"
          value="142"
          subtitle="24 successful interventions"
          icon={Sparkles}
          className="bg-primary/5"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Network Load Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Load Trends</CardTitle>
                <CardDescription>Patient admissions vs Inter-hospital transfers</CardDescription>
              </div>
              <BarChart3 className="size-5 text-muted-foreground opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--secondary)'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="admissions" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="transfers" fill="var(--chart-2)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <div className="space-y-6">
           <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="size-5" />
                  AI Sync Priority
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-sm opacity-90 leading-relaxed">
                   Critical congestion detected at City General. AI recommends redirecting next 3 trauma units to St. Jude Regional.
                 </p>
                 <div className="flex flex-col gap-2 pt-2">
                    <Button variant="secondary" className="w-full text-primary font-bold h-10">
                       Approve Diversion
                    </Button>
                    <Button variant="ghost" className="w-full text-primary-foreground/90 hover:bg-primary/80 hover:text-white h-8 text-xs">
                       View Load Forecast
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Facility Status</CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                 {hospitals.map(h => (
                   <div key={h.id} className="group cursor-pointer">
                      <div className="flex items-center justify-between text-xs mb-1">
                         <span className="font-semibold">{h.name}</span>
                         <span className="text-muted-foreground">{Math.round((h.totalStaff/1000)*100)}%</span>
                      </div>
                      <Progress value={Math.round((h.totalStaff/1000)*100)} className="h-1.5" />
                   </div>
                 ))}
                 <Button variant="link" className="w-full text-xs h-auto p-0 pt-2 text-primary">View Network Map</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
