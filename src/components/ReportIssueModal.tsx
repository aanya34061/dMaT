'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { Question } from '../types';

interface ReportIssueModalProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportIssueModal({ question, isOpen, onClose }: ReportIssueModalProps) {
  const [issueType, setIssueType] = useState<string>('Typo / Formatting');
  const [description, setDescription] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <h3>Report Question Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Thank You!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your feedback for Question #{question.id} has been submitted to the course team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Question Details
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                #{question.id}: {question.question.substring(0, 60)}...
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Issue Category
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="Typo / Formatting">Typo or Formatting Error</option>
                <option value="Incorrect Answer">Wrong Correct Answer Marked</option>
                <option value="Unclear Explanation">Unclear / Confusing Explanation</option>
                <option value="Image / Diagram Issue">Diagram or Image Not Loading</option>
                <option value="Other">Other Problem</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Details (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is incorrect or could be improved..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
