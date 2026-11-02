import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Scene3D from '../three/Scene3D';
import MagneticButton from '../components/MagneticButton';
import { apiUrl } from '../services/api';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [helpAction, setHelpAction] = useState(null);

  const { loginWithEmail, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setHelpAction(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setErrorMessage('Firebase is not yet configured with valid credentials in client/.env.');
        setIsLoading(false);
        return;
      }

      await loginWithEmail(cleanEmail, password, rememberMe);
      toast.success('Welcome back to AICheck!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error code:', err.code, 'message:', err.message);
      let msg = 'Failed to sign in. Please verify your credentials.';
      let action = null;

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        // Consult server-side Firebase Admin SDK to accurately identify the root cause
        try {
          const res = await fetch(apiUrl('/auth/check-method'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail }),
          });
          const checkData = await res.json();

          if (checkData.status === 'success') {
            if (!checkData.exists) {
              msg = `No account found for "${cleanEmail}". Please register to create an account.`;
              action = { type: 'register', label: 'Create an account', link: '/register' };
            } else if (checkData.isGoogleOnly) {
              msg = `The account "${cleanEmail}" was created using Google Sign-In and does not have a separate password. Please sign in with Google below.`;
              action = { type: 'google', label: 'Continue with Google' };
            } else if (checkData.disabled) {
              msg = 'This user account has been disabled. Please contact support.';
            } else {
              msg = 'Incorrect password for this email address. Please check your spelling or reset your password.';
              action = { type: 'forgot', label: 'Reset password', link: '/forgot-password' };
            }
          } else {
            msg = 'Invalid email or password. If you registered using Google, please click "Continue with Google" below.';
            action = { type: 'google', label: 'Continue with Google' };
          }
        } catch (checkErr) {
          msg = 'Invalid email or password. If you registered with Google, please click "Continue with Google" below.';
          action = { type: 'google', label: 'Continue with Google' };
        }
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address format is invalid. Please check for spelling mistakes.';
      } else if (err.code === 'auth/user-disabled') {
        msg = 'This user account has been disabled by an administrator.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or trying again later.';
        action = { type: 'forgot', label: 'Reset password', link: '/forgot-password' };
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        msg = err.message;
      }

      setErrorMessage(msg);
      setHelpAction(action);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setHelpAction(null);
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setErrorMessage('Firebase is not yet configured with valid credentials in client/.env.');
        setIsLoading(false);
        return;
      }
      await loginWithGoogle();
      toast.success('Signed in with Google successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
        toast.error('Google sign-in was interrupted.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050816]">
      
      {/* Background Ambient Atmospheres */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00D9FF]/05 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#8B5CF6]/05 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* =====================================================================
            LEFT PANEL: 3D AI Orb, Atmospheric Elements & Brand Statement
            ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:col-span-6 flex-col justify-center relative space-y-6 pr-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111B30]/80 border border-white/[0.08] backdrop-blur-md w-fit">
            <Sparkles className="w-4 h-4 text-[#00D9FF]" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
              SECURE PLATFORM ACCESS
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Linguistic Precision <br />
            <span className="text-gradient-highlight">at Enterprise Scale.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-md">
            Log in to access your analysis workspace, export verifiable audit reports, and inspect multi-format documents with sentence-level transparency.
          </p>

          {/* Interactive 3D Canvas Box */}
          <div className="w-full h-80 relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0B1224]/50">
            <Scene3D showDocs={true} className="w-full h-full" />
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#00D9FF] shrink-0" />
              <span>Multi-Tenant Isolation</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Zero Disk Retention</span>
            </div>
          </div>
        </motion.div>

        {/* =====================================================================
            RIGHT PANEL: Premium Glassmorphism Login Card
            ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-6 max-w-md w-full mx-auto"
        >
          <div className="bg-[#111B30]/85 border border-white/[0.09] rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-glass-card space-y-6">
            
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
                Welcome back
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Enter your credentials to access your protected workspace.
              </p>
            </div>

            {/* Error Message with Smart Contextual Action */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>

                {helpAction?.type === 'google' && (
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="mt-1 px-3 py-2 rounded-lg bg-[#00D9FF]/20 hover:bg-[#00D9FF]/30 text-[#00D9FF] border border-[#00D9FF]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Click here to Sign in with Google</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {helpAction?.type === 'register' && (
                  <Link
                    to="/register"
                    className="mt-1 px-3 py-2 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Go to Registration Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                {helpAction?.type === 'forgot' && (
                  <Link
                    to="/forgot-password"
                    className="mt-1 px-3 py-2 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Reset Password via Email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                      if (helpAction) setHelpAction(null);
                    }}
                    onBlur={() => setEmail(email.trim())}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck="false"
                    placeholder="name@company.com"
                    className="w-full bg-[#0B1224]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#00D9FF] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                      if (helpAction) setHelpAction(null);
                    }}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B1224]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0B1224] border-white/20 text-[#00D9FF] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-slate-400 cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Primary Login Button with Magnetic Interaction */}
              <MagneticButton
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </MagneticButton>

            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#111B30] px-3 text-[11px] text-slate-400 uppercase font-mono tracking-wider absolute">
                or continue with
              </span>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-200 bg-[#0B1224]/80 hover:bg-[#162340] border transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                helpAction?.type === 'google'
                  ? 'border-[#00D9FF] shadow-glow-cyan ring-1 ring-[#00D9FF]'
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
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

            {/* Footer Signup Link */}
            <div className="text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#00D9FF] hover:underline font-semibold">
                Create an account
              </Link>
            </div>

          </div>
        </motion.div>

      </div>

    </div>
  );
}

export default LoginPage;
