import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase } from "../../../lib/db";
import { getRooms } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { roomType, checkIn, checkOut } = req.body;
    if (!roomType || !checkIn || !checkOut) {
      return res.status(400).json({ error: "Missing required dates or roomType parameters." });
    }

    const rooms = getRooms();
    const matchedRoom = rooms.find((r) => r.name === roomType);
    const max = matchedRoom ? matchedRoom.availableCount : 3;
    const db = readDatabase();

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // Audit overlapping non-cancelled reservations
    const overlapping = db.filter((b) => {
      if (b.roomType !== roomType) return false;
      if (b.status === "CANCELLED") return false;

      const bStart = new Date(b.checkIn);
      const bEnd = new Date(b.checkOut);

      // Overlap condition: start of B is before end of A, AND end of B is after start of A
      return start < bEnd && end > bStart;
    });

    const activeBookingsCount = overlapping.length;

    let availabilityStatus: "Available" | "Limited Rooms" | "Sold Out" = "Available";
    if (activeBookingsCount >= max) {
      availabilityStatus = "Sold Out";
    } else if (activeBookingsCount === max - 1) {
      availabilityStatus = "Limited Rooms";
    }

    return res.status(200).json({
      success: true,
      status: availabilityStatus,
      availableCount: Math.max(0, max - activeBookingsCount),
      totalInventory: max
    });
  } catch (error) {
    console.error("Availability Check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
