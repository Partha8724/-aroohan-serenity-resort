// @ts-nocheck
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

import { useMemo } from "react";

// Particles floating gracefully in the background over the video
const AmbientParticles = () => {
  const [count, setCount] = useState(150);
  const meshRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const finalCount = isMobile ? 50 : 150;
    setCount(finalCount);

    const positions = new Float32Array(finalCount * 3);
    for (let i = 0; i < finalCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    if (geomRef.current) {
      geomRef.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
    }
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.02;
      meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry ref={geomRef} />
      <pointsMaterial
        size={0.05}
        color="#b89b72"
        transparent
        opacity={0.6}
        sizeWrite={false}
      />
    </points>
  );
};

export const HeroScene = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div style={{ height: "100%", width: "100%", background: "#111111" }} />;

  return (
    <div style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={typeof window !== "undefined" && window.innerWidth < 768 ? 1 : [1, 2]}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#f5f0e1" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#b89b72" />
        
        <AmbientParticles />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};
