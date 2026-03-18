import { useRef } from "react";
import { useScroll } from "framer-motion";
import { GlareCard } from "@/components/ui/glare-card";
import { CheckCircle2, Ambulance, Brain, Bell, ShieldCheck } from "lucide-react";
import { TextEffect } from "@/components/ui/text-effect";
import { CharacterV1 } from "@/components/ui/text-scroll-animation";

export function HowItWorks() {
  const headingRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: headingRef,
    offset: ["start end", "end start"]
  });

  const headingText = "Two workflows. One platform.";
  const characters = headingText.split("");
  const centerIndex = Math.floor(characters.length / 2);

  const steps = [
    // ... (keep steps same)
    {
      id: "01",
      title: "Emergency Case Created",
      description: "Ambulance crew initiates a case with critical vitals and telemetry.",
      icon: <Ambulance className="w-6 h-6 text-emerald-500" />,
      content: (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs">
          <div className="flex justify-between mb-2">
            <span className="text-white/40 uppercase font-bold tracking-tighter">Patient</span>
            <span className="text-white font-medium">Rajesh K., 54M</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
             <div className="bg-red-500/10 border border-red-500/20 p-2 rounded">
                <span className="block text-red-400 font-bold">BP 90/60</span>
             </div>
             <div className="bg-red-500/10 border border-red-500/20 p-2 rounded">
                <span className="block text-red-400 font-bold">SpO2 88%</span>
             </div>
          </div>
        </div>
      )
    },
    {
      id: "02",
      title: "AI Analyzes & Recommends",
      description: "Proprietary AI scores hospitals based on proximity, load, and specialty.",
      icon: <Brain className="w-6 h-6 text-blue-500" />,
      content: (
        <div className="mt-4 space-y-2">
          <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded flex justify-between items-center">
            <span className="text-xs text-emerald-400 font-bold">Gen Hospital</span>
            <span className="text-[10px] text-white/60">ETA 8m</span>
          </div>
          <div className="p-2 bg-white/5 border border-white/10 rounded flex justify-between items-center">
            <span className="text-xs text-white/40 font-bold">Med Center</span>
            <span className="text-[10px] text-white/20">ETA 12m</span>
          </div>
        </div>
      )
    },
    {
      id: "03",
      title: "Hospital Receives Alert",
      description: "Real-time dashboard updates with live ETA and clinical data.",
      icon: <Bell className="w-6 h-6 text-amber-500" />,
      content: (
        <div className="mt-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg animate-pulse">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <span className="text-xs font-bold text-red-400">INCOMING CRITICAL</span>
          </div>
          <p className="text-[10px] text-white/60">Trauma Unit A · Bed 4 Ready</p>
        </div>
      )
    },
    {
      id: "04",
      title: "Patient Arrives Prepared",
      description: "Seamless handoff with pre-synced records and coordinated staff.",
      icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
      content: (
        <div className="mt-4 flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-white/70">Vitals Synced</span>
           </div>
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-white/70">Records Retrieved</span>
           </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="pt-12 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <TextEffect 
            as="h2" 
            preset="blur" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-10%" }}
            className="text-primary font-bold text-sm tracking-widest uppercase mb-4"
          >
            How It Works
          </TextEffect>
          <h2 
            ref={headingRef}
            className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight uppercase"
            style={{ perspective: "1000px" }}
          >
            {characters.map((char, index) => (
              <CharacterV1
                key={index}
                char={char}
                index={index}
                centerIndex={centerIndex}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Our intelligent ecosystem bridges the gap between field ambulance crews and emergency departments.
          </p>
        </div>


        <div className="scale-90 origin-top">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {steps.map((step) => (
              <GlareCard key={step.id} className="p-5 flex flex-col items-start justify-between">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 w-full">
                    <span className="text-3xl font-black text-white/10 uppercase italic">{step.id}</span>
                    <div className="scale-90 transform origin-top-right">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{step.title}</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>
                <div className="w-full scale-95 transform origin-bottom">
                  {step.content}
                </div>
              </GlareCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
