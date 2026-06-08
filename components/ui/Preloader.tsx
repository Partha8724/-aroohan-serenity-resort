import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { MagneticButton } from "./MagneticButton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

export const Preloader = () => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const typingTextRef = useRef<HTMLDivElement>(null);
  const enterBtnRef = useRef<HTMLDivElement>(null);
  const progressValRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Simulate luxury asset loading progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Asset reveal sequence
        const tl = gsap.timeline();
        tl.to(progressValRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: "power3.in"
        })
        .fromTo(
          videoWrapperRef.current,
          { opacity: 0, scale: 0.85, filter: "blur(15px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.8, ease: "power4.out" }
        );

        // Character typewriter animation
        if (typingTextRef.current) {
          tl.to(typingTextRef.current, {
            duration: 3.2,
            text: "Aroohan — A Serenity Park. Reconnecting with the natural frequencies of life.",
            ease: "none",
          }, "-=0.4");
        }

        // Fade in CTA
        tl.fromTo(
          enterBtnRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.8"
        );
      }
      setProgress(currentProgress);
    }, 100);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, []);

  const handleEnter = () => {
    const exitTl = gsap.timeline({
      onComplete: () => {
        setIsDone(true);
        document.body.style.overflow = "";
      },
    });

    // Zoom the video frame to full viewport, and fade out other text & overlay background
    exitTl.to([typingTextRef.current, enterBtnRef.current], {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power3.in",
    })
    .to(videoWrapperRef.current, {
      scale: 3.2,
      borderRadius: "0px",
      duration: 1.5,
      ease: "power4.inOut",
    }, "-=0.3")
    .to(containerRef.current, {
      backgroundColor: "rgba(13, 13, 13, 0)",
      duration: 1.5,
      ease: "power4.inOut",
    }, "-=1.5")
    .to(videoWrapperRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.5");
  };

  if (isDone) return null;

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#0d0d0d", // Deep dark luxury void
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          overflow: "hidden",
        }}
      >
        {/* Decorative ambient glowing lights */}
        <div className="ambient-glow" />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2.5rem",
            maxWidth: "600px",
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Framed Video Container */}
          <div
            ref={videoWrapperRef}
            className="video-frame-container"
            style={{
              width: "100%",
              maxWidth: "500px",
              aspectRatio: "16/9",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
              opacity: 0, // Controlled by GSAP
            }}
          >
            {/* Elegant Border Tracer Line */}
            <div className="border-glow-tracer" />

            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            >
              <source src="/videos/intro.mp4.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Typing Area with Blinking Cursor */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2px" }}>
            <div
              ref={typingTextRef}
              style={{
                fontFamily: "var(--font-family)",
                fontSize: "0.95rem",
                color: "rgba(245, 240, 225, 0.8)",
                textAlign: "center",
                minHeight: "45px",
                lineHeight: "1.6",
                letterSpacing: "1.5px",
                maxWidth: "480px",
              }}
            />
            {progress === 100 && <span className="blinking-cursor">|</span>}
          </div>

          {/* Loading Clock Indicator */}
          {progress < 100 && (
            <div
              ref={progressValRef}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              {/* Pulsing oracle core */}
              <div className="oracle-dot" />
              
              <div
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "2.8rem",
                  fontWeight: 200,
                  color: "#b89b72",
                  letterSpacing: "6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>{String(progress).padStart(3, "0")}</span>
                <span style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "rgba(245, 240, 225, 0.4)", textTransform: "uppercase" }}>
                  Preparing Sanctuary...
                </span>
              </div>
            </div>
          )}

          {/* Magnetic Sanctuary Entry Button */}
          <div ref={enterBtnRef} style={{ opacity: 0 }}>
            <MagneticButton data-cursor="Enter" onClick={handleEnter}>
              <button
                className="button pulse-glow"
                style={{
                  borderRadius: "50px",
                  backgroundColor: "#b89b72",
                  color: "#111111",
                  padding: "1rem 2.8rem",
                  fontSize: "0.8rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(184, 155, 114, 0.25)",
                }}
              >
                Enter Sanctuary
              </button>
            </MagneticButton>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ambient-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(184, 155, 114, 0.08) 0%, transparent 70%);
          animation: floatGlow 15s infinite ease-in-out;
          pointer-events: none;
          z-index: 1;
        }

        .oracle-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #b89b72;
          box-shadow: 0 0 20px #b89b72, 0 0 40px #b89b72;
          animation: pulseOracle 2s infinite ease-in-out;
        }

        .video-frame-container {
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 
                      0 0 0 1px rgba(184, 155, 114, 0.15),
                      0 0 40px rgba(184, 155, 114, 0.05);
          transition: box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .video-frame-container:hover {
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.9), 
                      0 0 0 1px rgba(184, 155, 114, 0.45),
                      0 0 60px rgba(184, 155, 114, 0.2);
        }

        /* Gold tracer gradient border animation using mask */
        .border-glow-tracer {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(90deg, transparent, #b89b72, transparent, #b89b72, transparent);
          background-size: 300% 100%;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          -webkit-mask-composite: exclude;
          pointer-events: none;
          animation: borderTrace 5s infinite linear;
          z-index: 5;
        }

        .pulse-glow:hover {
          animation: buttonGlow 1.5s infinite alternate;
        }

        .blinking-cursor {
          color: #b89b72;
          font-weight: 600;
          font-size: 1.1rem;
          animation: blink 0.8s infinite;
        }

        @keyframes pulseOracle {
          0%, 100% { transform: scale(0.85); opacity: 0.6; box-shadow: 0 0 15px rgba(184, 155, 114, 0.4); }
          50% { transform: scale(1.25); opacity: 1; box-shadow: 0 0 25px rgba(184, 155, 114, 0.8); }
        }

        @keyframes borderTrace {
          0% { background-position: 0% 0%; }
          100% { background-position: 300% 0%; }
        }

        @keyframes floatGlow {
          0%, 100% { transform: translate(-10%, -10%) scale(1); }
          50% { transform: translate(10%, 10%) scale(1.15); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes buttonGlow {
          from { box-shadow: 0 10px 30px rgba(184, 155, 114, 0.25); }
          to { box-shadow: 0 10px 45px rgba(184, 155, 114, 0.6); }
        }
      `}</style>
    </>
  );
};
