import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { CustomCursor } from "../components/ui/CustomCursor";

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
}

interface HousekeepingTask {
  id: string;
  roomNumber: string;
  cleanerName: string;
  status: "PENDING" | "COMPLETED";
  notes: string;
  assignedAt: string;
}

interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  issue: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedStaff: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
}

interface RestaurantOrder {
  id: string;
  bookingId?: string;
  tableNumber?: string;
  isRoomService: boolean;
  items: { name: string; qty: number; price: number }[];
  totalPrice: number;
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

interface SpaBooking {
  id: string;
  bookingId: string;
  guestName: string;
  therapyName: string;
  scheduledAt: string;
  therapist: string;
  price: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

interface TransportBooking {
  id: string;
  bookingId: string;
  guestName: string;
  vehicleType: "Sedan" | "SUV" | "Luxury Coach";
  pickupLocation: string;
  dropLocation: string;
  scheduledAt: string;
  driver: string;
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  price: number;
}

interface EventBooking {
  id: string;
  name: string;
  type: "Wedding" | "Conference" | "Corporate" | "Private";
  startTime: string;
  endTime: string;
  budget: number;
  guestCount: number;
  vendorTracking: { vendor: string; cost: number; paid: boolean }[];
  status: "CONFIRMED" | "CANCELLED";
}

interface CRMProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  identityDoc: string;
  loyaltyPoints: number;
  vipStatus: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM";
  preferences: string[];
}

interface ChannelState {
  channel: string;
  lastSyncAt: string;
  status: "ACTIVE" | "DESYNCED";
  syncedRooms: number;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [loginStep, setLoginStep] = useState(1); // 1: Password, 2: 2FA Verification
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [activeTab, setActiveTab] = useState("pms");

  // Subsystems States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>([]);
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>([]);
  const [spaBookings, setSpaBookings] = useState<SpaBooking[]>([]);
  const [transportBookings, setTransportBookings] = useState<TransportBooking[]>([]);
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [crmProfiles, setCrmProfiles] = useState<CRMProfile[]>([]);
  const [channels, setChannels] = useState<ChannelState[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Action status indicators
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Form states for Rooms & Coupons
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: "",
    desc: "",
    fullDesc: "",
    size: "",
    maxGuests: 2,
    bedType: "",
    amenities: "",
    price: 350,
    images: "",
    videoUrl: "",
    checkInTime: "02:00 PM",
    checkOutTime: "11:00 AM",
    cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
    availableCount: 3,
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    discountPercentage: 10,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
  });

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/rooms";
      const method = editingRoomId ? "PUT" : "POST";
      const payload = {
        ...roomForm,
        id: editingRoomId,
        amenities: roomForm.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        images: roomForm.images.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Room save operation failed.");

      // Refresh list
      const updatedRoomsRes = await fetch("/api/admin/rooms", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      const updatedRoomsData = await updatedRoomsRes.json();
      if (updatedRoomsData.success) setRooms(updatedRoomsData.rooms);

      // Reset form
      setEditingRoomId(null);
      setRoomForm({
        name: "",
        desc: "",
        fullDesc: "",
        size: "",
        maxGuests: 2,
        bedType: "",
        amenities: "",
        price: 350,
        images: "",
        videoUrl: "",
        checkInTime: "02:00 PM",
        checkOutTime: "11:00 AM",
        cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
        availableCount: 3,
      });
      alert("Room saved successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRoomDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room type?")) return;
    try {
      const res = await fetch(`/api/admin/rooms?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Room delete failed.");

      setRooms((prev) => prev.filter((r) => r.id !== id));
      alert("Room deleted!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/coupons";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(couponForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coupon save failed.");

      // Refresh list
      const updatedCouponsRes = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      const updatedCouponsData = await updatedCouponsRes.json();
      if (updatedCouponsData.success) setCoupons(updatedCouponsData.coupons);

      // Reset form
      setCouponForm({
        code: "",
        discountPercentage: 10,
        validFrom: new Date().toISOString().split("T")[0],
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true,
      });
      alert("Coupon created successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCouponToggle = async (coupon: any) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coupon update failed.");

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCouponDelete = async (id: string) => {
    if (!confirm("Delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coupon delete failed.");

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      alert("Coupon deleted!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Authenticate Admin client-side and fetch records
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (loginStep === 1) {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login", key: adminKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setLoginStep(2);
        return;
      }

      if (loginStep === 2) {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify_2fa", code: twoFactorCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Save session credentials
        localStorage.setItem("aroohan_admin_token", data.token);
        setIsAdmin(true);
        loadDashboardData(data.token);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    }
  };

  // Load all subsystems databases
  const loadDashboardData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel fetching for high performance
      const [
        bookingsRes,
        pmsMetricsRes,
        restaurantRes,
        spaRes,
        transportRes,
        channelRes,
        roomsRes,
        couponsRes,
      ] = await Promise.all([
        fetch("/api/bookings/list", { headers }),
        fetch("/api/admin/metrics", { headers }),
        fetch("/api/restaurant", { headers }),
        fetch("/api/spa", { headers }),
        fetch("/api/transport", { headers }),
        fetch("/api/channel", { headers }),
        fetch("/api/admin/rooms", { headers }),
        fetch("/api/admin/coupons", { headers }),
      ]);

      const bookingsData = await bookingsRes.json();
      const metricsData = await pmsMetricsRes.json();
      const restaurantData = await restaurantRes.json();
      const spaData = await spaRes.json();
      const transportData = await transportRes.json();
      const channelData = await channelRes.json();
      const roomsData = await roomsRes.json();
      const couponsData = await couponsRes.json();

      if (bookingsData.success) setBookings(bookingsData.bookings);
      if (metricsData.success) {
        setMetrics(metricsData.metrics);
        setAuditLogs(metricsData.auditLogs);
        setStaffList(metricsData.staff);
      }
      if (restaurantData.success) setRestaurantOrders(restaurantData.orders);
      if (spaData.success) setSpaBookings(spaData.bookings);
      if (transportData.success) setTransportBookings(transportData.bookings);
      if (channelData.success) setChannels(channelData.channels);
      if (roomsData.success) setRooms(roomsData.rooms);
      if (couponsData.success) setCoupons(couponsData.coupons);

      // Fetch enterprise local states
      const enterpriseRes = await fetch("/api/admin/metrics", { headers });
      const entData = await enterpriseRes.json();

      // Read secondary simulated properties
      const localEntRes = await fetch("/api/restaurant"); // triggers get from enterprise local db file
      const localEntData = await localEntRes.json();
      
      // Load PMS items
      const pmsRes = await fetch("/api/admin/metrics", { headers });
      const pmsData = await pmsRes.json();

      // Set Mock Housekeeping & CRM
      setHousekeeping([
        { id: "HK-1", roomNumber: "Cottage 101", cleanerName: "Ramesh Kumar", status: "COMPLETED", notes: "Vacuumed, cedar scents.", assignedAt: new Date().toISOString() },
        { id: "HK-2", roomNumber: "Cottage 102", cleanerName: "Priya Sharma", status: "PENDING", notes: "Change linens.", assignedAt: new Date().toISOString() }
      ]);
      setMaintenance([
        { id: "MN-1", roomNumber: "Cottage 103", issue: "Solar panel heating low pressure", priority: "HIGH", assignedStaff: "Amit Singh", status: "OPEN", createdAt: new Date().toISOString() }
      ]);
      setEvents([
        { id: "EV-1", name: "Mehta Wedding Renewal", type: "Wedding", startTime: "2026-06-17T17:00:00Z", endTime: "2026-06-17T23:00:00Z", budget: 8500, guestCount: 30, vendorTracking: [{ vendor: "Forest Florals", cost: 2500, paid: true }], status: "CONFIRMED" }
      ]);
      setCrmProfiles([
        { id: "G-1", name: "Arjun Mehta", email: "arjun@example.com", phone: "+91 98765 43210", identityDoc: "Passport: Z1234567", loyaltyPoints: 350, vipStatus: "GOLD", preferences: ["High floor", "Cedar Oils"] },
        { id: "G-2", name: "Sarah Connor", email: "sarah.connor@example.com", phone: "+1 (555) 019-2831", identityDoc: "DL: TX-90210", loyaltyPoints: 120, vipStatus: "STANDARD", preferences: ["Late check-out"] }
      ]);

    } catch (error) {
      console.error("Failed to compile dashboard datasets:", error);
    }
  };

  // Check persisted admin key on mount
  useEffect(() => {
    const token = localStorage.getItem("aroohan_admin_token");
    if (token === "AroohanAdmin8724") {
      setIsAdmin(true);
      setAdminKey(token);
      loadDashboardData(token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aroohan_admin_token");
    setIsAdmin(false);
    setAdminKey("");
    setLoginStep(1);
    setTwoFactorCode("");
  };

  // Trigger OTA Channel Synchronization
  const handleChannelSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/channel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh sync logs
      const updatedRes = await fetch("/api/channel", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      const updatedData = await updatedRes.json();
      if (updatedData.success) setChannels(updatedData.channels);

      alert(data.message || "OTA inventory successfully synced!");
    } catch (err: any) {
      alert(err.message || "Sync operation failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Export Bookings Database to CSV file
  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ["Booking ID", "Guest Name", "Email", "Phone", "Room Selection", "Check In", "Check Out", "Total Paid", "Status"];
    const rows = bookings.map((b) => [
      b.id,
      b.guestName,
      b.guestEmail,
      b.guestPhone,
      b.roomType,
      b.checkIn,
      b.checkOut,
      `$${b.totalPrice}`,
      b.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Aroohan_Bookings_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update Booking Status
  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    setIsUpdating(bookingId);
    try {
      const res = await fetch("/api/bookings/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: data.booking.status } : b))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setIsUpdating(null);
    }
  };

  // jsPDF Document Downloader
  const handleDownloadInvoice = async (booking: Booking) => {
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

      // Header Banner
      doc.setFillColor(11, 61, 46); // Forest Green
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(245, 240, 225); // Cream
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AROOHAN SERENITY RESORT", 20, 26);

      doc.setTextColor(17, 17, 17);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("ADMIN RECEIPT REPORT", 20, 55);
      doc.setFont("helvetica", "normal");

      doc.text(`Booking Reference ID: ${booking.id}`, 20, 65);
      doc.text(`Current Status: ${booking.status}`, 20, 72);
      doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 79);

      doc.setDrawColor(184, 155, 114);
      doc.setLineWidth(0.5);
      doc.line(20, 85, 190, 85);

      // Guest Details
      doc.setFont("helvetica", "bold");
      doc.text("GUEST CREDENTIALS", 20, 95);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${booking.guestName}`, 20, 103);
      doc.text(`Email: ${booking.guestEmail}`, 20, 110);
      doc.text(`Phone: ${booking.guestPhone}`, 20, 117);
      doc.text(`Identity ID: ${booking.guestIdentity}`, 20, 124);

      // Details
      doc.setFont("helvetica", "bold");
      doc.text("ACCOMMODATION SUMMARY", 20, 138);
      doc.setFont("helvetica", "normal");
      doc.text(`Room: ${booking.roomType}`, 20, 146);
      doc.text(`Schedule: ${booking.checkIn} to ${booking.checkOut}`, 20, 153);
      doc.text(`Occupancy: ${booking.guests} Guests`, 20, 160);

      const nights = Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
      doc.line(20, 170, 190, 170);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Duration:`, 20, 179);
      doc.text(`${nights} Nights`, 150, 179);
      doc.text(`TOTAL REVENUE:`, 20, 189);
      doc.text(`$${booking.totalPrice}.00 USD`, 150, 189);

      doc.save(`Aroohan_AdminReport_${booking.id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to render invoice PDF.");
    }
  };

  return (
    <>
      <Head>
        <title>Aroohan Operations | Enterprise Resort PMS Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <CustomCursor />

      <main
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #112620 0%, #0d0d0d 100%)",
          color: "#f5f0e1",
          fontFamily: "var(--font-family)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3rem 2rem",
        }}
      >
        {!isAdmin ? (
          /* Secure Multi-Step Authentication Lock */
          <div
            className="glass"
            style={{
              width: "100%",
              maxWidth: "450px",
              padding: "3.5rem 3rem",
              marginTop: "10vh",
              border: "1px solid rgba(184, 155, 114, 0.25)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              borderRadius: "20px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#b89b72", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 600 }}>
                Aroohan Sanctuary
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: 300, color: "#f5f0e1", marginTop: "0.5rem" }}>Operations</h2>
            </div>

            {errorMsg && (
              <div style={{ padding: "0.8rem", background: "rgba(255,0,0,0.12)", borderRadius: "8px", border: "1px solid red", color: "#ffbaba", fontSize: "0.8rem", marginBottom: "1.5rem", textAlign: "center" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {loginStep === 1 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Security Key Credentials</label>
                  <input
                    type="password"
                    placeholder="Enter security access key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", textAlign: "center", letterSpacing: "2px" }}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Two-Factor Auth Passcode</label>
                  <input
                    type="text"
                    placeholder="Enter 2FA verification code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", textAlign: "center", letterSpacing: "4px" }}
                  />
                  <span style={{ fontSize: "0.65rem", color: "rgba(245,240,225,0.4)", textAlign: "center", marginTop: "4px" }}>Passcode: 8724</span>
                </div>
              )}

              <button
                type="submit"
                className="button"
                style={{ width: "100%", padding: "0.9rem", borderRadius: "50px", backgroundColor: "#b89b72", color: "#111", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.75rem" }}
              >
                {loginStep === 1 ? "Verify Credentials" : "Authorize Session"}
              </button>
            </form>
          </div>
        ) : (
          /* Multi-Tab Enterprise Operations Panel */
          <div style={{ width: "100%", maxWidth: "1250px", display: "grid", gridTemplateColumns: "250px 1fr", gap: "3rem" }}>
            
            {/* Sidebar Navigation */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div style={{ padding: "0 1rem 1.5rem 1rem", borderBottom: "1px solid rgba(245,240,225,0.08)", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600 }}>Enterprise PMS</span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 300, margin: "5px 0 0 0", color: "#f5f0e1" }}>Aroohan</h3>
              </div>

              {[
                { id: "pms", label: "Cottages & PMS" },
                { id: "rooms", label: "Manage Rooms" },
                { id: "bookings", label: "Reservations" },
                { id: "restaurant", label: "Dining & Wellness" },
                { id: "transport", label: "Logistics & Events" },
                { id: "channels", label: "Channel Manager" },
                { id: "coupons", label: "Manage Coupons" },
                { id: "crm", label: "CRM & Guests" },
                { id: "analytics", label: "Reports & Analytics" },
                { id: "security", label: "System Security" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? "rgba(184, 155, 114, 0.15)" : "transparent",
                    border: "none",
                    borderRadius: "8px",
                    color: activeTab === tab.id ? "#b89b72" : "rgba(245,240,225,0.7)",
                    padding: "0.85rem 1.2rem",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    letterSpacing: "1px",
                    transition: "all 0.3s ease",
                    borderLeft: activeTab === tab.id ? "3px solid #b89b72" : "3px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 186, 186, 0.25)",
                  color: "#ffbaba",
                  borderRadius: "8px",
                  padding: "0.85rem 1.2rem",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  marginTop: "3rem",
                  textTransform: "uppercase",
                }}
              >
                Sign Out
              </button>
            </aside>

            {/* Subsystem Panels Rendering Area */}
            <section style={{ minWidth: 0 }}>
              
              {/* TAB: Manage Rooms */}
              {activeTab === "rooms" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Manage Room Suites</h2>
                  
                  {/* Room Add/Edit Form */}
                  <div className="glass" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid rgba(184, 155, 114, 0.25)", marginBottom: "2.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1.5rem", color: "#b89b72" }}>
                      {editingRoomId ? `Edit Room Suite Details (ID: ${editingRoomId})` : "Configure New Room Suite"}
                    </h3>
                    
                    <form onSubmit={handleRoomSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Room Name</label>
                        <input
                          type="text"
                          required
                          value={roomForm.name}
                          onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Price Per Night ($)</label>
                        <input
                          type="number"
                          required
                          value={roomForm.price}
                          onChange={(e) => setRoomForm({ ...roomForm, price: Number(e.target.value) })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Short Description</label>
                        <input
                          type="text"
                          required
                          value={roomForm.desc}
                          onChange={(e) => setRoomForm({ ...roomForm, desc: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Full Details Description</label>
                        <textarea
                          required
                          value={roomForm.fullDesc}
                          onChange={(e) => setRoomForm({ ...roomForm, fullDesc: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none", minHeight: "60px", resize: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Room Size (e.g. 50 sq m)</label>
                        <input
                          type="text"
                          value={roomForm.size}
                          onChange={(e) => setRoomForm({ ...roomForm, size: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Bed Type (e.g. King Size)</label>
                        <input
                          type="text"
                          value={roomForm.bedType}
                          onChange={(e) => setRoomForm({ ...roomForm, bedType: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Max Guests</label>
                        <input
                          type="number"
                          value={roomForm.maxGuests}
                          onChange={(e) => setRoomForm({ ...roomForm, maxGuests: Number(e.target.value) })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Inventory count (available rooms)</label>
                        <input
                          type="number"
                          required
                          value={roomForm.availableCount}
                          onChange={(e) => setRoomForm({ ...roomForm, availableCount: Number(e.target.value) })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Amenities (Comma separated)</label>
                        <input
                          type="text"
                          value={roomForm.amenities}
                          placeholder="Eco Architecture, Outdoor shower, Organic bedding"
                          onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Image URLs (Comma separated)</label>
                        <input
                          type="text"
                          value={roomForm.images}
                          placeholder="/images/room1.jpg, /images/room2.jpg"
                          onChange={(e) => setRoomForm({ ...roomForm, images: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ gridColumn: "span 2", display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                        <button type="submit" className="button" style={{ padding: "0.6rem 1.8rem", borderRadius: "50px", fontSize: "0.75rem", backgroundColor: "#b89b72", color: "#111", fontWeight: 600 }}>
                          {editingRoomId ? "Update Suite" : "Add Suite Type"}
                        </button>
                        {editingRoomId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoomId(null);
                              setRoomForm({
                                name: "",
                                desc: "",
                                fullDesc: "",
                                size: "",
                                maxGuests: 2,
                                bedType: "",
                                amenities: "",
                                price: 350,
                                images: "",
                                videoUrl: "",
                                checkInTime: "02:00 PM",
                                checkOutTime: "11:00 AM",
                                cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
                                availableCount: 3,
                              });
                            }}
                            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50px", color: "#f5f0e1", padding: "0.6rem 1.8rem", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Rooms List Table */}
                  <div className="glass" style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", marginBottom: "2.5rem" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#b89b72" }}>
                          <th style={{ padding: "0.8rem" }}>Suite Name</th>
                          <th style={{ padding: "0.8rem" }}>Details</th>
                          <th style={{ padding: "0.8rem" }}>Price/Night</th>
                          <th style={{ padding: "0.8rem" }}>Inventory capacity</th>
                          <th style={{ padding: "0.8rem", textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((r) => (
                          <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{r.name}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>
                              <div style={{ opacity: 0.6 }}>{r.desc}</div>
                              <div style={{ fontSize: "0.7rem", marginTop: "3px", color: "#b89b72" }}>
                                Size: {r.size} | Bed: {r.bedType} | Max Guests: {r.maxGuests}
                              </div>
                            </td>
                            <td style={{ padding: "1rem 0.8rem", color: "#b89b72", fontWeight: 600 }}>${r.price}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{r.availableCount} Rooms</td>
                            <td style={{ padding: "1rem 0.8rem", textAlign: "center" }}>
                              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                                <button
                                  onClick={() => {
                                    setEditingRoomId(r.id);
                                    setRoomForm({
                                      name: r.name,
                                      desc: r.desc,
                                      fullDesc: r.fullDesc || r.desc,
                                      size: r.size,
                                      maxGuests: r.maxGuests,
                                      bedType: r.bedType,
                                      amenities: (r.amenities || []).join(", "),
                                      price: r.price,
                                      images: (r.images || []).join(", "),
                                      videoUrl: r.videoUrl || "",
                                      checkInTime: r.checkInTime || "02:00 PM",
                                      checkOutTime: r.checkOutTime || "11:00 AM",
                                      cancellationPolicy: r.cancellationPolicy || "Free cancellation up to 48 hours prior to arrival.",
                                      availableCount: r.availableCount || 3,
                                    });
                                  }}
                                  style={{ background: "none", border: "1px solid rgba(184,155,114,0.4)", color: "#b89b72", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleRoomDelete(r.id)}
                                  style={{ background: "none", border: "1px solid rgba(255,0,0,0.3)", color: "#ffbaba", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: Manage Coupons */}
              {activeTab === "coupons" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Manage Coupon Discounts</h2>
                  
                  {/* Coupon Add Form */}
                  <div className="glass" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid rgba(184, 155, 114, 0.25)", marginBottom: "2.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1.5rem", color: "#b89b72" }}>Add New Promo Coupon Code</h3>
                    <form onSubmit={handleCouponSubmit} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "1.2rem", alignItems: "flex-end" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Coupon Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SUMMER30"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Discount %</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={couponForm.discountPercentage}
                          onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: Number(e.target.value) })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Valid From</label>
                        <input
                          type="date"
                          required
                          value={couponForm.validFrom}
                          onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase" }}>Valid To</label>
                        <input
                          type="date"
                          required
                          value={couponForm.validTo}
                          onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.6rem", fontSize: "0.85rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ gridColumn: "span 4", display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                        <button type="submit" className="button" style={{ padding: "0.6rem 1.8rem", borderRadius: "50px", fontSize: "0.75rem", backgroundColor: "#b89b72", color: "#111", fontWeight: 600 }}>
                          Generate Coupon
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Coupons Table list */}
                  <div className="glass" style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#b89b72" }}>
                          <th style={{ padding: "0.8rem" }}>Coupon Code</th>
                          <th style={{ padding: "0.8rem" }}>Discount Percentage</th>
                          <th style={{ padding: "0.8rem" }}>Validity Window</th>
                          <th style={{ padding: "0.8rem" }}>Active State</th>
                          <th style={{ padding: "0.8rem", textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((c) => (
                          <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600, color: "#b89b72" }}>{c.code}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{c.discountPercentage}% Discount</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{c.validFrom} to {c.validTo}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>
                              <span style={{ color: c.isActive ? "#b89b72" : "#ffbaba" }}>
                                ● {c.isActive ? "ACTIVE" : "DISABLED"}
                              </span>
                            </td>
                            <td style={{ padding: "1rem 0.8rem", textAlign: "center" }}>
                              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                                <button
                                  onClick={() => handleCouponToggle(c)}
                                  style={{ background: "none", border: "1px solid rgba(184,155,114,0.4)", color: "#b89b72", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
                                >
                                  {c.isActive ? "Disable" : "Enable"}
                                </button>
                                <button
                                  onClick={() => handleCouponDelete(c.id)}
                                  style={{ background: "none", border: "1px solid rgba(255,0,0,0.3)", color: "#ffbaba", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 1: PMS Room Operations */}
              {activeTab === "pms" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Cottage PMS Board</h2>
                  
                  {/* Cottage Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
                    {[
                      { num: "Cottage 101", type: "Luxury Serenity", status: "OCCUPIED", hk: "Cleaned" },
                      { num: "Cottage 102", type: "Luxury Serenity", status: "AVAILABLE", hk: "Needs Attention" },
                      { num: "Cottage 103", type: "Ocean Vista Villa", status: "MAINTENANCE", hk: "Checked" },
                      { num: "Cottage 104", type: "Ocean Vista Villa", status: "AVAILABLE", hk: "Cleaned" },
                      { num: "Cottage 105", type: "Forest Canopy", status: "AVAILABLE", hk: "Cleaned" },
                      { num: "Cottage 106", type: "Forest Canopy", status: "OCCUPIED", hk: "Cleaned" },
                    ].map((room, idx) => (
                      <div key={idx} className="glass" style={{ padding: "1.8rem", border: "1px solid rgba(184, 155, 114, 0.15)", borderRadius: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{room.num}</h4>
                          <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.6rem", borderRadius: "50px", fontWeight: 600, backgroundColor: room.status === "AVAILABLE" ? "#0b3d2e" : room.status === "OCCUPIED" ? "rgba(184, 155, 114, 0.25)" : "rgba(255,0,0,0.15)", color: room.status === "AVAILABLE" ? "#b89b72" : room.status === "OCCUPIED" ? "#b89b72" : "#ffbaba" }}>
                            {room.status}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 1.2rem 0", fontSize: "0.8rem", color: "rgba(245,240,225,0.5)" }}>{room.type}</p>
                        <div style={{ borderTop: "1px solid rgba(245,240,225,0.06)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                          <span>Housekeeping: <strong style={{ color: room.hk.includes("Needs") ? "#ffbaba" : "#b89b72" }}>{room.hk}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Housekeeping Tasks */}
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 300, marginBottom: "1rem" }}>Housekeeping Log Queue</h3>
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Room</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Cleaner</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Logs Notes</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Date/Time</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {housekeeping.map((hk) => (
                          <tr key={hk.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{hk.roomNumber}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{hk.cleanerName}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{hk.notes}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{new Date(hk.assignedAt).toLocaleTimeString()}</td>
                            <td style={{ padding: "1rem 0.8rem" }}><span style={{ color: hk.status === "COMPLETED" ? "#b89b72" : "#ffbaba" }}>{hk.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: Bookings Reservations List */}
              {activeTab === "bookings" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: 300, margin: 0 }}>Reservations Log</h2>
                    <button
                      onClick={handleExportCSV}
                      className="button"
                      style={{ padding: "0.6rem 1.4rem", borderRadius: "50px", fontSize: "0.75rem", letterSpacing: "1px" }}
                    >
                      Export Database CSV
                    </button>
                  </div>

                  <div className="glass" style={{ borderRadius: "16px", border: "1px solid rgba(184,155,114,0.15)", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(245, 240, 225, 0.1)", background: "rgba(255, 255, 255, 0.02)" }}>
                          <th style={{ padding: "1.2rem 1rem", color: "#b89b72" }}>Booking ID</th>
                          <th style={{ padding: "1.2rem 1rem", color: "#b89b72" }}>Guest Profile</th>
                          <th style={{ padding: "1.2rem 1rem", color: "#b89b72" }}>Room & Stay</th>
                          <th style={{ padding: "1.2rem 1rem", color: "#b89b72" }}>Total</th>
                          <th style={{ padding: "1.2rem 1rem", color: "#b89b72" }}>Status</th>
                          <th style={{ padding: "1.2rem 1rem", color: "#b89b72", textAlign: "center" }}>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} style={{ borderBottom: "1px solid rgba(245, 240, 225, 0.04)" }}>
                            <td style={{ padding: "1.2rem 1rem", fontWeight: 600 }}>{booking.id}</td>
                            <td style={{ padding: "1.2rem 1rem" }}>
                              <div style={{ fontWeight: 500, color: "#f5f0e1" }}>{booking.guestName}</div>
                              <div style={{ fontSize: "0.75rem", color: "rgba(245, 240, 225, 0.5)" }}>{booking.guestEmail}</div>
                            </td>
                            <td style={{ padding: "1.2rem 1rem" }}>
                              <div>{booking.roomType}</div>
                              <div style={{ fontSize: "0.75rem", color: "rgba(245, 240, 225, 0.5)" }}>{booking.checkIn} to {booking.checkOut}</div>
                            </td>
                            <td style={{ padding: "1.2rem 1rem", color: "#b89b72", fontWeight: 600 }}>${booking.totalPrice}</td>
                            <td style={{ padding: "1.2rem 1rem" }}>
                              <select
                                value={booking.status}
                                onChange={(e) => handleBookingStatusChange(booking.id, e.target.value)}
                                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: booking.status === "CONFIRMED" ? "#b89b72" : "#ffbaba", padding: "0.3rem 0.6rem", fontSize: "0.75rem", outline: "none", cursor: "pointer" }}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                            <td style={{ padding: "1.2rem 1rem", textAlign: "center" }}>
                              <button
                                onClick={() => handleDownloadInvoice(booking)}
                                style={{ background: "none", border: "1px solid rgba(184,155,114,0.3)", color: "#b89b72", padding: "0.4rem 0.8rem", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer", transition: "all 0.3s ease" }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#b89b72"; e.currentTarget.style.color = "#111"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#b89b72"; }}
                              >
                                PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: Restaurant & Wellness */}
              {activeTab === "restaurant" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Dining & Spa operations</h2>
                  
                  {/* Dining Queue */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>Kitchen Order Board</h3>
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "3rem" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Order ID</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Table/Room</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Cuisine Items</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Total Bill</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restaurantOrders.map((ord) => (
                          <tr key={ord.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{ord.id}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{ord.tableNumber}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>
                              {ord.items.map((item, idx) => `${item.name} (x${item.qty})`).join(", ")}
                            </td>
                            <td style={{ padding: "1rem 0.8rem", color: "#b89b72", fontWeight: 600 }}>${ord.totalPrice}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>
                              <span style={{ color: "#e1caa0" }}>{ord.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Spa Scheduler */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>Spa Therapy Calendar</h3>
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Spa Code</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Guest</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Therapy Package</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Therapist</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Scheduled Date/Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spaBookings.map((spa) => (
                          <tr key={spa.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{spa.id}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{spa.guestName}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{spa.therapyName}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{spa.therapist}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{new Date(spa.scheduledAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: Logistics & Events */}
              {activeTab === "transport" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Logistics & Private Events</h2>

                  {/* Airport Pickups */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>Airport Transfer Schedules</h3>
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "3rem" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Ref ID</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Guest</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Vehicle</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Route</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Driver</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Pickup Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transportBookings.map((tr) => (
                          <tr key={tr.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{tr.id}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{tr.guestName}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{tr.vehicleType}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{tr.pickupLocation} → {tr.dropLocation}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{tr.driver}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{new Date(tr.scheduledAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Private Events */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>Private Event Calendar & Budget</h3>
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Event Name</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Category</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Guests</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Allocated Budget</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Vendors Paid</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((ev) => (
                          <tr key={ev.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{ev.name}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{ev.type}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{ev.guestCount}</td>
                            <td style={{ padding: "1rem 0.8rem", color: "#b89b72", fontWeight: 600 }}>${ev.budget}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>
                              {ev.vendorTracking.map((v) => `${v.vendor} ($${v.cost})`).join(", ")}
                            </td>
                            <td style={{ padding: "1rem 0.8rem" }}>{ev.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: Hotel Channel Manager */}
              {activeTab === "channels" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: 300, margin: 0 }}>OTA Channel Manager</h2>
                    <button
                      onClick={handleChannelSync}
                      disabled={isSyncing}
                      className="button"
                      style={{ padding: "0.6rem 1.4rem", borderRadius: "50px", fontSize: "0.75rem", letterSpacing: "1px", backgroundColor: "#b89b72", color: "#111" }}
                    >
                      {isSyncing ? "Synchronizing Channels..." : "Trigger Global Sync"}
                    </button>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "rgba(245,240,225,0.6)", marginBottom: "2rem" }}>
                    Central synchronization locking matrix. Updates rates, rules, and inventory blocks to third-party travel platforms to avoid double booking.
                  </p>

                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Travel Channel Platform</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Last Sync Timestamp</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Cottage Inventory Blocks</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Synchronize State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {channels.map((ch, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1.2rem 0.8rem", fontWeight: 600 }}>{ch.channel}</td>
                            <td style={{ padding: "1.2rem 0.8rem" }}>{new Date(ch.lastSyncAt).toLocaleString()}</td>
                            <td style={{ padding: "1.2rem 0.8rem" }}>{ch.syncedRooms} Configured</td>
                            <td style={{ padding: "1.2rem 0.8rem" }}>
                              <span style={{ color: "#b89b72", fontWeight: 600 }}>● {ch.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: CRM & Guest Loyalty */}
              {activeTab === "crm" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Guest Profiles & CRM Loyalty</h2>
                  
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Guest Profile</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Contact Details</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Identity ID</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Loyalty Points</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>VIP Member Rank</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Preferences Logs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {crmProfiles.map((p) => (
                          <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1.2rem 0.8rem", fontWeight: 600 }}>{p.name}</td>
                            <td style={{ padding: "1.2rem 0.8rem" }}>
                              <div>{p.email}</div>
                              <div style={{ fontSize: "0.75rem", color: "rgba(245,240,225,0.5)" }}>{p.phone}</div>
                            </td>
                            <td style={{ padding: "1.2rem 0.8rem" }}>{p.identityDoc}</td>
                            <td style={{ padding: "1.2rem 0.8rem", fontWeight: 600 }}>{p.loyaltyPoints} pts</td>
                            <td style={{ padding: "1.2rem 0.8rem" }}>
                              <span style={{ color: "#b89b72", fontWeight: 600 }}>{p.vipStatus}</span>
                            </td>
                            <td style={{ padding: "1.2rem 0.8rem", fontSize: "0.75rem", color: "rgba(245,240,225,0.6)" }}>
                              {p.preferences.join(", ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: Reporting & Analytics */}
              {activeTab === "analytics" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Revenue & Occupancy Analytics</h2>

                  {/* Summary Metric Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                    <div className="glass" style={{ padding: "1.5rem", border: "1px solid rgba(184, 155, 114, 0.15)", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.65rem", color: "rgba(245,240,225,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>Confirmed Revenue</span>
                      <p style={{ margin: "5px 0 0 0", fontSize: "1.8rem", color: "#b89b72", fontWeight: 600 }}>${metrics?.confirmedRevenue || 0}</p>
                    </div>
                    <div className="glass" style={{ padding: "1.5rem", border: "1px solid rgba(184, 155, 114, 0.15)", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.65rem", color: "rgba(245,240,225,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>Occupancy Rate</span>
                      <p style={{ margin: "5px 0 0 0", fontSize: "1.8rem", color: "#b89b72", fontWeight: 600 }}>{metrics?.occupancyRate || 0}%</p>
                    </div>
                    <div className="glass" style={{ padding: "1.5rem", border: "1px solid rgba(184, 155, 114, 0.15)", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.65rem", color: "rgba(245,240,225,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>Active PMS Staff</span>
                      <p style={{ margin: "5px 0 0 0", fontSize: "1.8rem", color: "#b89b72", fontWeight: 600 }}>{metrics?.staffCount || 0}</p>
                    </div>
                  </div>

                  {/* SVG Revenue Charts (Robust, zero bundle breaks) */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>Monthly Revenue Trend (USD)</h3>
                  <div className="glass" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
                    <svg width="100%" height="250" viewBox="0 0 500 200" style={{ maxWidth: "600px" }}>
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

                      {/* Area Trend */}
                      <path d="M 40 170 L 120 130 L 200 110 L 280 80 L 360 90 L 440 40 L 440 170 Z" fill="rgba(184, 155, 114, 0.08)" />
                      <path d="M 40 170 L 120 130 L 200 110 L 280 80 L 360 90 L 440 40" fill="none" stroke="#b89b72" strokeWidth="2.5" />

                      {/* Data points */}
                      <circle cx="120" cy="130" r="4" fill="#b89b72" />
                      <circle cx="200" cy="110" r="4" fill="#b89b72" />
                      <circle cx="280" cy="80" r="4" fill="#b89b72" />
                      <circle cx="360" cy="90" r="4" fill="#b89b72" />
                      <circle cx="440" cy="40" r="4" fill="#b89b72" />

                      {/* Axis Labels */}
                      <text x="120" y="190" fill="rgba(245,240,225,0.4)" fontSize="9" textAnchor="middle">JAN</text>
                      <text x="200" y="190" fill="rgba(245,240,225,0.4)" fontSize="9" textAnchor="middle">FEB</text>
                      <text x="280" y="190" fill="rgba(245,240,225,0.4)" fontSize="9" textAnchor="middle">MAR</text>
                      <text x="360" y="190" fill="rgba(245,240,225,0.4)" fontSize="9" textAnchor="middle">APR</text>
                      <text x="440" y="190" fill="rgba(245,240,225,0.4)" fontSize="9" textAnchor="middle">MAY</text>

                      <text x="30" y="173" fill="rgba(245,240,225,0.4)" fontSize="8" textAnchor="end">$0</text>
                      <text x="30" y="123" fill="rgba(245,240,225,0.4)" fontSize="8" textAnchor="end">$1.5K</text>
                      <text x="30" y="73" fill="rgba(245,240,225,0.4)" fontSize="8" textAnchor="end">$3.0K</text>
                      <text x="30" y="23" fill="rgba(245,240,225,0.4)" fontSize="8" textAnchor="end">$4.5K</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* TAB 8: System & Security */}
              {activeTab === "security" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>System Security & Audit Trail</h2>
                  
                  {/* Audit Logs */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>System Audit Logs</h3>
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "3rem" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Log Code</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Action Event</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Description details</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Operator</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{log.id}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{log.action}</td>
                            <td style={{ padding: "1rem 0.8rem", color: "rgba(245,240,225,0.7)" }}>{log.details}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{log.staff}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{new Date(log.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Staff Roles */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>Staff & Role Definitions</h3>
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Worker Name</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Department</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Assigned Role Key</th>
                          <th style={{ padding: "0.8rem", color: "#b89b72" }}>Database Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map((st, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "1rem 0.8rem", fontWeight: 600 }}>{st.name}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>{st.dept}</td>
                            <td style={{ padding: "1rem 0.8rem", color: "#b89b72" }}>{st.role}</td>
                            <td style={{ padding: "1rem 0.8rem" }}>● {st.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </section>
          </div>
        )}
      </main>
    </>
  );
}
