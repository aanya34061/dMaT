'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, User as UserIcon, ArrowRight, KeyRound, Sparkles, Shield, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, forgotPassword, resetPassword, isAuthenticated } = useAuth();

  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Status & errors
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'signup') {
      if (!name.trim()) return setError('Please enter your full name');
      if (!email.trim()) return setError('Please enter your email');
      if (!password) return setError('Please enter a password');
      if (password.length < 6) return setError('Password must be at least 6 characters');
      if (password !== confirmPassword) return setError('Passwords do not match');

      setIsSubmitting(true);
      const result = await signup(name, email, password);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || 'Sign up failed');
      } else {
        router.push('/profile');
      }
    } else {
      if (!email.trim() || !password) return setError('Please enter email and password');

      setIsSubmitting(true);
      const result = await login(email, password);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || 'Sign in failed');
      } else {
        router.push('/profile');
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const res = await forgotPassword(forgotEmail);
    setIsSubmitting(false);
    if (res.success) {
      setForgotStep(2);
      setSuccessMsg(res.message || 'Reset code sent!');
    } else {
      setError(res.error || 'Request failed');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const res = await resetPassword(forgotEmail, resetCode, newPassword);
    setIsSubmitting(false);
    if (res.success) {
      setShowForgotModal(false);
      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      setActiveTab('signin');
      setForgotStep(1);
    } else {
      setError(res.error || 'Reset failed');
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo variant="stacked" height={100} linkToHome />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {activeTab === 'signin' ? 'Sign in to dMAT Platform' : 'Create your dMAT Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access practice questions, chapter analytics, and user account progress.
          </p>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
        >
          {/* Tab Controls */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => {
                setActiveTab('signin');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {activeTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotEmail(email);
                      setError('');
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? 'Processing...' : activeTab === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Reset Password
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your email address and we will send you instructions to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instructions sent! Enter your code and new password below.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="RESET-2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Loading auth portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}

