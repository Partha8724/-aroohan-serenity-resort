import type { NextApiRequest, NextApiResponse } from "next";
import { getCoupons } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const coupons = getCoupons();
    const { code } = req.query;

    if (code) {
      const uppercaseCode = String(code).toUpperCase().trim();
      const found = coupons.find(
        (c) => c.code.toUpperCase() === uppercaseCode && c.isActive
      );

      if (found) {
        // Validate date window
        const now = new Date();
        const start = new Date(found.validFrom);
        const end = new Date(found.validTo);

        if (now >= start && now <= end) {
          return res.status(200).json({ success: true, coupon: found });
        } else {
          return res.status(400).json({ error: "Coupon is outside of valid date range." });
        }
      } else {
        return res.status(404).json({ error: "Invalid or inactive coupon code." });
      }
    }

    return res.status(200).json({ success: true, coupons: coupons.filter((c) => c.isActive) });
  } catch (error) {
    console.error("Public Coupons API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
