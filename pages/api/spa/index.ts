import type { NextApiRequest, NextApiResponse } from "next";
import { getSpaBookings, updateSpaBooking } from "../../../lib/enterprise";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dbPath = path.join(process.cwd(), "db_enterprise.json");

  try {
    if (req.method === "GET") {
      const bookings = getSpaBookings();
      return res.status(200).json({ success: true, bookings });
    }

    if (req.method === "POST") {
      const { action, bookingId, guestName, therapyName, scheduledAt, therapist, price, spaBookingId, status } = req.body;

      if (action === "create_spa") {
        if (!bookingId || !guestName || !therapyName || !scheduledAt || !price) {
          return res.status(400).json({ error: "Missing required details for spa scheduler." });
        }

        const newSpa = {
          id: `SPA-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
          bookingId,
          guestName,
          therapyName,
          scheduledAt,
          therapist: therapist || "Concierge Therapist",
          price: Number(price),
          status: "SCHEDULED" as const
        };

        if (fs.existsSync(dbPath)) {
          const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
          db.spaBookings.push(newSpa);
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
        }

        return res.status(200).json({ success: true, spaBooking: newSpa });
      }

      if (action === "update_status") {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
          return res.status(401).json({ error: "Unauthorized access: admin key mismatch." });
        }

        updateSpaBooking(spaBookingId, status);
        return res.status(200).json({ success: true });
      }
    }

    return res.status(400).json({ error: "Invalid action specifier." });
  } catch (error) {
    console.error("Spa API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
