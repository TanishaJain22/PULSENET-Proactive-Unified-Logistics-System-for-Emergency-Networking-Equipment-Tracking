import * as React from "react"
import { useParams } from "react-router-dom"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls, Stage } from "@react-three/drei"
import * as THREE from "three"
import type { Group } from "three"
import { WordPullUp } from "@/components/ui/word-pull-up"
import { GradientButton } from "@/components/ui/gradient-button"
import { Badge } from "@/components/ui/badge"
import { Activity, Bed, ArrowUpRight, Settings, ChevronRight } from "lucide-react"

// Preload model to avoid load jank
useGLTF.preload("/models/hospital.glb")

function RotatingModel({ url }: { url: string }) {
  const ref = React.useRef<Group>(null!)
  const { scene: originalScene } = useGLTF(url)
  const materialsApplied = React.useRef(false)

  // Clone the scene so cached GLTF scenes aren't mutated
  const scene = React.useMemo(() => originalScene.clone(true), [originalScene])

  // Apply emissive materials so the model is always visible
  React.useEffect(() => {
    if (scene && !materialsApplied.current) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          if (mat) {
            mat.transparent = true
            mat.opacity = 0.95
            mat.depthWrite = true
            mat.depthTest = true
            
            // Enhanced hospital-specific coloring
            if (child.name.toLowerCase().includes("hospital") || 
                child.name.toLowerCase().includes("building") ||
                child.name.toLowerCase().includes("main")) {
              // Main hospital building - clean white/light blue
              mat.color.set("#f8fafc")
              mat.emissive.set("#e0f2fe")
              mat.emissiveIntensity = 0.3
            } else if (child.name.toLowerCase().includes("cross") || 
                       child.name.toLowerCase().includes("medical") ||
                       child.name.toLowerCase().includes("sign")) {
              // Medical cross or signs - healthcare red
              mat.color.set("#ef4444")
              mat.emissive.set("#dc2626")
              mat.emissiveIntensity = 0.6
            } else if (child.name.toLowerCase().includes("window") ||
                       child.name.toLowerCase().includes("glass")) {
              // Windows - light blue tint
              mat.color.set("#bfdbfe")
              mat.emissive.set("#3b82f6")
              mat.emissiveIntensity = 0.2
            } else if (child.name.toLowerCase().includes("roof") ||
                       child.name.toLowerCase().includes("top")) {
              // Roof - darker professional color
              mat.color.set("#64748b")
              mat.emissive.set("#475569")
              mat.emissiveIntensity = 0.1
            } else {
              // Default hospital elements - clean medical white
              mat.color.set("#ffffff")
              mat.emissive.set("#f1f5f9")
              mat.emissiveIntensity = 0.2
            }
            mat.needsUpdate = true
          }
        }
      })
      materialsApplied.current = true
    }
  }, [scene])

  // Smooth frame-rate-independent rotation
  useFrame((_state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3
  })

  // Center the model and apply scaling
  return (
    <group ref={ref} scale={0.8} position={[0, -0.2, 0]}>
      <primitive object={scene} />
    </group>
  )
}

export function HospitalBedHero() {
  const { hospitalId } = useParams<{ hospitalId: string }>()
  const [adminName, setAdminName] = React.useState("Loading...")

  // Fetch admin details instead of hospital details
  React.useEffect(() => {
    // First try to get current user profile
    fetch('http://localhost:8080/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Failed to fetch user profile')
      })
      .then((data: any) => {
        if (data.success && data.user) {
          const user = data.user
          const fullName = `${user.firstName} ${user.lastName}`.trim()
          setAdminName(fullName || user.email || "Admin")
        } else {
          setAdminName("Admin")
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error)
        // Fallback to a generic admin name
        setAdminName("Admin")
      })
  }, [hospitalId])
  return (
    <section className="grid lg:grid-cols-2 gap-12 items-start relative pt-12 pb-8 px-6 overflow-hidden">
      {/* Background visual flair */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Column: 3D Model + Ripples */}
      <div className="flex justify-center items-center relative pt-2">
        {/* Container for 3D model + Ripples */}
        <div style={{ 
          position: "relative", 
          flex: "none",
          width: "min(340px, 75vw)",
          height: "min(340px, 75vw)",
          transform: "scale(1.1)", 
        }}>
          {/* Ripple elements */}
          <div className="ripple-effect" style={{ animationDelay: "0.2s" }} />
          <div className="ripple-effect" style={{ animationDelay: "1.53s" }} />
          <div className="ripple-effect" style={{ animationDelay: "2.86s" }} />
          
          {/* Three.js canvas container */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden border border-border/50 shadow-2xl backdrop-blur-sm z-10"
            style={{
              background: "radial-gradient(circle at center, #0f172a 0%, #1e293b 20%, #0ea5e9 40%, #06b6d4 60%, #22d3ee 80%, #67e8f9 95%, #a5f3fc 100%)",
            }}
          >
            {/* inner glow ring */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(var(--color-primary)/0.2)_0%,transparent_75%)] pointer-events-none z-[1]" />
            
            <Canvas
              camera={{ position: [0, 0, 4], fov: 50 }}
              dpr={[1, 2]}
              gl={{
                alpha: true,
                antialias: true,
                powerPreference: "high-performance",
              }}
              className="w-full h-full block bg-transparent"
            >
              <React.Suspense fallback={null}>
                {/* Enhanced lighting setup */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <directionalLight position={[-10, -10, -5]} intensity={0.4} />
                <pointLight position={[0, 10, 0]} intensity={0.3} />
                
                <Stage 
                  preset="rembrandt" 
                  intensity={0.8}
                  environment="city"
                  adjustCamera={1.1}
                  center={{ disable: false }}
                >
                  <RotatingModel url="/models/hospital.glb" />
                </Stage>
              </React.Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
                target={[0, 0, 0]}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
          </div>
        </div>
      </div>

      {/* Right Column: Content */}
      <div className="flex flex-col space-y-6 relative z-20">
        <div className="space-y-3">
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 gap-1.5 flex items-center rounded-full text-xs font-bold tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              LIVE CONNECTED
            </Badge>
            <div className="h-px w-12 bg-border/50" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">PulseNet Command Center</span>
          </div>

          <WordPullUp 
            words={`Welcome, ${adminName}`} 
            underlinedWords={["Welcome", ...adminName.split(" ")]}
            className="text-6xl md:text-7xl font-extrabold tracking-tight text-left leading-[1.1] !drop-shadow-none"
          />
          
          <p className="text-base text-muted-foreground/90 leading-relaxed max-w-xl animate-in fade-in slide-in-from-top-4 duration-1000 delay-1000 mt-4">
            Monitor real-time resource distribution, orchestrate emergency response, and maximize healthcare delivery efficiency through our AI-integrated trauma network.
          </p>
        </div>

        {/* Mini Stats Bar - Repositioned higher */}
        <div className="grid grid-cols-2 sm:flex gap-6 py-2 animate-in fade-in opacity-100 duration-1000 delay-1000">
          <div className="flex items-center gap-4 group bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Bed className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">ER Capacity</p>
              <p className="text-2xl font-bold tracking-tight">12 <span className="text-sm font-medium text-muted-foreground/60">Beds Available</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 group bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-border/50 hover:border-destructive/30 transition-all">
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 group-hover:bg-destructive/20 transition-colors">
              <Activity className="size-6 text-destructive" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Active Alerts</p>
              <p className="text-2xl font-bold text-destructive tracking-tight">5 <span className="text-sm font-medium text-destructive/60">Trauma Cases</span></p>
            </div>
          </div>
        </div>

      </div>
    </section>


  )
}
