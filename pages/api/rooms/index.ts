import type { NextApiRequest, NextApiResponse } from "next";
import { getRooms } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rooms = getRooms();
    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error("Public Rooms API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
