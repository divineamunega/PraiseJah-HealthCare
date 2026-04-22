import React, { useState } from 'react';
import { useChangePassword, useLogout } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { Shield, Lock, ArrowRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const changePassword = useChangePassword();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await changePassword.mutateAsync({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Password changed successfully. Please login again.');
      
      // Logout after password change to force fresh login with ACTIVE status
      logout.mutate(undefined, {
        onSuccess: () => {
          navigate('/login');
        },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-clinical-blue/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-surface-container-low p-10 shadow-2xl border-none relative overflow-hidden group"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-clinical-blue/5 rounded-full blur-3xl group-hover:bg-clinical-blue/10 transition-all duration-700" />

        <div className="relative space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-clinical-blue rounded-sm flex items-center justify-center shadow-lg shadow-clinical-blue/20">
              <Lock size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tighter">Security <span className="text-on-surface-variant font-normal">Update</span></h1>
              <p className="mono-label text-clinical-blue mt-1">First-time Activation Required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="mono-label text-on-surface-variant">Current Password</label>
                <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                  <Lock size={16} className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors" />
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="mono-label text-on-surface-variant">New Password</label>
                <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                  <Shield size={16} className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="mono-label text-on-surface-variant">Confirm New Password</label>
                <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                  <Shield size={16} className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/30"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={changePassword.isPending}
              className="w-full bg-clinical-blue py-3 px-6 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              {changePassword.isPending ? 'UPDATING...' : 'UPDATE & ACTIVATE'}
              {!changePassword.isPending && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="pt-6 border-t border-white/5 text-center">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 mx-auto text-[10px] text-on-surface-variant hover:text-red-400 transition-colors uppercase tracking-widest font-medium"
            >
              <LogOut size={12} />
              Return to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
