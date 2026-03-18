"use client";
import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

interface OptimizedAuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const OptimizedAuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: OptimizedAuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col min-h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        {/* Simplified background with reduced animations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Static gradient background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(114, 227, 173, 0.1) 0%, 
                  rgba(74, 222, 128, 0.15) 25%, 
                  rgba(52, 211, 153, 0.1) 50%, 
                  rgba(154, 233, 196, 0.08) 75%, 
                  rgba(34, 197, 94, 0.12) 100%
                )
              `
            }}
          />
          
          {/* Subtle animated overlay - reduced complexity */}
          <div
            className={cn(
              "absolute inset-0 opacity-20",
              "bg-gradient-to-br from-emerald-100/20 via-green-50/10 to-teal-100/20",
              "animate-pulse",
              showRadialGradient && "mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)"
            )}
            style={{
              animationDuration: "4s",
              animationTimingFunction: "ease-in-out"
            }}
          />
          
          {/* Minimal moving elements for subtle effect */}
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-200/10 rounded-full blur-xl animate-bounce"
            style={{
              animationDuration: "6s",
              animationDelay: "0s"
            }}
          />
          <div
            className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-green-200/10 rounded-full blur-lg animate-bounce"
            style={{
              animationDuration: "8s",
              animationDelay: "2s"
            }}
          />
        </div>
        {children}
      </div>
    </main>
  );
};