import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { OptimizedAuroraBackground } from "@/components/ui/optimized-aurora-background"
import { LoginNavbar } from "@/components/ui/login-navbar"
import { authApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  otp: string
}

export default function UserRegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = React.useState<'details' | 'otp' | 'success'>('details')
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [formData, setFormData] = React.useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: ""
  })

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required")
      return false
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required")
      return false
    }
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return false
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required")
      return false
    }
    if (!/^[+]?[\d\s-()]{10,}$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number")
      return false
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    return true
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Send registration request with OTP
      await authApi.userRegister({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
      
      toast.success("Registration successful! OTP sent to your email")
      setStep('otp')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.otp.trim()) {
      toast.error("Please enter the OTP")
      return
    }
    
    setLoading(true)
    
    try {
      // Verify OTP and complete registration
      const response = await authApi.verifyUserRegistration({
        email: formData.email,
        otp: formData.otp
      })
      
      login(response)
      toast.success("Registration completed successfully!")
      setStep('success')
      
      // Redirect to user dashboard after a short delay
      setTimeout(() => {
        navigate("/user/dashboard")
      }, 1500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "OTP verification failed")
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setLoading(true)
    try {
      await authApi.requestOtp(formData.email)
      toast.success("OTP resent to your email")
    } catch (error) {
      toast.error("Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoginNavbar />
      <OptimizedAuroraBackground>
        <div className="relative z-10 w-full max-w-[480px] pt-24 pb-12 animate-in fade-in zoom-in-95 duration-1000 ease-out px-4">
          <Card className="border-white/60 bg-white/70 backdrop-blur-md shadow-[var(--shadow-login)] rounded-[18px] overflow-hidden transition-all duration-500 hover:shadow-[0_32px_60px_rgba(0,0,0,0.12)]">
            <CardHeader className="space-y-0 p-8 pb-4">
              <div className="flex flex-col items-center text-center">
                <img src="/logo.png" alt="PulseNet Logo" className="h-20 w-auto object-contain mb-6 scale-125" />
                <div className="space-y-2">
                  <CardTitle 
                    className="text-[32px] font-semibold tracking-[0.2px] text-slate-900 leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {step === 'details' && "Create Account"}
                    {step === 'otp' && "Verify Email"}
                    {step === 'success' && "Welcome!"}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500/80 mb-4 tracking-wide">
                    {step === 'details' && "Join PulseNet as a user"}
                    {step === 'otp' && "Enter the OTP sent to your email"}
                    {step === 'success' && "Registration completed successfully"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-8 pb-6 pt-0">
              {step === 'details' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        required 
                        placeholder="Rahul" 
                        className="bg-white/50 h-11"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        required 
                        placeholder="Sharma" 
                        className="bg-white/50 h-11"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        id="email" 
                        type="email"
                        required 
                        placeholder="rahul.sharma@gmail.com" 
                        className="bg-white/50 h-11 pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        id="phone" 
                        type="tel"
                        required 
                        placeholder="+91-9876543210" 
                        className="bg-white/50 h-11 pl-10"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        required 
                        placeholder="••••••••" 
                        className="bg-white/50 h-11 pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        required 
                        placeholder="••••••••" 
                        className="bg-white/50 h-11 pl-10 pr-10"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-6 text-sm font-semibold shadow-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="size-5 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent"></div>
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Create Account
                  </Button>

                  <div className="pt-4 text-center text-sm text-slate-600 font-medium">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline transition-all">
                      Sign in here
                    </Link>
                  </div>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-600">
                      We've sent a verification code to
                    </p>
                    <p className="font-semibold text-slate-800">{formData.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input 
                      id="otp" 
                      required 
                      placeholder="Enter 6-digit code" 
                      className="bg-white/50 h-11 font-mono tracking-widest text-lg text-center" 
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => handleInputChange("otp", e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-6 text-sm font-semibold shadow-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="size-5 mr-2 animate-spin rounded-full border-2 border-white/80 border-t-transparent"></div>
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Verify & Complete Registration
                  </Button>

                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading}
                      className="text-sm text-primary font-semibold hover:underline transition-all"
                    >
                      Didn't receive the code? Resend OTP
                    </button>
                  </div>
                </form>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-600 mb-4">
                    Your account has been created successfully!
                  </p>
                  <p className="text-sm text-slate-500">
                    Redirecting to your dashboard...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-[11px] font-bold tracking-[0.15em] text-slate-400/50 uppercase">
            PulseNet • Secure Healthcare Platform
          </p>
        </div>
      </OptimizedAuroraBackground>
    </>
  )
}