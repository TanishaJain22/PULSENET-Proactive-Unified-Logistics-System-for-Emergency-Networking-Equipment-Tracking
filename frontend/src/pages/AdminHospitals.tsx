import * as React from "react"
import { StatCard } from "@/components/StatCard"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  MapPin, 
  Phone, 
  ArrowUpRight, 
  Search, 
  Plus, 
  Activity,
  Bed,
  Users2
} from "lucide-react"
import { hospitals } from "@/data/mock"

export default function AdminHospitals() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hospital Network</h2>
          <p className="text-muted-foreground">Manage and monitor all healthcare facilities in the region.</p>
        </div>
        <GradientButton variant="variant" className="gap-2 text-white px-4">
          <Plus className="size-4" />
          Register New Facility
        </GradientButton>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input placeholder="Search hospitals by name, ID or location..." className="pl-10 h-11 shadow-sm" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {hospitals.map((hospital) => (
          <Card key={hospital.id} className="overflow-hidden transition-all hover:shadow-md border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{hospital.name}</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {hospital.address}
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                   Active Hub
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-y py-4">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase">
                       <Bed className="size-3" /> Beds
                    </div>
                    <div className="text-lg font-bold">1,240 <span className="text-[10px] text-muted-foreground font-normal">Total</span></div>
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase">
                       <Users2 className="size-3" /> Staff
                    </div>
                    <div className="text-lg font-bold">{hospital.totalStaff} <span className="text-[10px] text-muted-foreground font-normal">Active</span></div>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    <span>ER Saturation</span>
                    <span className="text-primary">82%</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '82%' }}></div>
                 </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Phone className="size-3" />
                  Contact
                </Button>
                <Button size="sm" className="flex-1 gap-2 border-primary/20 text-primary bg-primary/10 hover:bg-primary/20 shadow-none border">
                  <Activity className="size-3" />
                  Live Feeds
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
