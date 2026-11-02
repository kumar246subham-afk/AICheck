import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MailCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MagneticButton from '../components/MagneticButton';
import toast from 'react-hot-toast';

export function EmailVerificationPage() {
  const location = useLocation();
  const { user, sendVerification, isFirebaseConfigured } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const email = location.state?.email || user?.email || 'your registered email';

  const handleResend = async () => {
    setIsSending(true);
    try {
      if (!isFirebaseConfigured) {
        toast.success(`[Test Mode] Verification email re-sent to ${email}`);
        setIsSending(false);
        return;
      }
      await sendVerification();
      toast.success('Verification link resent to your email address!');
    } catch (err) {
      console.error('Error resending email verification:', err);
      toast.error(err.message || 'Could not resend email verification right now.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050816]">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00D9FF]/06 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full rounded-3xl bg-[#111B30]/85 border border-white/[0.09] p-8 sm:p-10 backdrop-blur-2xl shadow-glass-card relative z-10 text-center space-y-6"
      >
        
        {/* Verification Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center mx-auto text-[#00D9FF] shadow-glow-cyan">
          <MailCheck className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Verify Your Email Address
          </h2>
          <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
            We sent a verification link to <strong className="text-[#00D9FF]">{email}</strong>. Please check your inbox and click the link to confirm your account.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link to="/dashboard" className="block w-full">
            <MagneticButton className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2">
              <span>Proceed to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={isSending}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0B1224] border border-white/[0.08] hover:border-white/[0.15] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
            <span>Didn't receive email? Resend</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 pt-2 border-t border-white/[0.06]">
          Tip: Check your spam or junk folder if you don't see the verification link within 2 minutes.
        </p>

      </motion.div>

    </div>
  );
}

export default EmailVerificationPage;
