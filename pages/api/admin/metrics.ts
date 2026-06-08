import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase } from "../../../lib/db";
import { getHousekeeping, getMaintenance } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    
    // Authorization check
    if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
      return res.status(401).json({ error: "Unauthorized access: admin passcode mismatch." });
    }

    const bookings = readDatabase();
    const hk = getHousekeeping();
    const mn = getMaintenance();

    // Calculate aggregated revenue streams
    let confirmedRevenue = 0;
    let pendingRevenue = 0;
    let cancelledRevenue = 0;

    bookings.forEach((b) => {
      if (b.status === "CONFIRMED") {
        confirmedRevenue += b.totalPrice;
      } else if (b.status === "PENDING") {
        pendingRevenue += b.totalPrice;
      } else if (b.status === "CANCELLED") {
        cancelledRevenue += b.totalPrice;
      }
    });

    // Mock Audit trail records
    const auditLogs = [
      { id: "AUD-01", action: "RESERVATION_CONFIRM", details: "Booking BK-8724-X90A confirmed via pay webhook", staff: "Gateway Webhook", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { id: "AUD-02", action: "PMS_HOUSEKEEPING", details: "Cottage 101 marked as fully cleaned", staff: "HK Ramesh Kumar", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: "AUD-03", action: "PMS_MAINTENANCE", details: "Solar heater pressure ticket raised", staff: "Mgr Priya Sharma", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
    ];

    // Staff roster tracking
    const staff = [
      { name: "Priya Sharma", role: "Manager", dept: "Operations", status: "ACTIVE" },
      { name: "Amit Singh", role: "Receptionist", dept: "Front Desk", status: "ACTIVE" },
      { name: "Ramesh Kumar", role: "Housekeeping", dept: "Sanitation", status: "ACTIVE" },
      { name: "Tenzin Gyatso", role: "Therapist", dept: "Spa & Wellness", status: "ACTIVE" },
      { name: "Manish Dev", role: "Driver", dept: "Logistics", status: "ACTIVE" }
    ];

    return res.status(200).json({
      success: true,
      metrics: {
        confirmedRevenue,
        pendingRevenue,
        cancelledRevenue,
        occupancyRate: bookings.length > 0 ? Math.min(100, Math.ceil((bookings.filter(b => b.status === "CONFIRMED").length / 6) * 100)) : 0,
        housekeepingPending: hk.filter((t) => t.status === "PENDING").length,
        maintenanceOpen: mn.filter((t) => t.status === "OPEN").length,
        staffCount: staff.length,
      },
      auditLogs,
      staff
    });
  } catch (error) {
    console.error("Admin Metrics API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
