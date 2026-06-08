import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase } from "../../../lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    
    // Simple secure check against server token: AroohanAdmin8724
    if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
      return res.status(401).json({ error: "Unauthorized access: Access credentials invalid." });
    }

    const bookings = readDatabase();
    const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ success: true, bookings: sorted });
  } catch (error) {
    console.error("Booking List error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
