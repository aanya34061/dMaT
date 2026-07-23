'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  BookMarked,
  Award,
  Crown,
  Play,
  KeyRound,
  Trash2,
  Edit2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile, changePassword, upgradeSubscription, deleteAccount } = useAuth();

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Change password states
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Delete account modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePass, setDeletePass] = useState('');

  // Status & notifications
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 font-semibold flex items-center gap-2">
          <BrandLogo variant="emblem" height={40} />
          Loading user profile...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Please sign in or create an account to view your user profile and track performance metrics.
        </p>
        <Link href="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow">
          Sign In
        </Link>
      </div>
    );
  }

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    const res = await updateProfile({ name, avatarUrl });
    setSubmitting(false);
    if (res.success) {
      setMessage('Profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      setError(res.error || 'Failed to update profile');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    const res = await changePassword(currentPass, newPass);
    setSubmitting(false);
    if (res.success) {
      setMessage('Password changed successfully!');
      setIsChangingPass(false);
      setCurrentPass('');
      setNewPass('');
    } else {
      setError(res.error || 'Failed to change password');
    }
  };

  const handleTogglePlan = async () => {
    setError('');
    setMessage('');
    const targetPlan = user.subscription.plan === 'PRO' ? 'FREE' : 'PRO';
    const res = await upgradeSubscription(targetPlan);
    if (res.success) {
      setMessage(`Subscription updated to ${targetPlan} plan!`);
    } else {
      setError(res.error || 'Subscription update failed');
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await deleteAccount(deletePass);
    setSubmitting(false);
    if (res.success) {
      router.push('/login');
    } else {
      setError(res.error || 'Deletion failed');
    }
  };

  const continueLink = user.progress.lastQuestionId ? `/practice?id=${user.progress.lastQuestionId}` : '/practice';
  const joinDateFormatted = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const lastActiveFormatted = new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow transition-colors bg-slate-50/50 dark:bg-slate-950">
      {/* Top Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-2xl border-2 border-blue-500 shadow-md object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user.name[0].toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-950 dark:text-white">{user.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                  user.subscription.plan === 'PRO'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {user.subscription.plan === 'PRO' && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                {user.subscription.plan} PLAN
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Joined {joinDateFormatted}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Active {lastActiveFormatted}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
          <Link
            href={continueLink}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105"
          >
            <Play className="w-4 h-4 fill-white" />
            Continue Learning
          </Link>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-750 transition-all flex items-center justify-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Edit Profile Panel */}
      {isEditingProfile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-blue-500" />
            Update Account Details
          </h3>
          <form onSubmit={handleUpdateProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Attempted</span>
            <Target className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{user.profile.totalAttempts}</p>
          <p className="text-[11px] text-slate-400">Total answered</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Accuracy</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{user.profile.accuracy}%</p>
          <p className="text-[11px] text-slate-400">{user.profile.correctAnswers} correct / {user.profile.incorrectAnswers} incorrect</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Streak</span>
            <Zap className="w-4 h-4 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{user.profile.streak} Days</p>
          <p className="text-[11px] text-slate-400">Daily study streak</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-indigo-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">XP Points</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{user.profile.xp} XP</p>
          <p className="text-[11px] text-slate-400">Earned from quizzes</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bookmarks</span>
            <BookMarked className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{user.profile.bookmarkedCount}</p>
          <p className="text-[11px] text-slate-400">Flagged questions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-cyan-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Study Time</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{user.profile.studyTimeMinutes} mins</p>
          <p className="text-[11px] text-slate-400">Total time spent</p>
        </div>
      </div>

      {/* Subscription & Account Settings Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Plan Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Subscription & Billing
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {user.subscription.plan}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {user.subscription.plan === 'PRO'
              ? 'You are on the Pro Plan. You have unlocked unlimited practice questions, full explanations, advanced diagnostic statistics, and priority support.'
              : 'You are currently on the Free Plan. Upgrade to Pro to unlock unlimited practice questions, detailed analytical performance breakdowns, and exam simulations.'}
          </p>

          <button
            onClick={handleTogglePlan}
            className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              user.subscription.plan === 'PRO'
                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md'
            }`}
          >
            {user.subscription.plan === 'PRO' ? 'Downgrade to Free Plan' : 'Upgrade to Pro Plan'}
          </button>
        </div>

        {/* Password & Security Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-500" />
              Security & Credentials
            </h3>
          </div>

          {!isChangingPass ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep your account secure by updating your password regularly.
              </p>
              <button
                onClick={() => setIsChangingPass(true)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsChangingPass(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsDeleting(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-rose-600 text-base flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Account Permanently?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action cannot be undone. All your progress, answers, bookmarks, and account data will be erased permanently.
            </p>
            <form onSubmit={handleDeleteSubmit} className="space-y-3">
              <input
                type="password"
                required
                value={deletePass}
                onChange={(e) => setDeletePass(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
