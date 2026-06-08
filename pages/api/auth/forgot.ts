import type { NextApiRequest, NextApiResponse } from "next";
import { getUsers, sendNotification } from "../../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing email address parameter." });
    }

    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "No guest account registered with this email." });
    }

    // Simulate recovery link
    const resetLink = `http://localhost:3000/dashboard?action=reset&token=rst_8724_${Math.floor(1000 + Math.random() * 9000)}`;
    sendNotification(
      user.email,
      "Password Reset Requested — Aroohan Serenity Resort",
      `Dear ${user.name},\n\nWe received a request to reset your password. Use the following link to configure new credentials:\n\n${resetLink}\n\nIf you did not request this, ignore this message.\n\nWarm regards,\nAroohan Concierge`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your registered email."
    });
  } catch (error) {
    console.error("Forgot API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
