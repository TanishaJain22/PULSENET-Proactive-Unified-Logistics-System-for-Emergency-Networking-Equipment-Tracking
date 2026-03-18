import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Suspense, lazy, useEffect } from "react"
import { PageSkeleton } from "@/components/PageSkeleton"
import HospitalAdminLayout from "@/layouts/HospitalAdminLayout"
import SystemAdminLayout from "@/layouts/SystemAdminLayout"
import UserLayout from "@/layouts/UserLayout"
import { AuthProvider } from "@/contexts/AuthContext"
import { initializeDialogScrollFix } from "@/utils/dialogScrollFix"

// Lazy load pages
const LandingPage = lazy(() => import("@/pages/LandingPage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const HospitalRegisterPage = lazy(() => import("@/pages/HospitalRegisterPage"))
const UserRegisterPage = lazy(() => import("@/pages/UserRegisterPage"))
const HospitalDashboard = lazy(() => import("@/pages/HospitalDashboard"))
const ResourceManagement = lazy(() => import("@/pages/ResourceManagement"))
const PatientRecords = lazy(() => import("@/pages/PatientRecords"))
const HospitalEmergencies = lazy(() => import("@/pages/HospitalEmergencies"))
const HospitalTransfers = lazy(() => import("@/pages/HospitalTransfers"))
const DoctorsManagement = lazy(() => import("@/pages/DoctorsManagement"))
const HospitalNotifications = lazy(() => import("@/pages/HospitalNotifications"))
const HospitalProfile = lazy(() => import("@/pages/HospitalProfile"))
const HospitalApplicationStatus = lazy(() => import("@/pages/HospitalApplicationStatus"))
const AdminOverview = lazy(() => import("@/pages/AdminOverview"))
const AdminHospitals = lazy(() => import("@/pages/AdminHospitals"))

// User section pages
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"))
const FamilyNetwork = lazy(() => import("@/pages/user/FamilyNetwork"))
const GovSchemes = lazy(() => import("@/pages/user/GovSchemes"))

const UserSettings = lazy(() => import("@/pages/user/UserSettings"))

// Advanced user feature pages
const AIHealthHub = lazy(() => import("@/pages/user/AIHealthHub"))
const HealthDashboard3D = lazy(() => import("@/pages/user/HealthDashboard3D"))
const SimpleHeartPage = lazy(() => import("@/pages/user/SimpleHeartPage"))
const Heart3DTest = lazy(() => import("@/pages/user/Heart3DTest"))
const MentalWellness = lazy(() => import("@/pages/user/MentalWellness"))
const EmergencyHub = lazy(() => import("@/pages/user/EmergencyHub"))
const VaccinationHub = lazy(() => import("@/pages/user/VaccinationHub"))
const LabResults = lazy(() => import("@/pages/user/LabResults"))
const InsuranceHub = lazy(() => import("@/pages/user/InsuranceHub"))
const DoctorConsultation = lazy(() => import("@/pages/user/DoctorConsultation"))
const WearableHub = lazy(() => import("@/pages/user/WearableHub"))
const FitnessHub = lazy(() => import("@/pages/user/FitnessHub"))

import { PlaceholderPage } from "@/components/PlaceholderPage"
import { Navbar } from "@/components/landing/Navbar"
import { ReactLenis } from "lenis/react"

import { motion, AnimatePresence } from "framer-motion"

function AppContent() {
  const location = useLocation()
  const isAuthPath = location.pathname.startsWith("/hospital") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/user") || location.pathname === "/login"

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {!isAuthPath && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut",
            opacity: { duration: 0.2 }
          }}
          className="h-full w-full"
        >
          <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><PageSkeleton /></div>}>
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/hospital-register" element={<HospitalRegisterPage />} />
              <Route path="/user-register" element={<UserRegisterPage />} />

              {/* Hospital Admin Routes */}
              <Route path="/hospital" element={<Navigate to="/login" replace />} />
              <Route path="/hospital/:hospitalId/*" element={<HospitalAdminLayout><Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<HospitalDashboard />} />
                <Route path="resources" element={<ResourceManagement />} />
                <Route path="records" element={<PatientRecords />} />
                <Route path="emergencies" element={<HospitalEmergencies />} />
                <Route path="transfers" element={<HospitalTransfers />} />
                <Route path="doctors" element={<DoctorsManagement />} />
                <Route path="notifications" element={<HospitalNotifications />} />
                <Route path="profile" element={<HospitalProfile />} />
                <Route path="application-status" element={<HospitalApplicationStatus />} />
              </Routes></HospitalAdminLayout>} />

              {/* System Admin Routes */}
              <Route path="/admin" element={<SystemAdminLayout><Routes>
                <Route index element={<Navigate to="/admin/overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="hospitals" element={<AdminHospitals />} />
                <Route path="emergencies" element={<PlaceholderPage title="Global Emergencies" />} />
                <Route path="transfers" element={<PlaceholderPage title="Global Transfers" />} />
                <Route path="capacity" element={<PlaceholderPage title="Regional Capacity" />} />
                <Route path="logs" element={<PlaceholderPage title="AI Intervention Logs" />} />
              </Routes></SystemAdminLayout>} />

              <Route path="/admin/*" element={<SystemAdminLayout><Routes>
                 <Route index element={<Navigate to="/admin/overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="hospitals" element={<AdminHospitals />} />
                <Route path="emergencies" element={<PlaceholderPage title="Global Emergencies" />} />
                <Route path="transfers" element={<PlaceholderPage title="Global Transfers" />} />
                <Route path="capacity" element={<PlaceholderPage title="Regional Capacity" />} />
                <Route path="logs" element={<PlaceholderPage title="AI Intervention Logs" />} />
              </Routes></SystemAdminLayout>} />

              {/* User Section Routes */}
              <Route path="/user" element={<UserLayout />}>
                <Route index element={<Navigate to="/user/dashboard" replace />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="family" element={<FamilyNetwork />} />
                <Route path="schemes" element={<GovSchemes />} />

                <Route path="settings" element={<UserSettings />} />
                
                {/* Advanced User Features */}
                <Route path="ai-health" element={<AIHealthHub />} />
                <Route path="health-3d" element={<HealthDashboard3D />} />
                <Route path="simple-heart" element={<SimpleHeartPage />} />
                <Route path="heart-test" element={<Heart3DTest />} />
                <Route path="mindspace" element={<MentalWellness />} />
                <Route path="emergency" element={<EmergencyHub />} />
                <Route path="vaccination" element={<VaccinationHub />} />
                <Route path="lab-results" element={<LabResults />} />
                <Route path="insurance" element={<InsuranceHub />} />
                <Route path="doctors" element={<DoctorConsultation />} />
                <Route path="wearable" element={<WearableHub />} />
                <Route path="fitness" element={<FitnessHub />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function App() {
  // Initialize dialog scroll fix on app start
  useEffect(() => {
    initializeDialogScrollFix();
  }, []);

  return (
    <AuthProvider>
      <ReactLenis root>
        <BrowserRouter>
          <AppContent />
          <Toaster position="top-right" closeButton richColors />
        </BrowserRouter>
      </ReactLenis>
    </AuthProvider>
  )
}

export default App
