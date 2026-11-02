import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, ShieldCheck, Calendar, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TiltCard from '../components/TiltCard';

export function UserProfilePage() {
  const { user, userProfile, plan, role } = useAuth();

  const displayName = userProfile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Researcher';
  const email = userProfile?.email || user?.email || 'user@aicheck.ai';
  const createdAt = userProfile?.createdAt || new Date().toISOString();

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Profile Header */}
      <div className="p-8 rounded-3xl glass-card border-cyber-blue/20 bg-gradient-to-r from-midnight-900 via-midnight-850 to-midnight-900 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyber-blue to-cyber-violet p-[2px] shadow-glow-blue shrink-0">
          <div className="w-full h-full bg-midnight-900 rounded-[14px] flex items-center justify-center text-3xl font-extrabold text-cyber-blue">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-white truncate">{displayName}</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 font-bold uppercase">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">{email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyber-blue" />
              Member since {new Date(createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Access
            </span>
          </div>
        </div>

        <Link
          to="/settings"
          className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-midnight-900 border border-white/10 hover:border-cyber-blue/40 text-slate-200 transition-colors shrink-0"
        >
          Edit Profile
        </Link>
      </div>

      {/* Subscription Card */}
      <TiltCard glowColor="rgba(0, 210, 255, 0.25)">
        <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyber-violet/20 text-cyber-violet-light border border-cyber-violet/30 text-xs font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Current Plan: {plan}</span>
            </div>
            <h3 className="text-xl font-bold text-white">Unlock High-Capacity Document Scans</h3>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Upgrade to Professional or Enterprise for batch file uploads, unwatermarked PDF reports, and priority queue execution.
            </p>
          </div>

          <Link
            to="/pricing"
            className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 hover:shadow-glow-blue transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>View All Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </TiltCard>

      {/* Profile Details List */}
      <div className="rounded-3xl glass-card border-white/10 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white mb-4">Account Attributes</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5 space-y-1">
            <span className="text-slate-500 uppercase">User UID</span>
            <p className="text-slate-200 truncate">{user?.uid || 'local_session_uid'}</p>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5 space-y-1">
            <span className="text-slate-500 uppercase">Authentication Mode</span>
            <p className="text-emerald-400 font-bold">Firebase Token Verified</p>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5 space-y-1">
            <span className="text-slate-500 uppercase">Total Analyses</span>
            <p className="text-cyber-blue font-bold">{userProfile?.totalAnalyses || 0} Scans</p>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5 space-y-1">
            <span className="text-slate-500 uppercase">Data Retention Tier</span>
            <p className="text-slate-200">Zero Retention (Ephemerally Processed)</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default UserProfilePage;
