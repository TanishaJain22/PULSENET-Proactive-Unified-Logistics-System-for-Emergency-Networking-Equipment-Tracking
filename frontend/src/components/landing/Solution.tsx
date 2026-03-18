import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { InfiniteTextMarquee } from "@/components/ui/infinite-text-marquee";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { GlowCard } from "@/components/ui/spotlight-card";
import { ModelViewer } from "@/components/ui/ModelViewer";
const SOLUTION_ITEMS = [
  "AI-powered hospital routing for every emergency",
  "Real-time bed and ICU capacity across the network",
  "Digital patient records that travel with the patient",
  "Seamless inter-hospital transfer coordination",
  "National emergency monitoring for health authorities",
];

export function Solution() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="solution" className="bg-background pt-0 pb-8 md:pt-0 md:pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADING SECTION */}
        <div className="flex flex-col items-center text-center w-full overflow-hidden mb-0">
          <InfiniteTextMarquee
            text="One platform. Every hospital. Every emergency. Coordinated."
            speed={60}
            fontSize="clamp(1.4rem, 3.5vw, 2.8rem)"
            tooltipText="Coordinated Everything"
            className="w-vw"
            renderItem={(text: string) => {
              const parts = text.split("Coordinated.");
              return (
                <div className="flex items-center gap-2">
                  <span>{parts[0]}</span>
                  <PointerHighlight rectangleClassName="border-primary bg-primary/5 rounded-md">
                    <span className="font-serif italic text-primary">Coordinated.</span>
                  </PointerHighlight>
                </div>
              );
            }}
          />
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div ref={containerRef} className="-mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: GLOW CARD wrapping the capability text */}
          <GlowCard
            glowColor="green"
            customSize={true}
            className="w-full h-auto !aspect-auto order-2 lg:order-1"
            backgroundColor="#FEFCCE"
          >
            <div className="flex flex-col relative z-10 scale-90 origin-top-left">
              <p className="text-[clamp(0.85rem,1.5vw,1rem)] text-muted-foreground leading-[1.7] mb-6">
                PulseNet connects every hospital, ambulance unit, and government authority on one intelligent platform — giving everyone the right information at the right moment.
              </p>

              <motion.div
                variants={listVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="flex flex-col"
              >
                {SOLUTION_ITEMS.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`flex items-center gap-2.5 py-2.5 ${
                      index !== SOLUTION_ITEMS.length - 1 ? "border-b border-border/40" : ""
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                    <span className="text-xs font-medium text-foreground">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </GlowCard>


          {/* RIGHT COLUMN: 3D MODEL VIEWER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="order-1 lg:order-2 flex items-center justify-center relative w-full h-[360px] lg:h-full min-h-[360px] lg:min-h-[450px]"
          >
            <ModelViewer src="/models/model.glb" className="w-full h-full" />
          </motion.div>

        </div>
      </div>

      <style>{`
        @keyframes move {
          0% { left: 100%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 0%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
