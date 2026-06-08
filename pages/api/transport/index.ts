import type { NextApiRequest, NextApiResponse } from "next";
import { getTransportBookings, updateTransportBooking } from "../../../lib/enterprise";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dbPath = path.join(process.cwd(), "db_enterprise.json");

  try {
    if (req.method === "GET") {
      const bookings = getTransportBookings();
      return res.status(200).json({ success: true, bookings });
    }

    if (req.method === "POST") {
      const { action, bookingId, guestName, vehicleType, pickupLocation, dropLocation, scheduledAt, driver, price, transportId, status } = req.body;

      if (action === "create_transport") {
        if (!bookingId || !guestName || !vehicleType || !pickupLocation || !dropLocation || !scheduledAt || !price) {
          return res.status(400).json({ error: "Missing required details for transport logs." });
        }

        const newTransport = {
          id: `TR-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
          bookingId,
          guestName,
          vehicleType,
          pickupLocation,
          dropLocation,
          scheduledAt,
          driver: driver || "Concierge Driver Team",
          status: "SCHEDULED" as const,
          price: Number(price)
        };

        if (fs.existsSync(dbPath)) {
          const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
          db.transportBookings.push(newTransport);
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
        }

        return res.status(200).json({ success: true, transport: newTransport });
      }

      if (action === "update_status") {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
          return res.status(401).json({ error: "Unauthorized access: admin verification error." });
        }

        updateTransportBooking(transportId, status);
        return res.status(200).json({ success: true });
      }
    }

    return res.status(400).json({ error: "Invalid action specifier." });
  } catch (error) {
    console.error("Transport API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
