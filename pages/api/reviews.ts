import type { NextApiRequest, NextApiResponse } from "next";
import { getReviews, createReview } from "../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const allReviews = getReviews();
      const approved = allReviews.filter((r) => r.isApproved);
      return res.status(200).json({ success: true, reviews: approved });
    }

    if (req.method === "POST") {
      const { bookingId, guestName, rating, comment, photos } = req.body;

      if (!bookingId || !guestName || rating === undefined || !comment) {
        return res.status(400).json({ error: "Missing required fields (bookingId, guestName, rating, comment)." });
      }

      const ratingVal = Number(rating);
      if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
        return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
      }

      const newReview = createReview({
        bookingId,
        guestName,
        rating: ratingVal,
        comment,
        photos: Array.isArray(photos) ? photos : []
      });

      return res.status(200).json({ success: true, review: newReview });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Reviews API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
