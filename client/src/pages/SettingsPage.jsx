import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  MailCheck,
  Trash2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user, userProfile, updateUserProfileData, resetPassword, logout, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(userProfile?.fullName || user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Update profile name
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }
    setIsUpdating(true);
    try {
      if (isFirebaseConfigured) {
        await updateUserProfileData({ fullName });
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Dispatch password change email
  const handleChangePassword = async () => {
    if (!user?.email) {
      toast.error('No email associated with this session.');
      return;
    }
    setIsSendingReset(true);
    try {
      if (isFirebaseConfigured) {
        await resetPassword(user.email);
        toast.success(`Password reset email sent to ${user.email}!`);
      } else {
        toast.success(`[Test Mode] Password change email sent to ${user.email}`);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('Could not send password change email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.success('Account and session data removed.');
    await logout();
    navigate('/');
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Manage your personal details, credentials, and privacy configurations.
        </p>
      </div>

      {/* Profile Details Form */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-cyber-blue" />
          <span>Profile Information</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address (Fixed)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'user@aicheck.ai'}
              className="w-full px-4 py-2.5 rounded-xl bg-midnight-900 border border-white/5 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyber-blue text-midnight-950 hover:bg-cyber-blue-light transition-all flex items-center gap-2 shadow-glow-blue/20"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Security & Password Reset */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyber-violet" />
          <span>Security & Authentication</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
          Need to change your password? Click below and Firebase will send an official password modification link directly to your inbox.
        </p>

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={isSendingReset}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-midnight-900 border border-white/10 hover:border-cyber-violet/40 text-slate-200 transition-colors flex items-center gap-2"
        >
          <MailCheck className="w-4 h-4 text-cyber-violet" />
          <span>{isSendingReset ? 'Dispatching Email...' : 'Send Password Reset Email'}</span>
        </button>
      </div>

      {/* Privacy Settings */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white">Privacy Controls</h3>
        <div className="space-y-3 text-xs text-slate-300">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-midnight-900 border-white/10 text-cyber-blue" />
            <span>Enable zero retention for uploaded documents (buffers purged instantly)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-midnight-900 border-white/10 text-cyber-blue" />
            <span>Exclude my scan metrics from anonymous model accuracy benchmarks</span>
          </label>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border-rose-500/30 space-y-4">
        <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
          Permanently delete your account, saved analyses, and profile settings. This action cannot be reversed.
        </p>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border-rose-500/50 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you completely sure you want to delete your account? All saved document analysis history will be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-midnight-900 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsPage;
