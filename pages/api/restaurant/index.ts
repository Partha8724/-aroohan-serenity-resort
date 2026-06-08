import type { NextApiRequest, NextApiResponse } from "next";
import { getRestaurantOrders, updateRestaurantOrder } from "../../../lib/enterprise";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dbPath = path.join(process.cwd(), "db_enterprise.json");

  try {
    if (req.method === "GET") {
      const { bookingId } = req.query;
      const orders = getRestaurantOrders();
      if (bookingId) {
        const filtered = orders.filter((o) => o.bookingId === String(bookingId));
        return res.status(200).json({ success: true, orders: filtered });
      }
      return res.status(200).json({ success: true, orders });
    }

    if (req.method === "POST") {
      const { action, items, tableNumber, isRoomService, bookingId, orderId, status } = req.body;

      if (action === "create_order") {
        if (!items || items.length === 0) {
          return res.status(400).json({ error: "Missing items in order submission." });
        }

        const total = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
        const orderIdGenerated = `FD-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

        const newOrder = {
          id: orderIdGenerated,
          bookingId: bookingId || null,
          tableNumber: tableNumber || "Table Service",
          isRoomService: !!isRoomService,
          items,
          totalPrice: total,
          status: "PENDING" as const,
          createdAt: new Date().toISOString()
        };

        if (fs.existsSync(dbPath)) {
          const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
          db.restaurantOrders.push(newOrder);
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
        }

        return res.status(200).json({ success: true, order: newOrder });
      }

      if (action === "update_status") {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== "Bearer AroohanAdmin8724") {
          return res.status(401).json({ error: "Unauthorized access: admin passcode required." });
        }

        updateRestaurantOrder(orderId, status);
        return res.status(200).json({ success: true });
      }
    }

    return res.status(400).json({ error: "Invalid action specifier." });
  } catch (error) {
    console.error("Restaurant API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
