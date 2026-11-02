import React, { useState, useEffect } from 'react';

export function MouseFollowLight() {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-60"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0, 210, 255, 0.05), rgba(139, 92, 246, 0.03) 40%, transparent 80%)`,
      }}
    />
  );
}

export default MouseFollowLight;
