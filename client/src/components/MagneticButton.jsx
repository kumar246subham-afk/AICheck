import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function MagneticButton({
  children,
  className = '',
  onClick,
  disabled = false,
  strength = 0.25,
  ...props
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default MagneticButton;
