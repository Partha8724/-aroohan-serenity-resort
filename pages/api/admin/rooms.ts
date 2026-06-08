import type { NextApiRequest, NextApiResponse } from "next";
import { getRooms, createRoom, updateRoom, deleteRoom } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
      return res.status(401).json({ error: "Unauthorized access: Invalid admin credentials." });
    }

    if (req.method === "GET") {
      const rooms = getRooms();
      return res.status(200).json({ success: true, rooms });
    }

    if (req.method === "POST") {
      const { name, desc, fullDesc, size, maxGuests, bedType, amenities, price, images, videoUrl, checkInTime, checkOutTime, cancellationPolicy, availableCount } = req.body;
      if (!name || !desc || !price || !availableCount) {
        return res.status(400).json({ error: "Missing required room properties (name, desc, price, availableCount)." });
      }
      const room = createRoom({
        name,
        desc,
        fullDesc: fullDesc || desc,
        size: size || "N/A",
        maxGuests: Number(maxGuests || 2),
        bedType: bedType || "Standard Bed",
        amenities: amenities || [],
        price: Number(price),
        images: images || [],
        videoUrl: videoUrl || "",
        checkInTime: checkInTime || "02:00 PM",
        checkOutTime: checkOutTime || "11:00 AM",
        cancellationPolicy: cancellationPolicy || "Non-refundable",
        availableCount: Number(availableCount)
      });
      return res.status(200).json({ success: true, room });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const { id, ...updateData } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing room ID for update." });
      }
      const updated = updateRoom(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Room not found." });
      }
      return res.status(200).json({ success: true, room: updated });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Missing room ID parameter." });
      }
      deleteRoom(String(id));
      return res.status(200).json({ success: true, message: "Room deleted successfully." });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin Rooms API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
