import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, ArrowRight, User, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MagneticButton from './MagneticButton';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Technology', href: '#technology' },
    { name: 'About', href: '#about' },
  ];

  const handleNavClick = (link) => {
    setActiveSection(link.name);
    setMobileMenuOpen(false);

    if (link.href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate(`/${link.href}`);
      } else {
        const el = document.querySelector(link.href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(link.href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050816]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D9FF] to-[#8B5CF6] p-[2px] shadow-glow-cyan transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#0B1224] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#00D9FF]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                AICheck
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30 tracking-wider">
                3D AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#111B30]/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.06]">
            {navLinks.map((link) => {
              const isActive = activeSection === link.name;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className={`relative px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer rounded-full ${
                    isActive ? 'text-white' : 'text-[#94A3B8] hover:text-[#00D9FF]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/[0.12]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <MagneticButton className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30 hover:bg-[#00D9FF]/20 transition-all shadow-glow-cyan">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </MagneticButton>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link to="/register">
                  <MagneticButton className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </MagneticButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#111B30] border border-white/[0.08]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B1224]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pt-3 pb-6 mt-3 space-y-3"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-[#00D9FF] hover:bg-white/[0.04]"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
