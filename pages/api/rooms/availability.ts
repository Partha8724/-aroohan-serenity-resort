import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase } from "../../../lib/db";
import { getRooms } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { roomType } = req.query;
    if (!roomType) {
      return res.status(400).json({ error: "Missing roomType query parameter." });
    }

    const rooms = getRooms();
    const matchedRoom = rooms.find((r) => r.name === roomType);
    if (!matchedRoom) {
      return res.status(404).json({ error: "Room type not found." });
    }

    const maxCapacity = matchedRoom.availableCount;
    const db = readDatabase();

    const availabilityMatrix = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      // Count overlapping bookings for this specific single date
      const activeBookingsCount = db.filter((b) => {
        if (b.roomType !== roomType) return false;
        if (b.status === "CANCELLED") return false;

        const bStart = new Date(b.checkIn);
        const bEnd = new Date(b.checkOut);
        const targetDate = new Date(dateStr);

        // A booking overlaps this date if targetDate is >= checkIn AND targetDate < checkOut
        return targetDate >= bStart && targetDate < bEnd;
      }).length;

      let status: "Available" | "Limited Rooms" | "Sold Out" = "Available";
      if (activeBookingsCount >= maxCapacity) {
        status = "Sold Out";
      } else if (activeBookingsCount === maxCapacity - 1) {
        status = "Limited Rooms";
      }

      availabilityMatrix.push({
        date: dateStr,
        status,
        availableCount: Math.max(0, maxCapacity - activeBookingsCount),
      });
    }

    return res.status(200).json({
      success: true,
      roomType,
      matrix: availabilityMatrix,
    });
  } catch (error) {
    console.error("Room availability matrix calculation failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
