import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { GradientButton } from "@/components/ui/gradient-button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const NavLinks = () => (
    <>
      <a
        href="#features"
        onClick={(e) => handleScrollTo(e, "features")}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
      >
        Features
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
      </a>
      <a
        href="#about-us"
        onClick={(e) => handleScrollTo(e, "about-us")}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
      >
        About Us
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
      </a>
      <a
        href="#contact"
        onClick={(e) => handleScrollTo(e, "contact")}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
      >
        Contact
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
      </a>
    </>
  );

  return (
    <nav
      className={`fixed top-0 w-full h-16 z-50 transition-colors duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0 h-16 overflow-hidden">
          <Link to="/" className="flex items-center h-full">
            <img 
              src="/logo.png" 
              alt="PulseNet Logo" 
              className="h-24 md:h-32 w-auto object-contain mix-blend-multiply" 
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
              }}
            />
          </Link>
        </div>

        {/* Right side: Nav Links & Actions */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          
          <div className="flex items-center gap-3">
            <GradientButton variant="variant" asChild>
              <Link to="/login">Get Started</Link>
            </GradientButton>
          </div>
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-12 flex flex-col gap-8">
              <VisuallyHidden><SheetTitle>Navigation Menu</SheetTitle></VisuallyHidden>
              <div className="flex flex-col gap-6">
                <NavLinks />
              </div>
              <div className="flex flex-col gap-3 mt-auto mb-8">
                <GradientButton variant="variant" className="w-full" asChild>
                  <Link to="/login">Get Started</Link>
                </GradientButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
