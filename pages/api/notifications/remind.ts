import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase } from "../../lib/db";
import { sendNotification } from "../../lib/enterprise";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = readDatabase();
    const confirmedBookings = db.filter((b) => b.status === "CONFIRMED");
    const sentLogs: { bookingId: string; guestName: string; type: string; medium: string }[] = [];

    const today = new Date();
    
    for (const booking of confirmedBookings) {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      
      // Calculate days difference
      const timeDiffCheckIn = checkInDate.getTime() - today.getTime();
      const daysDiffCheckIn = Math.ceil(timeDiffCheckIn / (1000 * 3600 * 24));
      
      const timeDiffCheckOut = checkOutDate.getTime() - today.getTime();
      const daysDiffCheckOut = Math.ceil(timeDiffCheckOut / (1000 * 3600 * 24));

      // 1. Send check-in reminder (if check-in is within 7 days and check-in has not been done online)
      if (daysDiffCheckIn > 0 && daysDiffCheckIn <= 7 && !booking.checkedInOnline) {
        // Mock email dispatch log
        sendNotification(
          booking.guestEmail,
          `Upcoming Stay Pre-Arrival Check-In: ${booking.id}`,
          `Hi ${booking.guestName}, your stay at Aroohan Serenity Resort is in ${daysDiffCheckIn} days! Skip the front desk queue by completing check-in online: https://aroohanserenityresort.com/dashboard`
        );
        // Mock WhatsApp dispatch log
        sendNotification(
          booking.guestPhone || booking.guestEmail,
          `[WHATSAPP] Pre-Arrival Check-In Alert`,
          `Dear ${booking.guestName}, your luxury getaway is just around the corner. Please complete your pre-arrival online check-in here to secure your keys: https://aroohanserenityresort.com/dashboard`
        );
        sentLogs.push({
          bookingId: booking.id,
          guestName: booking.guestName,
          type: "Check-In Reminder",
          medium: "Email & WhatsApp"
        });
      }

      // 2. Send check-out notification / billing alert (if check-out is today)
      if (Math.abs(daysDiffCheckOut) <= 1) {
        sendNotification(
          booking.guestEmail,
          `Express Check-Out & Final Folio: ${booking.id}`,
          `Dear ${booking.guestName}, we hope you enjoyed your stay. Your express checkout is scheduled for 11:00 AM. Your final folio invoice has been prepared. Review it in your dashboard.`
        );
        sentLogs.push({
          bookingId: booking.id,
          guestName: booking.guestName,
          type: "Check-Out Alert",
          medium: "Email"
        });
      }
    }

    return res.status(200).json({
      success: true,
      processedCount: confirmedBookings.length,
      sentCount: sentLogs.length,
      dispatchedReminders: sentLogs
    });
  } catch (error) {
    console.error("Notifications remind API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
