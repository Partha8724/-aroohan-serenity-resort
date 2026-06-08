import { useState } from "react";
import { MagneticButton } from "./MagneticButton";

interface NavbarProps {
  onReserveClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReserveClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className="glass"
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "1200px",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 999,
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/images/logo.png.png"
            alt="Aroohan Logo"
            style={{
              height: "40px",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallbackText = document.createElement("div");
                fallbackText.innerText = "AROOHAN";
                fallbackText.style.fontFamily = "var(--font-family)";
                fallbackText.style.fontSize = "1.2rem";
                fallbackText.style.fontWeight = "300";
                fallbackText.style.letterSpacing = "3px";
                fallbackText.style.color = "#f5f0e1";
                fallbackText.style.textTransform = "uppercase";
                parent.appendChild(fallbackText);
              }
            }}
          />
        </div>

        <nav className="desktop-nav" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {["Home", "Experience", "Suites", "Wellness"].map((item) => (
            <MagneticButton
              key={item}
              data-cursor="Go"
              onClick={() => {
                const target = document.querySelector(`#${item.toLowerCase()}`);
                if (target && (window as any).lenis) {
                  (window as any).lenis.scrollTo(target);
                }
              }}
            >
              <a
                href={`#${item.toLowerCase()}`}
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "2px",
                  color: "rgba(245, 240, 225, 0.8)",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#b89b72")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245, 240, 225, 0.8)")}
              >
                {item}
              </a>
            </MagneticButton>
          ))}
        </nav>

        <div className="desktop-nav">
          <MagneticButton data-cursor="Book">
            <a
              href="#booking"
              onClick={(e) => {
                if (onReserveClick) {
                  e.preventDefault();
                  onReserveClick();
                }
              }}
              className="button"
              style={{
                padding: "0.6rem 1.4rem",
                borderRadius: "50px",
                fontSize: "0.7rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                textDecoration: "none",
                backgroundColor: "#b89b72",
                color: "#111111",
                fontWeight: 600,
              }}
            >
              Reserve Now
            </a>
          </MagneticButton>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexDirection: "column",
            gap: "6px",
            zIndex: 1000,
            padding: "0.5rem",
          }}
          className="mobile-menu-btn"
        >
          <span style={{ display: "block", width: "22px", height: "1px", backgroundColor: "#f5f0e1", transition: "transform 0.3s ease, margin 0.3s ease", transform: mobileMenuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
          <span style={{ display: "block", width: "22px", height: "1px", backgroundColor: "#f5f0e1", transition: "opacity 0.3s ease", opacity: mobileMenuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: "22px", height: "1px", backgroundColor: "#f5f0e1", transition: "transform 0.3s ease, margin 0.3s ease", transform: mobileMenuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
        </button>
      </header>

      {/* Mobile Glassmorphic Drawer Panel overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(17, 17, 17, 0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 998,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "2.5rem",
          transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          transform: mobileMenuOpen ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        {["Home", "Experience", "Suites", "Wellness"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={() => {
              setMobileMenuOpen(false);
              const target = document.querySelector(`#${item.toLowerCase()}`);
              if (target && (window as any).lenis) {
                (window as any).lenis.scrollTo(target);
              }
            }}
            style={{
              fontFamily: "var(--font-family)",
              fontSize: "1.3rem",
              fontWeight: 300,
              letterSpacing: "4px",
              color: "#f5f0e1",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "color 0.3s ease",
            }}
          >
            {item}
          </a>
        ))}
        
        <a
          href="#booking"
          onClick={(e) => {
            setMobileMenuOpen(false);
            if (onReserveClick) {
              e.preventDefault();
              onReserveClick();
            }
          }}
          className="button"
          style={{
            padding: "0.8rem 2.2rem",
            borderRadius: "50px",
            fontSize: "0.8rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            textDecoration: "none",
            backgroundColor: "#b89b72",
            color: "#111111",
            fontWeight: 600,
            marginTop: "1.5rem",
          }}
        >
          Reserve Now
        </a>
      </div>
    </>
  );
};

