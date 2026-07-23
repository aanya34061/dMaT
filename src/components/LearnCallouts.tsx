'use client';

import React from 'react';
import { Lightbulb, AlertTriangle, FileText, Star, Pin, Target } from 'lucide-react';

interface CalloutProps {
  children?: React.ReactNode;
  text?: string;
  title?: string;
}

export function ImportantBox({ title = "Important", text, children }: CalloutProps) {
  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-500 text-white shrink-0 shadow-sm">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
          <h4 className="font-extrabold text-blue-900 dark:text-blue-300 text-base flex items-center gap-1.5">
            💡 {title}
          </h4>
          {text && <p className="whitespace-pre-line">{text}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function CommonMistakeBox({ title = "Common Mistake", text, children }: CalloutProps) {
  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
          <h4 className="font-extrabold text-amber-900 dark:text-amber-300 text-base flex items-center gap-1.5">
            ⚠ {title}
          </h4>
          {text && <p className="whitespace-pre-line">{text}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function RememberBox({ title = "Remember", text, children }: CalloutProps) {
  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500 text-white shrink-0 shadow-sm">
          <FileText className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
          <h4 className="font-extrabold text-indigo-900 dark:text-indigo-300 text-base flex items-center gap-1.5">
            📝 {title}
          </h4>
          {text && <p className="whitespace-pre-line">{text}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ExamTipBox({ title = "Exam Tip", text, children }: CalloutProps) {
  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 shadow-sm">
          <Star className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
          <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-base flex items-center gap-1.5">
            ⭐ {title}
          </h4>
          {text && <p className="whitespace-pre-line">{text}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function DefinitionBox({ title = "Definition", text, children }: CalloutProps) {
  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-violet-500 text-white shrink-0 shadow-sm">
          <Pin className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
          <h4 className="font-extrabold text-violet-900 dark:text-violet-300 text-base flex items-center gap-1.5">
            📌 {title}
          </h4>
          {text && <p className="whitespace-pre-line">{text}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function KeyPointBox({ title = "Key Point", text, children }: CalloutProps) {
  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-purple-500 text-white shrink-0 shadow-sm">
          <Target className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
          <h4 className="font-extrabold text-purple-900 dark:text-purple-300 text-base flex items-center gap-1.5">
            🎯 {title}
          </h4>
          {text && <p className="whitespace-pre-line">{text}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
