'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface MockTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  onTick: (newSeconds: number) => void;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export default function MockTimer({
  secondsRemaining,
  totalSeconds,
  onTick,
  onTimeUp,
  isPaused = false,
}: MockTimerProps) {
  const [hasWarned10m, setHasWarned10m] = useState(false);
  const [hasWarned5m, setHasWarned5m] = useState(false);
  const [hasWarned1m, setHasWarned1m] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      onTickRef.current(Math.max(0, secondsRemaining - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, secondsRemaining]);

  // Warning thresholds
  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeUpRef.current();
      return;
    }

    if (secondsRemaining <= 600 && secondsRemaining > 590 && !hasWarned10m && totalSeconds > 600) {
      setHasWarned10m(true);
      showToast('⚠️ 10 minutes remaining in this test session.');
    } else if (secondsRemaining <= 300 && secondsRemaining > 290 && !hasWarned5m && totalSeconds > 300) {
      setHasWarned5m(true);
      showToast('⚠️ 5 minutes remaining! Please review your unanswered questions.');
    } else if (secondsRemaining <= 60 && secondsRemaining > 50 && !hasWarned1m) {
      setHasWarned1m(true);
      showToast('🚨 FINAL MINUTE: Test will auto-submit in 60 seconds!');
    }
  }, [secondsRemaining, totalSeconds, hasWarned10m, hasWarned5m, hasWarned1m]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const formatTime = (secs: number) => {
    const safeSecs = Math.max(0, secs);
    const hrs = Math.floor(safeSecs / 3600);
    const mins = Math.floor((safeSecs % 3600) / 60);
    const s = safeSecs % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining <= 300; // <= 5 mins
  const isCriticalTime = secondsRemaining <= 60; // <= 1 min

  let badgeColor = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
  if (isCriticalTime) {
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse';
  } else if (isLowTime) {
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  }

  return (
    <div className="relative inline-flex items-center">
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold max-w-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Timer Pill */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-colors ${badgeColor}`}
        title="Time Remaining in Exam"
      >
        <Clock className={`w-4 h-4 ${isCriticalTime ? 'text-rose-600' : isLowTime ? 'text-amber-600' : 'text-blue-600'}`} />
        <span>{formatTime(secondsRemaining)}</span>
      </div>
    </div>
  );
}
