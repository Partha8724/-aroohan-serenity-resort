import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { CustomCursor } from "../components/ui/CustomCursor";
import { Navbar } from "../components/ui/Navbar";
import { MagneticButton } from "../components/ui/MagneticButton";

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestIdentity: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  paymentStatus?: string;
}

export default function CustomerDashboard() {
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Load from query params on mount if guest comes from email redirect link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qId = params.get("id");
    const qEmail = params.get("email");
    if (qId && qEmail) {
      setBookingId(qId);
      setEmail(qEmail);
      autoLookup(qId, qEmail);
    }
  }, []);

  const autoLookup = async (id: string, mail: string) => {
    setIsLoading(true);
    setErrorMsg("");
    setBooking(null);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, email: mail }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
      } else {
        setErrorMsg(data.error || "No matching reservation found.");
      }
    } catch (err) {
      setErrorMsg("Connection error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !email) {
      setErrorMsg("Please fill out both search parameters.");
      return;
    }
    autoLookup(bookingId, email);
  };

  // jsPDF Invoice Downloader
  const handleDownloadInvoice = async () => {
    if (!booking) return;
    try {
      const jspdfModule: any = await new Promise((resolve) => {
        if ((window as any).jspdf) {
          resolve((window as any).jspdf);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = () => resolve((window as any).jspdf);
        document.body.appendChild(script);
      });

      const doc = new jspdfModule.jsPDF();
      const nights = Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
      const basePrice = booking.totalPrice / 1.23; // Estimate back base rate before tax/gst
      const gst = basePrice * 0.18;
      const luxuryTax = basePrice * 0.05;

      // Header Banner
      doc.setFillColor(11, 61, 46); // Forest Green
      doc.rect(0, 0, 210, 42, "F");

      doc.setTextColor(245, 240, 225); // Cream
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AROOHAN SERENITY RESORT", 20, 26);

      doc.setTextColor(17, 17, 17);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("GUEST TAX INVOICE", 20, 56);
      doc.setFont("helvetica", "normal");

      doc.text(`Booking Reference ID: ${booking.id}`, 20, 66);
      doc.text(`Reservation ID: RES-8724-${booking.id.split("-")[2]}`, 20, 73);
      doc.text(`Invoice ID: INV-8724-${booking.id.split("-")[2]}`, 20, 80);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 87);

      doc.setDrawColor(184, 155, 114);
      doc.line(20, 93, 190, 93);

      // Guest Details
      doc.setFont("helvetica", "bold");
      doc.text("GUEST PARTICULARS", 20, 103);
      doc.setFont("helvetica", "normal");
      doc.text(`Lead Guest: ${booking.guestName}`, 20, 111);
      doc.text(`Email: ${booking.guestEmail} | Phone: ${booking.guestPhone}`, 20, 118);
      doc.text(`Identity/Address: ${booking.guestIdentity}`, 20, 125);

      // Booking details
      doc.setFont("helvetica", "bold");
      doc.text("ACCOMMODATION & SERVICES", 20, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Room Sanctuary: ${booking.roomType}`, 20, 147);
      doc.text(`Stay Window: ${booking.checkIn} to ${booking.checkOut} (${nights} Nights)`, 20, 154);
      doc.text(`Guests count: ${booking.guests} Guests`, 20, 161);

      // Financial grid
      doc.line(20, 169, 190, 169);
      doc.setFont("helvetica", "bold");
      doc.text(`Base Cottage Rate:`, 20, 177);
      doc.text(`$${Math.round(basePrice)}.00 USD`, 150, 177);
      doc.setFont("helvetica", "normal");
      doc.text(`Resort Luxury Tax (5%):`, 20, 185);
      doc.text(`$${Math.round(luxuryTax)}.00 USD`, 150, 185);
      doc.text(`GST / CGST (18%):`, 20, 192);
      doc.text(`$${Math.round(gst)}.00 USD`, 150, 192);
      
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL AMOUNT PAID (Net):`, 20, 202);
      doc.text(`$${booking.totalPrice}.00 USD`, 150, 202);

      // Footer
      doc.setFillColor(245, 240, 225);
      doc.rect(20, 215, 170, 22, "F");
      doc.setTextColor(11, 61, 46);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Payment received via Razorpay Gateway. Verified by Aroohan Concierge.", 26, 228);

      doc.save(`Aroohan_Invoice_${booking.id}.pdf`);
    } catch (error) {
      alert("Invoice export failed.");
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setIsCancelling(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, email: booking.guestEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Cancellation request processed successfully.");
        setBooking(data.booking);
        setShowCancelConfirm(false);
      } else {
        setErrorMsg(data.error || "Cancellation request failed.");
      }
    } catch (err) {
      setErrorMsg("Network failure, try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Head>
        <title>Guest Hub Dashboard | Aroohan Serenity Resort</title>
        <meta name="description" content="View your reservation particulars, download tax receipts, or manage your accommodation details." />
      </Head>

      <Navbar onReserveClick={() => {}} />
      <CustomCursor />

      <main
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #112620 0%, #0d0d0d 100%)",
          color: "#f5f0e1",
          padding: "8rem 2rem 5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "var(--font-family)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "700px", textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#b89b72", letterSpacing: "5px", textTransform: "uppercase" }}>Guest Dashboard</span>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 300, textTransform: "uppercase", margin: "0.5rem 0", color: "#f5f0e1" }}>Manage Reservation</h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(245,240,225,0.6)", maxWidth: "480px", margin: "0 auto" }}>
            Enter your booking reference credentials below to lookup details, export invoice PDFs, or request stays cancellation.
          </p>
        </div>

        {/* Search Panel Card */}
        <div
          className="glass"
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "2.5rem",
            borderRadius: "16px",
            border: "1px solid rgba(184, 155, 114, 0.2)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            marginBottom: "2.5rem",
          }}
        >
          <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Booking ID</label>
                <input
                  type="text"
                  placeholder="BK-8724-XXXX"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", fontSize: "0.9rem", textAlign: "center", letterSpacing: "1px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Guest Email</label>
                <input
                  type="email"
                  placeholder="leadguest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="button"
              style={{
                padding: "0.9rem",
                borderRadius: "50px",
                backgroundColor: "#b89b72",
                color: "#111",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "0.75rem",
              }}
            >
              {isLoading ? "Searching Registry..." : "Lookup Booking"}
            </button>
          </form>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div style={{ width: "100%", maxWidth: "600px", padding: "1rem", backgroundColor: "rgba(255,0,0,0.12)", border: "1px solid red", color: "#ffbaba", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "2rem", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ width: "100%", maxWidth: "600px", padding: "1rem", backgroundColor: "rgba(184, 155, 114, 0.12)", border: "1px solid #b89b72", color: "#f5f0e1", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "2rem", textAlign: "center" }}>
            {successMsg}
          </div>
        )}

        {/* Booking Details Card Sheet */}
        {booking && (
          <div
            className="glass"
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "3rem 2.5rem",
              borderRadius: "16px",
              border: "1px solid rgba(184, 155, 114, 0.2)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.2rem" }}>
              <div>
                <span style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Booking Reference</span>
                <h3 style={{ margin: "3px 0 0 0", fontSize: "1.3rem", color: "#f5f0e1" }}>{booking.id}</h3>
              </div>
              <span style={{
                fontSize: "0.7rem",
                padding: "0.3rem 0.8rem",
                borderRadius: "50px",
                fontWeight: 600,
                backgroundColor: booking.status === "CONFIRMED" ? "#0b3d2e" : booking.status === "PENDING" ? "rgba(184, 155, 114, 0.18)" : "rgba(255,0,0,0.12)",
                color: booking.status === "CONFIRMED" ? "#b89b72" : booking.status === "PENDING" ? "#b89b72" : "#ffbaba",
                border: `1px solid ${booking.status === "CONFIRMED" ? "rgba(184,155,114,0.3)" : booking.status === "PENDING" ? "rgba(184,155,114,0.2)" : "rgba(255,0,0,0.2)"}`
              }}>
                {booking.status}
              </span>
            </div>

            {/* Guest Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Lead Guest Details</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", color: "rgba(245,240,225,0.85)" }}>
                <div><strong>Full Name:</strong> {booking.guestName}</div>
                <div><strong>Mobile:</strong> {booking.guestPhone}</div>
                <div style={{ gridColumn: "span 2" }}><strong>Address Doc:</strong> {booking.guestIdentity}</div>
              </div>
            </div>

            {/* Accommodation Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Stay Parameters</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", color: "rgba(245,240,225,0.85)" }}>
                <div style={{ gridColumn: "span 2" }}><strong>Sanctuary:</strong> {booking.roomType}</div>
                <div><strong>Check In:</strong> {booking.checkIn}</div>
                <div><strong>Check Out:</strong> {booking.checkOut}</div>
                <div><strong>Guests:</strong> {booking.guests} Guests</div>
                <div><strong>Payment Status:</strong> <span style={{ color: booking.paymentStatus === "PAID" ? "#b89b72" : booking.paymentStatus === "REFUNDED" ? "#ffbaba" : "#e1caa0", fontWeight: 600 }}>{booking.paymentStatus || "PENDING"}</span></div>
                <div style={{ gridColumn: "span 2" }}><strong>Total Paid:</strong> <strong style={{ color: "#b89b72" }}>${booking.totalPrice}.00 USD</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1.2rem", marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
              <button
                onClick={handleDownloadInvoice}
                className="button"
                style={{
                  borderRadius: "50px",
                  backgroundColor: "#b89b72",
                  color: "#111",
                  padding: "0.9rem",
                  fontSize: "0.75rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  flex: 1.2,
                }}
              >
                Download PDF Invoice
              </button>

              {booking.status !== "CANCELLED" && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  style={{
                    borderRadius: "50px",
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255, 186, 186, 0.4)",
                    color: "#ffbaba",
                    padding: "0.9rem",
                    fontSize: "0.75rem",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    flex: 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Backdrop modal */}
        {showCancelConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(10,10,10,0.9)",
              backdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10005,
              padding: "1rem",
            }}
          >
            <div
              className="glass"
              style={{
                width: "100%",
                maxWidth: "450px",
                padding: "2.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(255, 0, 0, 0.3)",
                backgroundColor: "rgba(17,17,17,0.98)",
                textAlign: "center",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
              }}
            >
              <h3 style={{ fontSize: "1.4rem", fontWeight: 300, color: "#f5f0e1", marginBottom: "1rem" }}>Confirm Cancellation</h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(245,240,225,0.7)", lineHeight: "1.6", marginBottom: "2rem" }}>
                Are you sure you want to cancel your stay at **{booking?.roomType}** from **{booking?.checkIn}** to **{booking?.checkOut}**?
                <br /><br />
                Refund calculations and processing fees will be automated according to our policy.
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  disabled={isCancelling}
                  onClick={handleCancelBooking}
                  className="button"
                  style={{
                    backgroundColor: "red",
                    color: "#fff",
                    borderRadius: "50px",
                    padding: "0.8rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    flex: 1,
                  }}
                >
                  {isCancelling ? "Cancelling Stay..." : "Yes, Cancel Stay"}
                </button>
                <button
                  disabled={isCancelling}
                  onClick={() => setShowCancelConfirm(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(245,240,225,0.2)",
                    color: "rgba(245,240,225,0.8)",
                    borderRadius: "50px",
                    padding: "0.8rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  No, Keep Stay
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
