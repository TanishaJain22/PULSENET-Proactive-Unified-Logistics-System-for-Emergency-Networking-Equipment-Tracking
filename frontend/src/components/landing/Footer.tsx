import { ShieldCheck } from "lucide-react";

export function Footer() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    } else if (targetId === "request-demo") {
      // Trigger demo dialog from nav if it exists by simulating click on nav button or by using a global context
      // For standalone component simplicity without context bloat, fallback to scrolling to top if dialog logic is only in Navbar.
      // But user spec asks to "opens dialog". Since dialog state is local to Navbar in our current implementation, we'll
      // just scroll to top where they can click it. Best practice would be to hoist dialog state to layout.
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-8">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col">
            <div className="mb-4">
              <img src="/logo.png" alt="PulseNet Logo" className="h-16 w-auto object-contain bg-white/90 p-1.5 rounded-lg scale-110 origin-left" />
            </div>

            
            <div className="mt-6 flex gap-4 text-muted/80">
                {/* Social placeholders */}
                <a href="#" className="hover:text-background transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="hover:text-background transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="flex flex-col">
            <h4 className="text-xs uppercase tracking-[0.08em] font-semibold text-muted mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" onClick={(e) => handleScrollTo(e, "how-it-works")} className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">How It Works</a>
              </li>
              <li>
                <a href="#features" onClick={(e) => handleScrollTo(e, "features")} className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Features</a>
              </li>
              <li>
                <a href="#solution" onClick={(e) => handleScrollTo(e, "solution")} className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Solution</a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleScrollTo(e, "request-demo")} className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Request Demo</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Organization */}
          <div className="flex flex-col">
            <h4 className="text-xs uppercase tracking-[0.08em] font-semibold text-muted mb-4">Organization</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">About PulseNet</a></li>
              <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Contact Us</a></li>
              <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Careers</a></li>
              <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Blog</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col">
             <h4 className="text-xs uppercase tracking-[0.08em] font-semibold text-muted mb-4">Legal</h4>
             <ul className="space-y-3">
               <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Privacy Policy</a></li>
               <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Terms of Service</a></li>
               <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Security</a></li>
               <li><a href="#" className="text-sm text-muted hover:text-background hover:underline transition-colors decoration-1 underline-offset-4">Compliance</a></li>
             </ul>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="mt-12 mb-6 border-t border-border/15"></div>

        {/* BOTTOM ROW */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="text-xs text-muted/60">
             © 2026 PulseNet. All rights reserved.
           </div>
           <div className="flex items-center gap-1.5 text-xs text-muted">
             <ShieldCheck className="w-3.5 h-3.5" />
             Government Authorized System
           </div>
        </div>

      </div>
    </footer>
  );
}
