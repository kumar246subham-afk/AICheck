import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Scene3D from '../three/Scene3D';
import MagneticButton from '../components/MagneticButton';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { registerWithEmail, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-sky-400', 'bg-emerald-500'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('You must accept the Terms of Service and Privacy Policy to register.');
      return;
    }

    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setErrorMessage('Firebase is not yet configured with valid credentials. Please configure the VITE_FIREBASE_* environment variables in your deployment settings.');
        setIsLoading(false);
        return;
      }

      await registerWithEmail(email.trim(), password, fullName.trim());
      toast.success('Account created successfully! Verification email sent.');
      navigate('/verify-email', { state: { email: email.trim() } });
    } catch (err) {
      console.error('Registration error:', err);
      let msg = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address provided is invalid.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The password is too weak. Please use at least 6 characters with mixed symbols.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setErrorMessage('Firebase is not yet configured with valid credentials. Please configure the VITE_FIREBASE_* environment variables in your deployment settings.');
        setIsLoading(false);
        return;
      }
      await loginWithGoogle();
      toast.success('Welcome to AICheck!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google sign-up error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google sign-up failed.');
        toast.error('Google registration was interrupted.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050816]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#00D9FF]/05 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[#8B5CF6]/05 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* =====================================================================
            LEFT PANEL: 3D Composition & Platform Capabilities
            ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111B30]/80 border border-white/[0.08] backdrop-blur-md w-fit">
            <Sparkles className="w-4 h-4 text-[#00D9FF]" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
              JOIN AICHECK PLATFORM
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-[1.18]">
            Begin Analyzing with <br />
            <span className="text-gradient-highlight">3D Intelligence.</span>
          </h1>

          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Create your account to unlock multi-format document analysis, burstiness analytics, sentence-level color highlighting, and executive PDF reporting.
          </p>

          {/* 3D Scene Mini Preview */}
          <div className="w-full h-72 relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0B1224]/50">
            <Scene3D showDocs={true} className="w-full h-full" />
          </div>

          {/* Checklist */}
          <div className="space-y-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00D9FF] shrink-0" />
              <span>Full access to PDF, DOCX, DOC and TXT parsing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Private history with strict Firestore ownership isolation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0" />
              <span>Downloadable executive PDF audit reports</span>
            </div>
          </div>
        </motion.div>

        {/* =====================================================================
            RIGHT PANEL: Premium Glassmorphism Registration Form
            ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-7 max-w-lg w-full mx-auto"
        >
          <div className="bg-[#111B30]/85 border border-white/[0.09] rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-glass-card space-y-5">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00D9FF] to-[#8B5CF6] p-[2px]">
                  <div className="w-full h-full bg-[#0B1224] rounded-[6px] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#00D9FF]" />
                  </div>
                </div>
                <span className="font-extrabold text-lg text-white">AICheck</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Enter your details to register for the platform.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-[#0B1224]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full bg-[#0B1224]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0B1224]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0B1224]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Password Strength Indicator */}
              {password && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {strengthLabels[Math.max(0, strength - 1)] || 'Too Short'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          step < strength ? strengthColors[strength - 1] : 'bg-white/[0.08]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Acceptance */}
              <div className="flex items-start pt-1">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-[#0B1224] border-white/20 text-[#00D9FF] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="accept-terms" className="ml-2.5 text-xs text-slate-400 leading-snug cursor-pointer">
                  I accept the{' '}
                  <Link to="/terms" className="text-[#00D9FF] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#00D9FF] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <MagneticButton
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2 pt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </MagneticButton>

            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#111B30] px-3 text-[11px] text-slate-400 uppercase font-mono tracking-wider absolute">
                or sign up with
              </span>
            </div>

            {/* Google Registration */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-200 bg-[#0B1224]/80 hover:bg-[#162340] border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Existing User Login Link */}
            <div className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00D9FF] hover:underline font-semibold">
                Sign in here
              </Link>
            </div>

          </div>
        </motion.div>

      </div>

    </div>
  );
}

export default RegisterPage;
