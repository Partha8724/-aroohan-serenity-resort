import type { NextApiRequest, NextApiResponse } from "next";
import { getChats, addChatMessage } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { bookingId } = req.query;
      const authHeader = req.headers.authorization;
      const isAdmin = authHeader === "Bearer AroohanAdmin8724";

      const allSessions = getChats();

      if (isAdmin) {
        if (bookingId) {
          const session = allSessions.find((s) => s.bookingId === String(bookingId));
          return res.status(200).json({ success: true, session: session || null });
        }
        return res.status(200).json({ success: true, sessions: allSessions });
      } else {
        if (!bookingId) {
          return res.status(400).json({ error: "Missing bookingId parameter for guest view." });
        }
        const session = allSessions.find((s) => s.bookingId === String(bookingId));
        return res.status(200).json({ success: true, session: session || null });
      }
    }

    if (req.method === "POST") {
      const { bookingId, guestName, sender, message } = req.body;

      if (!bookingId || !guestName || !sender || !message) {
        return res.status(400).json({ error: "Missing required message parameters (bookingId, guestName, sender, message)." });
      }

      if (sender !== "guest" && sender !== "admin") {
        return res.status(400).json({ error: "Sender must be either 'guest' or 'admin'." });
      }

      // If sender is admin, verify auth passcode
      if (sender === "admin") {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
          return res.status(401).json({ error: "Unauthorized access: admin key mismatch." });
        }
      }

      const session = addChatMessage(bookingId, guestName, sender, message);
      return res.status(200).json({ success: true, session });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
