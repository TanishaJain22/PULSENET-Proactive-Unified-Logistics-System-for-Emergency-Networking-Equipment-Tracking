import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Solution } from "@/components/landing/Solution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Component as BackgroundComponent } from "@/components/ui/background-components";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <main>
        <BackgroundComponent>
          <Hero />
        </BackgroundComponent>
        <Solution />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
