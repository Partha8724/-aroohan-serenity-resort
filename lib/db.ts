import fs from "fs";
import path from "path";

// Define the shape of a Booking
export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestIdentity: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

const dbFilePath = path.join(process.cwd(), "db.json");

// Default initial state if the file doesn't exist
const initialBookings: Booking[] = [
  {
    id: "BK-8724-X90A",
    guestName: "Arjun Mehta",
    guestEmail: "arjun@example.com",
    guestPhone: "+91 98765 43210",
    guestIdentity: "Passport: Z1234567",
    roomType: "Luxury Serenity Cottage",
    checkIn: "2026-06-15",
    checkOut: "2026-06-18",
    guests: 2,
    totalPrice: 1050,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "BK-8724-Y71B",
    guestName: "Sarah Connor",
    guestEmail: "sarah.connor@example.com",
    guestPhone: "+1 (555) 019-2831",
    guestIdentity: "DL: TX-90210",
    roomType: "Ocean Vista Villa",
    checkIn: "2026-07-01",
    checkOut: "2026-07-06",
    guests: 3,
    totalPrice: 2750,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  }
];

export const readDatabase = (): Booking[] => {
  try {
    /* 
      SUPABASE / FIREBASE PRODUCTION INTEGRATION EXAMPLE:
      --------------------------------------------------
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) throw error;
      return data;
    */

    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify(initialBookings, null, 2), "utf-8");
      return initialBookings;
    }
    const rawData = fs.readFileSync(dbFilePath, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Database read error:", error);
    return [];
  }
};

export const writeDatabase = (bookings: Booking[]): boolean => {
  try {
    /* 
      SUPABASE / FIREBASE PRODUCTION INTEGRATION EXAMPLE:
      --------------------------------------------------
      const { error } = await supabase.from('bookings').upsert(bookings);
      if (error) throw error;
      return true;
    */

    fs.writeFileSync(dbFilePath, JSON.stringify(bookings, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Database write error:", error);
    return false;
  }
};
