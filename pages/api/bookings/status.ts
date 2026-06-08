import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase, writeDatabase } from "../../../lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    
    // Auth validation check
    if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
      return res.status(401).json({ error: "Unauthorized access: Access credentials invalid." });
    }

    const { bookingId, status } = req.body;
    if (!bookingId || !status) {
      return res.status(400).json({ error: "Missing bookingId or status value." });
    }

    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status state value." });
    }

    const db = readDatabase();
    const idx = db.findIndex((b) => b.id === bookingId);

    if (idx === -1) {
      return res.status(404).json({ error: "Booking reference not found." });
    }

    db[idx].status = status;
    writeDatabase(db);

    // Update enterprise database tables
    try {
      const { readEnterpriseDb, writeEnterpriseDb } = require("../../../lib/enterprise");
      const entDb = readEnterpriseDb();
      
      // 1. Update Booking status
      entDb.bookings = entDb.bookings || [];
      const entBkIdx = entDb.bookings.findIndex((b: any) => b.id === bookingId);
      if (entBkIdx !== -1) {
        entDb.bookings[entBkIdx].status = status;
      }

      // 2. Synchronize Payment status based on new Booking status
      entDb.payments = entDb.payments || [];
      const payIdx = entDb.payments.findIndex((p: any) => p.bookingId === bookingId);
      if (payIdx !== -1) {
        if (status === "CANCELLED") {
          entDb.payments[payIdx].status = "REFUNDED";
        } else if (status === "CONFIRMED") {
          entDb.payments[payIdx].status = "PAID";
        }
      }
      
      writeEnterpriseDb(entDb);
    } catch (e) {
      console.error("Failed to update enterprise tables on status update:", e);
    }

    return res.status(200).json({ success: true, booking: db[idx] });
  } catch (error) {
    console.error("Booking Status Update error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
