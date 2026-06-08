import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase } from "../../../lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bookingId, email } = req.body;

    if (!bookingId || !email) {
      return res.status(400).json({ error: "Missing Booking ID or Lead Guest Email parameter." });
    }

    const db = readDatabase();
    const found = db.find(
      (b) =>
        b.id.toUpperCase() === bookingId.toUpperCase().trim() &&
        b.guestEmail.toLowerCase() === email.toLowerCase().trim()
    );

    if (!found) {
      return res.status(404).json({ error: "No matching reservation found. Verify Booking ID and Email." });
    }

    // Resolve payment status from enterprise payments database
    let paymentStatus = found.status === "CONFIRMED" ? "PAID" : found.status === "CANCELLED" ? "REFUNDED" : "PENDING";
    try {
      const { getPayments } = require("../../../lib/enterprise");
      const payments = getPayments();
      const paymentRecord = payments.find((p: any) => p.bookingId === found.id);
      if (paymentRecord) {
        paymentStatus = paymentRecord.status;
      }
    } catch (e) {
      console.error("Failed to query payment status:", e);
    }

    return res.status(200).json({ 
      success: true, 
      booking: {
        ...found,
        paymentStatus
      }
    });
  } catch (error) {
    console.error("Booking Lookup API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
