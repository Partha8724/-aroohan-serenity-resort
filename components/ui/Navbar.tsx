import { MagneticButton } from "./MagneticButton";

interface NavbarProps {
  onReserveClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReserveClick }) => {
  return (
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

      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
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

      <div>
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
    </header>
  );
};
