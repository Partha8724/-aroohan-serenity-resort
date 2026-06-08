import type { NextApiRequest, NextApiResponse } from "next";
import { getReviews, moderateReview } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
      return res.status(401).json({ error: "Unauthorized access: admin key mismatch." });
    }

    if (req.method === "GET") {
      const allReviews = getReviews();
      return res.status(200).json({ success: true, reviews: allReviews });
    }

    if (req.method === "PUT") {
      const { id, isApproved, isFeatured } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing review ID." });
      }

      const updated = moderateReview(id, !!isApproved, !!isFeatured);
      if (!updated) {
        return res.status(404).json({ error: "Review not found." });
      }

      return res.status(200).json({ success: true, review: updated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin Reviews API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
