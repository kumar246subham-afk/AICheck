import React from 'react';
import { motion } from 'framer-motion';

export function HolographicScanner({ isScanning = true, children, className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {children}
      {isScanning && (
        <motion.div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyber-blue to-transparent shadow-[0_0_15px_#00d2ff] z-20 pointer-events-none"
          initial={{ top: '0%' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Faint laser haze underneath the beam */}
          <div className="w-full h-8 -mt-4 bg-gradient-to-b from-cyber-blue/15 to-transparent blur-sm"></div>
        </motion.div>
      )}
    </div>
  );
}

export default HolographicScanner;
