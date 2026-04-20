import React, { useState } from 'react';
import { useForgotPassword } from '../../lib/authQueries';
import { Shield, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword.mutateAsync({ email });
      setSubmitted(true);
      toast.success('Reset link sent');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
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
                Password Recovery
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="bg-background border border-white/5 p-6">
                <p className="text-sm text-white mb-2">
                  If your email is in our system, you will receive a reset link
                  shortly.
                </p>
                <p className="text-xs text-on-surface-variant">
                  Please check your inbox and spam folder.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-clinical-blue hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                RETURN TO LOGIN
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-on-surface-variant text-center">
                Enter your email address and we'll send you a link to reset
                your password.
              </p>

              <div className="space-y-1">
                <label className="mono-label text-on-surface-variant">
                  Access Identity
                </label>
                <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                  <Mail
                    size={16}
                    className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="clinical_id@praisejah.com"
                    required
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="w-full bg-clinical-blue py-3 px-6 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                {forgotPassword.isPending
                  ? 'SENDING...'
                  : 'SEND RESET LINK'}
                {!forgotPassword.isPending && (
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

export default ForgotPasswordPage;
