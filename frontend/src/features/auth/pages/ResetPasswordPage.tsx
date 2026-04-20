import React, { useState } from 'react';
import { useResetPassword } from '@/features/auth/hooks/useAuth';
import { Shield, Lock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { toast } from 'sonner';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  const resetPassword = useResetPassword();

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-low p-10 text-center space-y-6">
          <p className="text-sm text-red-400">
            Invalid or missing reset token.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-xs font-bold text-clinical-blue hover:text-white transition-colors"
          >
            REQUEST A NEW LINK
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;

    try {
      await resetPassword.mutateAsync({ token, newPassword });
      setSucceeded(true);
      toast.success('Password reset successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    }
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
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tighter">
                PraiseJah{' '}
                <span className="text-on-surface-variant font-normal">
                  EMR
                </span>
              </h1>
              <p className="mono-label text-clinical-blue mt-1">
                Reset Password
              </p>
            </div>
          </div>

          {succeeded ? (
            <div className="space-y-6 text-center">
              <div className="bg-background border border-green-500/20 p-6">
                <CheckCircle
                  size={32}
                  className="text-green-400 mx-auto mb-3"
                />
                <p className="text-sm text-white mb-2">
                  Password has been reset successfully.
                </p>
                <p className="text-xs text-on-surface-variant">
                  You can now log in with your new password.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-clinical-blue py-3 px-6 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all"
              >
                GO TO LOGIN
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="mono-label text-on-surface-variant">
                    New Password
                  </label>
                  <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                    <Lock
                      size={16}
                      className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="mono-label text-on-surface-variant">
                    Confirm Password
                  </label>
                  <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                    <Lock
                      size={16}
                      className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={8}
                      className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/30"
                    />
                  </div>
                </div>

                {newPassword &&
                  confirmPassword &&
                  newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={
                  resetPassword.isPending ||
                  newPassword !== confirmPassword ||
                  !newPassword
                }
                className="w-full bg-clinical-blue py-3 px-6 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                {resetPassword.isPending
                  ? 'RESETTING...'
                  : 'RESET PASSWORD'}
                {!resetPassword.isPending && (
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-xs font-bold text-on-surface-variant hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                BACK TO LOGIN
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
