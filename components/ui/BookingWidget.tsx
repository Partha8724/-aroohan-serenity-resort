import { useState } from "react";
import { MagneticButton } from "./MagneticButton";

interface BookingWidgetProps {
  onCheckAvailability?: (details: { checkIn: string; checkOut: string; guests: string }) => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ onCheckAvailability }) => {
  const [checkIn, setCheckIn] = useState("2026-06-10");
  const [checkOut, setCheckOut] = useState("2026-06-15");
  const [guests, setGuests] = useState("2");

  const handleCheck = () => {
    if (onCheckAvailability) {
      onCheckAvailability({ checkIn, checkOut, guests });
    }
  };

  return (
    <div
      className="glass booking-widget-main"
      style={{
        width: "100%",
        maxWidth: "1000px",
        padding: "2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.5rem",
        alignItems: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          style={{
            fontSize: "0.65rem",
            letterSpacing: "2px",
            color: "#b89b72",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Check In
        </label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(245, 240, 225, 0.2)",
            color: "#f5f0e1",
            fontFamily: "var(--font-family)",
            fontSize: "0.9rem",
            padding: "0.5rem 0",
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          style={{
            fontSize: "0.65rem",
            letterSpacing: "2px",
            color: "#b89b72",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Check Out
        </label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(245, 240, 225, 0.2)",
            color: "#f5f0e1",
            fontFamily: "var(--font-family)",
            fontSize: "0.9rem",
            padding: "0.5rem 0",
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          style={{
            fontSize: "0.65rem",
            letterSpacing: "2px",
            color: "#b89b72",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Guests
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(245, 240, 225, 0.2)",
            color: "#f5f0e1",
            fontFamily: "var(--font-family)",
            fontSize: "0.9rem",
            padding: "0.5rem 0",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option style={{ background: "#111" }} value="1">1 Guest</option>
          <option style={{ background: "#111" }} value="2">2 Guests</option>
          <option style={{ background: "#111" }} value="3">3 Guests</option>
          <option style={{ background: "#111" }} value="4">4+ Guests</option>
        </select>
      </div>

      <div className="booking-widget-btn-wrapper" style={{ display: "flex", justifyContent: "flex-end" }}>
        <MagneticButton data-cursor="Check" onClick={handleCheck}>
          <button
            className="button"
            style={{
              padding: "1rem 2rem",
              borderRadius: "50px",
              backgroundColor: "#b89b72",
              color: "#111111",
              fontSize: "0.8rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              width: "100%",
              border: "none",
              cursor: "pointer",
            }}
          >
            Check Availability
          </button>
        </MagneticButton>
      </div>
    </div>
  );
};
