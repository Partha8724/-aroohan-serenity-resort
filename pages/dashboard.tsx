import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { CustomCursor } from "../components/ui/CustomCursor";
import { Navbar } from "../components/ui/Navbar";

interface Booking {
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
  paymentStatus?: string;
  checkedInOnline?: boolean;
  arrivalTime?: string;
  idDocument?: string;
  qrPass?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  vipStatus: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM";
  preferences: string[];
}

const translations: Record<string, Record<string, string>> = {
  EN: {
    dashboardTitle: "Guest Experience Hub",
    stays: "Stays & Check-In",
    roomService: "Room Service",
    wellness: "Wellness & Spa",
    concierge: "Digital Concierge",
    loyalty: "Loyalty Perks",
    reviews: "Stay Reviews",
    supportChat: "Support Chat",
    profile: "Profile & Preferences",
    logout: "Log Out",
    welcomeBack: "Welcome back",
    points: "points",
    vipStatus: "VIP Tier",
    bookingReference: "Booking Reference",
    checkinStatus: "Check-In Status",
    checkedIn: "Checked In",
    notCheckedIn: "Not Checked In",
    arrivalTime: "Arrival Time",
    idDoc: "ID Document",
    downloadPass: "Download Boarding Pass",
    qrPass: "QR Boarding Pass",
    completed: "Completed",
    pending: "Pending",
    cancelled: "Cancelled",
    orderFood: "Order Food & Drinks",
    cart: "Order Cart",
    placeOrder: "Place Room Service Order",
    bookTherapy: "Book Wellness Therapy",
    therapyName: "Therapy / Session",
    selectDateTime: "Select Date & Time",
    scheduledSessions: "Scheduled Sessions",
    requestService: "Request Service",
    towelRequest: "Request Extra Towels",
    cleaningRequest: "Request Room Cleaning",
    wakeupRequest: "Request Wake-Up Call",
    airportRequest: "Request Airport Transfer",
    tourRequest: "Request Local Tour",
    loyaltyTitle: "Aroohan Loyalty Sanctuary",
    tierSilver: "Silver Tier",
    tierGold: "Gold Tier",
    tierPlatinum: "Platinum Tier",
    referralPerk: "Refer a friend for 15% discount voucher",
    generateReferral: "Generate Referral Code",
    submitReview: "Submit Stay Experience",
    feedback: "Feedback & Comments",
    rating: "Rating",
    uploadPhotos: "Upload Photos (URLs)",
    chatTitle: "Live Sanctuary Chat Concierge",
    typeMessage: "Type your message...",
    send: "Send",
    savePref: "Save Preferences",
    prefPlaceholder: "e.g. High floor, Vegan cuisine, Soft pillows"
  },
  HI: {
    stays: "रहने की जगह और चेक-इन",
    roomService: "कमरा सेवा",
    wellness: "कल्याण और स्पा",
    concierge: "डिजिटल दरबान",
    loyalty: "वफादारी लाभ",
    reviews: "समीक्षाएं",
    supportChat: "सहायता चैट",
    profile: "प्रोफ़ाइल और प्राथमिकताएं",
    logout: "लॉग आउट",
    welcomeBack: "आपका स्वागत है",
    points: "अंक",
    vipStatus: "वीआईपी श्रेणी",
    bookingReference: "बुकिंग संदर्भ",
    checkinStatus: "चेक-इन स्थिति",
    checkedIn: "चेक-इन पूर्ण",
    notCheckedIn: "चेक-इन नहीं हुआ",
    arrivalTime: "आगमन समय",
    idDoc: "पहचान पत्र",
    downloadPass: "बोर्डिंग पास डाउनलोड करें",
    qrPass: "क्यूआर बोर्डिंग पास",
    completed: "पूरा हुआ",
    pending: "लंबित",
    cancelled: "रद्द",
    orderFood: "भोजन और पेय ऑर्डर करें",
    cart: "ऑर्डर कार्ट",
    placeOrder: "ऑर्डर सबमिट करें",
    bookTherapy: "कल्याण चिकित्सा बुक करें",
    therapyName: "चिकित्सा / सत्र",
    selectDateTime: "दिनांक और समय चुनें",
    scheduledSessions: "अनुसूचित सत्र",
    requestService: "सेवा का अनुरोध करें",
    towelRequest: "अतिरिक्त तौलिए मांगें",
    cleaningRequest: "कमरा सफाई मांगें",
    wakeupRequest: "वेक-अप कॉल अनुरोध",
    airportRequest: "हवाई अड्डा स्थानांतरण",
    tourRequest: "स्थानीय दौरा अनुरोध",
    loyaltyTitle: "आरूहन वफादारी अभयारण्य",
    tierSilver: "सिल्वर श्रेणी",
    tierGold: "गोल्ड श्रेणी",
    tierPlatinum: "प्लेटिनम श्रेणी",
    referralPerk: "15% छूट वाउचर के लिए मित्र को भेजें",
    generateReferral: "रेफरल कोड जनरेट करें",
    submitReview: "अनुभव साझा करें",
    feedback: "प्रतिक्रिया और टिप्पणियां",
    rating: "रेटिंग",
    uploadPhotos: "तस्वीरें अपलोड करें (URLs)",
    chatTitle: "लाइव चैट दरबान",
    typeMessage: "अपना संदेश टाइप करें...",
    send: "भेजें",
    savePref: "प्राथमिकताएं सहेजें",
    prefPlaceholder: "जैसे: ऊपरी मंजिल, शाकाहारी भोजन, मुलायम तकिए"
  },
  BN: {
    stays: "থাকার ব্যবস্থা এবং চেক-ইন",
    roomService: "রুম সার্ভিস",
    wellness: "ওয়েলনেস ও স্পা",
    concierge: "ডিজিটাল দরজারক্ষী",
    loyalty: "আনুগত্য সুবিধা",
    reviews: "পর্যালোচনা",
    supportChat: "সহায়তা চ্যাট",
    profile: "প্রোফাইল এবং পছন্দসমূহ",
    logout: "লগ আউট",
    welcomeBack: "স্বাগতম",
    points: "পয়েন্ট",
    vipStatus: "ভিআইপি টিয়ার",
    bookingReference: "বুকিং রেফারেন্স",
    checkinStatus: "চেক-ইন স্ট্যাটাস",
    checkedIn: "চেক-ইন সম্পন্ন",
    notCheckedIn: "চেক-ইন হয়নি",
    arrivalTime: "আগমনের সময়",
    idDoc: "পরিচয়পত্র",
    downloadPass: "বোর্ডিং পাস ডাউনলোড",
    qrPass: "কিউআর বোর্ডিং পাস",
    completed: "সম্পন্ন",
    pending: "মুলতুবি",
    cancelled: "বাতিল",
    orderFood: "খাবার ও পানীয় অর্ডার করুন",
    cart: "অর্ডার কার্ট",
    placeOrder: "অর্ডার প্লেস করুন",
    bookTherapy: "থেরাপি বুক করুন",
    therapyName: "থেরাপি / সেশন",
    selectDateTime: "তারিখ ও সময় নির্বাচন করুন",
    scheduledSessions: "নির্ধারিত সেশন",
    requestService: "অনুরোধ পাঠান",
    towelRequest: "অতিরিক্ত তোয়ালে",
    cleaningRequest: "রুম পরিষ্কার করার অনুরোধ",
    wakeupRequest: "ওয়েক-আপ কল",
    airportRequest: "এয়ারপোর্ট পিকআপ",
    tourRequest: "স্থানীয় ট্যুর",
    loyaltyTitle: "আরোহন আনুগত্য অভয়ারণ্য",
    tierSilver: "সিলভার টিয়ার",
    tierGold: "গোল্ড টিয়ার",
    tierPlatinum: "প্লাটিনাম টিয়ার",
    referralPerk: "১৫% ডিসকাউন্ট ভাউচারের জন্য বন্ধুকে রেফার করুন",
    generateReferral: "রেফারেল কোড তৈরি করুন",
    submitReview: "অভিজ্ঞতা শেয়ার করুন",
    feedback: "মতামত ও মন্তব্য",
    rating: "রেটিং",
    uploadPhotos: "ছবি আপলোড করুন (URLs)",
    chatTitle: "লাইভ চ্যাট কনসিয়ারেজ",
    typeMessage: "আপনার বার্তা লিখুন...",
    send: "পাঠান",
    savePref: "পছন্দ সংরক্ষণ করুন",
    prefPlaceholder: "যেমন: উপরের তলা, নিরামিষ খাবার, নরম বালিশ"
  },
  AS: {
    stays: "থকাৰ সুবিধা আৰু চেক-ইন",
    roomService: "ৰুম চাৰ্ভিচ",
    wellness: "ৱেলনেছ আৰু স্পা",
    concierge: "ডিজিটেল দৰ্জাৰক্ষী",
    loyalty: "আনুগত্য সুবিধা",
    reviews: "পৰ্যালোচনা",
    supportChat: "সহায়তা চ্যাট",
    profile: "প্ৰফাইল আৰু অগ্ৰাধিকাৰ",
    logout: "লগ আউট",
    welcomeBack: "স্বাগতম",
    points: "পইণ্ট",
    vipStatus: "ভিআইপি টিয়াৰ",
    bookingReference: "বুকিং উল্লেখন",
    checkinStatus: "চেক-ইন স্থিতি",
    checkedIn: "চেক-ইন সম্পূৰ্ণ",
    notCheckedIn: "চেক-ইন হোৱা নাই",
    arrivalTime: "আগমণৰ সময়",
    idDoc: "পৰিচয় পত্ৰ",
    downloadPass: "বৰ্ডিং পাছ ডাউনলোড",
    qrPass: "কিউআৰ বৰ্ডিং পাছ",
    completed: "সম্পূৰ্ণ",
    pending: "লম্বিত",
    cancelled: "বাতিল কৰা হৈছে",
    orderFood: "আহাৰ আৰু পানীয় অৰ্ডাৰ কৰক",
    cart: "অৰ্ডাৰ কাৰ্ট",
    placeOrder: "অৰ্ডাৰ কৰক",
    bookTherapy: "থেৰাপী বুক কৰক",
    therapyName: "থেৰাপী / অধিবেশন",
    selectDateTime: "তাৰিখ আৰু সময় বাছনি কৰক",
    scheduledSessions: "নিৰ্ধাৰিত অধিবেশনসমূহ",
    requestService: "অনুৰোধ পঠাওক",
    towelRequest: "অতিৰিক্ত টাৱেল",
    cleaningRequest: "ৰুম চাফা কৰাৰ অনুৰোধ",
    wakeupRequest: "ৱেক-আপ কল",
    airportRequest: "বিমানবন্দৰ পিকআপ",
    tourRequest: "স্থানীয় ভ্ৰমণ অনুৰোধ",
    loyaltyTitle: "আৰোহণ আনুগত্য অভয়াৰণ্য",
    tierSilver: "ছিলভাৰ টিয়াৰ",
    tierGold: "গ'ল্ড টিয়াৰ",
    tierPlatinum: "প্লেটিনাম টিয়াৰ",
    referralPerk: "১৫% ৰেহাই ভাউচাৰৰ বাবে বন্ধুক ৰেফাৰ কৰক",
    generateReferral: "ৰেফাৰেল ক'ড সৃষ্টি কৰক",
    submitReview: "অভিজ্ঞতা লিখক",
    feedback: "মন্তব্যসমূহ",
    rating: "ৰেটিং",
    uploadPhotos: "ছবি আপলোড কৰক (URLs)",
    chatTitle: "লাইভ চ্যাট কনচিয়াৰ্জ",
    typeMessage: "বাৰ্তা লিখক...",
    send: "পঠাওক",
    savePref: "অগ্ৰাধিকাৰ সংৰক্ষণ কৰক",
    prefPlaceholder: "যেনে: ওপৰ মহলা, নিৰামিষ আহাৰ, কোমল গাৰু"
  }
};

const foodMenu = [
  { id: "m1", name: "Forest Mushroom Soup", desc: "Rich cream of wild chanterelles and pine mushrooms, infused with white truffle oil.", price: 18 },
  { id: "m2", name: "Organic Botanical Quinoa Salad", desc: "Organic tricolor quinoa, wild herbs, fresh pomegranate, citrus-advocado dressing.", price: 22 },
  { id: "m3", name: "Truffle Ricotta Gnocchi", desc: "Hand-rolled potato gnocchi, black truffle paste, sheep's milk ricotta, wild sage.", price: 28 },
  { id: "m4", name: "Himalayan Trout Filet", desc: "Pan-seared river trout, lemon-dill butter, wood-fired seasonal greens.", price: 35 },
  { id: "m5", name: "Wood-Fired Wild Berry Crumble", desc: "Fresh forest berries, organic oats crumble, homemade wild honey gelato.", price: 15 }
];

const spaCatalog = [
  { name: "Tibetan Sound Cleansing & Cedar Mud Wrap", desc: "Deep relaxation using singing bowls and therapeutic forest clay wrap.", price: 150 },
  { name: "Himalayan Hot Stone Forest Massage", desc: "75-min alignment massage with basalt stones infused with local pine oils.", price: 180 },
  { name: "Pranayama Breathwork & Sunrise Vinyasa", desc: "Group alignment flow on the outdoor wooden overlook deck.", price: 60 },
  { name: "Deep Forest Bathing & Meditation Walk", desc: "Guided mindfulness excursion through the sanctuary pine trails.", price: 50 }
];

export default function CustomerDashboard() {
  // Lang Toggle
  const [lang, setLang] = useState("EN");

  // Auth States
  const [authTab, setAuthTab] = useState<"login" | "register" | "forgot">("login");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPreferences, setAuthPreferences] = useState("");

  // Booking direct search states (backwards compatibility)
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  // General Status
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Tab workspace state
  const [activeTab, setActiveTab] = useState<"stays" | "dining" | "wellness" | "concierge" | "loyalty" | "reviews" | "chat" | "profile">("stays");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Operational states
  // Check-In Inputs
  const [arrivalTime, setArrivalTime] = useState("14:00");
  const [idDocType, setIdDocType] = useState("Passport");
  const [idDocDetails, setIdDocDetails] = useState("");
  const [idFileName, setIdFileName] = useState("");

  // Room Service cart
  const [cart, setCart] = useState<Record<string, number>>({});
  const [roomServiceOrders, setRoomServiceOrders] = useState<any[]>([]);

  // Wellness Inputs
  const [selectedTherapy, setSelectedTherapy] = useState(spaCatalog[0].name);
  const [spaDateTime, setSpaDateTime] = useState("");
  const [spaBookings, setSpaBookings] = useState<any[]>([]);

  // Concierge history
  const [conciergeRequests, setConciergeRequests] = useState<any[]>([]);
  const [customConciergeText, setCustomConciergeText] = useState("");

  // Loyalty Referral Vouchers
  const [referralCode, setReferralCode] = useState("");

  // Review Feedback Inputs
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState("");
  const [myReviews, setMyReviews] = useState<any[]>([]);

  // Support Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Translation helper
  const t = (key: string) => {
    return translations[lang]?.[key] || translations["EN"]?.[key] || key;
  };

  // Check for stored token and load from query params on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }

    const params = new URLSearchParams(window.location.search);
    const qId = params.get("id");
    const qEmail = params.get("email");
    if (qId && qEmail) {
      setBookingId(qId);
      setEmail(qEmail);
      autoLookup(qId, qEmail);
    }
  }, []);

  // Poll chat message queue if Chat Tab is active and booking is loaded
  useEffect(() => {
    if (activeTab !== "chat" || !selectedBooking) return;
    
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chat/message?bookingId=${selectedBooking.id}`);
        const data = await res.json();
        if (data.success && data.session) {
          setChatMessages(data.session.messages || []);
        }
      } catch (err) {
        console.error("Chat polling error", err);
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 4000);
    return () => clearInterval(interval);
  }, [activeTab, selectedBooking]);

  // Scroll chat window to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const fetchProfile = async (tk: string) => {
    try {
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${tk}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setUserBookings(data.bookings || []);
        if (data.bookings && data.bookings.length > 0) {
          // Auto select first booking as active
          setSelectedBooking(data.bookings[0]);
          loadOperationalData(data.bookings[0]);
        }
      } else {
        // Token expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadOperationalData = async (bk: Booking) => {
    try {
      // 1. Fetch Room Service Orders
      const orderRes = await fetch(`/api/restaurant?bookingId=${bk.id}`);
      const orderData = await orderRes.json();
      if (orderData.success) {
        setRoomServiceOrders(orderData.orders || []);
      }

      // 2. Fetch Spa Bookings
      const spaRes = await fetch("/api/spa");
      const spaData = await spaRes.json();
      if (spaData.success) {
        const filtered = (spaData.bookings || []).filter((s: any) => s.bookingId === bk.id);
        setSpaBookings(filtered);
      }

      // 3. Fetch Concierge Requests
      const conciergeRes = await fetch(`/api/concierge/request?bookingId=${bk.id}`);
      const conciergeData = await conciergeRes.json();
      if (conciergeData.success) {
        setConciergeRequests(conciergeData.requests || []);
      }

      // 4. Fetch Reviews
      const reviewRes = await fetch("/api/reviews");
      const reviewData = await reviewRes.json();
      if (reviewData.success) {
        const filtered = (reviewData.reviews || []).filter((r: any) => r.bookingId === bk.id);
        setMyReviews(filtered);
      }
    } catch (e) {
      console.error("Failed loading operational details", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setUserBookings([]);
    setSelectedBooking(null);
  };

  const autoLookup = async (id: string, mail: string) => {
    setIsLoading(true);
    setErrorMsg("");
    setBooking(null);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, email: mail }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
        // Also feed this into selectedBooking for tabs workspace
        setSelectedBooking(data.booking);
        loadOperationalData(data.booking);
      } else {
        setErrorMsg(data.error || "No matching reservation found.");
      }
    } catch (err) {
      setErrorMsg("Connection error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !email) {
      setErrorMsg("Please fill out both search parameters.");
      return;
    }
    autoLookup(bookingId, email);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (authTab === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          fetchProfile(data.token);
          setSuccessMsg("Logged in successfully.");
        } else {
          setErrorMsg(data.error || "Login failed.");
        }
      } else if (authTab === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            phone: authPhone,
            password: authPassword,
            preferences: authPreferences.split(",").map(p => p.trim()).filter(Boolean)
          }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          fetchProfile(data.token);
          setSuccessMsg("Account registered successfully!");
        } else {
          setErrorMsg(data.error || "Registration failed.");
        }
      } else {
        // Forgot password
        const res = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMsg("Simulated reset link has been printed to the server logs.");
        } else {
          setErrorMsg(data.error || "Forgot password failed.");
        }
      }
    } catch (err) {
      setErrorMsg("Connection error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          preferences: user.preferences
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSuccessMsg("Profile updated successfully.");
      } else {
        setErrorMsg(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setErrorMsg("Network error.");
    }
  };

  const handleOnlineCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          email: selectedBooking.guestEmail,
          arrivalTime,
          idDocument: `${idDocType}: ${idDocDetails} (${idFileName || "doc_attachment.jpg"})`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(data.booking);
        // Refresh bookings lists
        if (token) fetchProfile(token);
        setSuccessMsg("Pre-arrival check-in complete! Your digital boarding pass QR is active.");
      } else {
        setErrorMsg(data.error || "Check-in failed.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderRoomService = async () => {
    if (!selectedBooking) return;
    const items = Object.entries(cart)
      .map(([id, qty]) => {
        const menuItem = foodMenu.find((m) => m.id === id);
        return menuItem ? { name: menuItem.name, qty, price: menuItem.price } : null;
      })
      .filter(Boolean);

    if (items.length === 0) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          bookingId: selectedBooking.id,
          tableNumber: `Room: ${selectedBooking.id.split("-")[2]}`,
          isRoomService: true,
          items
        })
      });
      const data = await res.json();
      if (data.success) {
        setCart({});
        setSuccessMsg("Dining order placed! Chef is reviewing details.");
        loadOperationalData(selectedBooking);
      } else {
        setErrorMsg(data.error || "Order placement failed.");
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    }
  };

  const handleBookWellness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !spaDateTime) return;
    setErrorMsg("");
    setSuccessMsg("");

    const matchingTherapy = spaCatalog.find(s => s.name === selectedTherapy);
    const price = matchingTherapy ? matchingTherapy.price : 100;

    try {
      const res = await fetch("/api/spa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_spa",
          bookingId: selectedBooking.id,
          guestName: selectedBooking.guestName,
          therapyName: selectedTherapy,
          scheduledAt: spaDateTime,
          price
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Wellness therapy appointment scheduled!");
        loadOperationalData(selectedBooking);
      } else {
        setErrorMsg(data.error || "Wellness scheduling failed.");
      }
    } catch (err) {
      setErrorMsg("Network error.");
    }
  };

  const handleConciergeRequest = async (type: string, detailsText?: string) => {
    if (!selectedBooking) return;
    setErrorMsg("");
    setSuccessMsg("");

    const details = detailsText || `Requested ${type} for sanctuary room.`;

    try {
      const res = await fetch("/api/concierge/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          guestName: selectedBooking.guestName,
          roomNumber: `Sanctuary: ${selectedBooking.id.split("-")[2]}`,
          requestType: type,
          details
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Digital concierge request for ${type} submitted!`);
        if (detailsText) setCustomConciergeText("");
        loadOperationalData(selectedBooking);
      } else {
        setErrorMsg(data.error || "Request failed.");
      }
    } catch (err) {
      setErrorMsg("Network error.");
    }
  };

  const handleGenerateReferral = () => {
    const code = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferralCode(code);
    setSuccessMsg(`Referral Code: ${code} generated. 15% discount registered in coupons!`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !reviewComment) return;
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          guestName: selectedBooking.guestName,
          rating: reviewRating,
          comment: reviewComment,
          photos: reviewPhotos.split(",").map(p => p.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewComment("");
        setReviewPhotos("");
        setSuccessMsg("Review submitted for moderation review.");
        loadOperationalData(selectedBooking);
      } else {
        setErrorMsg(data.error || "Review submission failed.");
      }
    } catch (err) {
      setErrorMsg("Network failure.");
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !chatInput.trim()) return;

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          guestName: selectedBooking.guestName,
          sender: "guest",
          message: chatInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatInput("");
        setChatMessages(data.session.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // jsPDF Invoice Downloader (preserving the original exactly)
  const handleDownloadInvoice = async () => {
    const activeBk = selectedBooking || booking;
    if (!activeBk) return;
    try {
      const jspdfModule: any = await new Promise((resolve) => {
        if ((window as any).jspdf) {
          resolve((window as any).jspdf);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = () => resolve((window as any).jspdf);
        document.body.appendChild(script);
      });

      const doc = new jspdfModule.jsPDF();
      const nights = Math.max(1, Math.ceil((new Date(activeBk.checkOut).getTime() - new Date(activeBk.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
      const basePrice = activeBk.totalPrice / 1.23; // Estimate back base rate before tax/gst
      const gst = basePrice * 0.18;
      const luxuryTax = basePrice * 0.05;

      // Header Banner
      doc.setFillColor(11, 61, 46); // Forest Green
      doc.rect(0, 0, 210, 42, "F");

      doc.setTextColor(245, 240, 225); // Cream
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AROOHAN SERENITY RESORT", 20, 26);

      doc.setTextColor(17, 17, 17);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("GUEST TAX INVOICE", 20, 56);
      doc.setFont("helvetica", "normal");

      doc.text(`Booking Reference ID: ${activeBk.id}`, 20, 66);
      doc.text(`Reservation ID: RES-8724-${activeBk.id.split("-")[2]}`, 20, 73);
      doc.text(`Invoice ID: INV-8724-${activeBk.id.split("-")[2]}`, 20, 80);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 87);

      doc.setDrawColor(184, 155, 114);
      doc.line(20, 93, 190, 93);

      // Guest Details
      doc.setFont("helvetica", "bold");
      doc.text("GUEST PARTICULARS", 20, 103);
      doc.setFont("helvetica", "normal");
      doc.text(`Lead Guest: ${activeBk.guestName}`, 20, 111);
      doc.text(`Email: ${activeBk.guestEmail} | Phone: ${activeBk.guestPhone}`, 20, 118);
      doc.text(`Identity/Address: ${activeBk.guestIdentity}`, 20, 125);

      // Booking details
      doc.setFont("helvetica", "bold");
      doc.text("ACCOMMODATION & SERVICES", 20, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Room Sanctuary: ${activeBk.roomType}`, 20, 147);
      doc.text(`Stay Window: ${activeBk.checkIn} to ${activeBk.checkOut} (${nights} Nights)`, 20, 154);
      doc.text(`Guests count: ${activeBk.guests} Guests`, 20, 161);

      // Financial grid
      doc.line(20, 169, 190, 169);
      doc.setFont("helvetica", "bold");
      doc.text(`Base Cottage Rate:`, 20, 177);
      doc.text(`$${Math.round(basePrice)}.00 USD`, 150, 177);
      doc.setFont("helvetica", "normal");
      doc.text(`Resort Luxury Tax (5%):`, 20, 185);
      doc.text(`$${Math.round(luxuryTax)}.00 USD`, 150, 185);
      doc.text(`GST / CGST (18%):`, 20, 192);
      doc.text(`$${Math.round(gst)}.00 USD`, 150, 192);
      
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL AMOUNT PAID (Net):`, 20, 202);
      doc.text(`$${activeBk.totalPrice}.00 USD`, 150, 202);

      // Footer
      doc.setFillColor(245, 240, 225);
      doc.rect(20, 215, 170, 22, "F");
      doc.setTextColor(11, 61, 46);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Payment received via Razorpay Gateway. Verified by Aroohan Concierge.", 26, 228);

      doc.save(`Aroohan_Invoice_${activeBk.id}.pdf`);
    } catch (error) {
      alert("Invoice export failed.");
    }
  };

  // Express Cancel Booking (preserving original)
  const handleCancelBooking = async () => {
    const activeBk = selectedBooking || booking;
    if (!activeBk) return;
    setIsCancelling(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: activeBk.id, email: activeBk.guestEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Cancellation request processed successfully.");
        if (booking) setBooking(data.booking);
        if (selectedBooking) setSelectedBooking(data.booking);
        if (token) fetchProfile(token);
        setShowCancelConfirm(false);
      } else {
        setErrorMsg(data.error || "Cancellation request failed.");
      }
    } catch (err) {
      setErrorMsg("Network failure, try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Head>
        <title>Guest Hub Dashboard | Aroohan Serenity Resort</title>
        <meta name="description" content="View your reservation particulars, download tax receipts, or manage your accommodation details." />
      </Head>

      <Navbar onReserveClick={() => {}} />
      <CustomCursor />

      <main
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #112620 0%, #0d0d0d 100%)",
          color: "#f5f0e1",
          padding: "8rem 2rem 5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "var(--font-family, sans-serif)",
        }}
      >
        {/* Language & Header Bar */}
        <div style={{ width: "100%", maxWidth: "1200px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#b89b72", letterSpacing: "5px", textTransform: "uppercase" }}>
              {t("dashboardTitle")}
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(245,240,225,0.6)" }}>Language:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(184, 155, 114, 0.3)",
                color: "#f5f0e1",
                borderRadius: "4px",
                padding: "4px 8px",
                outline: "none",
                cursor: "pointer",
                fontSize: "0.8rem"
              }}
            >
              <option value="EN" style={{ background: "#111" }}>English</option>
              <option value="HI" style={{ background: "#111" }}>हिंदी (Hindi)</option>
              <option value="BN" style={{ background: "#111" }}>বাংলা (Bengali)</option>
              <option value="AS" style={{ background: "#111" }}>অসমীয়া (Assamese)</option>
            </select>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div style={{ width: "100%", maxWidth: "1200px", padding: "1rem", backgroundColor: "rgba(255,0,0,0.12)", border: "1px solid red", color: "#ffbaba", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "2rem", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ width: "100%", maxWidth: "1200px", padding: "1rem", backgroundColor: "rgba(184, 155, 114, 0.12)", border: "1px solid #b89b72", color: "#f5f0e1", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "2rem", textAlign: "center" }}>
            {successMsg}
          </div>
        )}

        {/* LOGGED OUT STATE */}
        {!user && !booking && (
          <div style={{ width: "100%", maxWidth: "1200px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", width: "100%" }} className="responsive-auth-grid">
            
            {/* Left: Classic Booking Lookup */}
            <div
              className="glass"
              style={{
                padding: "2.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(184, 155, 114, 0.2)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: 300, color: "#f5f0e1", margin: 0, textTransform: "uppercase" }}>Track Stay Reservation</h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(245,240,225,0.6)", margin: 0 }}>
                Quick track reservation without account. Access invoices and bookings cancellation request forms.
              </p>
              
              <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Booking ID</label>
                  <input
                    type="text"
                    placeholder="BK-8724-XXXX"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", fontSize: "0.9rem", letterSpacing: "1px" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Guest Email</label>
                  <input
                    type="email"
                    placeholder="leadguest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.8rem", outline: "none", fontSize: "0.9rem" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "0.9rem",
                    borderRadius: "50px",
                    backgroundColor: "#b89b72",
                    color: "#111",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.3s ease"
                  }}
                >
                  {isLoading ? "Searching Registry..." : "Lookup Booking"}
                </button>
              </form>
            </div>

            {/* Right: Guest Account Auth */}
            <div
              className="glass"
              style={{
                padding: "2.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(184, 155, 114, 0.2)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}
            >
              {/* Auth tabs selector */}
              <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1rem" }}>
                <span 
                  onClick={() => setAuthTab("login")} 
                  style={{ fontSize: "1rem", cursor: "pointer", color: authTab === "login" ? "#b89b72" : "rgba(245,240,225,0.4)", borderBottom: authTab === "login" ? "2px solid #b89b72" : "none", paddingBottom: "0.5rem" }}
                >
                  Sign In
                </span>
                <span 
                  onClick={() => setAuthTab("register")} 
                  style={{ fontSize: "1rem", cursor: "pointer", color: authTab === "register" ? "#b89b72" : "rgba(245,240,225,0.4)", borderBottom: authTab === "register" ? "2px solid #b89b72" : "none", paddingBottom: "0.5rem" }}
                >
                  Register
                </span>
                <span 
                  onClick={() => setAuthTab("forgot")} 
                  style={{ fontSize: "1rem", cursor: "pointer", color: authTab === "forgot" ? "#b89b72" : "rgba(245,240,225,0.4)", borderBottom: authTab === "forgot" ? "2px solid #b89b72" : "none", paddingBottom: "0.5rem" }}
                >
                  Forgot
                </span>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {authTab === "register" && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.7rem", outline: "none", fontSize: "0.9rem" }}
                        required
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.7rem", outline: "none", fontSize: "0.9rem" }}
                        required
                      />
                    </div>
                  </>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.7rem", outline: "none", fontSize: "0.9rem" }}
                    required
                  />
                </div>

                {authTab !== "forgot" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.7rem", outline: "none", fontSize: "0.9rem" }}
                      required
                    />
                  </div>
                )}

                {authTab === "register" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>Preferences (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="High floor, Quiet room, Vegan food"
                      value={authPreferences}
                      onChange={(e) => setAuthPreferences(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f0e1", padding: "0.7rem", outline: "none", fontSize: "0.9rem" }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "0.9rem",
                    borderRadius: "50px",
                    backgroundColor: "#b89b72",
                    color: "#111",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    border: "none",
                    marginTop: "0.5rem"
                  }}
                >
                  {isLoading 
                    ? "Processing..." 
                    : authTab === "login" 
                      ? "Sign In" 
                      : authTab === "register" 
                        ? "Create Account" 
                        : "Send Reset Link"}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* LOGGED OUT STATE - CLASSIC Direct Lookup Display */}
        {!user && booking && (
          <div
            className="glass"
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "3rem 2.5rem",
              borderRadius: "16px",
              border: "1px solid rgba(184, 155, 114, 0.2)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.2rem" }}>
              <div>
                <span style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "1px", textTransform: "uppercase" }}>{t("bookingReference")}</span>
                <h3 style={{ margin: "3px 0 0 0", fontSize: "1.3rem", color: "#f5f0e1" }}>{booking.id}</h3>
              </div>
              <span style={{
                fontSize: "0.7rem",
                padding: "0.3rem 0.8rem",
                borderRadius: "50px",
                fontWeight: 600,
                backgroundColor: booking.status === "CONFIRMED" ? "#0b3d2e" : booking.status === "PENDING" ? "rgba(184, 155, 114, 0.18)" : "rgba(255,0,0,0.12)",
                color: booking.status === "CONFIRMED" ? "#b89b72" : booking.status === "PENDING" ? "#b89b72" : "#ffbaba",
                border: `1px solid ${booking.status === "CONFIRMED" ? "rgba(184,155,114,0.3)" : booking.status === "PENDING" ? "rgba(184,155,114,0.2)" : "rgba(255,0,0,0.2)"}`
              }}>
                {booking.status}
              </span>
            </div>

            {/* Guest Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Lead Guest Details</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", color: "rgba(245,240,225,0.85)" }}>
                <div><strong>Full Name:</strong> {booking.guestName}</div>
                <div><strong>Mobile:</strong> {booking.guestPhone}</div>
                <div style={{ gridColumn: "span 2" }}><strong>Address Doc:</strong> {booking.guestIdentity}</div>
              </div>
            </div>

            {/* Accommodation Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <span style={{ fontSize: "0.65rem", color: "#b89b72", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Stay Parameters</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", color: "rgba(245,240,225,0.85)" }}>
                <div style={{ gridColumn: "span 2" }}><strong>Sanctuary:</strong> {booking.roomType}</div>
                <div><strong>Check In:</strong> {booking.checkIn}</div>
                <div><strong>Check Out:</strong> {booking.checkOut}</div>
                <div><strong>Guests:</strong> {booking.guests} Guests</div>
                <div><strong>Payment Status:</strong> <span style={{ color: booking.paymentStatus === "PAID" ? "#b89b72" : booking.paymentStatus === "REFUNDED" ? "#ffbaba" : "#e1caa0", fontWeight: 600 }}>{booking.paymentStatus || "PENDING"}</span></div>
                <div style={{ gridColumn: "span 2" }}><strong>Total Paid:</strong> <strong style={{ color: "#b89b72" }}>${booking.totalPrice}.00 USD</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1.2rem", marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
              <button onClick={handleDownloadInvoice} style={{ borderRadius: "50px", backgroundColor: "#b89b72", color: "#111", padding: "0.9rem", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600, flex: 1.2, border: "none", cursor: "pointer" }}>
                Download PDF Invoice
              </button>
              {booking.status !== "CANCELLED" && (
                <button onClick={() => setShowCancelConfirm(true)} style={{ borderRadius: "50px", backgroundColor: "transparent", border: "1px solid rgba(255, 186, 186, 0.4)", color: "#ffbaba", padding: "0.9rem", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", flex: 1 }}>
                  Cancel Booking
                </button>
              )}
            </div>
            <button onClick={() => setBooking(null)} style={{ border: "none", background: "none", color: "rgba(245,240,225,0.4)", textDecoration: "underline", cursor: "pointer", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Back to Hub Search
            </button>
          </div>
        )}

        {/* LOGGED IN ACCOUNT WORKSPACE */}
        {user && (
          <div style={{ width: "100%", maxWidth: "1200px", display: "grid", gridTemplateColumns: "250px 1fr", gap: "2.5rem" }} className="responsive-dashboard-grid">
            
            {/* Sidebar Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Profile overview card */}
              <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(184, 155, 114, 0.2)", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                <span style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase", letterSpacing: "1px" }}>{t("welcomeBack")}</span>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 300 }}>{user.name}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem", fontSize: "0.8rem" }}>
                  <span>Points:</span>
                  <strong style={{ color: "#b89b72" }}>{user.loyaltyPoints}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                  <span>{t("vipStatus")}:</span>
                  <span style={{
                    fontSize: "0.65rem",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    backgroundColor: user.vipStatus === "PLATINUM" ? "#E5E7EB" : user.vipStatus === "GOLD" ? "#F59E0B" : user.vipStatus === "SILVER" ? "#9CA3AF" : "transparent",
                    color: user.vipStatus === "STANDARD" ? "#f5f0e1" : "#111"
                  }}>
                    {user.vipStatus}
                  </span>
                </div>
              </div>

              {/* Booking Selection selector */}
              {userBookings.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "#b89b72", textTransform: "uppercase", letterSpacing: "1px" }}>Active stay booking</label>
                  <select
                    value={selectedBooking?.id || ""}
                    onChange={(e) => {
                      const bk = userBookings.find(b => b.id === e.target.value);
                      if (bk) {
                        setSelectedBooking(bk);
                        loadOperationalData(bk);
                      }
                    }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(184, 155, 114, 0.3)",
                      color: "#f5f0e1",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      outline: "none",
                      cursor: "pointer",
                      width: "100%",
                      fontSize: "0.85rem"
                    }}
                  >
                    {userBookings.map((bk) => (
                      <option key={bk.id} value={bk.id} style={{ background: "#111" }}>
                        {bk.id} ({bk.roomType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Workspace Navigation tab lists */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[
                  { key: "stays", label: t("stays"), icon: "🛏️" },
                  { key: "dining", label: t("roomService"), icon: "🍽️" },
                  { key: "wellness", label: t("wellness"), icon: "🧘" },
                  { key: "concierge", label: t("concierge"), icon: "🛎️" },
                  { key: "loyalty", label: t("loyalty"), icon: "🏆" },
                  { key: "reviews", label: t("reviews"), icon: "✍️" },
                  { key: "chat", label: t("supportChat"), icon: "💬" },
                  { key: "profile", label: t("profile"), icon: "👤" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: activeTab === tab.key ? "rgba(184, 155, 114, 0.15)" : "transparent",
                      color: activeTab === tab.key ? "#b89b72" : "#f5f0e1",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: activeTab === tab.key ? 600 : 400,
                      transition: "all 0.2s"
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleLogout}
                style={{
                  padding: "10px",
                  borderRadius: "50px",
                  border: "1px solid rgba(255,0,0,0.3)",
                  color: "#ffbaba",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}
              >
                {t("logout")}
              </button>
            </div>

            {/* Workspace Content Sheet */}
            <div className="glass" style={{ padding: "2.5rem", borderRadius: "16px", border: "1px solid rgba(184, 155, 114, 0.2)", minHeight: "450px" }}>
              
              {/* STAYS & ONLINE CHECK-IN */}
              {activeTab === "stays" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("stays")}</h3>
                  
                  {selectedBooking ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }} className="responsive-checkin-grid">
                      {/* Left booking summary */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.8rem" }}>
                          <span>{selectedBooking.roomType}</span>
                          <span style={{ color: "#b89b72" }}>{selectedBooking.id}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.85rem" }}>
                          <span><strong>Check-in:</strong> {selectedBooking.checkIn}</span>
                          <span><strong>Check-out:</strong> {selectedBooking.checkOut}</span>
                          <span><strong>Guests:</strong> {selectedBooking.guests}</span>
                          <span><strong>Price:</strong> ${selectedBooking.totalPrice}</span>
                          <span><strong>Status:</strong> {selectedBooking.status}</span>
                        </div>

                        {/* Online check-in submission form */}
                        {!selectedBooking.checkedInOnline ? (
                          <form onSubmit={handleOnlineCheckin} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                            <h4 style={{ margin: 0, fontSize: "1rem", color: "#b89b72" }}>Complete Pre-Arrival Check-in</h4>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Arrival Time</label>
                                <select 
                                  value={arrivalTime} 
                                  onChange={(e) => setArrivalTime(e.target.value)}
                                  style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "6px", color: "#f5f0e1" }}
                                >
                                  <option value="12:00">12:00 PM</option>
                                  <option value="13:00">01:00 PM</option>
                                  <option value="14:00">02:00 PM (Standard)</option>
                                  <option value="15:00">03:00 PM</option>
                                  <option value="16:00">04:00 PM</option>
                                  <option value="17:00">05:00 PM</option>
                                </select>
                              </div>
                              
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>ID Type</label>
                                <select 
                                  value={idDocType} 
                                  onChange={(e) => setIdDocType(e.target.value)}
                                  style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "6px", color: "#f5f0e1" }}
                                >
                                  <option value="Passport">Passport</option>
                                  <option value="DrivingLicense">Driver's License</option>
                                  <option value="Aadhaar">Aadhaar Card</option>
                                  <option value="NationalID">National ID Card</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>ID Document Number</label>
                              <input 
                                type="text" 
                                placeholder="Enter ID serial number"
                                value={idDocDetails} 
                                onChange={(e) => setIdDocDetails(e.target.value)}
                                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "6px", color: "#f5f0e1" }}
                                required
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>ID Scan Upload (Simulated)</label>
                              <input 
                                type="file" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setIdFileName(e.target.files[0].name);
                                  }
                                }}
                                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "6px", color: "#f5f0e1", fontSize: "0.8rem" }}
                              />
                            </div>

                            <button 
                              type="submit" 
                              disabled={isLoading}
                              style={{ padding: "8px", borderRadius: "50px", backgroundColor: "#b89b72", border: "none", cursor: "pointer", color: "#111", fontWeight: 600 }}
                            >
                              {isLoading ? "Submitting..." : "Complete Online Check-In"}
                            </button>
                          </form>
                        ) : (
                          <div style={{ padding: "1.2rem", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", background: "rgba(16, 185, 129, 0.05)", marginTop: "1rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: "bold", textTransform: "uppercase" }}>✓ Pre-Arrival Check-In Completed</span>
                            <div style={{ fontSize: "0.85rem", marginTop: "5px", color: "rgba(245,240,225,0.8)" }}>
                              Your selected arrival is scheduled at <strong>{selectedBooking.arrivalTime || arrivalTime}</strong>. 
                              The room key and check-in pass are ready.
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                          <button onClick={handleDownloadInvoice} style={{ background: "none", border: "1px solid rgba(184,155,114,0.4)", borderRadius: "4px", color: "#b89b72", padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer" }}>
                            Download Invoice PDF
                          </button>
                          {selectedBooking.status !== "CANCELLED" && (
                            <button onClick={() => setShowCancelConfirm(true)} style={{ background: "none", border: "1px solid rgba(255,0,0,0.3)", borderRadius: "4px", color: "#ffbaba", padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer" }}>
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right boarding pass QR visual representation */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "1.5rem" }} className="checkin-qr-col">
                        {selectedBooking.checkedInOnline && selectedBooking.qrPass ? (
                          <>
                            <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", color: "#b89b72" }}>{t("qrPass")}</h4>
                            <div dangerouslySetInnerHTML={{ __html: selectedBooking.qrPass }} />
                            <span style={{ fontSize: "0.7rem", color: "rgba(245,240,225,0.5)", marginTop: "8px" }}>Scan code at front lobby terminal</span>
                          </>
                        ) : (
                          <div style={{ color: "rgba(245,240,225,0.3)", fontSize: "0.85rem", padding: "2rem" }}>
                            Complete check-in online to generate your Reservation QR boarding code and skip registration desk queues.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      No active stays found. Book a cottage or room to access checkout or boarding systems.
                    </div>
                  )}
                </div>
              )}

              {/* ROOM SERVICE MENU & CART */}
              {activeTab === "dining" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("orderFood")}</h3>
                  
                  {selectedBooking ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }} className="responsive-dining-grid">
                      {/* Left: Food menu catalog */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {foodMenu.map((item) => (
                          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.8rem", alignItems: "center" }}>
                            <div style={{ paddingRight: "10px" }}>
                              <h4 style={{ margin: 0, fontSize: "1rem", color: "#f5f0e1" }}>{item.name}</h4>
                              <p style={{ margin: "3px 0 0 0", fontSize: "0.75rem", color: "rgba(245,240,225,0.6)" }}>{item.desc}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <strong style={{ color: "#b89b72", fontSize: "0.9rem" }}>${item.price}</strong>
                              <button
                                onClick={() => setCart({ ...cart, [item.id]: (cart[item.id] || 0) + 1 })}
                                style={{ background: "#b89b72", color: "#111", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", fontWeight: "bold" }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Cart and active order tracker */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className="glass" style={{ padding: "1.2rem", borderRadius: "8px", border: "1px solid rgba(184, 155, 114, 0.2)" }}>
                          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem" }}>{t("cart")}</h4>
                          {Object.keys(cart).length === 0 ? (
                            <div style={{ fontSize: "0.8rem", color: "rgba(245,240,225,0.4)" }}>Cart is empty</div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {Object.entries(cart).map(([id, qty]) => {
                                const m = foodMenu.find((item) => item.id === id);
                                if (!m) return null;
                                return (
                                  <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                                    <span>{m.name} x {qty}</span>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                      <span>${m.price * qty}</span>
                                      <span onClick={() => {
                                        const c = { ...cart };
                                        delete c[id];
                                        setCart(c);
                                      }} style={{ color: "red", cursor: "pointer" }}>✕</span>
                                    </div>
                                  </div>
                                );
                              })}
                              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "0.85rem" }}>
                                <span>Total:</span>
                                <span style={{ color: "#b89b72" }}>
                                  ${Object.entries(cart).reduce((sum, [id, qty]) => sum + (foodMenu.find(item => item.id === id)?.price || 0) * qty, 0)}
                                </span>
                              </div>
                              <button onClick={handleOrderRoomService} style={{ width: "100%", padding: "6px", backgroundColor: "#b89b72", border: "none", color: "#111", fontWeight: 600, cursor: "pointer", borderRadius: "4px", fontSize: "0.75rem", marginTop: "10px" }}>
                                {t("placeOrder")}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Order Status Tracker */}
                        {roomServiceOrders.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#b89b72" }}>Active Kitchen Tickets</h4>
                            {roomServiceOrders.map((ord: any) => (
                              <div key={ord.id} style={{ padding: "10px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", background: "rgba(255,255,255,0.02)", fontSize: "0.8rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                  <strong>{ord.id}</strong>
                                  <span style={{
                                    color: ord.status === "DELIVERED" ? "#10B981" : ord.status === "PENDING" ? "#F59E0B" : "#3B82F6"
                                  }}>{ord.status}</span>
                                </div>
                                <div style={{ color: "rgba(245,240,225,0.6)" }}>
                                  {ord.items.map((i: any) => `${i.name} (${i.qty})`).join(", ")}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      Select an active stay reservation to order in-room boutique dining service.
                    </div>
                  )}
                </div>
              )}

              {/* WELLNESS & SPA SCHEDULER */}
              {activeTab === "wellness" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("wellness")}</h3>
                  
                  {selectedBooking ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "2rem" }} className="responsive-wellness-grid">
                      {/* Left booking form */}
                      <form onSubmit={handleBookWellness} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "#b89b72" }}>{t("bookTherapy")}</h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>{t("therapyName")}</label>
                          <select 
                            value={selectedTherapy}
                            onChange={(e) => setSelectedTherapy(e.target.value)}
                            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#f5f0e1" }}
                          >
                            {spaCatalog.map((s, idx) => (
                              <option key={idx} value={s.name} style={{ background: "#111" }}>{s.name} (${s.price})</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>{t("selectDateTime")}</label>
                          <input 
                            type="datetime-local" 
                            value={spaDateTime}
                            onChange={(e) => setSpaDateTime(e.target.value)}
                            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#f5f0e1" }}
                            required
                          />
                        </div>

                        <button 
                          type="submit"
                          style={{
                            padding: "10px",
                            backgroundColor: "#b89b72",
                            border: "none",
                            borderRadius: "50px",
                            color: "#111",
                            fontWeight: 600,
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                          }}
                        >
                          Book Session Slot
                        </button>
                      </form>

                      {/* Right booked list */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#b89b72" }}>{t("scheduledSessions")}</h4>
                        {spaBookings.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "rgba(245,240,225,0.4)" }}>No spa therapies booked yet</div>
                        ) : (
                          spaBookings.map((sb) => (
                            <div key={sb.id} style={{ padding: "10px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", background: "rgba(255,255,255,0.02)", fontSize: "0.8rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                                <span>{sb.therapyName}</span>
                                <span style={{ color: "#10B981" }}>{sb.status}</span>
                              </div>
                              <div style={{ marginTop: "4px", color: "rgba(245,240,225,0.6)" }}>
                                Scheduled: {new Date(sb.scheduledAt).toLocaleString()} | Therapist: {sb.therapist}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      Select an active stay reservation to schedule wellness treatments.
                    </div>
                  )}
                </div>
              )}

              {/* DIGITAL CONCIERGE */}
              {activeTab === "concierge" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("concierge")}</h3>
                  
                  {selectedBooking ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }} className="responsive-concierge-grid">
                      {/* Left quick request actions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "#b89b72" }}>{t("requestService")}</h4>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }} className="responsive-actions-grid">
                          <button onClick={() => handleConciergeRequest("Towels", "Extra towels requested for Cottage.")} style={{ padding: "12px", border: "1px solid rgba(184,155,114,0.3)", borderRadius: "6px", color: "#f5f0e1", background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.3s" }}>
                            🧻 {t("towelRequest")}
                          </button>
                          <button onClick={() => handleConciergeRequest("Cleaning", "Daily room housekeeping cleanup requested.")} style={{ padding: "12px", border: "1px solid rgba(184,155,114,0.3)", borderRadius: "6px", color: "#f5f0e1", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}>
                            🧹 {t("cleaningRequest")}
                          </button>
                          <button onClick={() => handleConciergeRequest("WakeUp", "Wake-up call requested for tomorrow at 06:30 AM.")} style={{ padding: "12px", border: "1px solid rgba(184,155,114,0.3)", borderRadius: "6px", color: "#f5f0e1", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}>
                            ⏰ {t("wakeupRequest")}
                          </button>
                          <button onClick={() => handleConciergeRequest("Airport", "Airport pickup requested.")} style={{ padding: "12px", border: "1px solid rgba(184,155,114,0.3)", borderRadius: "6px", color: "#f5f0e1", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}>
                            🚗 {t("airportRequest")}
                          </button>
                        </div>

                        {/* Custom Concierge Request Box */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "1rem" }}>
                          <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Custom Request / Message</label>
                          <textarea 
                            rows={3} 
                            placeholder="e.g. Need local tour information, book dining, extra pillows"
                            value={customConciergeText}
                            onChange={(e) => setCustomConciergeText(e.target.value)}
                            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#f5f0e1", outline: "none" }}
                          />
                          <button 
                            onClick={() => handleConciergeRequest("Dining", customConciergeText)}
                            disabled={!customConciergeText.trim()}
                            style={{ padding: "8px", borderRadius: "50px", backgroundColor: "#b89b72", border: "none", cursor: "pointer", color: "#111", fontWeight: 600, fontSize: "0.75rem", marginTop: "5px" }}
                          >
                            Send Custom Request
                          </button>
                        </div>
                      </div>

                      {/* Right requests history list */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#b89b72" }}>Concierge Requests History</h4>
                        {conciergeRequests.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "rgba(245,240,225,0.4)" }}>No requests logged yet</div>
                        ) : (
                          conciergeRequests.map((cr) => (
                            <div key={cr.id} style={{ padding: "10px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", background: "rgba(255,255,255,0.02)", fontSize: "0.8rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                                <span>{cr.requestType}</span>
                                <span style={{
                                  color: cr.status === "COMPLETED" ? "#10B981" : cr.status === "CANCELLED" ? "red" : "#F59E0B"
                                }}>{cr.status}</span>
                              </div>
                              <p style={{ margin: "4px 0 0 0", color: "rgba(245,240,225,0.65)" }}>{cr.details}</p>
                              <span style={{ fontSize: "0.65rem", color: "rgba(245,240,225,0.4)", display: "block", marginTop: "5px" }}>Submitted: {new Date(cr.createdAt).toLocaleString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      Select an active stay reservation to submit butler or concierge requests.
                    </div>
                  )}
                </div>
              )}

              {/* LOYALTY PERKS */}
              {activeTab === "loyalty" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("loyaltyTitle")}</h3>
                  
                  {/* Tier status meter */}
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(184, 155, 114, 0.2)", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Current Level: <strong style={{ color: "#b89b72" }}>{user.vipStatus}</strong></span>
                      <span>{user.loyaltyPoints} points</span>
                    </div>
                    {/* Progress bar to next tier */}
                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.min(100, (user.loyaltyPoints / 1000) * 100)}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #b89b72 0%, #10B981 100%)"
                      }} />
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(245,240,225,0.5)" }}>
                      Accrued points: Earn 1 point per $10 spent. Unlock SILVER at 200, GOLD at 500, and PLATINUM at 1000 points.
                    </span>
                  </div>

                  {/* Tier information charts */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }} className="responsive-perks-grid">
                    <div style={{ padding: "10px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", background: "rgba(255,255,255,0.01)" }}>
                      <h4 style={{ margin: 0, fontSize: "0.85rem", color: "#9CA3AF" }}>SILVER BENEFITS</h4>
                      <ul style={{ fontSize: "0.75rem", paddingLeft: "15px", margin: "5px 0 0 0", color: "rgba(245,240,225,0.7)" }}>
                        <li>Welcome refreshment drinks</li>
                        <li>Boutique spa 10% discount</li>
                        <li>Priority express check-in</li>
                      </ul>
                    </div>
                    <div style={{ padding: "10px", border: "1px solid rgba(245,240,225,0.15)", borderRadius: "6px", background: "rgba(245,240,225,0.02)" }}>
                      <h4 style={{ margin: 0, fontSize: "0.85rem", color: "#F59E0B" }}>GOLD BENEFITS</h4>
                      <ul style={{ fontSize: "0.75rem", paddingLeft: "15px", margin: "5px 0 0 0", color: "rgba(245,240,225,0.7)" }}>
                        <li>Complimentary sunrise yoga session</li>
                        <li>Boutique spa 15% discount</li>
                        <li>Room upgrade upon slot availability</li>
                      </ul>
                    </div>
                    <div style={{ padding: "10px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", background: "rgba(255,255,255,0.01)" }}>
                      <h4 style={{ margin: 0, fontSize: "0.85rem", color: "#E5E7EB" }}>PLATINUM BENEFITS</h4>
                      <ul style={{ fontSize: "0.75rem", paddingLeft: "15px", margin: "5px 0 0 0", color: "rgba(245,240,225,0.7)" }}>
                        <li>Complimentary airport pickup SUV</li>
                        <li>Boutique spa 20% discount</li>
                        <li>2-hour late check-out slot extension</li>
                      </ul>
                    </div>
                  </div>

                  {/* Referral coupon generator */}
                  <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(184, 155, 114, 0.2)", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{t("referralPerk")}</h4>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button onClick={handleGenerateReferral} style={{ padding: "8px 16px", backgroundColor: "#b89b72", border: "none", color: "#111", fontWeight: 600, cursor: "pointer", borderRadius: "4px", fontSize: "0.75rem" }}>
                        {t("generateReferral")}
                      </button>
                      {referralCode && (
                        <div style={{ padding: "6px 12px", border: "1px dashed #b89b72", borderRadius: "4px", fontSize: "0.9rem", letterSpacing: "1px", fontWeight: "bold" }}>
                          {referralCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* REVIEWS & RATINGS */}
              {activeTab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("reviews")}</h3>
                  
                  {selectedBooking ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }} className="responsive-reviews-grid">
                      {/* Left: Feedback Submission */}
                      <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "#b89b72" }}>{t("submitReview")}</h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>{t("rating")} (1-5)</label>
                          <select 
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", color: "#f5f0e1" }}
                          >
                            <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                            <option value="4">⭐⭐⭐⭐ (Good)</option>
                            <option value="3">⭐⭐⭐ (Average)</option>
                            <option value="2">⭐⭐ (Poor)</option>
                            <option value="1">⭐ (Unsatisfactory)</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>{t("feedback")}</label>
                          <textarea 
                            rows={4}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#f5f0e1", outline: "none" }}
                            required
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Photo Links (comma-separated URLs)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. https://domain.com/photo1.jpg"
                            value={reviewPhotos}
                            onChange={(e) => setReviewPhotos(e.target.value)}
                            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", color: "#f5f0e1" }}
                          />
                        </div>

                        <button type="submit" style={{ padding: "10px", borderRadius: "50px", backgroundColor: "#b89b72", border: "none", color: "#111", fontWeight: 600, textTransform: "uppercase", cursor: "pointer" }}>
                          Submit Stay Review
                        </button>
                      </form>

                      {/* Right: Submitted Reviews */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#b89b72" }}>Submitted Stays Feedbacks</h4>
                        {myReviews.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "rgba(245,240,225,0.4)" }}>No reviews submitted yet</div>
                        ) : (
                          myReviews.map((r) => (
                            <div key={r.id} style={{ padding: "10px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", background: "rgba(255,255,255,0.02)", fontSize: "0.8rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Rating: {"⭐".repeat(r.rating)}</span>
                                <span style={{
                                  fontSize: "0.65rem",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: r.isApproved ? "rgba(16, 185, 129, 0.2)" : "rgba(245,158,11,0.2)",
                                  color: r.isApproved ? "#10B981" : "#F59E0B"
                                }}>
                                  {r.isApproved ? "Approved" : "Pending Moderation"}
                                </span>
                              </div>
                              <p style={{ margin: "5px 0 0 0", color: "rgba(245,240,225,0.7)" }}>{r.comment}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      Select an active stay reservation to submit reviews.
                    </div>
                  )}
                </div>
              )}

              {/* SUPPORT LIVE CHAT */}
              {activeTab === "chat" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("chatTitle")}</h3>
                  
                  {selectedBooking ? (
                    <div style={{ display: "flex", flexDirection: "column", height: "400px", border: "1px solid rgba(184, 155, 114, 0.2)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                      {/* Chat Messages thread */}
                      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {chatMessages.length === 0 ? (
                          <div style={{ margin: "auto", color: "rgba(245,240,225,0.3)", fontSize: "0.85rem", textAlign: "center" }}>
                            Send a message to our front-desk concierge support team. We are active 24/7.
                          </div>
                        ) : (
                          chatMessages.map((msg, idx) => {
                            const isGuest = msg.sender === "guest";
                            return (
                              <div 
                                key={idx} 
                                style={{
                                  alignSelf: isGuest ? "flex-end" : "flex-start",
                                  maxWidth: "70%",
                                  padding: "8px 12px",
                                  borderRadius: isGuest ? "12px 12px 0 12px" : "12px 12px 12px 0",
                                  background: isGuest ? "#b89b72" : "rgba(255,255,255,0.08)",
                                  color: isGuest ? "#111" : "#f5f0e1",
                                  fontSize: "0.85rem"
                                }}
                              >
                                <div style={{ fontWeight: 600, fontSize: "0.65rem", opacity: 0.7, marginBottom: "2px" }}>
                                  {isGuest ? "You" : "Front Desk Butler"}
                                </div>
                                <div>{msg.message}</div>
                                <div style={{ fontSize: "0.6rem", textAlign: "right", opacity: 0.5, marginTop: "3px" }}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Chat input form */}
                      <form onSubmit={handleSendChatMessage} style={{ display: "flex", borderTop: "1px solid rgba(184, 155, 114, 0.2)" }}>
                        <input
                          type="text"
                          placeholder={t("typeMessage")}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            padding: "12px",
                            color: "#f5f0e1",
                            outline: "none",
                            fontSize: "0.85rem"
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: "#b89b72",
                            color: "#111",
                            border: "none",
                            padding: "0 20px",
                            cursor: "pointer",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            fontSize: "0.75rem"
                          }}
                        >
                          {t("send")}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      Select an active stay reservation to start support live chat threads.
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE & PREFERENCES SETTINGS */}
              {activeTab === "profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <h3 style={{ margin: 0, fontWeight: 300, fontSize: "1.5rem", color: "#f5f0e1" }}>{t("profile")}</h3>
                  
                  <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="responsive-profile-fields">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Full Name</label>
                        <input 
                          type="text"
                          value={user.name}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#f5f0e1" }}
                          required
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Phone Number</label>
                        <input 
                          type="text"
                          value={user.phone}
                          onChange={(e) => setUser({ ...user, phone: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#f5f0e1" }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Email Address (Cannot change)</label>
                      <input 
                        type="email"
                        value={user.email}
                        disabled
                        style={{ background: "rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "10px", color: "rgba(245,240,225,0.5)" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>Saved Stays Preferences (comma-separated)</label>
                      <textarea
                        rows={3}
                        value={user.preferences.join(", ")}
                        onChange={(e) => setUser({ ...user, preferences: e.target.value.split(",").map(p => p.trim()) })}
                        placeholder={t("prefPlaceholder")}
                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#f5f0e1", outline: "none" }}
                      />
                    </div>

                    <button type="submit" style={{ padding: "10px", borderRadius: "50px", backgroundColor: "#b89b72", border: "none", color: "#111", fontWeight: 600, textTransform: "uppercase", cursor: "pointer", alignSelf: "flex-start", paddingLeft: "2rem", paddingRight: "2rem" }}>
                      {t("savePref")}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Cancellation Confirmation modal */}
        {showCancelConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(10,10,10,0.9)",
              backdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10005,
              padding: "1rem",
            }}
          >
            <div
              className="glass"
              style={{
                width: "100%",
                maxWidth: "450px",
                padding: "2.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(255, 0, 0, 0.3)",
                backgroundColor: "rgba(17,17,17,0.98)",
                textAlign: "center",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
              }}
            >
              <h3 style={{ fontSize: "1.4rem", fontWeight: 300, color: "#f5f0e1", marginBottom: "1rem" }}>Confirm Cancellation</h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(245,240,225,0.7)", lineHeight: "1.6", marginBottom: "2rem" }}>
                Are you sure you want to cancel your stay at **{selectedBooking?.roomType || booking?.roomType}**?
                <br /><br />
                Refund calculations and processing fees will be automated according to our policy.
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  disabled={isCancelling}
                  onClick={handleCancelBooking}
                  className="button"
                  style={{
                    backgroundColor: "red",
                    color: "#fff",
                    borderRadius: "50px",
                    padding: "0.8rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    flex: 1,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {isCancelling ? "Cancelling Stay..." : "Yes, Cancel Stay"}
                </button>
                <button
                  disabled={isCancelling}
                  onClick={() => setShowCancelConfirm(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(245,240,225,0.2)",
                    color: "rgba(245,240,225,0.8)",
                    borderRadius: "50px",
                    padding: "0.8rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  No, Keep Stay
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
