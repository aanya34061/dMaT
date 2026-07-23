'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  Crown,
  BookOpen,
  LayoutGrid,
  TrendingUp,
  DollarSign,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  BookMarked,
  Shield,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { AdminStats, SubscriberRecord, AnalyticsData } from '@/types/auth';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'overview' | 'subscribers' | 'analytics' | 'questions'>('users');

  // Auth / Loading states
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [subFilter, setSubFilter] = useState('ALL');

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  // Modals
  const [selectedUserModal, setSelectedUserModal] = useState<any | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  // Question Form State
  const [qTitle, setQTitle] = useState('');
  const [qChapterId, setQChapterId] = useState(1);
  const [qOpt0, setQOpt0] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [qExp, setQExp] = useState('');
  const [qDiff, setQDiff] = useState('Medium');

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Check admin authorization
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('dmat_admin_token') || localStorage.getItem('dmat_auth_token') : null;
    if (!t) {
      router.push('/admin/login');
      return;
    }
    setToken(t);
  }, [router]);

  const authHeaders = useCallback(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  // Fetch Overview Stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', { headers: authHeaders() });
      if (res.status === 403 || res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (_) {}
  }, [token, authHeaders, router]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        page: String(usersPagination.page),
        limit: String(usersPagination.limit),
        search: userSearch,
        plan: userPlanFilter,
        status: userStatusFilter,
      });
      const res = await fetch(`/api/admin/users?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setUsersPagination(data.pagination);
      }
    } catch (_) {}
  }, [token, authHeaders, usersPagination.page, usersPagination.limit, userSearch, userPlanFilter, userStatusFilter]);

  // Fetch Subscribers
  const fetchSubscribers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/subscribers?filter=${subFilter}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setSubscribers(data.subscribers);
    } catch (_) {}
  }, [token, authHeaders, subFilter]);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/analytics', { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (_) {}
  }, [token, authHeaders]);

  // Fetch Questions & Chapters
  const fetchQuestionsAndChapters = useCallback(async () => {
    if (!token) return;
    try {
      const qRes = await fetch('/api/admin/questions', { headers: authHeaders() });
      const qData = await qRes.json();
      if (qData.success) setQuestions(qData.questions);

      const cRes = await fetch('/api/admin/chapters', { headers: authHeaders() });
      const cData = await cRes.json();
      if (cData.success) setChapters(cData.chapters);
    } catch (_) {}
  }, [token, authHeaders]);

  // Load data when tab or token changes
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchSubscribers(),
      fetchAnalytics(),
      fetchQuestionsAndChapters(),
    ]).finally(() => setLoading(false));
  }, [token, fetchStats, fetchUsers, fetchSubscribers, fetchAnalytics, fetchQuestionsAndChapters]);

  // User Actions
  const handleUserAction = async (userId: string, action: 'toggleStatus' | 'togglePlan' | 'delete') => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        notify(`User ${user.name} deleted successfully`);
        fetchUsers();
        fetchStats();
      }
      return;
    }

    const newStatus = action === 'toggleStatus' ? (user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE') : user.status;
    const newPlan = action === 'togglePlan' ? (user.currentPlan === 'PRO' ? 'FREE' : 'PRO') : user.currentPlan;

    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ userId, status: newStatus, plan: newPlan }),
    });

    if (res.ok) {
      notify(`User ${user.name} updated`);
      fetchUsers();
      fetchStats();
      fetchSubscribers();
    }
  };

  // Question Form Submission
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingQuestion ? editingQuestion.id : undefined,
      chapterId: qChapterId,
      title: qTitle,
      options: [qOpt0, qOpt1, qOpt2, qOpt3],
      correctIndex: qCorrect,
      explanation: qExp,
      difficulty: qDiff,
    };

    const method = editingQuestion ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/questions', {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      notify(editingQuestion ? 'Question updated!' : 'New question added!');
      setShowQuestionModal(false);
      setEditingQuestion(null);
      fetchQuestionsAndChapters();
      fetchStats();
    }
  };

  const handleToggleQuestionStatus = async (q: any) => {
    const res = await fetch('/api/admin/questions', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ id: q.id, enabled: !q.enabled }),
    });
    if (res.ok) {
      notify(`Question status toggled`);
      fetchQuestionsAndChapters();
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Delete this question permanently?')) return;
    const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      notify('Question deleted');
      fetchQuestionsAndChapters();
      fetchStats();
    }
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/chapters', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title: cTitle, description: cDesc }),
    });

    if (res.ok) {
      notify('New chapter added!');
      setShowChapterModal(false);
      setCTitle('');
      setCDesc('');
      fetchQuestionsAndChapters();
      fetchStats();
    }
  };

  const openEditQuestionModal = (q: any) => {
    setEditingQuestion(q);
    setQTitle(q.title);
    setQChapterId(q.chapterId);
    setQOpt0(q.options[0] || '');
    setQOpt1(q.options[1] || '');
    setQOpt2(q.options[2] || '');
    setQOpt3(q.options[3] || '');
    setQCorrect(q.correctIndex || 0);
    setQExp(q.explanation || '');
    setQDiff(q.difficulty || 'Medium');
    setShowQuestionModal(true);
  };

  const openNewQuestionModal = () => {
    setEditingQuestion(null);
    setQTitle('');
    setQChapterId(chapters[0]?.id || 1);
    setQOpt0('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQCorrect(0);
    setQExp('');
    setQDiff('Medium');
    setShowQuestionModal(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dmat_admin_token');
      localStorage.removeItem('dmat_auth_token');
    }
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-white font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" height={36} />
            <div>
              <h2 className="font-extrabold text-base tracking-wider text-white">dMAT Admin</h2>
              <p className="text-[10px] text-slate-400">Control Panel v1.0</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Overview Stats
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              User Management
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'subscribers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Crown className="w-4 h-4" />
              Subscribers
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Question Bank
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300">Admin Account</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-400 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-10 space-y-8 overflow-x-hidden">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white capitalize">
              {activeTab} Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live administrative monitoring and configuration for dMAT Practice Platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchStats();
                fetchUsers();
                fetchSubscribers();
                fetchAnalytics();
                fetchQuestionsAndChapters();
                notify('Data refreshed');
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-semibold">Loading Admin Dashboard data...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* 9 Admin Counter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-blue-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                    <p className="text-[11px] text-slate-500">Registered platform accounts</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-emerald-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Users</span>
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.activeUsers}</p>
                    <p className="text-[11px] text-slate-500">Non-disabled accounts</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-amber-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pro Subscribers</span>
                      <Crown className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.proSubscribers}</p>
                    <p className="text-[11px] text-slate-500">Paid tier memberships</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Free Users</span>
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.freeUsers}</p>
                    <p className="text-[11px] text-slate-500">Standard free tier</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-cyan-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Questions</span>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.totalQuestions}</p>
                    <p className="text-[11px] text-slate-500">Active bank items</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-indigo-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Chapters</span>
                      <Layers className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.totalChapters}</p>
                    <p className="text-[11px] text-slate-500">Syllabus modules</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-rose-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Accuracy</span>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.averageAccuracy}%</p>
                    <p className="text-[11px] text-slate-500">Across all question attempts</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-emerald-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">${stats.totalRevenue}</p>
                    <p className="text-[11px] text-slate-500">Subscription revenue placeholder</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-purple-400">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">New Users Today</span>
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-black text-white">{stats.newUsersToday}</p>
                    <p className="text-[11px] text-slate-500">New signups in last 24h</p>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setUsersPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                      placeholder="Search users by name or email..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">Plan:</span>
                      <select
                        value={userPlanFilter}
                        onChange={(e) => {
                          setUserPlanFilter(e.target.value);
                          setUsersPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
                      >
                        <option value="ALL">All Plans</option>
                        <option value="FREE">Free</option>
                        <option value="PRO">Pro</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">Status:</span>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => {
                          setUserStatusFilter(e.target.value);
                          setUsersPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DISABLED">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* User Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4">User</th>
                          <th className="py-3.5 px-4">Registration</th>
                          <th className="py-3.5 px-4">Plan</th>
                          <th className="py-3.5 px-4">Accuracy</th>
                          <th className="py-3.5 px-4">XP</th>
                          <th className="py-3.5 px-4">Last Active</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-500 font-semibold">
                              No users match the search/filter criteria.
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-400">
                                {new Date(u.registrationDate).toLocaleDateString('en-US')}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    u.currentPlan === 'PRO'
                                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {u.currentPlan}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-emerald-400">{u.accuracy}%</td>
                              <td className="py-3.5 px-4 text-indigo-400 font-bold">{u.xp} XP</td>
                              <td className="py-3.5 px-4 text-slate-400">
                                {new Date(u.lastActive).toLocaleDateString('en-US')}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    u.status === 'ACTIVE'
                                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                                      : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                                  }`}
                                >
                                  {u.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedUserModal(u)}
                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUserAction(u.id, 'togglePlan')}
                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-400"
                                    title={u.currentPlan === 'PRO' ? 'Downgrade to Free' : 'Upgrade to Pro'}
                                  >
                                    <Crown className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUserAction(u.id, 'toggleStatus')}
                                    className={`p-1.5 rounded-lg hover:bg-slate-800 ${
                                      u.status === 'ACTIVE' ? 'text-rose-400' : 'text-emerald-400'
                                    }`}
                                    title={u.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                                  >
                                    {u.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleUserAction(u.id, 'delete')}
                                    className="p-1.5 rounded-lg hover:bg-rose-950/60 text-rose-500 hover:text-rose-400"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="py-3 px-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Showing {users.length} of {usersPagination.total} users
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={usersPagination.page <= 1}
                        onClick={() => setUsersPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span>
                        Page {usersPagination.page} of {usersPagination.totalPages || 1}
                      </span>
                      <button
                        disabled={usersPagination.page >= usersPagination.totalPages}
                        onClick={() => setUsersPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSCRIBERS TAB */}
            {activeTab === 'subscribers' && (
              <div className="space-y-6">
                <div className="flex gap-2">
                  {['ALL', 'ACTIVE', 'EXPIRED', 'FREE', 'PRO'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSubFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        subFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {f} SUBSCRIBERS
                    </button>
                  ))}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4">User</th>
                          <th className="py-3.5 px-4">Plan</th>
                          <th className="py-3.5 px-4">Start Date</th>
                          <th className="py-3.5 px-4">Expiry Date</th>
                          <th className="py-3.5 px-4">Payment Status</th>
                          <th className="py-3.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {subscribers.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-850/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{s.name}</div>
                              <div className="text-[11px] text-slate-400">{s.email}</div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-amber-400">{s.plan}</td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {new Date(s.startDate).toLocaleDateString('en-US')}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-US') : 'Lifetime / Continuous'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-bold rounded-full text-[10px]">
                                {s.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold">{s.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Active Users Chart */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      Daily Active Users (DAU)
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.dailyActiveUsers}>
                          <defs>
                            <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                          <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#dauGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Question Attempts Over Time */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      Question Attempts Over Time
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.questionAttempts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                          <Bar dataKey="attempts" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION BANK TAB */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">
                    Total Questions: <strong className="text-white">{questions.length}</strong> | Total Chapters:{' '}
                    <strong className="text-white">{chapters.length}</strong>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowChapterModal(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Chapter
                    </button>
                    <button
                      onClick={openNewQuestionModal}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Question
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4">ID</th>
                          <th className="py-3.5 px-4">Title / Question</th>
                          <th className="py-3.5 px-4">Chapter</th>
                          <th className="py-3.5 px-4">Difficulty</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {questions.map((q) => {
                          const chap = chapters.find((c) => c.id === q.chapterId);
                          return (
                            <tr key={q.id} className="hover:bg-slate-850/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-slate-400">#{q.id}</td>
                              <td className="py-3.5 px-4 max-w-xs font-semibold text-white truncate">{q.title}</td>
                              <td className="py-3.5 px-4 text-slate-400">{chap ? chap.title : `Chapter #${q.chapterId}`}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 bg-slate-800 font-bold rounded-full text-[10px] text-slate-300">
                                  {q.difficulty || 'Medium'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => handleToggleQuestionStatus(q)}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    q.enabled !== false
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}
                                >
                                  {q.enabled !== false ? 'Enabled' : 'Disabled'}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openEditQuestionModal(q)}
                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-blue-400"
                                    title="Edit Question"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-950 text-rose-400"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* User Details Modal */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">User Account Inspection</h3>
              <button onClick={() => setSelectedUserModal(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p>
                <strong className="text-slate-400">Name:</strong> {selectedUserModal.name}
              </p>
              <p>
                <strong className="text-slate-400">Email:</strong> {selectedUserModal.email}
              </p>
              <p>
                <strong className="text-slate-400">Plan:</strong> {selectedUserModal.currentPlan}
              </p>
              <p>
                <strong className="text-slate-400">Accuracy:</strong> {selectedUserModal.accuracy}%
              </p>
              <p>
                <strong className="text-slate-400">XP Points:</strong> {selectedUserModal.xp} XP
              </p>
              <p>
                <strong className="text-slate-400">Registered:</strong>{' '}
                {new Date(selectedUserModal.registrationDate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-white text-base">
              {editingQuestion ? 'Edit Question' : 'Add New Practice Question'}
            </h3>
            <form onSubmit={handleSaveQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Question Title / Prompt</label>
                <textarea
                  required
                  rows={3}
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Chapter</label>
                <select
                  value={qChapterId}
                  onChange={(e) => setQChapterId(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      Chapter {c.id}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Options (4 Choices)</label>
                <input
                  type="text"
                  required
                  value={qOpt0}
                  onChange={(e) => setQOpt0(e.target.value)}
                  placeholder="Option 1"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={qOpt1}
                  onChange={(e) => setQOpt1(e.target.value)}
                  placeholder="Option 2"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={qOpt2}
                  onChange={(e) => setQOpt2(e.target.value)}
                  placeholder="Option 3"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={qOpt3}
                  onChange={(e) => setQOpt3(e.target.value)}
                  placeholder="Option 4"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Correct Answer Index</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value={0}>Option 1 (Index 0)</option>
                    <option value={1}>Option 2 (Index 1)</option>
                    <option value={2}>Option 3 (Index 2)</option>
                    <option value={3}>Option 4 (Index 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={qDiff}
                    onChange={(e) => setQDiff(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Explanation</label>
                <textarea
                  required
                  rows={2}
                  value={qExp}
                  onChange={(e) => setQExp(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="flex-1 py-2 text-xs font-bold bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Add Syllabus Chapter</h3>
            <form onSubmit={handleSaveChapter} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Chapter Title</label>
                <input
                  type="text"
                  required
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="flex-1 py-2 text-xs font-bold bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl">
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
