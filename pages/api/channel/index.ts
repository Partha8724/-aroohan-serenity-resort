import type { NextApiRequest, NextApiResponse } from "next";
import { getChannels, syncChannels } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    
    // Auth validation checks
    if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
      return res.status(401).json({ error: "Unauthorized access: admin verification error." });
    }

    if (req.method === "GET") {
      const channels = getChannels();
      return res.status(200).json({ success: true, channels });
    }

    if (req.method === "POST") {
      syncChannels();
      return res.status(200).json({ success: true, message: "Inventory & Rates synchronized successfully across OTA platforms." });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Channel Manager API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
