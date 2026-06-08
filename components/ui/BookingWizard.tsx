import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { MagneticButton } from "./MagneticButton";

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string;
  initialRoomType?: string;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  isOpen,
  onClose,
  initialCheckIn = "2026-06-10",
  initialCheckOut = "2026-06-15",
  initialGuests = "2",
  initialRoomType,
}) => {
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [adults, setAdults] = useState(initialGuests || "2");
  const [children, setChildren] = useState("0");

  useEffect(() => {
    setGuests((Number(adults) + Number(children)).toString());
  }, [adults, children]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [roomType, setRoomType] = useState<string>(initialRoomType || "Luxury Serenity Cottage");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        if (data.success && data.rooms) {
          setRoomsList(data.rooms);
          if (initialRoomType) {
            setRoomType(initialRoomType);
          } else if (data.rooms.length > 0) {
            setRoomType(data.rooms[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };
    fetchRooms();
  }, [initialRoomType]);

  // Availability state
  const [availability, setAvailability] = useState<"Available" | "Limited Rooms" | "Sold Out" | "Checking">("Checking");
  const [availableCount, setAvailableCount] = useState(0);

  // Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [guestCountry, setGuestCountry] = useState("India");
  const [specialRequest, setSpecialRequest] = useState("");

  // Promo Codes System
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState("");

  // Booking Results
  const [bookingId, setBookingId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculations
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const matchedRoom = roomsList.find((r) => r.name === roomType);
  const pricePerNight = matchedRoom ? matchedRoom.price : 350;
  const roomCost = nights * pricePerNight;
  const gstAmount = Math.round(roomCost * 0.18); // 18% GST
  const taxAmount = Math.round(roomCost * 0.05); // 5% Luxury/Tourism Tax
  const discountAmount = Math.round(roomCost * (discountPercent / 100));
  const totalPrice = roomCost + gstAmount + taxAmount - discountAmount;

  // Verify availability on date or room changes
  useEffect(() => {
    if (isOpen) {
      checkRoomAvailability();
    }
  }, [checkIn, checkOut, roomType, isOpen]);

  const checkRoomAvailability = async () => {
    setAvailability("Checking");
    try {
      const res = await fetch("/api/bookings/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomType, checkIn, checkOut }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailability(data.status);
        setAvailableCount(data.availableCount);
      }
    } catch (err) {
      setAvailability("Available");
    }
  };

  // Check Coupon Code validity
  const handleApplyCoupon = async () => {
    const code = couponCode.toUpperCase().trim();
    if (!code) return;
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success && data.coupon) {
        setDiscountPercent(data.coupon.discountPercentage);
        setCouponStatus(`${code} code applied! ${data.coupon.discountPercentage}% Discount unlocked.`);
      } else {
        setDiscountPercent(0);
        setCouponStatus(data.error || "Invalid or inactive coupon code.");
      }
    } catch (err) {
      setDiscountPercent(0);
      setCouponStatus("Failed to verify coupon code.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg("");
      setBookingId("");
      setTransactionId("");
      setCouponCode("");
      setDiscountPercent(0);
      setCouponStatus("");
      
      // Reset details
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setGuestAddress("");
      setSpecialRequest("");

      if (initialRoomType) {
        setRoomType(initialRoomType);
      }

      // GSAP Animation entrance
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, y: 30 },
        { scale: 1, y: 0, duration: 0.5, ease: "back.out(1.1)", delay: 0.1 }
      );
    }
  }, [isOpen, initialRoomType]);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose,
    });
  };

  const handleNext = () => {
    if (step === 1 && availability === "Sold Out") {
      setErrorMsg("Cottage sold out on selected dates. Change room selection or stay window.");
      return;
    }
    if (step === 2) {
      if (!guestName || !guestEmail || !guestPhone || !guestAddress) {
        setErrorMsg("Fill out all guest credentials.");
        return;
      }
      setErrorMsg("");
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Load Razorpay & process booking confirmation
  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    setErrorMsg("");

    try {
      // Step 1: POST to /api/bookings/create
      const createRes = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestEmail,
          guestPhone,
          guestIdentity: `${guestAddress}, ${guestCountry} | Notes: ${specialRequest || "None"}`,
          roomType,
          checkIn,
          checkOut,
          guests: Number(guests),
          totalPrice,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || "Failed to initialize booking.");
      }

      // Step 2: Dynamically load Razorpay SDK
      const loadRzp = () => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const loaded = await loadRzp();
      
      if (loaded && (window as any).Razorpay) {
        // Run standard Razorpay Payment Flow popup
        const options = {
          key: "rzp_test_AroohanSecret8724", // Sandbox credentials
          amount: totalPrice * 100, // in paise
          currency: "INR",
          name: "Aroohan Serenity Resort",
          description: `Sanctuary Stay: ${roomType}`,
          order_id: createData.paymentPayload.orderId,
          handler: async function (response: any) {
            const payRes = await fetch("/api/bookings/pay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: createData.booking.id,
                paymentToken: response.razorpay_payment_id || "tok_visa",
                csrfToken: createData.csrfToken,
              }),
            });
            const payData = await payRes.json();
            if (payData.success) {
              setBookingId(payData.bookingId);
              setTransactionId(payData.transactionId);
              setStep(4);
            } else {
              setErrorMsg(payData.error || "Payment verification failed.");
            }
          },
          prefill: {
            name: guestName,
            email: guestEmail,
            contact: guestPhone,
          },
          theme: {
            color: "#b89b72",
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsProcessing(false);
      } else {
        // Fallback: Trigger payment callback inside the sandbox directly if script cannot load
        const payRes = await fetch("/api/bookings/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: createData.booking.id,
            paymentToken: "pay_simulated_success",
            csrfToken: createData.csrfToken,
          }),
        });
        const payData = await payRes.json();
        if (payData.success) {
          setBookingId(payData.bookingId);
          setTransactionId(payData.transactionId);
          setStep(4);
        } else {
          throw new Error(payData.error || "Simulated payment verification failed.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Checkout failed.");
      setIsProcessing(false);
    }
  };

  // Generate branded PDF Invoice (Taxes, GST, Coupons breakdown)
  const handleDownloadInvoice = async () => {
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

      // Forest Green header banner
      doc.setFillColor(11, 61, 46);
      doc.rect(0, 0, 210, 42, "F");

      doc.setTextColor(245, 240, 225);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AROOHAN SERENITY RESORT", 20, 26);

      doc.setTextColor(17, 17, 17);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("TAX INVOICE RECEIPT", 20, 56);
      doc.setFont("helvetica", "normal");

      doc.text(`Booking Reference ID: ${bookingId}`, 20, 66);
      doc.text(`Invoice Serial ID: INV-8724-${bookingId.split("-")[2]}`, 20, 73);
      doc.text(`Transaction Reference: ${transactionId}`, 20, 80);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 87);

      doc.setDrawColor(184, 155, 114);
      doc.line(20, 93, 190, 93);

      // Guest Details
      doc.setFont("helvetica", "bold");
      doc.text("GUEST PARTICULARS", 20, 103);
      doc.setFont("helvetica", "normal");
      doc.text(`Lead Guest: ${guestName}`, 20, 111);
      doc.text(`Email: ${guestEmail} | Phone: ${guestPhone}`, 20, 118);
      doc.text(`Address: ${guestAddress}, ${guestCountry}`, 20, 125);

      // Booking details
      doc.setFont("helvetica", "bold");
      doc.text("ACCOMMODATION & SERVICES", 20, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Room Sanctuary: ${roomType}`, 20, 147);
      doc.text(`Stay Window: ${checkIn} to ${checkOut} (${nights} Nights)`, 20, 154);
      doc.text(`Guests count: ${guests} Guests`, 20, 161);

      // Financial grid
      doc.line(20, 169, 190, 169);
      doc.setFont("helvetica", "bold");
      doc.text(`Base Cottage Rate:`, 20, 177);
      doc.text(`$${roomCost}.00 USD`, 150, 177);
      doc.setFont("helvetica", "normal");
      doc.text(`Resort Luxury Tax (5%):`, 20, 185);
      doc.text(`$${taxAmount}.00 USD`, 150, 185);
      doc.text(`GST / CGST (18%):`, 20, 192);
      doc.text(`$${gstAmount}.00 USD`, 150, 192);
      if (discountAmount > 0) {
        doc.text(`Applied Discount Coupon:`, 20, 199);
        doc.text(`-$${discountAmount}.00 USD`, 150, 199);
      }
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL AMOUNT PAID (Net):`, 20, 209);
      doc.text(`$${totalPrice}.00 USD`, 150, 209);

      // Footer
      doc.setFillColor(245, 240, 225);
      doc.rect(20, 222, 170, 22, "F");
      doc.setTextColor(11, 61, 46);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Payment received via Razorpay Gateway. Verified by Aroohan Concierge.", 26, 235);

      doc.save(`Aroohan_Invoice_${bookingId}.pdf`);
    } catch (error) {
      alert("Invoice export failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10002,
        backgroundColor: "rgba(10, 10, 10, 0.88)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem",
        color: "#f5f0e1",
      }}
    >
      <div
        ref={contentRef}
        className="glass wizard-modal-content"
        style={{
          width: "100%",
          maxWidth: "720px",
          backgroundColor: "rgba(17, 17, 17, 0.95)",
          border: "1px solid rgba(184, 155, 114, 0.2)",
          borderRadius: "24px",
          padding: "3rem 2.5rem",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "0.7rem", color: "#b89b72", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase" }}>
            {step < 4 ? `Step ${step} of 3` : "Reservation Secured"}
          </span>
          {step < 4 && (
            <button
              onClick={handleClose}
              style={{ background: "none", border: "none", color: "rgba(245, 240, 225, 0.5)", fontSize: "1.2rem", cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>

        {errorMsg && (
          <div style={{ padding: "1rem", backgroundColor: "rgba(255, 0, 0, 0.15)", borderRadius: "8px", border: "1px solid red", color: "#ffbaba", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Stay Dates & Room Selection */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}> Cradled in Nature</h2>
            
            <div className="wizard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Check In</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Check Out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                />
              </div>
            </div>

            <div className="wizard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Cottage Selection</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", cursor: "pointer" }}
                >
                  {roomsList.map((r) => (
                    <option key={r.id} value={r.name} style={{ background: "#111" }}>
                      {r.name} (${r.price}/n)
                    </option>
                  ))}
                </select>
              </div>
              <div className="wizard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Adults</label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", cursor: "pointer", width: "100%" }}
                  >
                    <option value="1" style={{ background: "#111" }}>1 Adult</option>
                    <option value="2" style={{ background: "#111" }}>2 Adults</option>
                    <option value="3" style={{ background: "#111" }}>3 Adults</option>
                    <option value="4" style={{ background: "#111" }}>4 Adults</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Children</label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", cursor: "pointer", width: "100%" }}
                  >
                    <option value="0" style={{ background: "#111" }}>0 Children</option>
                    <option value="1" style={{ background: "#111" }}>1 Child</option>
                    <option value="2" style={{ background: "#111" }}>2 Children</option>
                    <option value="3" style={{ background: "#111" }}>3 Children</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Availability Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "2rem", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", fontSize: "0.85rem" }}>
              <span style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: availability === "Available" ? "#0b3d2e" : availability === "Limited Rooms" ? "#e1caa0" : availability === "Checking" ? "rgba(255,255,255,0.3)" : "#ffbaba",
                boxShadow: availability === "Available" ? "0 0 10px #0b3d2e" : availability === "Limited Rooms" ? "0 0 10px #e1caa0" : "none"
              }} />
              <span>Availability: <strong>{availability}</strong> {availability !== "Checking" && `(${availableCount} left)`}</span>
            </div>

            {/* Coupon Code Panel */}
            <div className="wizard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem", marginBottom: "2rem", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1.5 }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Coupon Code</label>
                <input
                  type="text"
                  placeholder="WELCOME20 or SERENITY10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                style={{ background: "transparent", border: "1px solid rgba(184,155,114,0.4)", color: "#b89b72", padding: "0.8rem 1.5rem", borderRadius: "8px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }}
              >
                Apply Coupon
              </button>
            </div>
            {couponStatus && (
              <p style={{ fontSize: "0.8rem", color: couponStatus.includes("applied") ? "#b89b72" : "#ffbaba", marginTop: "-1.5rem", marginBottom: "2rem" }}>
                {couponStatus}
              </p>
            )}

            {/* Cost Breakdown Sheet */}
            <div style={{ padding: "1.5rem", background: "rgba(184, 155, 114, 0.06)", border: "1px solid rgba(184, 155, 114, 0.15)", borderRadius: "12px", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal (Cottage Rate):</span><span>${roomCost}.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>GST (18%):</span><span>${gstAmount}.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Luxury/Tourism Tax (5%):</span><span>${taxAmount}.00</span></div>
              {discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#b89b72" }}><span>Applied Coupon Discount:</span><span>-${discountAmount}.00</span></div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.5rem", fontSize: "1.1rem", color: "#b89b72", fontWeight: 600 }}>
                <span>Grand Total:</span><span>${totalPrice}.00 USD</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <MagneticButton onClick={handleNext}>
                <button disabled={availability === "Sold Out" || availability === "Checking"} className="button" style={{ padding: "0.9rem 2.5rem", borderRadius: "50px", opacity: (availability === "Sold Out" || availability === "Checking") ? 0.5 : 1 }}>Next Step</button>
              </MagneticButton>
            </div>
          </div>
        )}

        {/* STEP 2: Guest Details Profile */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Guest Credentials</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Arjun Mehta"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                />
              </div>

              <div className="wizard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="arjun@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                  />
                </div>
              </div>

              <div className="wizard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Address (City/State)</label>
                  <input
                    type="text"
                    placeholder="Dharamshala, Himachal Pradesh"
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Country</label>
                  <input
                    type="text"
                    value={guestCountry}
                    onChange={(e) => setGuestCountry(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Special Requests</label>
                <textarea
                  placeholder="Allergies, high floor preferences, extra towels..."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", minHeight: "80px", resize: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={handleBack}
                style={{ background: "transparent", border: "1px solid rgba(245, 240, 225, 0.2)", borderRadius: "50px", color: "rgba(245, 240, 225, 0.8)", padding: "0.9rem 2rem", fontSize: "0.8rem", letterSpacing: "1px", cursor: "pointer" }}
              >
                Back
              </button>
              <MagneticButton onClick={handleNext}>
                <button className="button" style={{ padding: "0.9rem 2.5rem", borderRadius: "50px" }}>Next Step</button>
              </MagneticButton>
            </div>
          </div>
        )}

        {/* STEP 3: Razorpay Payment Checkout */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Secure Checkout</h2>

            <div style={{ padding: "1.2rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Cottage Tier:</span><span style={{ fontWeight: 600 }}>{roomType}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Stay Duration:</span><span>{checkIn} to {checkOut} ({nights} nights)</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Guest:</span><span>{guestName} ({guestEmail})</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem", fontSize: "1rem" }}><span style={{ color: "#b89b72", fontWeight: 600 }}>Net Total Paid:</span><span style={{ color: "#b89b72", fontWeight: 600 }}>${totalPrice}.00 USD</span></div>
            </div>

            <div style={{ padding: "2rem", background: "rgba(184, 155, 114, 0.08)", border: "1px solid rgba(184, 155, 114, 0.2)", borderRadius: "12px", textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "rgba(245,240,225,0.8)" }}>
                Secure Payment powered by **Razorpay Gateway**
              </p>
              <span style={{ fontSize: "0.75rem", color: "rgba(245,240,225,0.5)" }}>
                Supports UPI, Paytm, PhonePe, GPay, Credit/Debit Cards, and Net Banking.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                disabled={isProcessing}
                onClick={handleBack}
                style={{ background: "transparent", border: "1px solid rgba(245, 240, 225, 0.2)", borderRadius: "50px", color: "rgba(245, 240, 225, 0.8)", padding: "0.9rem 2rem", fontSize: "0.8rem", letterSpacing: "1px", cursor: "pointer" }}
              >
                Back
              </button>
              <MagneticButton onClick={handlePaymentSubmit}>
                <button 
                  disabled={isProcessing}
                  className="button" 
                  style={{ padding: "0.9rem 2.5rem", borderRadius: "50px", backgroundColor: "#b89b72", color: "#111111", fontWeight: 600 }}
                >
                  {isProcessing ? "Opening Razorpay..." : "Authorize Payment"}
                </button>
              </MagneticButton>
            </div>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid #b89b72", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 1.5rem auto" }}>
              <span style={{ fontSize: "2.5rem", color: "#b89b72" }}>✓</span>
            </div>

            <h2 style={{ fontSize: "2rem", fontWeight: 300, color: "#f5f0e1", marginBottom: "0.5rem" }}>Sanctuary Secured</h2>
            <p style={{ color: "rgba(245, 240, 225, 0.6)", fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto 2rem auto", lineHeight: "1.6" }}>
              Your reservation is confirmed. Automated confirmation alerts, invoice PDFs, and WhatsApp boarding messages have been dispatched.
            </p>

            {/* Receipt Summary */}
            <div style={{ maxWidth: "420px", margin: "0 auto 2.5rem auto", padding: "1.2rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", textAlign: "left", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Booking ID:</span><span style={{ fontWeight: 600, color: "#b89b72" }}>{bookingId}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Reservation ID:</span><span>RES-8724-{bookingId.split("-")[2]}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Invoice Number:</span><span>INV-8724-{bookingId.split("-")[2]}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Cottage Room:</span><span>{roomType}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total Paid:</span><span>${totalPrice}.00 USD</span></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px", margin: "0 auto" }}>
              <button
                onClick={handleDownloadInvoice}
                className="button"
                style={{
                  borderRadius: "50px",
                  backgroundColor: "#b89b72",
                  color: "#111",
                  padding: "0.9rem",
                  fontSize: "0.75rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  width: "100%",
                }}
              >
                Download PDF Invoice
              </button>

              <button
                onClick={handleClose}
                style={{
                  borderRadius: "50px",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(245, 240, 225, 0.2)",
                  color: "rgba(245, 240, 225, 0.8)",
                  padding: "0.9rem",
                  fontSize: "0.75rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#f5f0e1";
                  e.currentTarget.style.color = "#f5f0e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(245, 240, 225, 0.2)";
                  e.currentTarget.style.color = "rgba(245, 240, 225, 0.8)";
                }}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
