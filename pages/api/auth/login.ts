import type { NextApiRequest, NextApiResponse } from "next";
import { getUsers } from "../../../lib/enterprise";
import { hashPassword, generateToken } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password." });
    }

    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({ error: "Invalid email credentials or account does not exist." });
    }

    const hash = hashPassword(password);
    if (user.passwordHash !== hash) {
      return res.status(400).json({ error: "Invalid password credentials." });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loyaltyPoints: user.loyaltyPoints,
        vipStatus: user.vipStatus,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error("Login API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
