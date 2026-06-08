import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Apple-like smooth scrolling with premium deceleration and inertia
    const lenis = new Lenis({
      duration: 1.8, // Luxuriously long decay curve
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      smoothWheel: true,
      wheelMultiplier: 0.9, // Buttery soft scrolls
      touchMultiplier: 1.8, // Fluid responsive trackpads/mobile touch
      infinite: false,
    });

    (window as any).lenis = lenis;

    // Direct scroll events sync GSAP ScrollTrigger computations and top progress bar
    lenis.on("scroll", (e: any) => {
      ScrollTrigger.update();
      const progressEl = document.getElementById("scroll-progress");
      if (progressEl && typeof e.progress === "number") {
        progressEl.style.width = `${e.progress * 100}%`;
      }
    });

    // Bind GSAP ticker to Lenis smooth scroll RAF
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable GSAP lag smoothing to maintain sync
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      delete (window as any).lenis;
    };
  }, []);

  return <>{children}</>;
};

