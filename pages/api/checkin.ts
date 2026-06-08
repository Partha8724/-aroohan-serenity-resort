import type { NextApiRequest, NextApiResponse } from "next";
import { readDatabase, writeDatabase } from "../../lib/db";
import { readEnterpriseDb, writeEnterpriseDb } from "../../lib/enterprise";

// Generates a valid vector representation of a QR Code
function generateMockQRCodeSVG(data: string) {
  const size = 180;
  const grid = 21;
  const boxSize = size / grid;
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">`;
  svg += `<rect width="${size}" height="${size}" fill="#FFFFFF" />`;

  const drawFinder = (x: number, y: number) => {
    const bx = x * boxSize;
    const by = y * boxSize;
    svg += `<rect x="${bx}" y="${by}" width="${boxSize * 7}" height="${boxSize * 7}" fill="#0F172A" />`;
    svg += `<rect x="${bx + boxSize}" y="${by + boxSize}" width="${boxSize * 5}" height="${boxSize * 5}" fill="#FFFFFF" />`;
    svg += `<rect x="${bx + boxSize * 2}" y="${by + boxSize * 2}" width="${boxSize * 3}" height="${boxSize * 3}" fill="#10B981" />`;
  };

  // 3 Finder patterns
  drawFinder(0, 0);
  drawFinder(14, 0);
  drawFinder(0, 14);

  // 1 Alignment pattern
  const ax = 14 * boxSize;
  const ay = 14 * boxSize;
  svg += `<rect x="${ax}" y="${ay}" width="${boxSize * 5}" height="${boxSize * 5}" fill="#0F172A" />`;
  svg += `<rect x="${ax + boxSize}" y="${ay + boxSize}" width="${boxSize * 3}" height="${boxSize * 3}" fill="#FFFFFF" />`;
  svg += `<rect x="${ax + boxSize * 2}" y="${ay + boxSize * 2}" width="${boxSize}" height="${boxSize}" fill="#10B981" />`;

  // Draw timing patterns & fake data matrix
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // Avoid finder and alignment patterns
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c > 12) ||
        (r > 12 && c < 8) ||
        (r >= 14 && r <= 18 && c >= 14 && c <= 18)
      ) {
        continue;
      }
      
      // Seeded random-like generation based on content hash
      const charCode = data.charCodeAt((r + c) % data.length) || 0;
      const isBlack = ((r * c + charCode) % 3 === 0) || ((r + c) % 5 === 0);
      if (isBlack) {
        svg += `<rect x="${c * boxSize}" y="${r * boxSize}" width="${boxSize}" height="${boxSize}" fill="#1E293B" />`;
      }
    }
  }

  svg += `</svg>`;
  return svg;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bookingId, email, arrivalTime, idDocument } = req.body;

    if (!bookingId || !email || !arrivalTime || !idDocument) {
      return res.status(400).json({ error: "Missing check-in parameter fields." });
    }

    // 1. Update main db.json
    const db = readDatabase();
    const idx = db.findIndex(
      (b) =>
        b.id.toUpperCase() === bookingId.toUpperCase().trim() &&
        b.guestEmail.toLowerCase() === email.toLowerCase().trim()
    );

    if (idx === -1) {
      return res.status(404).json({ error: "No matching reservation found to check in." });
    }

    const booking = db[idx];
    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Cannot check in to a cancelled reservation." });
    }

    const qrData = `AROOHAN-PASS-${booking.id}-${booking.guestName}`;
    const qrPassSvg = generateMockQRCodeSVG(qrData);

    db[idx] = {
      ...booking,
      checkedInOnline: true,
      arrivalTime,
      idDocument,
      qrPass: qrPassSvg
    };
    writeDatabase(db);

    // 2. Update enterprise db_enterprise.json
    const entDb = readEnterpriseDb();
    entDb.bookings = entDb.bookings || [];
    const entIdx = entDb.bookings.findIndex((b: any) => b.id === booking.id);
    if (entIdx !== -1) {
      entDb.bookings[entIdx] = {
        ...entDb.bookings[entIdx],
        checkedInOnline: true,
        arrivalTime,
        idDocument,
        qrPass: qrPassSvg
      };
      writeEnterpriseDb(entDb);
    }

    // Log simulated communications
    const { sendNotification } = require("../../lib/enterprise");
    sendNotification(
      booking.guestEmail,
      `Your Digital Boarding Pass is Ready!`,
      `Dear ${booking.guestName}, you have successfully completed online pre-arrival check-in. Your arrival time is selected as ${arrivalTime}. Present your QR Boarding Pass code upon arrival.`
    );

    return res.status(200).json({
      success: true,
      booking: db[idx]
    });
  } catch (error) {
    console.error("Check-in API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
