'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@dmat.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      setIsSubmitting(false);

      if (!res.ok || data.error) {
        setError(data.error || 'Admin login failed');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('dmat_admin_token', data.token);
          localStorage.setItem('dmat_auth_token', data.token);
        }
        router.push('/admin');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError('Network error');
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo variant="stacked" height={110} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            Restricted Admin Portal
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">System Administrator Authentication</h1>
          <p className="text-xs text-slate-400">
            Sign in to manage users, subscription tiers, platform analytics, and question banks.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5"
        >
          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-900/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dmat.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {isSubmitting ? 'Authenticating...' : 'Access Admin Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" /> Default Admin Credentials:
            </p>
            <p className="font-mono text-slate-400">Email: admin@dmat.com | Password: admin123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
