import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { ShieldAlert, Hospital, Sparkles, Building2, UserCog, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { OptimizedAuroraBackground } from "@/components/ui/optimized-aurora-background"
import { LoginNavbar } from "@/components/ui/login-navbar"
import { authApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = React.useState<"hospital" | "system" | "user" | null>(null)
  const [formData, setFormData] = React.useState({
    hospital: {
      identity: "",
      password: "",
      otp: ""
    },
    system: {
      identity: "",
      password: ""
    },
    user: {
      identity: "",
      password: ""
    }
  })

  const handleInputChange = (type: "hospital" | "system" | "user", field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  const requestOtp = async () => {
    if (!formData.hospital.identity) {
      toast.error("Please enter email first")
      return
    }

    try {
      await authApi.requestOtp(formData.hospital.identity)
      toast.success("OTP sent to your email")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send OTP")
    }
  }

  const handleHospitalLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("hospital")
    
    try {
      const response = await authApi.hospitalLogin(
        formData.hospital.identity,
        formData.hospital.password,
        formData.hospital.otp
      )
      
      login(response)
      toast.success("Logged in as Hospital Admin")
      
      // Navigate to hospital dashboard with the hospital ID from the response
      if (response.hospitalId) {
        navigate(`/hospital/${response.hospitalId}/dashboard`)
      } else {
        toast.error("Hospital ID not found in login response")
        navigate("/login")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(null)
    }
  }

  const handleSystemLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("system")
    
    try {
      const response = await authApi.adminLogin(
        formData.system.identity,
        formData.system.password
      )
      
      login(response)
      toast.success("Logged in as System Administrator")
      navigate("/admin/overview")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(null)
    }
  }

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("user")
    
    try {
      const response = await authApi.userLogin(
        formData.user.identity,
        formData.user.password
      )
      
      login(response)
      toast.success("Logged in as User")
      navigate("/user/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(null)
    }
  }

  const handleDemoLogin = () => {
    // Create a demo auth response
    const demoAuthResponse = {
      userId: 'demo-user-123',
      email: 'demo@pulsenet.com',
      role: 'USER',
      token: 'demo-token-' + Date.now()
    }
    
    login(demoAuthResponse)
    toast.success("Logged in as Demo User")
    navigate("/user/dashboard")
  }

  return (
    <>
      <LoginNavbar />
      <OptimizedAuroraBackground>
        <div className="relative z-10 w-full max-w-[460px] pt-24 pb-12 animate-in fade-in zoom-in-95 duration-1000 ease-out px-4">
        <Card className="border-white/60 bg-white/70 backdrop-blur-md shadow-[var(--shadow-login)] rounded-[18px] overflow-hidden transition-all duration-500 hover:shadow-[0_32px_60px_rgba(0,0,0,0.12)]">
          <CardHeader className="space-y-0 p-8 pb-4">
            <div className="flex flex-col items-center text-center">
              <img src="/logo.png" alt="PulseNet Logo" className="h-20 w-auto object-contain mb-6 scale-125" />
              <div className="space-y-2">
                <CardTitle 
                  className="text-[32px] font-semibold tracking-[0.2px] text-slate-900 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500/80 mb-4 tracking-wide">
                  Sign in to your portal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-6 pt-0">
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-200/50 p-1 rounded-xl">
                <TabsTrigger value="user" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <User className="w-4 h-4" />
                    User
                  </div>
                </TabsTrigger>
                <TabsTrigger value="hospital" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="w-4 h-4" />
                    Hospital
                  </div>
                </TabsTrigger>
                <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldAlert className="w-4 h-4" />
                    System Admin
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="mt-0">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input 
                      id="user-email" 
                      type="email"
                      required 
                      placeholder="user@gmail.com" 
                      className="bg-white/50 h-11"
                      value={formData.user.identity}
                      onChange={(e) => handleInputChange("user", "identity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="user-password">Password</Label>
                      <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot?</a>
                    </div>
                    <Input 
                      id="user-password" 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="bg-white/50 h-11"
                      value={formData.user.password}
                      onChange={(e) => handleInputChange("user", "password", e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-[68px] text-sm font-semibold shadow-md"
                    disabled={!!loading}
                  >
                    {loading === "user" ? (
                      <div className="size-5 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent"></div>
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Login as User
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full h-11 text-sm font-semibold border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    onClick={handleDemoLogin}
                    disabled={!!loading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Demo Login (Skip Authentication)
                  </Button>

                  <div className="pt-4 text-center text-sm text-slate-600 font-medium">
                    Don't have an account?{" "}
                    <Link to="/user-register" className="text-primary font-bold hover:underline transition-all">
                      Register here
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="hospital" className="mt-0">
                <form onSubmit={handleHospitalLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital-id">Email or Hospital ID</Label>
                    <Input 
                      id="hospital-id" 
                      required 
                      placeholder="admin@hospital.com" 
                      className="bg-white/50 h-11"
                      value={formData.hospital.identity}
                      onChange={(e) => handleInputChange("hospital", "identity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital-password">Password</Label>
                    <Input 
                      id="hospital-password" 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="bg-white/50 h-11"
                      value={formData.hospital.password}
                      onChange={(e) => handleInputChange("hospital", "password", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hospital-otp">OTP Code</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-primary font-medium h-auto p-1"
                        onClick={requestOtp}
                        disabled={!!loading}
                      >
                        Send OTP
                      </Button>
                    </div>
                    <Input 
                      id="hospital-otp" 
                      required 
                      placeholder="Enter 6-digit OTP" 
                      className="bg-white/50 h-11 font-mono tracking-widest text-lg" 
                      maxLength={6}
                      value={formData.hospital.otp}
                      onChange={(e) => handleInputChange("hospital", "otp", e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-2 text-sm font-semibold shadow-md"
                    disabled={!!loading}
                  >
                    {loading === "hospital" ? (
                      <div className="size-5 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent"></div>
                    ) : (
                      <Hospital className="w-4 h-4 mr-2" />
                    )}
                    Login as Hospital
                  </Button>

                  <div className="pt-4 text-center text-sm text-slate-600 font-medium">
                    Don't have an account?{" "}
                    <Link to="/hospital-register" className="text-primary font-bold hover:underline transition-all">
                      Register here
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="system" className="mt-0">
                <form onSubmit={handleSystemLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-id">Admin ID or Email</Label>
                    <Input 
                      id="admin-id" 
                      required 
                      placeholder="sysadmin@pulsenet.gov" 
                      className="bg-white/50 h-11"
                      value={formData.system.identity}
                      onChange={(e) => handleInputChange("system", "identity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                      <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot?</a>
                    </div>
                    <Input 
                      id="admin-password" 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="bg-white/50 h-11"
                      value={formData.system.password}
                      onChange={(e) => handleInputChange("system", "password", e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-[68px] text-sm font-semibold shadow-md border border-slate-900 bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={!!loading}
                  >
                    {loading === "system" ? (
                      <div className="size-5 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent"></div>
                    ) : (
                      <UserCog className="w-4 h-4 mr-2" />
                    )}
                    Login as System Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="mt-6 text-center text-[11px] font-bold tracking-[0.15em] text-slate-400/50 uppercase">
          PulseNet • Secure Infrastructure
        </p>
      </div>
    </OptimizedAuroraBackground>
    </>
  )
}
