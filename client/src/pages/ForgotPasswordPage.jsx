import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MagneticButton from '../components/MagneticButton';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { resetPassword, isFirebaseConfigured } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        toast.success(`[Test Mode] Password reset link simulated for ${email}`);
        setIsSuccess(true);
        setIsLoading(false);
        return;
      }

      await resetPassword(email);
      setIsSuccess(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No user account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address syntax.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050816]">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00D9FF]/06 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full rounded-3xl bg-[#111B30]/85 border border-white/[0.09] p-8 sm:p-10 backdrop-blur-2xl shadow-glass-card relative z-10 space-y-6"
      >
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00D9FF] to-[#8B5CF6] p-[2px]">
              <div className="w-full h-full bg-[#0B1224] rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#00D9FF]" />
              </div>
            </div>
            <span className="font-extrabold text-lg text-white">AICheck</span>
          </Link>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
            Enter your account email to receive a secure Firebase password reset link.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#0B1224]/80 border border-[#10B981]/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center mx-auto text-[#10B981]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have dispatched password reset instructions to <strong className="text-[#10B981]">{email}</strong>.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white text-xs hover:opacity-95 transition-all mt-2"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Registered email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0B1224]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <MagneticButton
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </MagneticButton>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#00D9FF] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>

          </form>
        )}

      </motion.div>

    </div>
  );
}

export default ForgotPasswordPage;
