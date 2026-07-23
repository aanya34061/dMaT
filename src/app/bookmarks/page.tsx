'use client';

import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowRight, BookOpen, FileEdit, Pin, Sparkles } from 'lucide-react';

export default function Bookmarks() {
  const { isLoaded, questions, progress, toggleBookmark, toggleTopicBookmark, deleteTopicNote } = useProgress();
  const [activeTab, setActiveTab] = useState<'questions' | 'topics' | 'notes'>('questions');

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">
        Loading bookmarks...
      </div>
    );
  }

  const bookmarkedQuestions = questions.filter((q) => (progress.bookmarks || []).includes(q.id));
  const topicBookmarks = progress.topicBookmarks || [];
  const notes = progress.notes || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow bg-white dark:bg-slate-950">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Bookmarks & Notes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Review your saved practice questions, bookmarked theory topics, key definitions, formulas, and personal study notes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'questions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Questions ({bookmarkedQuestions.length})
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'topics'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Topics & Concepts ({topicBookmarks.length})
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          Personal Notes ({notes.length})
        </button>
      </div>

      {/* TAB 1: QUESTIONS */}
      {activeTab === 'questions' && (
        <>
          {bookmarkedQuestions.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/55 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No bookmarked questions
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Toggle the star icon on any question in the Practice room to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarkedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-start gap-4"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/35">
                        {q.chapter}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Topic: {q.topic}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleBookmark(q.id, q.question)}
                      type="button"
                      className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/practice?id=${q.id}`}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center"
                      title="Practice Question"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: TOPICS & CONCEPTS */}
      {activeTab === 'topics' && (
        <>
          {topicBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/55 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No bookmarked topics or formulas
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Click the bookmark button on any topic, formula box, or definition in the Learning Center to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topicBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-start gap-4"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/35">
                        {bm.chapterName}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                        {bm.type}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {bm.topicTitle}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {bm.snippet}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        toggleTopicBookmark({
                          topicId: bm.topicId,
                          topicTitle: bm.topicTitle,
                          chapterName: bm.chapterName,
                          type: bm.type,
                          snippet: bm.snippet
                        })
                      }
                      className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                      title="Remove Topic Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/learn?topic=${bm.topicId}`}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center"
                      title="Open Topic in Learning Center"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 3: PERSONAL NOTES */}
      {activeTab === 'notes' && (
        <>
          {notes.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/55 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <FileEdit className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No personal study notes yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Open any topic in the Learning Center and click "Take Notes" to record your study notes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-0.5 rounded">
                          {n.chapterName}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {n.topicTitle}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTopicNote(n.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {n.highlightedText && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 italic bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      "{n.highlightedText}"
                    </p>
                  )}

                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line">
                    {n.noteText}
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Saved: {new Date(n.createdAt).toLocaleDateString()}</span>
                    <Link
                      href={`/learn?topic=${n.topicId}`}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Open Topic →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

