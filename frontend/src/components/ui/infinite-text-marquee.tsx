"use client";
 
import * as React from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
 
type InfiniteTextMarqueeProps = {
  text?: string;
  speed?: number;
  showTooltip?: boolean;
  tooltipText?: string;
  fontSize?: string;
  textColor?: string;
  hoverColor?: string;
  className?: string;
  renderItem?: (text: string, index: number) => React.ReactNode;
};
 
export const InfiniteTextMarquee: React.FC<InfiniteTextMarqueeProps> = ({
  text = "Let's Get Started",
  speed = 30,
  showTooltip = true,
  tooltipText = "Time to Flex💪",
  fontSize = "8rem",
  textColor = "", // optional override
  hoverColor = "", // optional override
  className,
  renderItem,
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const maxRotation = 8;
 
  useEffect(() => {
    if (!showTooltip) return;
 
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
 
      const midpoint = window.innerWidth / 2;
      const distanceFromMidpoint = Math.abs(e.clientX - midpoint);
      const rotation = (distanceFromMidpoint / midpoint) * maxRotation;
 
      setRotation(e.clientX > midpoint ? rotation : -rotation);
    };
 
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showTooltip]);
 
  return (
    <>
      {showTooltip && (
        <div
          className={cn(
            "following-tooltip fixed z-[99] transition-opacity duration-300 font-bold px-6 py-3 rounded-2xl text-nowrap bg-primary text-primary-foreground pointer-events-none",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{
            top: `${cursorPosition.y}px`,
            left: `${cursorPosition.x}px`,
            transform: `rotateZ(${rotation}deg) translate(-50%, -140%)`,
          }}
        >
          <p>{tooltipText}</p>
        </div>
      )}
 
      <main className={cn("relative w-full overflow-hidden", className)}>
        <motion.div
          className="whitespace-nowrap flex w-fit"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            repeat: Infinity,
            duration: speed,
            ease: "linear",
          }}
        >
          {Array(20).fill(text).map((item, i) => (
             <div key={i} className="flex items-center">
                <span
                  className={cn(
                    "font-bold tracking-tight py-10 px-4 transition-all",
                    !textColor && "text-black dark:text-white"
                  )}
                  style={{
                    fontSize,
                    color: textColor || undefined,
                  }}
                >
                  {renderItem ? renderItem(item, i) : item}
                </span>
                <span className="text-muted-foreground/30 px-2" style={{ fontSize }}>-</span>
             </div>
          ))}
        </motion.div>
      </main>
    </>
  );
};
