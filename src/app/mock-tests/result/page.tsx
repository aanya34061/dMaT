'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Turtle,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  RotateCcw,
  Eye,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  Calendar,
  Layers,
} from 'lucide-react';
import { getMockHistory } from '@/lib/mockEngine';
import { MockResult } from '@/types/mockTest';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

function MockResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');

  const [result, setResult] = useState<MockResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const history = getMockHistory();
    if (resultId) {
      const match = history.find((h) => h.id === resultId);
      if (match) {
        setResult(match);
        setIsLoaded(true);
        return;
      }
    }

    // Fallback: take most recent result
    if (history.length > 0) {
      setResult(history[0]);
    }
    setIsLoaded(true);
  }, [resultId]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-semibold">
        Generating diagnostic mock performance report...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          No Mock Result Found
        </h2>
        <p className="text-xs text-slate-500">
          We could not locate this test attempt in your local storage.
        </p>
        <Link
          href="/mock-tests"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Mock Hub
        </Link>
      </div>
    );
  }

  const mins = Math.floor(result.timeTakenSeconds / 60);
  const secs = result.timeTakenSeconds % 60;

  // Chart data for section breakdown
  const sectionChartData = result.sectionBreakdown.map((sec) => ({
    name: sec.section.replace('Mathematical Equations', 'Equations').replace('Figure Sequences', 'Figure Seq'),
    accuracy: sec.accuracy,
    correct: sec.correct,
    total: sec.total,
  }));

  // Chart data for difficulty breakdown
  const diffChartData = result.difficultyBreakdown.map((d) => ({
    difficulty: d.difficulty,
    accuracy: d.accuracy,
    correct: d.correct,
    total: d.total,
  }));

  const diffColors: Record<string, string> = {
    Easy: '#10b981',
    Medium: '#3b82f6',
    Hard: '#f59e0b',
    'Very Hard': '#ef4444',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
              Exam Complete
            </span>
            <span className="text-xs font-mono text-slate-400">
              {new Date(result.completedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {result.testTitle} Results
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/mock-tests/review?id=${result.id}`}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Review Answers
          </Link>

          <Link
            href="/mock-tests"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            Mock Hub
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* OVERALL SCORE SUMMARY HERO */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Main Score Dial */}
          <div className="flex items-center gap-5 md:col-span-2">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-800/80 border-2 border-slate-700 flex flex-col items-center justify-center p-3 text-center shrink-0 shadow-inner">
              <span className="text-3xl sm:text-4xl font-black text-white leading-none">
                {result.percentage}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Score</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    result.passed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {result.passed ? 'Benchmark Met (Passed)' : 'Needs Revision (Failed)'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                {result.score} Correct out of {result.totalQuestions} Questions
              </h3>
              <p className="text-xs text-slate-400">
                Overall Accuracy:{' '}
                <strong className="text-white font-mono">{result.accuracy}%</strong> • Attempted:{' '}
                <strong className="text-white">{result.attempted}</strong> • Skipped:{' '}
                <strong className="text-white">{result.skipped}</strong>
              </p>
            </div>
          </div>

          {/* Time & Pacing Metrics */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Time Spent</span>
            </div>
            <p className="text-xl font-black font-mono text-white">
              {mins}m {secs}s
            </p>
            <p className="text-[11px] text-slate-400">
              Avg Pace: <strong className="text-white font-mono">{result.averageTimePerQuestionSeconds}s</strong> per question
            </p>
          </div>

          {/* Extremes (Fastest & Slowest) */}
          <div className="space-y-2.5 text-xs">
            {result.fastestQuestion && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">Fastest Question</span>
                </div>
                <span className="font-mono font-bold text-white">
                  #{result.fastestQuestion.questionNumber} ({result.fastestQuestion.timeSeconds}s)
                </span>
              </div>
            )}

            {result.slowestQuestion && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Turtle className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-300">Slowest Question</span>
                </div>
                <span className="font-mono font-bold text-white">
                  #{result.slowestQuestion.questionNumber} ({result.slowestQuestion.timeSeconds}s)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION-WISE BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Section-Wise Performance
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            Modular Diagnostic
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {result.sectionBreakdown.map((sec, idx) => {
            const secMins = Math.floor(sec.timeSpentSeconds / 60);
            const secSecs = sec.timeSpentSeconds % 60;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
              >
                <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider block">
                  {sec.section}
                </span>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {sec.correct} <span className="text-xs font-normal text-slate-400">/ {sec.total}</span>
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    sec.accuracy >= 70
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {sec.accuracy}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${sec.accuracy}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Pacing: {secMins}m {secSecs}s</span>
                  <span>{sec.incorrect} Wrong</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DIFFICULTY BREAKDOWN CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Accuracy Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Accuracy by Section (%)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Accuracy']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="accuracy" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Accuracy Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            Accuracy by Difficulty Level (%)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="difficulty" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Accuracy']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {diffChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={diffColors[entry.difficulty] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* WEAK TOPICS & TARGETED PRACTICE RECOMMENDATIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Personalized Weak-Topic Diagnosis ({result.weakTopics.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Topics identified with mistakes or low accuracy during this mock test. Directly linked to the practice engine for rapid targeted revision.
          </p>
        </div>

        {result.weakTopics.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300">
              Outstanding Mastery! No Critical Weak Topics Detected
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              You answered with high accuracy across all tested sections. Continue taking full mocks to build endurance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.weakTopics.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                      {item.section}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {item.incorrectCount} Incorrect ({item.accuracy}% Acc)
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {item.topic}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.recommendation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-end gap-2">
                  <Link
                    href={`/practice?topic=${encodeURIComponent(item.topic)}`}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-xs"
                  >
                    Practice 10 Questions
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href={`/mock-tests/take?configId=${result.sessionId ? '' : ''}`}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Simulation
        </Link>

        <Link
          href={`/mock-tests/review?id=${result.id}`}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          Review All {result.totalQuestions} Questions & Detailed Solutions
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function MockResultPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Loading diagnostic analysis...</div>}>
      <MockResultContent />
    </Suspense>
  );
}
