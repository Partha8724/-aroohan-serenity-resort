import type { NextApiRequest, NextApiResponse } from "next";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
      return res.status(401).json({ error: "Unauthorized access: Invalid admin credentials." });
    }

    if (req.method === "GET") {
      const coupons = getCoupons();
      return res.status(200).json({ success: true, coupons });
    }

    if (req.method === "POST") {
      const { code, discountPercentage, validFrom, validTo, isActive } = req.body;
      if (!code || !discountPercentage || !validFrom || !validTo) {
        return res.status(400).json({ error: "Missing required coupon properties (code, discountPercentage, validFrom, validTo)." });
      }
      const coupon = createCoupon({
        code: String(code).toUpperCase().trim(),
        discountPercentage: Number(discountPercentage),
        validFrom,
        validTo,
        isActive: isActive !== false
      });
      return res.status(200).json({ success: true, coupon });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const { id, ...updateData } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing coupon ID for update." });
      }
      if (updateData.code) {
        updateData.code = String(updateData.code).toUpperCase().trim();
      }
      const updated = updateCoupon(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Coupon not found." });
      }
      return res.status(200).json({ success: true, coupon: updated });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Missing coupon ID parameter." });
      }
      deleteCoupon(String(id));
      return res.status(200).json({ success: true, message: "Coupon deleted successfully." });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin Coupons API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
