import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Group } from "three";

// Preload the model to avoid jank when it's first mounted
useGLTF.preload("/models/model.glb");

// ─── Spinning model ──────────────────────────────────────────────────────────
function Model({ url }: { url: string }) {
  const ref = useRef<Group>(null!);
  const { scene } = useGLTF(url);
  const materialsApplied = useRef(false);

  // Smooth Y-axis rotation
  useFrame((state, delta) => {
    if (ref.current) {
      // Use delta for frame-independent rotation speed
      ref.current.rotation.y += delta * 0.25;
    }
  });

  // Optimize material updates: only run once per scene change
  useEffect(() => {
    if (scene && !materialsApplied.current) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
              mat.transparent = false;
              mat.opacity = 1.0; 
              mat.depthWrite = true;
              mat.depthTest = true;
              
              if (child.name.includes("Health")) {
                 // Saturated green for clarity
                 mat.color.set("#10b981"); 
                 mat.emissive.set("#059669"); 
                 mat.emissiveIntensity = 0.4;
              } else {
                 // Slightly darker grey/blue for contrast
                 mat.color.set("#64748b"); 
                 mat.emissive.set("#1e293b"); 
                 mat.emissiveIntensity = 0.2;
              }

              mat.needsUpdate = true;
          }
        }
      });
      materialsApplied.current = true;
    }
  }, [scene]);

  return <primitive ref={ref} object={scene} scale={2.2} />;
}

// ─── Fallback while model loads ───────────────────────────────────────────────
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.4, 12, 12]} />
      <meshStandardMaterial color="#72e3ad" wireframe emissive="#72e3ad" emissiveIntensity={0.3} />
    </mesh>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────
interface ModelViewerProps {
  /** Path relative to /public, e.g. "/models/model.glb" */
  src?: string;
  className?: string;
}

export function ModelViewer({
  src = "/models/model.glb",
  className = "",
}: ModelViewerProps) {
  return (
    <div
      className={`relative w-full h-[400px] lg:h-full min-h-[400px] ${className}`}
    >
      <Canvas
        camera={{ position: [0.5, 2.5, 4.2], fov: 25 }}
        className="absolute inset-0 w-full h-full"
        // Aggressive Optimizations:
        // 1. Cap pixel ratio at 1.5 - huge win for mobile/4K screens
        dpr={[1, 1.5]}
        // 2. Performance hints
        gl={{ 
          alpha: true, 
          antialias: false, // Disable MSAA for extreme performance, FXAA/Bloom handles edges
          powerPreference: "high-performance",
          depth: true,
          stencil: false,
        }}
      >
        <ambientLight intensity={0.5} />
        <PointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <PointLight position={[-10, 5, -10]} intensity={0.8} color="#bfe7ff" />

        <Suspense fallback={<Loader />}>
          <Center>
            <Model url={src} />
          </Center>
          <Environment preset="city" blur={1} />
        </Suspense>

        <EffectComposer enableNormalPass={false}>
          <Bloom 
             luminanceThreshold={0.9} 
             mipmapBlur
             intensity={0.05} 
             levels={5} // Reduced levels for faster processing
          />
        </EffectComposer>

        <OrbitControls 
           enablePan={false} 
           enableZoom={false} 
           minPolarAngle={Math.PI / 4}
           maxPolarAngle={Math.PI / 1.5}
           target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

interface PointLightProps {
  position: [number, number, number];
  intensity: number;
  color: string;
}

function PointLight({ position, intensity, color }: PointLightProps) {
  return <pointLight position={position} intensity={intensity} color={color} />;
}
