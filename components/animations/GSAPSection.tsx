import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPSectionProps {
  children: React.ReactNode;
  className?: string;
  triggerStart?: string;
  triggerEnd?: string;
  scrub?: boolean | number;
  yOffset?: number;
  stagger?: number;
  style?: React.CSSProperties;
}

export const GSAPSection: React.FC<GSAPSectionProps> = ({
  children,
  className = "",
  triggerStart = "top 85%",
  triggerEnd = "bottom 20%",
  scrub = false,
  yOffset = 50,
  stagger = 0.15,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const fadeElements = el.querySelectorAll(".fade-in-up");
    const scaleElements = el.querySelectorAll(".scale-up");
    const sideRevealElements = el.querySelectorAll(".side-reveal");
    const lineElements = el.querySelectorAll(".line-reveal");
    const zoomBgElements = el.querySelectorAll(".zoom-in-bg");

    const ctx = gsap.context(() => {
      // Fade-in-up elements timeline
      if (fadeElements.length > 0) {
        gsap.fromTo(
          fadeElements,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: stagger,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: triggerStart,
              end: triggerEnd,
              toggleActions: scrub ? "play none none none" : "play none none reverse",
              scrub: scrub,
            },
          }
        );
      }

      // Scale-up elements timeline
      if (scaleElements.length > 0) {
        gsap.fromTo(
          scaleElements,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            stagger: stagger,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: triggerStart,
              end: triggerEnd,
              toggleActions: "play none none reverse",
              scrub: scrub,
            },
          }
        );
      }

      // Side reveal (masking effect)
      if (sideRevealElements.length > 0) {
        gsap.fromTo(
          sideRevealElements,
          { clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1.5,
            stagger: stagger,
            ease: "power4.inOut",
            scrollTrigger: {
              trigger: el,
              start: triggerStart,
              end: triggerEnd,
              toggleActions: "play none none reverse",
              scrub: scrub,
            },
          }
        );
      }

      // Horizontal line reveal
      if (lineElements.length > 0) {
        gsap.fromTo(
          lineElements,
          { width: "0%" },
          {
            width: "100%",
            duration: 1.6,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: triggerEnd,
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Zoom-in background image parallax-like reveal
      if (zoomBgElements.length > 0) {
        zoomBgElements.forEach((bg) => {
          gsap.fromTo(
            bg,
            { scale: 1.05 },
            {
              scale: 1.25,
              ease: "power1.out",
              scrollTrigger: {
                trigger: bg,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      }
    }, el);

    return () => ctx.revert();
  }, [triggerStart, triggerEnd, scrub, yOffset, stagger]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
};
