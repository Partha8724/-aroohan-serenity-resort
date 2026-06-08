import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase, writeDatabase, Booking } from "../../../lib/db";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { guestName, guestEmail, guestPhone, guestIdentity, roomType, checkIn, checkOut, guests, totalPrice } = req.body;

    // Validation
    if (!guestName || !guestEmail || !guestPhone || !roomType || !checkIn || !checkOut || !guests || !totalPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = readDatabase();
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // 1. Prevent duplicate reservation
    const duplicate = db.find(
      (b) =>
        b.guestEmail.toLowerCase() === guestEmail.toLowerCase() &&
        b.roomType === roomType &&
        b.checkIn === checkIn &&
        b.checkOut === checkOut &&
        b.status !== "CANCELLED"
    );

    if (duplicate) {
      return res.status(400).json({
        error: `Duplicate Reservation: An active booking already exists for ${guestEmail} with the same room type and dates. Reference ID: ${duplicate.id}`,
      });
    }

    // 2. Prevent Double Booking / Overbooking
    // Get capacity from database
    const { getRooms } = require("../../../lib/enterprise");
    const rooms = getRooms();
    const matchedRoom = rooms.find((r: any) => r.name === roomType);
    const maxCapacity = matchedRoom ? matchedRoom.availableCount : 3;

    const overlappingCount = db.filter((b) => {
      if (b.roomType !== roomType) return false;
      if (b.status === "CANCELLED") return false;

      const bStart = new Date(b.checkIn);
      const bEnd = new Date(b.checkOut);

      return start < bEnd && end > bStart;
    }).length;

    if (overlappingCount >= maxCapacity) {
      return res.status(400).json({
        error: `Overbooking Prevention: The requested room type (${roomType}) is fully booked during the selected stay dates.`,
      });
    }

    // Generate custom premium booking ID (Aroohan format: BK-8724-[RANDOM])
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const bookingId = `BK-8724-${randomSuffix}`;

    const newBooking: Booking = {
      id: bookingId,
      guestName,
      guestEmail,
      guestPhone,
      guestIdentity: guestIdentity || "Not Provided",
      roomType,
      checkIn,
      checkOut,
      guests: Number(guests),
      totalPrice: Number(totalPrice),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    db.push(newBooking);
    writeDatabase(db);

    // Populate enterprise database tables
    try {
      const { getGuests, createGuest, createPayment } = require("../../../lib/enterprise");
      const guestsList = getGuests();
      let matchedGuest = guestsList.find((g: any) => g.email.toLowerCase() === guestEmail.toLowerCase());
      if (!matchedGuest) {
        matchedGuest = createGuest({
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          identityDoc: guestIdentity || "Not Provided",
          loyaltyPoints: 0,
          vipStatus: "STANDARD",
          preferences: []
        });
      }

      // Add payment record
      createPayment({
        bookingId: bookingId,
        amount: Number(totalPrice),
        gateway: "Razorpay",
        gatewayTransactionId: `pay_pending_${randomSuffix}`,
        status: "PENDING"
      });

      // Add to enterprise bookings key
      const { readEnterpriseDb, writeEnterpriseDb } = require("../../../lib/enterprise");
      const entDb = readEnterpriseDb();
      entDb.bookings = entDb.bookings || [];
      entDb.bookings.push({
        id: bookingId,
        guestName,
        guestEmail,
        guestPhone,
        guestIdentity: guestIdentity || "Not Provided",
        roomType,
        checkIn,
        checkOut,
        guests: Number(guests),
        totalPrice: Number(totalPrice),
        status: "PENDING",
        createdAt: new Date().toISOString()
      });
      writeEnterpriseDb(entDb);
    } catch (e) {
      console.error("Failed to populate enterprise tables:", e);
    }

    // CSRF Protection token generation to validate subsequent payment checks
    const csrfToken = crypto.randomBytes(16).toString("hex");

    return res.status(200).json({
      success: true,
      booking: newBooking,
      csrfToken,
      paymentPayload: {
        orderId: `ORD-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        currency: "USD",
        amount: Number(totalPrice),
      }
    });
  } catch (error) {
    console.error("Booking Create error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
