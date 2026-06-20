"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Globe() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0018;
      groupRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1.55, 48, 48]} />
        <meshBasicMaterial
          color="#FFF12D"
          transparent
          opacity={0.055}
          wireframe
        />
      </mesh>
      {/* Inner solid sphere — very dark, adds depth */}
      <mesh>
        <sphereGeometry args={[1.52, 64, 64]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export default function GlobeCanvas() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      gl={{ alpha: true, antialias: true }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 3.6]} fov={60} />
      <ambientLight intensity={0.4} />
      <Globe />
    </Canvas>
  );
}
