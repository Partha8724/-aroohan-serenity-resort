import Head from "next/head";
import { useState } from "react";
import { CustomCursor } from "../components/ui/CustomCursor";
import { Preloader } from "../components/ui/Preloader";
import { Navbar } from "../components/ui/Navbar";
import { HeroScene } from "../components/3d/HeroScene";
import { RoomExplorer } from "../components/3d/RoomExplorer";
import { BookingWidget } from "../components/ui/BookingWidget";
import { GSAPSection } from "../components/animations/GSAPSection";
import { ParallaxLayer } from "../components/animations/ParallaxLayer";
import { MagneticButton } from "../components/ui/MagneticButton";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { BookingWizard } from "../components/ui/BookingWizard";

export default function Home() {
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "schedule" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [wizardData, setWizardData] = useState<{
    isOpen: boolean;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomType?: string;
  }>({
    isOpen: false,
  });

  const triggerReserveModal = () => {
    setWizardData({
      isOpen: true,
      checkIn: "2026-06-10",
      checkOut: "2026-06-15",
      guests: "2",
      roomType: "Luxury Serenity Cottage",
    });
  };

  return (
    <>
      <Head>
        <title>Aroohan Serenity Resort | Ultra-Luxury Eco Retreat</title>
        <meta
          name="description"
          content="Step into the healing forest of Aroohan Serenity Resort. Premium 3D WebGL rooms, immersive scroll journeys, and pure forest healing."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Premium UI overlays */}
      <div id="scroll-progress" />
      <Preloader />
      <CustomCursor />
      <Navbar onReserveClick={triggerReserveModal} />

      <main style={{ minHeight: "100vh", position: "relative" }}>
        
        {/* HERO SECTION: The Grand Arrival */}
        <section
          id="home"
          style={{
            position: "relative",
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            padding: "0 2rem",
          }}
        >
          {/* Background Hero Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/pic-1.jpg"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          >
            <source src="/videos/hero.mp4.mp4" type="video/mp4" />
          </video>

          {/* Dark Overlay for Video Readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(to bottom, rgba(17, 17, 17, 0.4) 0%, rgba(17, 17, 17, 0.85) 100%)",
              zIndex: 0,
            }}
          />

          {/* Background 3D Particle Scene */}
          <HeroScene />

          <GSAPSection
            className="hero-content"
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              marginTop: "4rem",
            }}
          >
            <span
              className="fade-in-up"
              style={{
                fontSize: "0.85rem",
                letterSpacing: "8px",
                color: "#b89b72",
                fontWeight: 500,
                textTransform: "uppercase",
              }}
            >
              Welcoming Conscious Souls
            </span>
            
            <h1
              className="fade-in-up"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: 300,
                letterSpacing: "4px",
                lineHeight: "1.1",
                textTransform: "uppercase",
                color: "#f5f0e1",
                margin: 0,
                maxWidth: "900px",
              }}
            >
              Redefining <span style={{ fontStyle: "italic", color: "#b89b72" }}>Serenity</span>
            </h1>

            <p
              className="fade-in-up"
              style={{
                fontSize: "1rem",
                color: "rgba(245, 240, 225, 0.7)",
                maxWidth: "600px",
                lineHeight: "1.7",
                margin: "0 0 2rem 0",
              }}
            >
              Deep within nature's embrace, discover a luxurious eco-sanctuary designed to align body, spirit, and environment.
            </p>

            {/* Glassmorphic Booking Widget */}
            <div className="fade-in-up" id="booking" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <BookingWidget
                onCheckAvailability={(details) =>
                  setWizardData({
                    isOpen: true,
                    checkIn: details.checkIn,
                    checkOut: details.checkOut,
                    guests: details.guests,
                  })
                }
              />
            </div>
          </GSAPSection>
        </section>

        {/* EXPERIENCE SECTION: Parallax Journey */}
        <section
          id="experience"
          style={{
            padding: "8rem 2rem",
            position: "relative",
            zIndex: 2,
            backgroundColor: "#0d0d0d",
            overflow: "hidden",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <GSAPSection className="experience-header" style={{ marginBottom: "6rem" }}>
              <span
                className="fade-in-up"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "4px",
                  color: "#b89b72",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                The Sacred Scenery
              </span>
              <h2
                className="fade-in-up"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: 300,
                  letterSpacing: "2px",
                  color: "#f5f0e1",
                  margin: "1rem 0 0 0",
                  textTransform: "uppercase",
                }}
              >
                Immersive Forest Healing
              </h2>
              <div className="line-reveal" style={{ height: "1px", backgroundColor: "#b89b72", marginTop: "1.5rem", opacity: 0.3 }} />
            </GSAPSection>

            {/* Parallax Grid Layout wrapped in GSAPSection for zoom activations */}
            <GSAPSection>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "4rem",
                  alignItems: "center",
                }}
              >
                {/* Left Column: Lake Boat card */}
                <ParallaxLayer speed={-0.12}>
                  <div
                    className="glass card-hover-effect"
                    onClick={() =>
                      setModalData({
                        isOpen: true,
                        title: "The Organic Sanctuary",
                        message: "Our architectural philosophy centers around zero-footprint conservation.\n\nEvery cottage is constructed from hand-hewn cedar wood, thermal-insulated rammed earth walls, and solar-capturing glass paneling.\n\nAll power is generated on-site using green solar arrays and localized micro-hydro turbines.",
                        type: "info",
                      })
                    }
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid rgba(184, 155, 114, 0.15)",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ height: "300px", width: "100%", position: "relative", overflow: "hidden" }}>
                      <img
                        className="zoom-in-bg"
                        src="/images/gal-1.jpg"
                        alt="Organic Lake Boat"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <h3
                        style={{
                          color: "#f5f0e1",
                          fontFamily: "var(--font-family)",
                          fontSize: "1.6rem",
                          fontWeight: 400,
                          margin: 0,
                        }}
                      >
                        The Organic Sanctuary
                      </h3>
                      <p style={{ color: "rgba(245, 240, 225, 0.6)", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
                        Constructed exclusively with locally harvested timbers, rammed earth, and biodegradable clay panels. Aroohan merges the comforts of five-star wellness with the raw power of the untouched wild.
                      </p>
                    </div>
                  </div>
                </ParallaxLayer>

                {/* Right Column: Wedding / Event card */}
                <ParallaxLayer speed={0.08}>
                  <div
                    className="glass card-hover-effect"
                    onClick={() =>
                      setModalData({
                        isOpen: true,
                        title: "Sacred Celebrations",
                        message: "Aroohan hosts clean, eco-conscious gatherings and private micro-weddings.\n\nWe provide organic decoration templates made of wild foliage, clay, and beeswax candles. Our services include pure farm-to-table banquets, sound bathing integrations, and personalized holistic accommodation blocks for up to 50 guests.",
                        type: "info",
                      })
                    }
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid rgba(184, 155, 114, 0.15)",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ height: "300px", width: "100%", position: "relative", overflow: "hidden" }}>
                      <img
                        className="zoom-in-bg"
                        src="/images/gal-2.jpg"
                        alt="Ceremony & Gatherings"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <h3
                        style={{
                          color: "#f5f0e1",
                          fontSize: "1.6rem",
                          fontWeight: 400,
                          margin: 0,
                        }}
                      >
                        Sacred Celebrations
                      </h3>
                      <p style={{ color: "rgba(245, 240, 225, 0.6)", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
                        Host memorable events in our open canopy gardens. Ideal for conscious gatherings, yoga retreats, and pristine eco-friendly celebrations overlooking the serene waters.
                      </p>
                    </div>
                  </div>
                </ParallaxLayer>
              </div>
            </GSAPSection>
          </div>
        </section>

        {/* SUITES SECTION: 3D Room Explorer */}
        <section
          id="suites"
          style={{
            padding: "8rem 2rem",
            backgroundColor: "#111111",
            position: "relative",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          {/* Deep Parallax Background of cottages aerial */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: "url('/images/gal-3.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.08,
              filter: "blur(4px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <GSAPSection className="suites-header" style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span
                className="fade-in-up"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "4px",
                  color: "#b89b72",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Select Your Sanctuary
              </span>
              <h2
                className="fade-in-up"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: 300,
                  letterSpacing: "2px",
                  color: "#f5f0e1",
                  margin: "1rem 0 0 0",
                  textTransform: "uppercase",
                }}
              >
                3D Room Explorer
              </h2>
              <div className="line-reveal" style={{ height: "1px", backgroundColor: "#b89b72", width: "100%", maxWidth: "200px", margin: "1.5rem auto 0 auto", opacity: 0.3 }} />
              <p
                className="fade-in-up"
                style={{
                  color: "rgba(245, 240, 225, 0.5)",
                  fontSize: "0.95rem",
                  marginTop: "1rem",
                }}
              >
                Hover over a sanctuary card to see it tilt. Click to start a 360-degree interactive tour.
              </p>
            </GSAPSection>

            {/* Room Explorer 3D Carousel & 360 viewer */}
            <RoomExplorer
              onBookNow={(roomType) => {
                setWizardData({
                  isOpen: true,
                  checkIn: "2026-06-10",
                  checkOut: "2026-06-15",
                  guests: "2",
                  roomType,
                });
              }}
            />
          </div>
        </section>

        {/* WELLNESS SECTION: Luxury Details */}
        <section
          id="wellness"
          style={{
            padding: "8rem 2rem",
            backgroundColor: "#0d0d0d",
            position: "relative",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "6rem", alignItems: "center" }}>
            
            <GSAPSection className="wellness-left">
              <span
                className="fade-in-up"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "4px",
                  color: "#b89b72",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Daily Rhythms
              </span>
              <h2
                className="fade-in-up"
                style={{
                  fontSize: "2.6rem",
                  fontWeight: 300,
                  color: "#f5f0e1",
                  margin: "1rem 0 1.5rem 0",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Holistic Balance
              </h2>
              <div className="line-reveal" style={{ height: "1px", backgroundColor: "#b89b72", marginTop: "1.5rem", opacity: 0.3 }} />
              <p className="fade-in-up" style={{ color: "rgba(245, 240, 225, 0.6)", lineHeight: "1.8", marginBottom: "2rem" }}>
                Every stay includes organic farm-to-table cuisine in our beautiful wooden dining hall, forest-bathing walks, daily yogic alignment, and personalized thermal cycles.
              </p>
              
              <div className="fade-in-up">
                <MagneticButton
                  data-cursor="Book"
                  onClick={() =>
                    setModalData({
                      isOpen: true,
                      title: "Holistic Daily Schedule",
                      message: "Monday: Pranic Sound Cleansing & Cedar Mud Bath\nTuesday: Forest Botanical Foraging & Earth-fired Dinner\nWednesday: Silent Sunrise Alignment Meditation\nThursday: Volcano Clay Thermal Massage Cycle\nFriday: Vedic Fire Purification Ceremony\nSaturday: Floating Hatha Yoga & Sunset Bathing\nSunday: Integration Circle & Pranic Alignment",
                      type: "schedule",
                    })
                  }
                >
                  <button
                    className="button"
                    style={{ borderRadius: "50px", padding: "1rem 2.5rem", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase" }}
                  >
                    View Schedule
                  </button>
                </MagneticButton>
              </div>
            </GSAPSection>

            <GSAPSection style={{ width: "100%", height: "100%" }}>
              <ParallaxLayer speed={0.05} className="wellness-right">
                <div
                  className="glass"
                  style={{
                    border: "1px solid rgba(184, 155, 114, 0.2)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                  }}
                >
                  <div style={{ height: "250px", width: "100%", position: "relative", overflow: "hidden" }}>
                    <img
                      className="zoom-in-bg"
                      src="/images/gal-4.jpg"
                      alt="Luxury Timber Dining Hall"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "3rem 2.5rem" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {[
                        {
                          time: "06:30 AM",
                          title: "Sunrise Alignment Yoga & Sound Bath",
                          desc: "Settle into our open-air wooden yoga deck as the morning sun breaks over the valleys. Followed by a deep 30-minute Tibetan singing bowl meditation to realign your nervous system."
                        },
                        {
                          time: "10:00 AM",
                          title: "Botanical Foraging & Earth Cooking",
                          desc: "Accompany our resident ethno-botanist into the forest to identify wild edible greens, seeds, and roots. Return to our earth kitchen to prepare a native meal over open clay fires."
                        },
                        {
                          time: "03:00 PM",
                          title: "Volcanic Hot-Stone & Mud Alignment",
                          desc: "A deep detoxifying treatment using hot volcanic stones infused with Himalayan cedar oils, followed by a body alignment wrap using local mineral-rich clays."
                        },
                        {
                          time: "07:30 PM",
                          title: "Conscious Farm-to-Table Feast",
                          desc: "A multi-course culinary journey showcasing 100% organic ingredients harvested from our resort gardens. Each dish is designed for maximum prana and digestibility."
                        },
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          onClick={() => setModalData({ isOpen: true, title: item.title, message: item.desc, type: "info" })}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.3rem",
                            borderBottom: idx !== 3 ? "1px solid rgba(245, 240, 225, 0.08)" : "none",
                            paddingBottom: idx !== 3 ? "1.2rem" : "0",
                            cursor: "pointer",
                          }}
                          className="rhythm-item"
                        >
                          <span style={{ fontSize: "0.75rem", color: "#b89b72", fontWeight: 600, letterSpacing: "1px" }}>
                            {item.time}
                          </span>
                          <span style={{ fontSize: "1.05rem", color: "#f5f0e1", fontWeight: 400 }}>
                            {item.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ParallaxLayer>
            </GSAPSection>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            backgroundColor: "#080808",
            padding: "5rem 2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.03)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "4rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <img
                  src="/images/logo.png.png"
                  alt="Aroohan Logo"
                  style={{
                    height: "50px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallbackText = document.createElement("h3");
                      fallbackText.innerText = "AROOHAN";
                      fallbackText.style.color = "#f5f0e1";
                      fallbackText.style.letterSpacing = "3px";
                      fallbackText.style.textTransform = "uppercase";
                      fallbackText.style.margin = "0";
                      parent.appendChild(fallbackText);
                    }
                  }}
                />
              </div>
              <p style={{ color: "rgba(245, 240, 225, 0.4)", fontSize: "0.85rem", lineHeight: "1.7", margin: 0 }}>
                An ultra-luxury eco-conscious resort sanctuary dedicated to healing, serenity, and reconnecting with natural life paths.
              </p>
            </div>

            <div style={{ display: "flex", gap: "4rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ color: "#b89b72", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
                  Contact
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(245, 240, 225, 0.6)" }}>
                  <span
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() =>
                      setModalData({
                        isOpen: true,
                        title: "Email Support",
                        message: "Send your inquiries directly to serenity@aroohan.com.\n\nOur concierge team typically responds within 2 hours.",
                        type: "info",
                      })
                    }
                  >
                    serenity@aroohan.com
                  </span>
                  <span
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() =>
                      setModalData({
                        isOpen: true,
                        title: "Phone Concierge",
                        message: "Speak with a booking specialist at +1 (800) 555-8724.\n\nAvailable 24/7 for guest services.",
                        type: "info",
                      })
                    }
                  >
                    +1 (800) 555-8724
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ color: "#b89b72", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
                  Sanctuary
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(245, 240, 225, 0.6)", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() =>
                    setModalData({
                      isOpen: true,
                      title: "Our Location",
                      message: "Aroohan Serenity Resort is nestled in the deep green valleys of Himachal Pradesh, India.\n\nCoordinates: 32.2190° N, 76.3234° E\n\nWe provide private luxury airport transfers from Kangra Airport (DHM).",
                      type: "info",
                    })
                  }
                >
                  <span>Aroohan Valleys</span>
                  <span>Himachal Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              maxWidth: "1200px",
              margin: "4rem auto 0 auto",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(245, 240, 225, 0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "rgba(245, 240, 225, 0.3)",
            }}
          >
            <span>© 2026 Aroohan Serenity Resort. All Rights Reserved.</span>
            <span>DESIGNED BY ANTIGRAVITY</span>
          </div>
        </footer>
      </main>

      {/* Global Interactive Feedback Modal */}
      <FeedbackModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
      />

      {/* Dynamic Booking Engine Wizard */}
      <BookingWizard
        isOpen={wizardData.isOpen}
        onClose={() => setWizardData((prev) => ({ ...prev, isOpen: false }))}
        initialCheckIn={wizardData.checkIn}
        initialCheckOut={wizardData.checkOut}
        initialGuests={wizardData.guests}
        initialRoomType={wizardData.roomType}
      />

      <style jsx global>{`
        .card-hover-effect {
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .card-hover-effect:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5) !important;
        }
        .rhythm-item {
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .rhythm-item:hover {
          transform: translateX(6px);
          opacity: 0.85;
        }
      `}</style>
    </>
  );
}
