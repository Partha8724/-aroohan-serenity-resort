// Enterprise PMS & CRM Core Business Logic Layer
// Location: C:\Users\HP\Desktop\aroohan-serenity-resort\lib\enterprise.ts

import fs from "fs";
import path from "path";

export interface CRMProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  identityDoc: string;
  loyaltyPoints: number;
  vipStatus: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM";
  preferences: string[];
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  cleanerName: string;
  status: "PENDING" | "COMPLETED";
  notes: string;
  assignedAt: string;
}

export interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  issue: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedStaff: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
}

export interface RestaurantOrder {
  id: string;
  bookingId?: string;
  tableNumber?: string;
  isRoomService: boolean;
  items: { name: string; qty: number; price: number }[];
  totalPrice: number;
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

export interface SpaBooking {
  id: string;
  bookingId: string;
  guestName: string;
  therapyName: string;
  scheduledAt: string;
  therapist: string;
  price: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export interface TransportBooking {
  id: string;
  bookingId: string;
  guestName: string;
  vehicleType: "Sedan" | "SUV" | "Luxury Coach";
  pickupLocation: string;
  dropLocation: string;
  scheduledAt: string;
  driver: string;
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  price: number;
}

export interface EventBooking {
  id: string;
  name: string;
  type: "Wedding" | "Conference" | "Corporate" | "Private";
  startTime: string;
  endTime: string;
  budget: number;
  guestCount: number;
  vendorTracking: { vendor: string; cost: number; paid: boolean }[];
  status: "CONFIRMED" | "CANCELLED";
}

export interface ChannelSyncState {
  channel: string;
  lastSyncAt: string;
  status: "ACTIVE" | "DESYNCED";
  syncedRooms: number;
}

export interface Room {
  id: string;
  name: string;
  desc: string;
  fullDesc: string;
  size: string;
  maxGuests: number;
  bedType: string;
  amenities: string[];
  price: number;
  images: string[];
  videoUrl?: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  availableCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  identityDoc: string;
  loyaltyPoints: number;
  vipStatus: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM";
  preferences: string[];
}

export interface RoomImage {
  id: string;
  roomId: string;
  url: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  gateway: string;
  gatewayTransactionId: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  paymentId: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface GuestUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  vipStatus: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM";
  preferences: string[];
  createdAt: string;
}

export interface ConciergeRequest {
  id: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  requestType: "Towels" | "Cleaning" | "WakeUp" | "Airport" | "Tour" | "Dining";
  details: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export interface StayReview {
  id: string;
  bookingId: string;
  guestName: string;
  rating: number;
  comment: string;
  photos: string[];
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "guest" | "admin";
  message: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  bookingId: string;
  guestName: string;
  messages: ChatMessage[];
  status: "active" | "archived";
  updatedAt: string;
}

const enterpriseDbPath = path.join(process.cwd(), "db_enterprise.json");

// Default initial data for simulation database
const defaultEnterpriseData = {
  profiles: [
    {
      id: "G-9081",
      name: "Arjun Mehta",
      email: "arjun@example.com",
      phone: "+91 98765 43210",
      identityDoc: "Passport: Z1234567",
      loyaltyPoints: 350,
      vipStatus: "GOLD" as const,
      preferences: ["High floor", "Himalayan Cedar Oils", "Vegan cuisine"],
    },
    {
      id: "G-7102",
      name: "Sarah Connor",
      email: "sarah.connor@example.com",
      phone: "+1 (555) 019-2831",
      identityDoc: "DL: TX-90210",
      loyaltyPoints: 120,
      vipStatus: "STANDARD" as const,
      preferences: ["Late checkout", "Quiet room"],
    }
  ] as CRMProfile[],
  guests: [
    {
      id: "G-9081",
      name: "Arjun Mehta",
      email: "arjun@example.com",
      phone: "+91 98765 43210",
      identityDoc: "Passport: Z1234567",
      loyaltyPoints: 350,
      vipStatus: "GOLD" as const,
      preferences: ["High floor", "Himalayan Cedar Oils", "Vegan cuisine"]
    },
    {
      id: "G-7102",
      name: "Sarah Connor",
      email: "sarah.connor@example.com",
      phone: "+1 (555) 019-2831",
      identityDoc: "DL: TX-90210",
      loyaltyPoints: 120,
      vipStatus: "STANDARD" as const,
      preferences: ["Late checkout", "Quiet room"]
    }
  ] as Guest[],
  room_images: [
    { id: "img_1", roomId: "room_1", url: "/images/my-room.jpg.jpg" },
    { id: "img_2", roomId: "room_1", url: "/images/gal-1.jpg" },
    { id: "img_3", roomId: "room_1", url: "/images/gal-3.jpg" },
    { id: "img_4", roomId: "room_2", url: "/images/gal-2.jpg" },
    { id: "img_5", roomId: "room_2", url: "/images/gal-4.jpg" },
    { id: "img_6", roomId: "room_2", url: "/images/gal-1.jpg" },
    { id: "img_7", roomId: "room_3", url: "/images/my-room.jpg (2).jpg" },
    { id: "img_8", roomId: "room_3", url: "/images/gal-3.jpg" },
    { id: "img_9", roomId: "room_3", url: "/images/gal-4.jpg" }
  ] as RoomImage[],
  bookings: [
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
      status: "CONFIRMED" as const,
      createdAt: new Date().toISOString(),
    }
  ],
  payments: [
    {
      id: "PAY-8724-X90A",
      bookingId: "BK-8724-X90A",
      amount: 1050,
      gateway: "Razorpay",
      gatewayTransactionId: "pay_test_ArjunTransaction1",
      status: "PAID" as const,
      createdAt: new Date().toISOString()
    }
  ] as Payment[],
  invoices: [
    {
      id: "INV-8724-X90A",
      invoiceNumber: "INV-8724-X90A",
      bookingId: "BK-8724-X90A",
      paymentId: "PAY-8724-X90A",
      pdfUrl: "/invoices/Aroohan_Invoice_BK-8724-X90A.pdf",
      createdAt: new Date().toISOString()
    }
  ] as Invoice[],
  users: [
    {
      id: "USR-9081",
      email: "arjun@example.com",
      passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // 'password'
      name: "Arjun Mehta",
      phone: "+91 98765 43210",
      loyaltyPoints: 350,
      vipStatus: "GOLD" as const,
      preferences: ["High floor", "Vegan cuisine"],
      createdAt: new Date().toISOString()
    }
  ] as GuestUser[],
  concierge_requests: [
    {
      id: "CR-001",
      bookingId: "BK-8724-X90A",
      guestName: "Arjun Mehta",
      roomNumber: "Cottage 101",
      requestType: "Towels" as const,
      details: "Please bring 2 extra pool towels to Cottage 101.",
      status: "PENDING" as const,
      createdAt: new Date().toISOString()
    }
  ] as ConciergeRequest[],
  reviews: [
    {
      id: "RV-001",
      bookingId: "BK-8724-X90A",
      guestName: "Arjun Mehta",
      rating: 5,
      comment: "Absolutely magical stay. The views of the misty pine forests are breath-taking. The outdoor rainforest shower was a true highlight!",
      photos: ["/images/gal-1.jpg", "/images/gal-3.jpg"],
      isFeatured: true,
      isApproved: true,
      createdAt: new Date().toISOString()
    }
  ] as StayReview[],
  chats: [
    {
      id: "CH-8724-X90A",
      bookingId: "BK-8724-X90A",
      guestName: "Arjun Mehta",
      messages: [
        { id: "m1", sender: "guest" as const, message: "Hi, what time is the sunset yoga tomorrow?", timestamp: new Date().toISOString() },
        { id: "m2", sender: "admin" as const, message: "Namaste Arjun! The yoga session starts at 5:30 PM on the outdoor wooden deck.", timestamp: new Date().toISOString() }
      ],
      status: "active" as const,
      updatedAt: new Date().toISOString()
    }
  ] as ChatSession[],
  housekeeping: [
    {
      id: "HK-101",
      roomNumber: "101",
      cleanerName: "Ramesh Kumar",
      status: "COMPLETED",
      notes: "Cottage vacuumed, fresh cedar scents added.",
      assignedAt: new Date().toISOString(),
    },
    {
      id: "HK-102",
      roomNumber: "102",
      cleanerName: "Priya Sharma",
      status: "PENDING",
      notes: "Turn-down service, towels replacement.",
      assignedAt: new Date().toISOString(),
    }
  ] as HousekeepingTask[],
  maintenance: [
    {
      id: "MN-901",
      roomNumber: "103",
      issue: "Solar water heater pressure drop",
      priority: "HIGH",
      assignedStaff: "Amit Singh",
      status: "OPEN",
      createdAt: new Date().toISOString(),
    }
  ] as MaintenanceTicket[],
  restaurantOrders: [
    {
      id: "FD-7011",
      bookingId: "BK-8724-X90A",
      tableNumber: "Room 101",
      isRoomService: true,
      items: [
        { name: "Forest Mushroom Soup", qty: 2, price: 18 },
        { name: "Organic Botanical Quinoa Salad", qty: 1, price: 22 }
      ],
      totalPrice: 58,
      status: "PREPARING",
      createdAt: new Date().toISOString()
    }
  ] as RestaurantOrder[],
  spaBookings: [
    {
      id: "SPA-3011",
      bookingId: "BK-8724-X90A",
      guestName: "Arjun Mehta",
      therapyName: "Tibetan Sound Cleansing & Cedar Mud Wrap",
      scheduledAt: "2026-06-16T14:00:00Z",
      therapist: "Tenzin Gyatso",
      price: 150,
      status: "SCHEDULED"
    }
  ] as SpaBooking[],
  transportBookings: [
    {
      id: "TR-5011",
      bookingId: "BK-8724-X90A",
      guestName: "Arjun Mehta",
      vehicleType: "SUV",
      pickupLocation: "Kangra Airport (DHM)",
      dropLocation: "Aroohan Resort Valleys",
      scheduledAt: "2026-06-15T09:30:00Z",
      driver: "Manish Dev",
      status: "SCHEDULED",
      price: 90
    }
  ] as TransportBooking[],
  events: [
    {
      id: "EV-1002",
      name: "Mehta Wedding Vows Renewal",
      type: "Wedding",
      startTime: "2026-06-17T17:00:00Z",
      endTime: "2026-06-17T23:00:00Z",
      budget: 8500,
      guestCount: 30,
      vendorTracking: [
        { vendor: "Forest Florals Design", cost: 2500, paid: true },
        { vendor: "Vedic Fire Catering", cost: 4500, paid: false }
      ],
      status: "CONFIRMED"
    }
  ] as EventBooking[],
  channels: [
    { channel: "Booking.com", lastSyncAt: new Date().toISOString(), status: "ACTIVE", syncedRooms: 3 },
    { channel: "Airbnb", lastSyncAt: new Date().toISOString(), status: "ACTIVE", syncedRooms: 2 },
    { channel: "Agoda", lastSyncAt: new Date().toISOString(), status: "ACTIVE", syncedRooms: 3 },
    { channel: "Expedia", lastSyncAt: new Date().toISOString(), status: "ACTIVE", syncedRooms: 3 }
  ] as ChannelSyncState[],
  rooms: [
    {
      id: "room_1",
      name: "Luxury Serenity Cottage",
      desc: "A hand-crafted timber cottage with double-glazed panoramic windows overlooking the misty forest canopy.",
      fullDesc: "A hand-crafted timber cottage with double-glazed panoramic windows overlooking the misty forest canopy. Features a private cedarwood deck, custom wool elements, and an outdoor copper shower.",
      size: "45 sq m",
      maxGuests: 2,
      bedType: "King Size",
      amenities: [
        "100% Certified Eco-Conscious Architecture",
        "Private Outdoor Rainforest Copper Shower",
        "On-Site Green Solar & Micro-Hydro Power Grid",
        "Organic Bamboo Linens & Natural Thermal Bedding",
        "Panoramic Visual Fields Overlooking Protected Wilds"
      ],
      price: 350,
      images: [
        "/images/my-room.jpg.jpg",
        "/images/gal-1.jpg",
        "/images/gal-3.jpg"
      ],
      videoUrl: "/videos/my-video.mp4 (2).mp4",
      checkInTime: "02:00 PM",
      checkOutTime: "11:00 AM",
      cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
      availableCount: 3
    },
    {
      id: "room_2",
      name: "Ocean Vista Villa",
      desc: "A floating ocean-front sanctuary built on copper pilings. Floor-to-ceiling glass doors open directly to a private deep-water infinity plunge pool.",
      fullDesc: "A floating ocean-front sanctuary built on copper pilings. Floor-to-ceiling glass doors open directly to a private deep-water infinity plunge pool and marine reef steps. Experience luxury on the water.",
      size: "60 sq m",
      maxGuests: 3,
      bedType: "King Size + Daybed",
      amenities: [
        "Floating Ocean-Front Architecture",
        "Private Deep-Water Infinity Plunge Pool",
        "Floor-to-Ceiling Glass Doors",
        "Marine Reef Access Steps",
        "Eco-Conscious Cooling & Filtration"
      ],
      price: 550,
      images: [
        "/images/gal-2.jpg",
        "/images/gal-4.jpg",
        "/images/gal-1.jpg"
      ],
      videoUrl: "/videos/my-video.mp4.mp4",
      checkInTime: "02:00 PM",
      checkOutTime: "11:00 AM",
      cancellationPolicy: "Free cancellation up to 72 hours prior to arrival.",
      availableCount: 2
    },
    {
      id: "room_3",
      name: "Forest Canopy Retreat",
      desc: "Elevated treehouse architecture constructed from native bamboo and light pine. Features an organic skylight for night stargazing.",
      fullDesc: "Elevated treehouse architecture constructed from native bamboo and light pine. Features an organic skylight for night stargazing, suspended hammocks, and custom solar energy generation panels.",
      size: "55 sq m",
      maxGuests: 4,
      bedType: "Two Double Beds",
      amenities: [
        "Elevated Treehouse Construction",
        "Organic Skylight for Night Stargazing",
        "Suspended Forest Canopy Hammocks",
        "Native Bamboo & Light Pine Elements",
        "Private Cedar Balcony with Valley View"
      ],
      price: 450,
      images: [
        "/images/my-room.jpg (2).jpg",
        "/images/gal-3.jpg",
        "/images/gal-4.jpg"
      ],
      videoUrl: "/videos/my-video.mp4 (3).mp4",
      checkInTime: "02:00 PM",
      checkOutTime: "11:00 AM",
      cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
      availableCount: 4
    }
  ] as Room[],
  coupons: [
    {
      id: "cp_1",
      code: "WELCOME20",
      discountPercentage: 20,
      validFrom: "2026-01-01",
      validTo: "2027-12-31",
      isActive: true
    },
    {
      id: "cp_2",
      code: "SERENITY10",
      discountPercentage: 10,
      validFrom: "2026-01-01",
      validTo: "2027-12-31",
      isActive: true
    }
  ] as Coupon[]
};

const readEnterpriseDb = () => {
  try {
    if (!fs.existsSync(enterpriseDbPath)) {
      fs.writeFileSync(enterpriseDbPath, JSON.stringify(defaultEnterpriseData, null, 2), "utf-8");
      return defaultEnterpriseData;
    }
    const data = JSON.parse(fs.readFileSync(enterpriseDbPath, "utf-8"));
    let updated = false;
    if (!data.rooms) {
      data.rooms = defaultEnterpriseData.rooms;
      updated = true;
    }
    if (!data.coupons) {
      data.coupons = defaultEnterpriseData.coupons;
      updated = true;
    }
    if (!data.guests) {
      data.guests = defaultEnterpriseData.guests;
      updated = true;
    }
    if (!data.room_images) {
      data.room_images = defaultEnterpriseData.room_images;
      updated = true;
    }
    if (!data.bookings) {
      data.bookings = defaultEnterpriseData.bookings;
      updated = true;
    }
    if (!data.payments) {
      data.payments = defaultEnterpriseData.payments;
      updated = true;
    }
    if (!data.invoices) {
      data.invoices = defaultEnterpriseData.invoices;
      updated = true;
    }
    if (!data.users) {
      data.users = defaultEnterpriseData.users;
      updated = true;
    }
    if (!data.concierge_requests) {
      data.concierge_requests = defaultEnterpriseData.concierge_requests;
      updated = true;
    }
    if (!data.reviews) {
      data.reviews = defaultEnterpriseData.reviews;
      updated = true;
    }
    if (!data.chats) {
      data.chats = defaultEnterpriseData.chats;
      updated = true;
    }
    if (updated) {
      fs.writeFileSync(enterpriseDbPath, JSON.stringify(data, null, 2), "utf-8");
    }
    return data;
  } catch (error) {
    console.error("Enterprise read error:", error);
    return defaultEnterpriseData;
  }
};

const writeEnterpriseDb = (data: typeof defaultEnterpriseData) => {
  try {
    fs.writeFileSync(enterpriseDbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Enterprise write error:", error);
    return false;
  }
};

// ========================================================
// BUSINESS API INTERFACE EXPOSURES
// ========================================================

// PMS Operations
export const getHousekeeping = (): HousekeepingTask[] => readEnterpriseDb().housekeeping;
export const updateHousekeeping = (id: string, status: "PENDING" | "COMPLETED", notes: string) => {
  const db = readEnterpriseDb();
  db.housekeeping = db.housekeeping.map((hk: HousekeepingTask) => 
    hk.id === id ? { ...hk, status, notes } : hk
  );
  writeEnterpriseDb(db);
};

export const getMaintenance = (): MaintenanceTicket[] => readEnterpriseDb().maintenance;
export const createMaintenance = (roomNumber: string, issue: string, priority: "LOW" | "MEDIUM" | "HIGH", assignedStaff: string) => {
  const db = readEnterpriseDb();
  const ticket: MaintenanceTicket = {
    id: `MN-${Math.floor(100 + Math.random() * 900)}`,
    roomNumber,
    issue,
    priority,
    assignedStaff,
    status: "OPEN",
    createdAt: new Date().toISOString()
  };
  db.maintenance.push(ticket);
  writeEnterpriseDb(db);
  return ticket;
};
export const resolveMaintenance = (id: string) => {
  const db = readEnterpriseDb();
  db.maintenance = db.maintenance.map((mn: MaintenanceTicket) =>
    mn.id === id ? { ...mn, status: "RESOLVED" } : mn
  );
  writeEnterpriseDb(db);
};

// CRM Profiles & Loyalty points calculator
export const getCRMProfiles = (): CRMProfile[] => readEnterpriseDb().profiles;
export const incrementLoyaltyPoints = (email: string, points: number) => {
  const db = readEnterpriseDb();
  db.profiles = db.profiles.map((p: CRMProfile) => {
    if (p.email === email) {
      const newPoints = p.loyaltyPoints + points;
      let newVip = p.vipStatus;
      if (newPoints >= 1000) newVip = "PLATINUM";
      else if (newPoints >= 500) newVip = "GOLD";
      else if (newPoints >= 200) newVip = "SILVER";
      return { ...p, loyaltyPoints: newPoints, vipStatus: newVip };
    }
    return p;
  });
  writeEnterpriseDb(db);
};

// Restaurant orders queue
export const getRestaurantOrders = (): RestaurantOrder[] => readEnterpriseDb().restaurantOrders;
export const updateRestaurantOrder = (id: string, status: RestaurantOrder["status"]) => {
  const db = readEnterpriseDb();
  db.restaurantOrders = db.restaurantOrders.map((ord: RestaurantOrder) =>
    ord.id === id ? { ...ord, status } : ord
  );
  writeEnterpriseDb(db);
};

// Spa scheduler
export const getSpaBookings = (): SpaBooking[] => readEnterpriseDb().spaBookings;
export const updateSpaBooking = (id: string, status: SpaBooking["status"]) => {
  const db = readEnterpriseDb();
  db.spaBookings = db.spaBookings.map((spa: SpaBooking) =>
    spa.id === id ? { ...spa, status } : spa
  );
  writeEnterpriseDb(db);
};

// Transport pickups
export const getTransportBookings = (): TransportBooking[] => readEnterpriseDb().transportBookings;
export const updateTransportBooking = (id: string, status: TransportBooking["status"]) => {
  const db = readEnterpriseDb();
  db.transportBookings = db.transportBookings.map((tr: TransportBooking) =>
    tr.id === id ? { ...tr, status } : tr
  );
  writeEnterpriseDb(db);
};

// Event operations
export const getEventBookings = (): EventBooking[] => readEnterpriseDb().events;
export const updateEventBooking = (id: string, status: EventBooking["status"]) => {
  const db = readEnterpriseDb();
  db.events = db.events.map((ev: EventBooking) =>
    ev.id === id ? { ...ev, status } : ev
  );
  writeEnterpriseDb(db);
};

// Channel synchronizer status logs
export const getChannels = (): ChannelSyncState[] => readEnterpriseDb().channels;
export const syncChannels = () => {
  const db = readEnterpriseDb();
  db.channels = db.channels.map((ch: ChannelSyncState) => ({
    ...ch,
    lastSyncAt: new Date().toISOString(),
    status: "ACTIVE"
  }));
  writeEnterpriseDb(db);
};

// Communication Gateway API (Simulated Resend, SMS, Nodemailer triggers)
export const sendNotification = (email: string, subject: string, message: string) => {
  console.log(`[COMMUNICATION GATEWAY] Target: ${email} | Subject: ${subject}`);
  console.log(`[BODY]: ${message}`);
  // In production, integrate resend:
  // await resend.emails.send({ from: 'Aroohan Resort <concierge@aroohan.com>', to: email, subject, html: message });
  return true;
};

// Advanced Dynamic Pricing Engine
export const calculateDynamicRate = (
  basePrice: number,
  checkInDate: string,
  checkOutDate: string
): { total: number; breakdown: { date: string; rate: number }[] } => {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const breakdown: { date: string; rate: number }[] = [];
  let total = 0;

  // Iterate date-by-date to check weekends/holidays
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const currentDateStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6; // Sunday/Saturday
    
    // Holiday configuration calendar mapping (Simulated Peak Season Months: Dec 15 - Jan 10)
    const month = d.getMonth(); // 0-indexed (11 is December, 0 is January)
    const date = d.getDate();
    const isHoliday = (month === 11 && date >= 15) || (month === 0 && date <= 10);

    let rate = basePrice;
    if (isHoliday) {
      rate = basePrice * 1.5; // Holiday markup 50%
    } else if (isWeekend) {
      rate = basePrice * 1.2; // Weekend markup 20%
    }

    total += rate;
    breakdown.push({ date: currentDateStr, rate });
  }

  return { total, breakdown };
};

// Rooms Operations
export const getRooms = (): Room[] => readEnterpriseDb().rooms || [];
export const createRoom = (room: Omit<Room, "id">) => {
  const db = readEnterpriseDb();
  const newRoom: Room = {
    ...room,
    id: `room_${Math.floor(1000 + Math.random() * 9000)}`
  };
  db.rooms = db.rooms || [];
  db.rooms.push(newRoom);
  writeEnterpriseDb(db);
  return newRoom;
};
export const updateRoom = (id: string, roomData: Partial<Room>) => {
  const db = readEnterpriseDb();
  db.rooms = (db.rooms || []).map((r: Room) =>
    r.id === id ? { ...r, ...roomData } : r
  );
  writeEnterpriseDb(db);
  return db.rooms.find((r: Room) => r.id === id);
};
export const deleteRoom = (id: string) => {
  const db = readEnterpriseDb();
  db.rooms = (db.rooms || []).filter((r: Room) => r.id !== id);
  writeEnterpriseDb(db);
  return true;
};

// Coupons Operations
export const getCoupons = (): Coupon[] => readEnterpriseDb().coupons || [];
export const createCoupon = (coupon: Omit<Coupon, "id">) => {
  const db = readEnterpriseDb();
  const newCoupon: Coupon = {
    ...coupon,
    id: `cp_${Math.floor(1000 + Math.random() * 9000)}`
  };
  db.coupons = db.coupons || [];
  db.coupons.push(newCoupon);
  writeEnterpriseDb(db);
  return newCoupon;
};
export const updateCoupon = (id: string, couponData: Partial<Coupon>) => {
  const db = readEnterpriseDb();
  db.coupons = (db.coupons || []).map((c: Coupon) =>
    c.id === id ? { ...c, ...couponData } : c
  );
  writeEnterpriseDb(db);
  return db.coupons.find((c: Coupon) => c.id === id);
};
export const deleteCoupon = (id: string) => {
  const db = readEnterpriseDb();
  db.coupons = (db.coupons || []).filter((c: Coupon) => c.id !== id);
  writeEnterpriseDb(db);
  return true;
};

// Guests Operations
export const getGuests = (): Guest[] => readEnterpriseDb().guests || [];
export const createGuest = (guest: Omit<Guest, "id">) => {
  const db = readEnterpriseDb();
  const newGuest: Guest = {
    ...guest,
    id: `G-${Math.floor(1000 + Math.random() * 9000)}`
  };
  db.guests = db.guests || [];
  db.guests.push(newGuest);
  writeEnterpriseDb(db);
  return newGuest;
};

// Room Images Operations
export const getRoomImages = (): RoomImage[] => readEnterpriseDb().room_images || [];

// Payments Operations
export const getPayments = (): Payment[] => readEnterpriseDb().payments || [];
export const createPayment = (payment: Omit<Payment, "id" | "createdAt">) => {
  const db = readEnterpriseDb();
  const newPayment: Payment = {
    ...payment,
    id: `PAY-8724-${cryptoRandomHex(2)}`,
    createdAt: new Date().toISOString()
  };
  db.payments = db.payments || [];
  db.payments.push(newPayment);
  writeEnterpriseDb(db);
  return newPayment;
};

// Invoices Operations
export const getInvoices = (): Invoice[] => readEnterpriseDb().invoices || [];
export const createInvoice = (invoice: Omit<Invoice, "id" | "createdAt">) => {
  const db = readEnterpriseDb();
  const newInvoice: Invoice = {
    ...invoice,
    id: `INV-8724-${cryptoRandomHex(2)}`,
    createdAt: new Date().toISOString()
  };
  db.invoices = db.invoices || [];
  db.invoices.push(newInvoice);
  writeEnterpriseDb(db);
  return newInvoice;
};

// Users Operations
export const getUsers = (): GuestUser[] => readEnterpriseDb().users || [];
export const createUser = (user: Omit<GuestUser, "id" | "createdAt" | "loyaltyPoints" | "vipStatus">) => {
  const db = readEnterpriseDb();
  const newUser: GuestUser = {
    ...user,
    id: `USR-8724-${cryptoRandomHex(2)}`,
    loyaltyPoints: 0,
    vipStatus: "STANDARD",
    createdAt: new Date().toISOString()
  };
  db.users = db.users || [];
  db.users.push(newUser);
  writeEnterpriseDb(db);
  return newUser;
};
export const updateUser = (id: string, data: Partial<GuestUser>) => {
  const db = readEnterpriseDb();
  db.users = (db.users || []).map((u: GuestUser) =>
    u.id === id ? { ...u, ...data } : u
  );
  writeEnterpriseDb(db);
  return db.users.find((u: GuestUser) => u.id === id);
};

// Concierge Operations
export const getConciergeRequests = (): ConciergeRequest[] => readEnterpriseDb().concierge_requests || [];
export const createConciergeRequest = (req: Omit<ConciergeRequest, "id" | "createdAt" | "status">) => {
  const db = readEnterpriseDb();
  const newReq: ConciergeRequest = {
    ...req,
    id: `CR-8724-${cryptoRandomHex(2)}`,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };
  db.concierge_requests = db.concierge_requests || [];
  db.concierge_requests.push(newReq);
  writeEnterpriseDb(db);
  return newReq;
};
export const updateConciergeRequest = (id: string, status: ConciergeRequest["status"]) => {
  const db = readEnterpriseDb();
  db.concierge_requests = (db.concierge_requests || []).map((r: ConciergeRequest) =>
    r.id === id ? { ...r, status } : r
  );
  writeEnterpriseDb(db);
  return db.concierge_requests.find((r: ConciergeRequest) => r.id === id);
};

// Reviews Operations
export const getReviews = (): StayReview[] => readEnterpriseDb().reviews || [];
export const createReview = (review: Omit<StayReview, "id" | "createdAt" | "isFeatured" | "isApproved">) => {
  const db = readEnterpriseDb();
  const newReview: StayReview = {
    ...review,
    id: `RV-8724-${cryptoRandomHex(2)}`,
    isFeatured: false,
    isApproved: false,
    createdAt: new Date().toISOString()
  };
  db.reviews = db.reviews || [];
  db.reviews.push(newReview);
  writeEnterpriseDb(db);
  return newReview;
};
export const moderateReview = (id: string, isApproved: boolean, isFeatured: boolean) => {
  const db = readEnterpriseDb();
  db.reviews = (db.reviews || []).map((r: StayReview) =>
    r.id === id ? { ...r, isApproved, isFeatured } : r
  );
  writeEnterpriseDb(db);
  return db.reviews.find((r: StayReview) => r.id === id);
};

// Live Chat Support Operations
export const getChats = (): ChatSession[] => readEnterpriseDb().chats || [];
export const addChatMessage = (bookingId: string, guestName: string, sender: "guest" | "admin", message: string) => {
  const db = readEnterpriseDb();
  db.chats = db.chats || [];
  let session = db.chats.find((c: ChatSession) => c.bookingId === bookingId);
  if (!session) {
    session = {
      id: `CH-8724-${bookingId.split("-")[2] || cryptoRandomHex(2)}`,
      bookingId,
      guestName,
      messages: [],
      status: "active",
      updatedAt: new Date().toISOString()
    };
    db.chats.push(session);
  }
  const newMsg: ChatMessage = {
    id: `MSG-${cryptoRandomHex(3)}`,
    sender,
    message,
    timestamp: new Date().toISOString()
  };
  session.messages.push(newMsg);
  session.status = "active";
  session.updatedAt = new Date().toISOString();
  
  db.chats = db.chats.map((c: ChatSession) => c.bookingId === bookingId ? session! : c);
  writeEnterpriseDb(db);
  return session;
};

// Small helper for random suffix
function cryptoRandomHex(bytes: number): string {
  try {
    const crypto = require("crypto");
    return crypto.randomBytes(bytes).toString("hex").toUpperCase();
  } catch (e) {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}

