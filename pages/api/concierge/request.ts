import type { NextApiRequest, NextApiResponse } from "next";
import { getConciergeRequests, createConciergeRequest, updateConciergeRequest } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { bookingId } = req.query;
      const allReqs = getConciergeRequests();
      
      if (bookingId) {
        const filtered = allReqs.filter((r) => r.bookingId === String(bookingId));
        return res.status(200).json({ success: true, requests: filtered });
      }
      return res.status(200).json({ success: true, requests: allReqs });
    }

    if (req.method === "POST") {
      const { bookingId, guestName, roomNumber, requestType, details } = req.body;
      if (!bookingId || !guestName || !roomNumber || !requestType || !details) {
        return res.status(400).json({ error: "Missing required fields (bookingId, guestName, roomNumber, requestType, details)." });
      }

      const newReq = createConciergeRequest({
        bookingId,
        guestName,
        roomNumber,
        requestType,
        details
      });

      return res.status(200).json({ success: true, request: newReq });
    }

    if (req.method === "PUT") {
      // Allow admin status updates
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: "Missing concierge request id or status." });
      }
      const updated = updateConciergeRequest(id, status);
      if (!updated) {
        return res.status(404).json({ error: "Request not found." });
      }
      return res.status(200).json({ success: true, request: updated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Concierge API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
