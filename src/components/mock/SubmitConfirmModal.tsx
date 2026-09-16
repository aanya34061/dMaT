'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Bookmark, Clock, X } from 'lucide-react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  totalQuestions: number;
  attemptedCount: number;
  markedCount: number;
  unansweredCount: number;
  timeRemainingFormatted: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SubmitConfirmModal({
  isOpen,
  totalQuestions,
  attemptedCount,
  markedCount,
  unansweredCount,
  timeRemainingFormatted,
  onCancel,
  onConfirm,
}: SubmitConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Submit Mock Test?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review your session status before final evaluation.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if unanswered */}
        {unansweredCount > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                {unansweredCount} Question{unansweredCount > 1 ? 's' : ''} Still Unanswered
              </p>
              <p className="text-amber-700 dark:text-amber-300/90 leading-relaxed">
                You have {timeRemainingFormatted} remaining. You can return to the test to attempt them or submit now.
              </p>
            </div>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attempted</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {attemptedCount} <span className="text-xs font-normal text-slate-400">/ {totalQuestions}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unanswered</span>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {unansweredCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marked for Review</span>
            <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
              {markedCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Left</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {timeRemainingFormatted}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Return to Test
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Yes, Submit Now
          </button>
        </div>
      </div>
    </div>
  );
}
