// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";

interface RoomData {
  id: number;
  name: string;
  desc: string;
  color: string;
  theme: string;
  imageUrl?: string;
  videoUrl?: string;
}

const rooms: RoomData[] = [
  {
    id: 1,
    name: "Luxury Serenity Cottage",
    desc: "A hand-crafted timber cottage with double-glazed panoramic windows overlooking the misty forest canopy. Features a private cedarwood deck and custom wool elements.",
    color: "#0b3d2e",
    theme: "#b89b72",
    imageUrl: "/images/my-room.jpg.jpg",
    videoUrl: "/videos/my-video.mp4 (2).mp4",
  },
  {
    id: 2,
    name: "Ocean Vista Villa",
    desc: "A floating ocean-front sanctuary built on copper pilings. Floor-to-ceiling glass doors open directly to a private deep-water infinity plunge pool and marine reef steps.",
    color: "#1a3644",
    theme: "#e1caa0",
    videoUrl: "/videos/my-video.mp4.mp4",
  },
  {
    id: 3,
    name: "Forest Canopy Retreat",
    desc: "Elevated treehouse architecture constructed from native bamboo and light pine. Features an organic skylight for night stargazing and suspended hammocks.",
    color: "#2a3d1c",
    theme: "#c2d1b0",
    imageUrl: "/images/my-room.jpg (2).jpg",
    videoUrl: "/videos/my-video.mp4 (3).mp4",
  },
];

// Interactive 3D Card component
interface CardProps {
  room: RoomData;
  position: [number, number, number];
  isActive: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}

const RoomCard: React.FC<CardProps> = ({ room, position, isActive, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Base floating motion
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5 + room.id) * 0.15;
    
    // Smooth hover rotation & scaling
    const targetScale = hovered ? 1.08 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    const targetRotY = hovered ? 0.3 : 0;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.1);
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => {
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
        onClick={onClick}
      >
        <boxGeometry args={[2.2, 3.2, 0.1]} />
        <meshStandardMaterial
          color={room.color}
          roughness={0.2}
          metalness={0.7}
        />
        
        {/* Label on the card */}
        <Text
          position={[0, 1.2, 0.06]}
          fontSize={0.16}
          color="#f5f0e1"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          {room.name.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.2, 0.06]}
          fontSize={0.095}
          color="#b89b72"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          {room.desc}
        </Text>
        <Text
          position={[0, -1.2, 0.06]}
          fontSize={0.12}
          color="#f5f0e1"
          anchorX="center"
          anchorY="middle"
        >
          EXPLORE ROOM
        </Text>
      </mesh>
    </group>
  );
};

// Cinematic flat portfolio detail modal
interface TourProps {
  room: any;
  onClose: () => void;
  onBookNow?: (roomType: string) => void;
}

const RoomDetailsModal: React.FC<TourProps> = ({ room, onClose, onBookNow }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(
    room.images && room.images.length > 0 ? room.images[0] : (room.imageUrl || "/images/my-room.jpg.jpg")
  );
  const [matrix, setMatrix] = useState<any[]>([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Smooth GSAP overlay fade in
    gsap.fromTo(containerRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );

    // Fetch availability matrix
    const fetchAvailability = async () => {
      try {
        const res = await fetch(`/api/rooms/availability?roomType=${encodeURIComponent(room.name)}`);
        const data = await res.json();
        if (data.success && data.matrix) {
          setMatrix(data.matrix);
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      }
    };
    fetchAvailability();

    return () => {
      document.body.style.overflow = "";
    };
  }, [room.name]);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: onClose
    });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const images = room.images && room.images.length > 0 ? room.images : [room.imageUrl || "/images/my-room.jpg.jpg"];
  const amenities = room.amenities && room.amenities.length > 0 ? room.amenities : [
    "100% Certified Eco-Conscious Architecture",
    "Private Outdoor Rainforest Copper Shower",
    "On-Site Green Solar & Micro-Hydro Power Grid",
    "Organic Bamboo Linens & Natural Thermal Bedding",
    "Panoramic Visual Fields Overlooking Protected Wilds"
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        backgroundColor: "rgba(10, 10, 10, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        color: "#f5f0e1",
      }}
    >
      <div
        className="portfolio-card glass"
        style={{
          width: "100%",
          maxWidth: "1050px",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(184, 155, 114, 0.2)",
          borderRadius: "24px",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0, 0, 0, 0.9)",
          position: "relative",
          maxHeight: "90vh",
        }}
      >
        {/* Left Side: Media Window */}
        <div 
          className="media-window"
          style={{ 
            position: "relative", 
            width: "100%", 
            height: "100%", 
            minHeight: "480px", 
            overflow: "hidden", 
            backgroundColor: "#000" 
          }}
        >
          {room.videoUrl && activeImage === images[0] ? (
            <>
              <video
                ref={videoRef}
                src={room.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Custom play/pause trigger overlay */}
              <div 
                onClick={togglePlay}
                style={{
                  position: "absolute",
                  bottom: "24px",
                  right: "24px",
                  backgroundColor: "rgba(17, 17, 17, 0.75)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  border: "1px solid rgba(184, 155, 114, 0.3)",
                  transition: "all 0.3s ease",
                  zIndex: 12,
                }}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#b89b72"><rect x="4" y="4" width="4" height="16" /><rect x="16" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#b89b72"><path d="M8 5v14l11-7z" /></svg>
                )}
              </div>
            </>
          ) : (
            <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
              <img
                src={activeImage}
                alt={room.name}
                className="hover-zoom-media"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* Thumbnails Overlay Slider */}
          {images.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                display: "flex",
                gap: "8px",
                zIndex: 12,
                background: "rgba(10, 10, 10, 0.5)",
                padding: "6px",
                borderRadius: "10px",
                backdropFilter: "blur(5px)",
              }}
            >
              {images.map((img: string, i: number) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveImage(img)}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: activeImage === img ? "2px solid #b89b72" : "1px solid rgba(255,255,255,0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Detail Sheet */}
        <div 
          className="details-sheet"
          style={{ 
            padding: "2.5rem 2.2rem", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between", 
            gap: "1.5rem",
            overflowY: "auto",
          }}
        >
          <div>
            <span style={{ fontSize: "0.7rem", color: "#b89b72", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase" }}>
              Luxury Sanctuary
            </span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 300, color: "#f5f0e1", marginTop: "0.4rem", marginBottom: "0.8rem", letterSpacing: "0.5px", lineHeight: "1.2" }}>
              {room.name}
            </h2>
            <p style={{ color: "rgba(245, 240, 225, 0.65)", fontSize: "0.85rem", lineHeight: "1.6", marginBottom: "1.2rem" }}>
              {room.fullDesc || room.desc}
            </p>

            {/* Quick Specs Grid */}
            <div className="room-specs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem", margin: "1rem 0", padding: "0.8rem 0", borderTop: "1px solid rgba(245,240,225,0.1)", borderBottom: "1px solid rgba(245,240,225,0.1)", fontSize: "0.75rem", color: "rgba(245,240,225,0.7)" }}>
              <div><strong>Size:</strong> {room.size || "45 sq m"}</div>
              <div><strong>Bed:</strong> {room.bedType || "King Size"}</div>
              <div><strong>Guests:</strong> Max {room.maxGuests || 2}</div>
            </div>

            {/* Guidelines */}
            <div className="room-policy-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1rem", fontSize: "0.75rem", color: "rgba(245,240,225,0.6)", marginBottom: "1rem" }}>
              <div>
                <div><strong>Check-In:</strong> {room.checkInTime || "02:00 PM"}</div>
                <div><strong>Check-Out:</strong> {room.checkOutTime || "11:00 AM"}</div>
                <div style={{ marginTop: "0.2rem", fontSize: "0.7rem", fontStyle: "italic" }}>{room.cancellationPolicy}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "1.5rem", color: "#b89b72", fontWeight: 300 }}>${room.price}</span>
                <span>/night</span>
              </div>
            </div>

            {/* Live Availability Tracker */}
            {matrix.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <span style={{ fontSize: "0.65rem", color: "#b89b72", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Live Availability Calendar</span>
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem", overflowX: "auto", paddingBottom: "0.4rem" }}>
                  {matrix.slice(0, 7).map((day, idx) => {
                    const dateObj = new Date(day.date);
                    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                    const dayNum = dateObj.getDate();
                    const color = day.status === "Available" ? "#0b3d2e" : day.status === "Limited Rooms" ? "#e1caa0" : "#ffbaba";
                    const textColor = day.status === "Available" ? "#f5f0e1" : "#111111";
                    return (
                      <div key={idx} style={{ flex: "1 0 auto", minWidth: "46px", padding: "0.4rem 0.2rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", fontSize: "0.65rem" }}>
                        <span style={{ opacity: 0.5 }}>{dayName} {dayNum}</span>
                        <span style={{ padding: "0.1rem 0.3rem", borderRadius: "4px", backgroundColor: color, color: textColor, fontWeight: 600, fontSize: "0.55rem" }}>
                          {day.status === "Available" ? "OK" : day.status === "Limited Rooms" ? "LTD" : "SOLD"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h3 style={{ fontSize: "0.75rem", color: "#b89b72", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginTop: "1.2rem", marginBottom: "0.5rem" }}>Amenities</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {amenities.slice(0, 4).map((feat: string, idx: number) => (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.75rem", color: "rgba(245, 240, 225, 0.85)" }}>
                  <span style={{ color: "#b89b72" }}>✦</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              onClick={() => {
                handleClose();
                if (onBookNow) {
                  setTimeout(() => {
                    onBookNow(room.name);
                  }, 500);
                }
              }}
              className="button"
              style={{
                borderRadius: "50px",
                backgroundColor: "#b89b72",
                color: "#111111",
                padding: "0.8rem 1.5rem",
                fontSize: "0.7rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 600,
                flex: 1.4,
              }}
            >
              Book Now
            </button>

            <button
              onClick={handleClose}
              className="btn-exit"
              style={{
                borderRadius: "50px",
                backgroundColor: "transparent",
                border: "1px solid rgba(245, 240, 225, 0.25)",
                color: "rgba(245, 240, 225, 0.8)",
                padding: "0.8rem 1.5rem",
                fontSize: "0.7rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s ease",
                flex: 1,
              }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-zoom-media {
          animation: slowPan 20s infinite alternate ease-in-out;
        }

        .btn-exit:hover {
          border-color: #f5f0e1 !important;
          color: #f5f0e1 !important;
          background-color: rgba(245, 240, 225, 0.05) !important;
        }

        @keyframes slowPan {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.12); }
        }

        @media (max-width: 820px) {
          .portfolio-card {
            grid-template-columns: 1fr !important;
            max-height: 90vh;
            overflow-y: auto;
          }
          .media-window {
            min-height: 280px !important;
            height: 280px !important;
          }
          .details-sheet {
            padding: 2.5rem 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export const RoomExplorer = ({ onBookNow }: { onBookNow?: (roomType: string) => void }) => {
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        if (data.success && data.rooms) {
          setRoomsList(data.rooms);
        }
      } catch (err) {
        console.error("Failed to load rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  if (!isMounted) return <div style={{ height: "500px", width: "100%", background: "#111" }} />;

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", gap: "4rem" }}>
      {activeRoom && (
        <RoomDetailsModal room={activeRoom} onClose={() => setActiveRoom(null)} onBookNow={onBookNow} />
      )}

      {/* 3D Canvas Selector */}
      <div style={{ height: "600px", width: "100%", position: "relative" }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#f5f0e1" />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#b89b72" />
          
          {rooms.map((room, idx) => {
            const posX = (idx - 1) * 2.8;
            return (
              <RoomCard
                key={room.id}
                room={room}
                position={[posX, 0, 0]}
                isActive={activeRoom?.name === room.name}
                onHover={(hovered) => {
                  // Hover triggers handled on custom cursor
                }}
                onClick={() => {
                  const matched = roomsList.find((r) => r.name === room.name);
                  setActiveRoom(matched || room);
                }}
              />
            );
          })}
        </Canvas>
      </div>

      {/* Dynamic flat Room Listing Grid */}
      <div style={{ padding: "0 1rem" }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 300, color: "#f5f0e1", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "2rem", textAlign: "center" }}>
          Premium Suites Catalog
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
          {roomsList.map((room) => {
            const imageSrc = room.images && room.images.length > 0 ? room.images[0] : (room.imageUrl || "/images/my-room.jpg.jpg");
            return (
              <div 
                key={room.id} 
                className="glass card-hover-effect"
                style={{ 
                  borderRadius: "16px", 
                  overflow: "hidden", 
                  border: "1px solid rgba(184, 155, 114, 0.15)", 
                  display: "flex", 
                  flexDirection: "column", 
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  background: "rgba(255,255,255,0.01)"
                }}
              >
                <div style={{ height: "240px", width: "100%", position: "relative", overflow: "hidden" }}>
                  <img
                    className="zoom-in-bg"
                    src={imageSrc}
                    alt={room.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(10,10,10,0.75)", padding: "0.4rem 0.8rem", borderRadius: "50px", fontSize: "0.8rem", border: "1px solid rgba(184,155,114,0.3)", color: "#b89b72", fontWeight: 600 }}>
                    ${room.price}/Night
                  </div>
                </div>

                <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ color: "#f5f0e1", fontSize: "1.3rem", fontWeight: 400, margin: 0 }}>
                      {room.name}
                    </h4>
                    <p style={{ color: "rgba(245, 240, 225, 0.55)", fontSize: "0.85rem", lineHeight: "1.6", marginTop: "0.8rem", marginBottom: "1rem" }}>
                      {room.desc}
                    </p>
                    
                    {/* Size and Bed Details */}
                    <div style={{ display: "flex", gap: "1.2rem", fontSize: "0.75rem", color: "rgba(245,240,225,0.7)", marginBottom: "1.2rem", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0.6rem 0" }}>
                      <span>📐 {room.size}</span>
                      <span>🛏️ {room.bedType}</span>
                      <span>👥 Max {room.maxGuests} guests</span>
                    </div>

                    {/* Amenities tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
                      {room.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                        <span key={idx} style={{ fontSize: "0.65rem", backgroundColor: "rgba(184, 155, 114, 0.08)", border: "1px solid rgba(184, 155, 114, 0.15)", color: "rgba(245,240,225,0.8)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={() => {
                        if (onBookNow) onBookNow(room.name);
                      }}
                      className="button"
                      style={{
                        borderRadius: "50px",
                        backgroundColor: "#b89b72",
                        color: "#111111",
                        padding: "0.7rem 1.5rem",
                        fontSize: "0.7rem",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        flex: 1.2,
                      }}
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => setActiveRoom(room)}
                      style={{
                        borderRadius: "50px",
                        backgroundColor: "transparent",
                        border: "1px solid rgba(245, 240, 225, 0.25)",
                        color: "rgba(245, 240, 225, 0.8)",
                        padding: "0.7rem 1.2rem",
                        fontSize: "0.7rem",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        flex: 1,
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
