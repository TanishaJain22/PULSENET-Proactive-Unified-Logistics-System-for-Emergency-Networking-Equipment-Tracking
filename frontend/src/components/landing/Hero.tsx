import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const ROTATING_WORDS = [
  "Decision.",
  "Doctor.",
  "Care.",
  "Response.",
  "Outcome.",
  "Life.",
];

export function Hero() {

  const { scrollY } = useScroll();
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  const handleScrollToProblem = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("problem");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-28 pb-24 overflow-visible">
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col items-center text-center z-10">
        
        {/* --- PART A: TAGLINE --- */}
        <div 
          className="text-[20px] md:text-[26px] lg:text-[32px] font-semibold leading-tight tracking-[-0.02em] flex flex-col items-center justify-center w-full mt-8 md:mt-12 mb-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.0, ease: "easeOut" }}
            className="block whitespace-nowrap overflow-hidden text-center w-full"
          >
            The Right{" "}
            <Typewriter 
              text={ROTATING_WORDS}
              speed={70}
              waitTime={2000}
              deleteSpeed={40}
              cursorChar="_"
              className="font-semibold"
            />
          </motion.div>
        </div>

        {/* --- CONTAINER SCROLL ANIMATION --- */}
        <div className="flex flex-col w-full mt-0 md:mt-2">
          <ContainerScroll
            titleComponent={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <h1 className="text-3xl md:text-5xl font-semibold text-black dark:text-white mt-0 mb-4">
                  Streamline Your <br />
                  <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none" style={{ color: '#2FCC85' }}>
                    Healthcare Operations
                  </span>
                </h1>
              </motion.div>
            }
          >
            <div className="relative w-full h-full" style={{ willChange: 'auto', transform: 'translateZ(0)' }}>
              <video
                src="/demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="mx-auto rounded-2xl object-cover h-full object-center w-full"
                style={{ willChange: 'auto', backfaceVisibility: 'hidden' }}
              />
            </div>
          </ContainerScroll>
        </div>

        {/* --- PART B: SCROLL INDICATOR --- */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="-mt-12 md:-mt-24 flex flex-col items-center justify-center cursor-pointer relative z-20"
          onClick={handleScrollToProblem}
        >
          <span className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
