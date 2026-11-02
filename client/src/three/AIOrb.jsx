import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function AIOrb({ speed = 1.6, distort = 0.38, radius = 1.25 }) {
  const groupRef = useRef();
  const outerMesh = useRef();
  const innerMesh = useRef();
  const ringCyan = useRef();
  const ringViolet = useRef();
  const haloPoints = useRef();

  useFrame((state, delta) => {
    // Pointer tracking with smooth damping (lerp)
    if (groupRef.current) {
      const targetRotX = state.pointer.y * 0.25;
      const targetRotY = state.pointer.x * 0.35;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    }

    // Outer liquid pulsation
    if (outerMesh.current) {
      outerMesh.current.rotation.y += delta * 0.2;
      outerMesh.current.rotation.x += delta * 0.1;
    }

    // Inner core counter-rotation
    if (innerMesh.current) {
      innerMesh.current.rotation.y -= delta * 0.35;
      innerMesh.current.rotation.z += delta * 0.15;
    }

    // Dual quantum energy rings
    if (ringCyan.current) {
      ringCyan.current.rotation.z += delta * 0.3;
      ringCyan.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.35;
    }
    if (ringViolet.current) {
      ringViolet.current.rotation.y += delta * 0.4;
      ringViolet.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Pulsing Liquid Core */}
      <Sphere ref={outerMesh} args={[radius, 64, 64]}>
        <MeshDistortMaterial
          color="#00D9FF"
          emissive="#005A9E"
          emissiveIntensity={0.65}
          roughness={0.12}
          metalness={0.85}
          distort={distort}
          speed={speed}
          transparent
          opacity={0.86}
        />
      </Sphere>

      {/* Inner Crystalline Neural Core */}
      <Sphere ref={innerMesh} args={[radius * 0.62, 28, 28]}>
        <meshStandardMaterial
          color="#A78BFA"
          emissive="#8B5CF6"
          emissiveIntensity={1.9}
          roughness={0.2}
          wireframe
        />
      </Sphere>

      {/* Primary Quantum Energy Ring (Cyan) */}
      <mesh ref={ringCyan} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[radius * 1.55, 0.018, 16, 100]} />
        <meshStandardMaterial
          color="#00D9FF"
          emissive="#00D9FF"
          emissiveIntensity={1.3}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Secondary Quantum Energy Ring (Violet) */}
      <mesh ref={ringViolet} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[radius * 1.8, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#8B5CF6"
          emissiveIntensity={1.4}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}

export default AIOrb;
