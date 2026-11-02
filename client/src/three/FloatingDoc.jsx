import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';

export function FloatingDoc({ position = [0, 0, 0], label = 'PDF', color = '#00d2ff', emissive = '#0084ff', speed = 2 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Float
      position={position}
      speed={speed}
      rotationIntensity={1.2}
      floatIntensity={1.8}
    >
      <group ref={meshRef}>
        {/* Document Plate */}
        <mesh>
          <boxGeometry args={[0.9, 1.2, 0.08]} />
          <meshStandardMaterial
            color="#0a122a"
            emissive={emissive}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Glowing border edges */}
        <mesh>
          <boxGeometry args={[0.92, 1.22, 0.09]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            wireframe
          />
        </mesh>

        {/* 3D Label */}
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          fontWeight={700}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

export default FloatingDoc;
