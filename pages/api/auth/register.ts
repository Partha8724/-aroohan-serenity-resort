import type { NextApiRequest, NextApiResponse } from "next";
import { getUsers, createUser } from "../../../lib/enterprise";
import { hashPassword, generateToken } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Missing required fields (name, email, password, phone)." });
    }

    const users = getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const passwordHash = hashPassword(password);
    const user = createUser({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      phone,
      preferences: []
    });

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
    console.error("Register API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
