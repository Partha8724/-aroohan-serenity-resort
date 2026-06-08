import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, key, code } = req.body;

    if (action === "login") {
      if (key !== "AroohanAdmin8724") {
        return res.status(401).json({ error: "Access key credentials invalid." });
      }

      // Pre-authorization successful, prompt for 2FA validation
      const preAuthToken = crypto.randomBytes(16).toString("hex");

      return res.status(200).json({
        success: true,
        preAuthToken,
        require2FA: true,
        message: "Step 1 credential checks complete. Enter 2FA passcode."
      });
    }

    if (action === "verify_2fa") {
      // Mock 2FA matching passcode verification (Aroohan default: 8724)
      if (code !== "872490" && code !== "8724") {
        return res.status(400).json({ error: "2FA validation token code mismatch." });
      }

      return res.status(200).json({
        success: true,
        token: "AroohanAdmin8724", // Return authorized token
        role: "SUPER_ADMIN",
        expiresIn: 86400, // 24 Hours
        userName: "Owner Concierge"
      });
    }

    return res.status(400).json({ error: "Invalid login action specifier." });
  } catch (error) {
    console.error("Security Auth API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
