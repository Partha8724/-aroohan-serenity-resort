# Guide: Adding 360° Photos and Videos to the Room Explorer

This guide explains how to add actual 360° (equirectangular) photos and videos to the 3D Room Explorer section in the website.

---

## 1. Prepare Your Media Assets

For 360° tours, your files must be in **Equirectangular Projection** format (a flat 2:1 ratio image or video that covers the full 360° x 180° panorama field).

### Recommended Specifications:
- **360° Photos**:
  - Format: `.jpg` or `.png`
  - Resolution: `4096 x 2048` pixels (4K) for a balance of high quality and fast loading times.
- **360° Videos**:
  - Format: `.mp4` (H.264 codec)
  - Resolution: `3840 x 1920` or `2048 x 1024` pixels.
  - Keep file sizes under 15MB for fast loading, as they load dynamically.

---

## 2. Place Files in the Public Directory

Place your assets inside the standard Next.js static asset folder (`public/`):

1. **For 360° Photos**:
   - Save them to: `public/images/`
   - Example: `public/images/room-1-360.jpg`

2. **For 360° Videos**:
   - Save them to: `public/videos/`
   - Example: `public/videos/room-1-360.mp4`

---

## 3. Update the Room Configuration in Code

Open the file [RoomExplorer.tsx](file:///C:/Users/HP/Desktop/aroohan-serenity-resort/components/3d/RoomExplorer.tsx). Inside the file, you will find the `rooms` configuration array (around lines 15-37):

```typescript
const rooms: RoomData[] = [
  {
    id: 1,
    name: "Luxury Serenity Cottage",
    desc: "Private garden deck, outdoor rain shower, forest view.",
    color: "#0b3d2e",
    theme: "#b89b72",
    // ⬇️ Add image or video path relative to the public directory
    imageUrl: "/images/room-1-360.jpg",
  },
  {
    id: 2,
    name: "Ocean Vista Villa",
    desc: "Infinity plunge pool, floor-to-ceiling glass, direct shore path.",
    color: "#1a3644",
    theme: "#e1caa0",
    // ⬇️ Add a 360° video path
    videoUrl: "/videos/room-2-360.mp4",
  },
  {
    id: 3,
    name: "Forest Canopy Retreat",
    desc: "Elevated treehouse architecture, skylight stargazing, organic cotton bed.",
    color: "#2a3d1c",
    theme: "#c2d1b0",
    // ⬇️ If neither is set, it falls back to the luxurious wireframe 3D grid
  },
];
```

### Key Behaviors:
- **`imageUrl`**: Takes precedence. If you provide a path like `/images/room-1-360.jpg`, the 3D viewer will load this photo and display it as an immersive 360° environment.
- **`videoUrl`**: If `videoUrl` is provided (and `imageUrl` is empty), the 3D viewer will stream this video texture dynamically, allowing users to look around a moving 360° video.
- **Fallback**: If neither is specified, the system renders a premium, neon-glowing wireframe space with floating architectural pillars so the website remains fully functional and looks high-tech.
