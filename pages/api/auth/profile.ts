import type { NextApiRequest, NextApiResponse } from "next";
import { getUsers, updateUser } from "../../../lib/enterprise";
import { verifyToken } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access: Missing authorization token." });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized access: Session token expired or invalid." });
    }

    const users = getUsers();
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    if (req.method === "GET") {
      const { readDatabase } = require("../../../lib/db");
      const bookings = readDatabase().filter(
        (b: any) => b.guestEmail.toLowerCase() === user.email.toLowerCase()
      );
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          loyaltyPoints: user.loyaltyPoints,
          vipStatus: user.vipStatus,
          preferences: user.preferences
        },
        bookings
      });
    }

    if (req.method === "PUT") {
      const { name, phone, preferences } = req.body;
      const updated = updateUser(user.id, {
        name: name || user.name,
        phone: phone || user.phone,
        preferences: preferences || user.preferences
      });
      return res.status(200).json({
        success: true,
        user: {
          id: updated?.id,
          name: updated?.name,
          email: updated?.email,
          phone: updated?.phone,
          loyaltyPoints: updated?.loyaltyPoints,
          vipStatus: updated?.vipStatus,
          preferences: updated?.preferences
        }
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Profile API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
