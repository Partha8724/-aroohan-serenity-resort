import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // e.g. -0.2 (slower) or 0.2 (faster)
  direction?: "vertical" | "horizontal";
  className?: string;
  style?: React.CSSProperties;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.1,
  direction = "vertical",
  className = "",
  style,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const transformProp = direction === "vertical" ? "y" : "x";
      const movement = speed * window.innerHeight;

      gsap.fromTo(
        el,
        { [transformProp]: 0 },
        {
          [transformProp]: movement,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <div ref={elementRef} className={className} style={{ position: "relative", ...style }}>
      {children}
    </div>
  );
};
