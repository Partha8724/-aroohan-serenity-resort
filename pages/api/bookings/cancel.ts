import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase, writeDatabase } from "../../../lib/db";
import { sendNotification } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bookingId, email } = req.body;

    if (!bookingId || !email) {
      return res.status(400).json({ error: "Missing booking ID reference or email address." });
    }

    const db = readDatabase();
    const idx = db.findIndex(
      (b) => b.id === bookingId && b.guestEmail.toLowerCase() === email.toLowerCase()
    );

    if (idx === -1) {
      return res.status(404).json({ error: "No matching reservation found in our database." });
    }

    if (db[idx].status === "CANCELLED") {
      return res.status(400).json({ error: "This booking has already been cancelled." });
    }

    // Update reservation state
    db[idx].status = "CANCELLED";
    writeDatabase(db);

    // Update enterprise database tables
    try {
      const { readEnterpriseDb, writeEnterpriseDb } = require("../../../lib/enterprise");
      const entDb = readEnterpriseDb();
      
      // 1. Update Booking status
      entDb.bookings = entDb.bookings || [];
      const entBkIdx = entDb.bookings.findIndex((b: any) => b.id === bookingId);
      if (entBkIdx !== -1) {
        entDb.bookings[entBkIdx].status = "CANCELLED";
      }

      // 2. Update Payment status to REFUNDED
      entDb.payments = entDb.payments || [];
      const payIdx = entDb.payments.findIndex((p: any) => p.bookingId === bookingId);
      if (payIdx !== -1) {
        entDb.payments[payIdx].status = "REFUNDED";
      }
      
      writeEnterpriseDb(entDb);
    } catch (e) {
      console.error("Failed to update enterprise tables on cancellation:", e);
    }

    // Dispatch automated cancellation notification alert
    sendNotification(
      db[idx].guestEmail,
      "Reservation Cancellation Confirmed — Aroohan Serenity Resort",
      `Dear ${db[idx].guestName},\n\nYour booking reservation reference ${bookingId} has been successfully cancelled.\n\nRefund of the payment has been initiated to your transaction source and will reflect in 5-7 business days.\n\nWarm regards,\nAroohan Sanctuary Concierge`
    );

    return res.status(200).json({
      success: true,
      message: "Reservation successfully cancelled and refund initiated.",
      booking: db[idx]
    });
  } catch (error) {
    console.error("Cancel Booking API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
