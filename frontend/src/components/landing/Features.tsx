import { useRef } from "react";
import { motion, useInView, useScroll } from "framer-motion";
import type { Variants } from "framer-motion";
import { Brain, MapPin, FolderOpen, ArrowLeftRight, Activity, Shield } from "lucide-react";
import { InfiniteSlider } from "@/components/ui/image-auto-slider";
import { CharacterV1 } from "@/components/ui/text-scroll-animation";

const FEATURES = [
  // ... (keep existing features)
  {
    icon: <Brain className="w-6 h-6" strokeWidth={1.5} />,
    title: "AI Hospital Routing",
    desc: "Routes every incoming patient to the most suitable hospital across 7+ clinical and logistical factors — automatically, in under 3 seconds."
  },
  {
    icon: <MapPin className="w-6 h-6" strokeWidth={1.5} />,
    title: "Live Ambulance Tracking",
    desc: "Real-time location and ETA for every incoming patient, visible to the receiving hospital before the ambulance arrives."
  },
  {
    icon: <FolderOpen className="w-6 h-6" strokeWidth={1.5} />,
    title: "Digital Patient Records",
    desc: "Medical history, medications, and lab results travel with the patient automatically on every admission and transfer."
  },
  {
    icon: <ArrowLeftRight className="w-6 h-6" strokeWidth={1.5} />,
    title: "Inter-Hospital Transfers",
    desc: "A 3-step AI-assisted workflow to initiate, coordinate, and track patient transfers across connected hospitals in the network."
  },
  {
    icon: <Activity className="w-6 h-6" strokeWidth={1.5} />,
    title: "Real-Time Capacity Monitoring",
    desc: "Live dashboard showing bed availability, ICU status, ventilators, and on-duty specialists across every connected facility."
  },
  {
    icon: <Shield className="w-6 h-6" strokeWidth={1.5} />,
    title: "Audit Logs & Compliance",
    desc: "Every routing decision, transfer, and record access is logged automatically for full accountability and regulatory compliance."
  }
];

export function Features() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  
  // Character Scroll Animation setup
  const headingRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: headingRef,
    offset: ["start end", "end start"]
  });

  const headingText = "EVERYTHING YOUR\nEMERGENCY NETWORK NEEDS,\nIN ONE PLACE.";
  const characters = headingText.split("");
  const centerIndex = Math.floor(characters.length / 2);

  return (
    <section id="features" ref={containerRef} className="bg-background pt-8 pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADING SECTION */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-primary/10 text-primary border border-primary/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.08em] mb-4 mt-4">
            Platform Capabilities
          </div>
          
          <h2 
            ref={headingRef}
            className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.03em] leading-[1.05] max-w-[900px] uppercase text-center"
            style={{ perspective: "1000px" }}
          >
            {characters.map((char, index) => {
              if (char === "\n") return <br key={index} />;
              return (
                <CharacterV1
                  key={index}
                  char={char}
                  index={index}
                  centerIndex={centerIndex}
                  scrollYProgress={scrollYProgress}
                />
              );
            })}
          </h2>

          <p className="text-[clamp(1rem,1.8vw,1.2rem)] text-muted-foreground leading-[1.75] max-w-[520px] mt-6">
            Purpose-built tools for every role in the healthcare coordination chain.
          </p>
        </div>

        {/* INFINITE FEATURE SLIDER */}
        <InfiniteSlider 
          items={FEATURES}
          speed={30}
          gap={32}
          renderItem={(feature) => (
            <div className="w-[320px] md:w-[380px] p-6 rounded-2xl border border-primary/20 gradient-card-green shadow-xl flex flex-col h-[220px]">
              <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center mb-5 shrink-0">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-white/90 leading-[1.7] line-clamp-3">
                {feature.desc}
              </p>
            </div>
          )}
        />

      </div>
    </section>
  );
}
