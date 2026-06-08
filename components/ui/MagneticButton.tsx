import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  "data-cursor"?: string;
  id?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = "",
  onClick,
  style,
  "data-cursor": dataCursor,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Magnetic strength bounds
      const dist = Math.sqrt(x * x + y * y);
      const maxDist = 80; // Distance within which the effect starts

      if (dist < maxDist) {
        // Pull towards mouse
        gsap.to(container, {
          x: x * 0.45,
          y: y * 0.45,
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(text, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        // Reset
        reset();
      }
    };

    const reset = () => {
      gsap.to(container, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
      gsap.to(text, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
    };

    const onMouseLeave = () => {
      reset();
    };

    // Listen on parent or window for proximity check
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`magnetic-btn-container ${className}`}
      style={{
        display: "inline-block",
        position: "relative",
        transition: "transform 0.16s var(--ease-out)",
        ...style,
      }}
      data-cursor={dataCursor}
      id={id}
    >
      <div ref={textRef} style={{ pointerEvents: "none" }}>
        {children}
      </div>
      <style jsx global>{`
        .magnetic-btn-container {
          cursor: pointer;
        }
        .magnetic-btn-container:active {
          transform: scale(0.96) !important;
        }
      `}</style>
    </div>
  );
};
