'use client';

import React from 'react';
import { useProgress } from '../../hooks/useProgress';
import DashboardCards from '../../components/DashboardCards';
import ProgressBar from '../../components/ProgressBar';
import Link from 'next/link';
import { ArrowRight, BookOpen, Activity, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { isLoaded, questions, progress, resetProgress } = useProgress();

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">
        Loading dashboard metrics...
      </div>
    );
  }

  const totalQuestions = questions.length;
  const attemptedCount = Object.keys(progress.answers).length;

  // Calculate correct, incorrect, and independent solves stats
  let correctCount = 0;

  Object.entries(progress.answers).forEach(([qIdStr, selectedIdx]) => {
    const qId = parseInt(qIdStr, 10);
    const question = questions.find((q) => q.id === qId);
    if (question && question.correctAnswer === selectedIdx) {
      correctCount++;
    }
  });

  const independentSolvesCount = correctCount; // Solved correctly
  const incorrectCount = attemptedCount - correctCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const bookmarksCount = progress.bookmarks.length;

  // Compute Topics Needing Revision
  // A topic needs revision if it has incorrect answers or accuracy below 80%
  const topicStats: { [topic: string]: { total: number; attempted: number; correct: number; incorrect: number; chapter: string } } = {};

  questions.forEach((q) => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, attempted: 0, correct: 0, incorrect: 0, chapter: q.chapter };
    }
    topicStats[q.topic].total++;

    if (q.id in progress.answers) {
      topicStats[q.topic].attempted++;
      if (progress.answers[q.id] === q.correctAnswer) {
        topicStats[q.topic].correct++;
      } else {
        topicStats[q.topic].incorrect++;
      }
    }
  });

  const topicsNeedingRevision = Object.entries(topicStats)
    .map(([topicName, stats]) => {
      const topicAccuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 100;
      const revisionScore = stats.incorrect * 3 + (100 - topicAccuracy);
      return {
        topicName,
        ...stats,
        accuracy: topicAccuracy,
        revisionScore,
      };
    })
    .filter((t) => t.incorrect > 0 || (t.attempted > 0 && t.accuracy < 80))
    .sort((a, b) => b.revisionScore - a.revisionScore);

  const getContinueLink = () => {
    if (progress.lastQuestionId) {
      return `/practice?id=${progress.lastQuestionId}`;
    }
    return '/practice';
  };

  const hasStarted = progress.lastQuestionId !== null || attemptedCount > 0;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow bg-white dark:bg-slate-950">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Practice Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitor independent solves, question bank coverage, and topics requiring revision.
          </p>
        </div>

        {hasStarted && (
          <Link
            href={getContinueLink()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all"
          >
            Continue Practice
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Dashboard Cards Grid */}
      <DashboardCards
        totalQuestionsCount={totalQuestions}
        attemptedCount={attemptedCount}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        accuracy={accuracy}
        bookmarksCount={bookmarksCount}
        independentSolvesCount={independentSolvesCount}
      />

      {/* Mock Examination Hub Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Official CBT Exam Simulator
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            Ready to test your exam readiness?
          </h3>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Take 5 distinct full-length 80-question dMAT simulations under authentic computer-based testing conditions. Real-time timer, sectional diagnostics, and weakness analysis.
          </p>
        </div>
        <Link
          href="/mock-tests"
          className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          Explore Mock Tests
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Topics Needing Revision Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Topics Needing Revision ({topicsNeedingRevision.length})
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            Based on incorrect attempts & accuracy
          </span>
        </div>

        {topicsNeedingRevision.length === 0 ? (
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-6 rounded-xl text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
              Great Job! No Critical Topics Needing Revision
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              You are solving questions with high accuracy. Keep practicing to maintain your performance!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {topicsNeedingRevision.slice(0, 6).map((topic, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                      {topic.chapter}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {topic.incorrect} Wrong
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {topic.topicName}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 font-semibold">
                    Topic Accuracy: <span className="text-slate-900 dark:text-white font-bold">{topic.accuracy}%</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/learn?topic=${encodeURIComponent(topic.topicName)}`}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                    >
                      Study Theory
                    </Link>
                    <Link
                      href={`/practice?topic=${encodeURIComponent(topic.topicName)}`}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Overall Question Bank Coverage
        </h3>
        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <ProgressBar
            value={attemptedCount}
            max={totalQuestions}
            label="Answered Questions Ratio"
            size="md"
          />
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Recent Activity
        </h3>

        {progress.recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
            No activity logged yet. Start practicing to see logs!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-80 overflow-y-auto pr-1">
            {progress.recentActivity.map((act) => (
              <div key={act.id} className="py-3.5 flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      act.type === 'correct'
                        ? 'bg-emerald-500'
                        : act.type === 'incorrect'
                        ? 'bg-rose-500'
                        : act.type === 'bookmark'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`} />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {act.title}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-4.5 max-w-xl break-words">
                    {act.detail}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-550 shrink-0 mt-0.5">
                  {formatDate(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Progress Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to RESET all your progress? This will clear all answers, bookmarks, and topic progress.')) {
              resetProgress();
            }
          }}
          type="button"
          className="px-4 py-2 border border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/30 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 text-rose-600 rounded-xl text-xs font-semibold transition-colors"
        >
          Reset All Practice Progress
        </button>
      </div>
    </div>
  );
}
