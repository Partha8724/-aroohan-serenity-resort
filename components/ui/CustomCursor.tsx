import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hoverText, setHoverText] = useState("");

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    // Set initial offscreen
    gsap.set([cursor, ring], { xPercent: -50, yPercent: -50 });

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Find closest interactive parent or tag name
      const interactiveEl = target.closest(
        "button, a, input, select, option, li, [data-cursor], .card-hover-effect, [onClick]"
      );
      
      const computedStyle = window.getComputedStyle(target);
      const isPointer = computedStyle.cursor === "pointer";

      if (interactiveEl || isPointer) {
        // Traverse up to find data-cursor if it exists
        const dataCursorEl = target.closest("[data-cursor]");
        const text = dataCursorEl ? dataCursorEl.getAttribute("data-cursor") || "" : "";
        setHoverText(text);

        gsap.to(ring, {
          scale: text ? 3.5 : 2,
          backgroundColor: "rgba(184, 155, 114, 0.18)",
          borderColor: "rgba(184, 155, 114, 0.9)",
          duration: 0.3,
        });
        gsap.to(cursor, {
          scale: text ? 0 : 0.4,
          backgroundColor: "#b89b72",
          duration: 0.3,
        });
      } else {
        setHoverText("");
        gsap.to(ring, {
          scale: 1,
          backgroundColor: "transparent",
          borderColor: "rgba(245, 240, 225, 0.3)",
          duration: 0.3,
        });
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: "#b89b72",
          duration: 0.3,
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          backgroundColor: "#b89b72",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "40px",
          height: "40px",
          border: "1px solid rgba(245, 240, 225, 0.3)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f5f0e1",
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          fontFamily: "var(--font-family)",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {hoverText && <span style={{ opacity: 1, transform: "scale(0.85)" }}>{hoverText}</span>}
      </div>
    </>
  );
};
