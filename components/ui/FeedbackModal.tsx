import { useEffect } from "react";
import gsap from "gsap";
import { MagneticButton } from "./MagneticButton";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "schedule" | "info";
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        ".modal-overlay",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        ".modal-content",
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        className="modal-content glass"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "3rem",
          border: "1px solid rgba(184, 155, 114, 0.3)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Icon */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "rgba(184, 155, 114, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b89b72",
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          {type === "success" ? "✓" : type === "schedule" ? "📅" : "✦"}
        </div>

        {/* Modal Title */}
        <h3
          style={{
            color: "#f5f0e1",
            fontFamily: "var(--font-family)",
            fontSize: "1.8rem",
            fontWeight: 300,
            letterSpacing: "1px",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {title}
        </h3>

        {/* Modal Message */}
        <p
          style={{
            color: "rgba(245, 240, 225, 0.7)",
            fontSize: "0.95rem",
            lineHeight: "1.7",
            margin: 0,
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </p>

        {/* Action Button */}
        <div style={{ marginTop: "1rem" }}>
          <MagneticButton data-cursor="Close">
            <button
              onClick={onClose}
              className="button"
              style={{
                borderRadius: "50px",
                backgroundColor: "#b89b72",
                color: "#111111",
                padding: "0.8rem 2.2rem",
                fontSize: "0.8rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Acknowledge
            </button>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};
