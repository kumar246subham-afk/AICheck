import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import AIOrb from './AIOrb';
import FloatingDoc from './FloatingDoc';
import ParticleField from './ParticleField';

// Enterprise Fallback 2D Animated Component for prefers-reduced-motion or unsupported WebGL
function FallbackOrb() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 opacity-40 blur-3xl animate-pulse-slow"></div>
      <div className="relative w-48 h-48 rounded-full border border-cyan-400/30 shadow-glow-cyan flex items-center justify-center bg-[#0B1224]/80 backdrop-blur-xl">
        <div className="w-36 h-36 rounded-full border border-violet-500/40 animate-spin" style={{ animationDuration: '14s' }}></div>
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 flex flex-col items-center justify-center">
          <span className="text-[#00D9FF] font-mono font-bold text-xs tracking-wider">AICHECK</span>
          <span className="text-[9px] font-mono text-slate-400">3D CORE</span>
        </div>
      </div>
    </div>
  );
}

export function Scene3D({ showDocs = true, className = "h-[450px] md:h-[550px] w-full" }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (reducedMotion || hasWebGLError) {
    return (
      <div className={className}>
        <FallbackOrb />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<FallbackOrb />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          onError={() => setHasWebGLError(true)}
        >
          {/* Studio Lighting Rig */}
          <ambientLight intensity={0.55} />
          <pointLight position={[8, 8, 8]} intensity={1.6} color="#00D9FF" />
          <pointLight position={[-8, -8, -4]} intensity={1.4} color="#8B5CF6" />
          <directionalLight position={[0, 6, 6]} intensity={1.1} color="#FFFFFF" />

          {/* Interactive Constellation Particle Mesh */}
          <ParticleField count={180} />

          {/* Holographic AI Core Orb */}
          <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.1}>
            <AIOrb radius={1.25} speed={1.5} distort={0.38} />
          </Float>

          {/* Orbiting Multi-Format Documents */}
          {showDocs && (
            <>
              <FloatingDoc position={[-2.4, 1.2, -0.4]} label="PDF" color="#EF4444" emissive="#991B1B" speed={2.0} />
              <FloatingDoc position={[2.4, 0.9, -0.6]} label="DOCX" color="#3B82F6" emissive="#1D4ED8" speed={1.8} />
              <FloatingDoc position={[-1.9, -1.3, -0.2]} label="TXT" color="#10B981" emissive="#047857" speed={2.1} />
              <FloatingDoc position={[2.0, -1.2, -0.4]} label="DOC" color="#8B5CF6" emissive="#6D28D9" speed={2.3} />
            </>
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}

export default Scene3D;
