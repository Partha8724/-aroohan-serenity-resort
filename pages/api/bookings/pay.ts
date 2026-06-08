import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase, writeDatabase } from "../../../lib/db";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bookingId, paymentToken, csrfToken } = req.body;

    // Security check: Validate presence of CSRF and payment token headers/body values
    if (!bookingId || !paymentToken || !csrfToken) {
      return res.status(400).json({ error: "CSRF or Payment transaction token validation failed." });
    }

    const db = readDatabase();
    const bookingIdx = db.findIndex((b) => b.id === bookingId);

    if (bookingIdx === -1) {
      return res.status(404).json({ error: "Booking reference not found." });
    }

    // Verify Stripe/Razorpay signature payload or token format (mock verification check)
    const isValidToken = paymentToken.startsWith("tok_") || paymentToken.startsWith("pay_") || paymentToken === "simulated_success";

    if (!isValidToken) {
      return res.status(400).json({ error: "Payment signature mismatch or invalid transaction status." });
    }

    // Transition state to CONFIRMED
    db[bookingIdx].status = "CONFIRMED";
    writeDatabase(db);

    const transactionId = `TXN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const targetBooking = db[bookingIdx];

    // Update enterprise tables
    try {
      const { 
        readEnterpriseDb, 
        writeEnterpriseDb, 
        createPayment, 
        createInvoice, 
        sendNotification,
        incrementLoyaltyPoints
      } = require("../../../lib/enterprise");

      // 1. Update Booking status in enterprise db
      const entDb = readEnterpriseDb();
      entDb.bookings = entDb.bookings || [];
      const entBkIdx = entDb.bookings.findIndex((b: any) => b.id === bookingId);
      if (entBkIdx !== -1) {
        entDb.bookings[entBkIdx].status = "CONFIRMED";
      }
      writeEnterpriseDb(entDb);

      // 2. Update Payment record to PAID (success)
      const payList = entDb.payments || [];
      const pendingPaymentIdx = payList.findIndex((p: any) => p.bookingId === bookingId && p.status === "PENDING");
      if (pendingPaymentIdx !== -1) {
        entDb.payments[pendingPaymentIdx].status = "PAID";
        entDb.payments[pendingPaymentIdx].gatewayTransactionId = paymentToken;
        writeEnterpriseDb(entDb);
      } else {
        createPayment({
          bookingId: bookingId,
          amount: targetBooking.totalPrice,
          gateway: "Razorpay",
          gatewayTransactionId: paymentToken,
          status: "PAID"
        });
      }

      // 3. Create Invoice record
      const invoiceNumber = `INV-8724-${bookingId.split("-")[2]}`;
      createInvoice({
        invoiceNumber,
        bookingId,
        paymentId: `PAY-${bookingId.split("-")[2]}`,
        pdfUrl: `/invoices/Aroohan_Invoice_${bookingId}.pdf`
      });

      // 4. Update loyalty points (1 point per $10 spent)
      const pointsEarned = Math.floor(targetBooking.totalPrice / 10);
      incrementLoyaltyPoints(targetBooking.guestEmail, pointsEarned);

      // 5. Automated Email Logs
      sendNotification(
        targetBooking.guestEmail, 
        `Booking Confirmed! Reference ID: ${bookingId}`, 
        `Dear ${targetBooking.guestName}, your reservation for ${targetBooking.roomType} is CONFIRMED from ${targetBooking.checkIn} to ${targetBooking.checkOut}.`
      );
      sendNotification(
        targetBooking.guestEmail, 
        `Payment Confirmation & Invoice: ${invoiceNumber}`, 
        `Dear ${targetBooking.guestName}, we have received your payment of $${targetBooking.totalPrice}.00 USD via Razorpay. Your PDF Invoice is attached.`
      );

      // 6. Automated WhatsApp Logs
      sendNotification(
        targetBooking.guestPhone || targetBooking.guestEmail,
        `[WHATSAPP] Booking Confirmed & Payment Received`,
        `Hi ${targetBooking.guestName}! Your stay at Aroohan Serenity Resort is locked. Reservation: RES-8724-${bookingId.split("-")[2]} is active. Check-in is at 02:00 PM on ${targetBooking.checkIn}. See you soon!`
      );
      sendNotification(
        targetBooking.guestPhone || targetBooking.guestEmail,
        `[WHATSAPP] Check-In Reminder & Preparation`,
        `Hi ${targetBooking.guestName}! This is a reminder that check-in for your booking ${bookingId} begins at 02:00 PM on ${targetBooking.checkIn}. Feel free to contact our concierge if you have special requests.`
      );
    } catch (e) {
      console.error("Failed to update enterprise tables on payment:", e);
    }

    return res.status(200).json({
      success: true,
      bookingId,
      status: "CONFIRMED",
      transactionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Booking Pay error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
