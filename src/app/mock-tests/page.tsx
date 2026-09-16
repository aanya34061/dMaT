'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Sliders,
  Award,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Shapes,
  Calculator,
  Grid3X3,
  GraduationCap,
  Binary,
  ToggleLeft,
  History,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { MOCK_TEST_CONFIGS, SECTION_METADATA, FULL_MOCK_PAPERS } from '@/lib/mockTestConfig';
import { getActiveSession, getMockHistory, clearActiveSession } from '@/lib/mockEngine';
import { MockSessionState, MockResult, QuestionSection } from '@/types/mockTest';

const SECTIONAL_TESTS = [
  {
    id: 'sec-data-types',
    title: 'Data Types',
    time: '35 Mins',
    count: '25 Questions',
    description: 'Memory footprint, IEEE 754 layouts, widening & narrowing conversions, integer division rules.',
    icon: Binary,
    iconColor: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'sec-combinational-logic',
    title: 'Combinational Logic',
    time: '35 Mins',
    count: '25 Questions',
    description: 'Truth tables, Boolean algebra, logic gates, sensor combinations, and Canonical Disjunctive Normal Form (CDNF).',
    icon: ToggleLeft,
    iconColor: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'sec-linear-transformations',
    title: 'Linear Transformations',
    time: '35 Mins',
    count: '25 Questions',
    description: 'Matrix rank, Rank-Nullity Theorem, characteristic polynomials, eigenvalue spectra, and PCA/LDA projections.',
    icon: Sliders,
    iconColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'sec-figure-sequences',
    title: 'Figure Sequences',
    time: '35 Mins',
    count: '25 Questions',
    description: 'Spatial rotations, perimeter movements, nested shape rules, boundary bouncing, and parity logic.',
    icon: Shapes,
    iconColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'sec-math-equations',
    title: 'Mathematical Equations',
    time: '40 Mins',
    count: '25 Questions',
    description: 'Symbolic systems, scale balances, variable substitutions, and functional deduction.',
    icon: Calculator,
    iconColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'sec-latin-squares',
    title: 'Latin Squares',
    time: '30 Mins',
    count: '20 Questions',
    description: '4×4, 5×5, and 6×6 row/column uniqueness deduction and dual-axis matrix elimination.',
    icon: Grid3X3,
    iconColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'sec-general-academic',
    title: 'General Academic (APS)',
    time: '40 Mins',
    count: '25 Questions',
    description: 'Academic data tables, experimental science curves, and quantitative problem solving.',
    icon: GraduationCap,
    iconColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
];

function MockTestsContent() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<MockSessionState | null>(null);
  const [history, setHistory] = useState<MockResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Custom Mock State
  const [customSection, setCustomSection] = useState<'ALL' | QuestionSection>('ALL');
  const [customCount, setCustomCount] = useState<number>(20);
  const [customDifficulty, setCustomDifficulty] = useState<string>('ALL');
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  useEffect(() => {
    setActiveSession(getActiveSession());
    setHistory(getMockHistory());
    setIsLoaded(true);
  }, []);

  const handleStartConfig = (configId: string) => {
    router.push(`/mock-tests/take?configId=${configId}`);
  };

  const handleStartCustom = () => {
    const params = new URLSearchParams();
    params.set('mode', 'custom');
    if (customSection !== 'ALL') params.set('section', customSection);
    if (customDifficulty !== 'ALL') params.set('difficulty', customDifficulty);
    params.set('count', String(customCount));
    params.set('time', String(customMinutes));

    setShowCustomModal(false);
    router.push(`/mock-tests/take?${params.toString()}`);
  };

  // Performance stats across history
  const totalMocksTaken = history.length;
  const avgScore =
    totalMocksTaken > 0
      ? Math.round(history.reduce((acc, h) => acc + h.percentage, 0) / totalMocksTaken)
      : 0;
  const bestScore =
    totalMocksTaken > 0
      ? Math.max(...history.map((h) => h.percentage))
      : 0;
  const avgAccuracy =
    totalMocksTaken > 0
      ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalMocksTaken)
      : 0;

  const getPaperStats = (cfgId: string) => {
    const paperAttempts = history.filter((h) => h.configId === cfgId);
    if (paperAttempts.length === 0) return null;
    const best = Math.max(...paperAttempts.map((h) => h.percentage));
    const latest = paperAttempts[0];
    return { attemptsCount: paperAttempts.length, bestPercentage: best, latestDate: latest.completedAt };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
            <Sparkles className="w-3.5 h-3.5" />
            Official dMAT Exam Simulator
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Mock Examinations
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Practice under realistic computer-based aptitude test (CBT) conditions. Featuring full-length dMAT simulations, sectional modules, real-time timers, and automated diagnostic performance analytics.
          </p>
        </div>

        {/* Quick Performance Strip */}
        {totalMocksTaken > 0 && (
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{totalMocksTaken}</span>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Best Score</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{bestScore}%</span>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Accuracy</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{avgAccuracy}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Ongoing Test Resume Banner */}
      {activeSession && !activeSession.isSubmitted && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider">
              Active Exam Session Detected
            </span>
            <h3 className="text-lg font-extrabold">{activeSession.testTitle}</h3>
            <p className="text-xs text-blue-100">
              {Object.keys(activeSession.answers).length} of {activeSession.questions.length} questions attempted •{' '}
              {Math.floor(activeSession.timeRemainingSeconds / 60)} minutes remaining.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Discard your active test progress?')) {
                  clearActiveSession();
                  setActiveSession(null);
                }
              }}
              className="px-3 py-2 text-xs font-bold text-blue-100 hover:text-white transition-colors"
            >
              Discard
            </button>
            <Link
              href="/mock-tests/take"
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-blue-700" />
              Resume Exam
            </Link>
          </div>
        </div>
      )}

      {/* FULL LENGTH SIMULATIONS (5 Non-Overlapping Papers) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                5 Full-Length Test Papers Available
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Full-Length Mock Test Papers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Complete computer-based aptitude tests matching the official dMAT blueprint (80 questions, 120 minutes each). All 5 papers feature 100% unique, non-overlapping questions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FULL_MOCK_PAPERS.map((paperId, pIdx) => {
            const cfg = MOCK_TEST_CONFIGS[paperId];
            if (!cfg) return null;
            const stats = getPaperStats(paperId);

            return (
              <div
                key={paperId}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-5 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                      Mock Paper {pIdx + 1}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      120 Min
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cfg.title}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      {cfg.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {cfg.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Curriculum Distribution ({cfg.sectionQuotas?.length || 0} Modules)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cfg.sectionQuotas?.map((sq) => (
                        <span
                          key={sq.section}
                          className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <span className="text-slate-400 mr-1 font-normal">
                            {sq.section
                              .replace('Combinational ', '')
                              .replace('Mathematical ', '')
                              .replace('Linear ', '')}
                            :
                          </span>
                          <strong>{sq.count}Q</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      Format: <strong className="text-slate-900 dark:text-white">80 Questions</strong>
                    </span>
                    {stats ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Best: {stats.bestPercentage}%
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Not Attempted</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartConfig(paperId)}
                    className={`w-full py-2.5 px-4 font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 ${
                      stats
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {stats ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retake Paper {pIdx + 1}
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Start Mock Paper {pIdx + 1}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Express Mock Card in same grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm flex flex-col justify-between space-y-5 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                  High-Yield Express
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  60 Min
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {MOCK_TEST_CONFIGS['full-express'].title}
                </h3>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {MOCK_TEST_CONFIGS['full-express'].subtitle}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {MOCK_TEST_CONFIGS['full-express'].description}
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Curriculum Distribution ({MOCK_TEST_CONFIGS['full-express'].sectionQuotas?.length || 0} Modules)
                </span>
                <div className="flex flex-wrap gap-1">
                  {MOCK_TEST_CONFIGS['full-express'].sectionQuotas?.map((sq) => (
                    <span
                      key={sq.section}
                      className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <span className="text-slate-400 mr-1 font-normal">
                        {sq.section
                          .replace('Combinational ', '')
                          .replace('Mathematical ', '')
                          .replace('Linear ', '')}
                        :
                      </span>
                      <strong>{sq.count}Q</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">
                  Format: <strong className="text-slate-900 dark:text-white">40 Questions</strong>
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                  Daily Benchmark
                </span>
              </div>

              <button
                onClick={() => handleStartConfig('full-express')}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Start Express Mock
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTIONAL MOCKS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Sectional Mock Tests
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target individual modules with focused time-pressure drills.
            </p>
          </div>
          <button
            onClick={() => setShowCustomModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            Build Custom Mock
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SECTIONAL_TESTS.map((sec) => {
            const IconComponent = sec.icon;
            return (
              <div
                key={sec.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-xl ${sec.iconColor} flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{sec.time}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {sec.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">{sec.count}</span>
                  <button
                    onClick={() => handleStartConfig(sec.id)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    Start
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERFORMANCE HISTORY TABLE */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Recent Mock Test Attempts ({history.length})
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Saved Offline & Synced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-3">Test Title</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Time Spent</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.slice(0, 10).map((res) => {
                  const mins = Math.floor(res.timeTakenSeconds / 60);
                  const secs = res.timeTakenSeconds % 60;
                  const dateStr = new Date(res.completedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {res.testTitle}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{dateStr}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-extrabold ${
                          res.percentage >= 65
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {res.score} / {res.totalQuestions} ({res.percentage}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {res.accuracy}%
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        {mins}m {secs}s
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/mock-tests/result?id=${res.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                          >
                            View Analysis
                          </Link>
                          <Link
                            href={`/mock-tests/review?id=${res.id}`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-bold"
                          >
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOM MOCK MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Custom Mock Generator
                </h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Section */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Target Domain / Module:
                </label>
                <select
                  value={customSection}
                  onChange={(e) => setCustomSection(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="ALL">All Sections (Comprehensive Mix)</option>
                  <option value="Data Types">Data Types</option>
                  <option value="Combinational Logic">Combinational Logic</option>
                  <option value="Linear Transformations">Linear Transformations</option>
                  <option value="Figure Sequences">Figure Sequences</option>
                  <option value="Mathematical Equations">Mathematical Equations</option>
                  <option value="Latin Squares">Latin Squares</option>
                  <option value="General Academic">General Academic Module</option>
                </select>
              </div>

              {/* Question Count */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Number of Questions: <strong className="text-blue-600">{customCount}</strong>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setCustomCount(num);
                        setCustomMinutes(Math.round(num * 1.5));
                      }}
                      className={`py-2 rounded-xl border font-bold ${
                        customCount === num
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Difficulty Filter:
                </label>
                <select
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="ALL">Mixed Difficulties (Standard Distribution)</option>
                  <option value="Easy">Easy Only (Beginner Warmup)</option>
                  <option value="Medium">Medium Only (Standard Exam Target)</option>
                  <option value="Hard">Hard Only (Advanced Drill)</option>
                  <option value="Very Hard">Very Hard (Mastery Level)</option>
                </select>
              </div>

              {/* Time Limit */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Time Limit: <strong className="text-blue-600">{customMinutes} Minutes</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                type="button"
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCustom}
                type="button"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Launch Custom Mock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MockTestsLandingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading mock test room...</div>}>
      <MockTestsContent />
    </Suspense>
  );
}
