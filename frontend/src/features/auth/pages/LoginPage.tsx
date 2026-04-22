import React, { useState } from 'react';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login.mutateAsync({ email, password });
      
      if (data.user.status === 'PENDING') {
        navigate('/change-password');
        return;
      }

      const role = data.user.role.toLowerCase();
      navigate(role === 'admin' ? '/admin' : `/${role}`);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
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
              <h1 className="text-2xl font-bold text-white tracking-tighter">PraiseJah <span className="text-on-surface-variant font-normal">EMR</span></h1>
              <p className="mono-label text-clinical-blue mt-1">Surgical Governance Portal</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="mono-label text-on-surface-variant">Access Identity</label>
                <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                  <Mail size={16} className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors" />
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

              <div className="space-y-1">
                <label className="mono-label text-on-surface-variant">Security Key</label>
                <div className="flex items-center gap-3 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors group/input">
                  <Lock size={16} className="text-on-surface-variant group-focus-within/input:text-clinical-blue transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/30"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-clinical-blue py-3 px-6 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              {login.isPending ? 'AUTHENTICATING...' : 'AUTHORIZE ACCESS'}
              {!login.isPending && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-xs text-on-surface-variant hover:text-clinical-blue transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">
              Protected by Hospital Security Protocol v4.2
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
