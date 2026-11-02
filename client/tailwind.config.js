/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Palette - Enterprise 3D Dark Direction
        deep: {
          950: '#050816', // Main Background
          900: '#0B1224', // Secondary Background
          850: '#111B30', // Card Surface
          800: '#162340',
          700: '#1D2E54',
          600: '#253C6D',
        },
        midnight: {
          950: '#050816',
          900: '#0B1224',
          850: '#111B30',
          800: '#162340',
          700: '#1D2E54',
          600: '#253C6D',
        },
        brand: {
          cyan: '#00D9FF',
          violet: '#8B5CF6',
          blue: '#3B82F6',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
        cyber: {
          blue: {
            DEFAULT: '#00D9FF',
            light: '#5AE2FF',
            dark: '#00A3C4',
            glow: 'rgba(0, 217, 255, 0.4)',
          },
          violet: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            dark: '#6D28D9',
            glow: 'rgba(139, 92, 246, 0.4)',
          },
          pink: {
            DEFAULT: '#EC4899',
            glow: 'rgba(236, 72, 153, 0.35)',
          },
          emerald: {
            DEFAULT: '#10B981',
            glow: 'rgba(16, 185, 129, 0.4)',
          },
          amber: {
            DEFAULT: '#F59E0B',
            glow: 'rgba(245, 158, 11, 0.4)',
          },
          slate: {
            DEFAULT: '#64748B',
            glow: 'rgba(100, 116, 139, 0.4)',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 217, 255, 0.45), 0 0 10px -3px rgba(0, 217, 255, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.45), 0 0 10px -3px rgba(139, 92, 246, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.45), 0 0 10px -3px rgba(245, 158, 11, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.45), 0 0 10px -3px rgba(16, 185, 129, 0.25)',
        'glass-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-card': '0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glow-blue': '0 0 25px -5px rgba(0, 217, 255, 0.45), 0 0 10px -3px rgba(0, 217, 255, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'laser-scan': 'scan 2.5s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '96%' },
          '100%': { top: '0%' },
        }
      }
    },
  },
  plugins: [],
};
