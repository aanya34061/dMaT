'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
  BookOpen,
  Award,
} from 'lucide-react';
import { getMockHistory } from '@/lib/mockEngine';
import { getAllMockQuestions } from '@/data/mockQuestions';
import { MockResult, MockQuestion } from '@/types/mockTest';
import MathRenderer from '@/components/MathRenderer';
import LatinSquareGrid from '@/components/mock/LatinSquareGrid';
import FigureSequenceViewer from '@/components/mock/FigureSequenceViewer';
import AcademicDataViewer from '@/components/mock/AcademicDataViewer';

function MockReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');

  const [result, setResult] = useState<MockResult | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Record<string, MockQuestion>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'SKIPPED' | 'MARKED'>('ALL');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const history = getMockHistory();
    let currentResult: MockResult | null = null;

    if (resultId) {
      currentResult = history.find((h) => h.id === resultId) || null;
    }
    if (!currentResult && history.length > 0) {
      currentResult = history[0];
    }

    if (currentResult) {
      setResult(currentResult);
      const allQ = getAllMockQuestions();
      const map: Record<string, MockQuestion> = {};
      allQ.forEach((q) => {
        map[q.id] = q;
      });
      setQuestionsMap(map);
    }
    setIsLoaded(true);
  }, [resultId]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-semibold">
        Loading test review booklet...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          No Review Data Available
        </h2>
        <Link
          href="/mock-tests"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Mock Hub
        </Link>
      </div>
    );
  }

  // Filtered items
  const filteredIndices: number[] = [];
  result.questionResults.forEach((qr, idx) => {
    if (filter === 'ALL') filteredIndices.push(idx);
    else if (filter === 'CORRECT' && qr.status === 'correct') filteredIndices.push(idx);
    else if (filter === 'INCORRECT' && qr.status === 'incorrect') filteredIndices.push(idx);
    else if (filter === 'SKIPPED' && qr.status === 'skipped') filteredIndices.push(idx);
    else if (filter === 'MARKED' && qr.wasMarked) filteredIndices.push(idx);
  });

  const activeResultItem = result.questionResults[currentIndex];
  const activeQuestion = activeResultItem ? questionsMap[activeResultItem.questionId] : null;

  const handleNext = () => {
    if (currentIndex < result.questionResults.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <Link
            href={`/mock-tests/result?id=${result.id}`}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Score Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Answers & Solutions: {result.testTitle}
          </h1>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          {(['ALL', 'CORRECT', 'INCORRECT', 'SKIPPED', 'MARKED'] as const).map((t) => {
            const count =
              t === 'ALL'
                ? result.totalQuestions
                : t === 'CORRECT'
                ? result.correct
                : t === 'INCORRECT'
                ? result.incorrect
                : t === 'SKIPPED'
                ? result.skipped
                : result.markedForReviewCount;

            return (
              <button
                key={t}
                onClick={() => {
                  setFilter(t);
                  const firstMatching = result.questionResults.findIndex((qr) => {
                    if (t === 'ALL') return true;
                    if (t === 'CORRECT') return qr.status === 'correct';
                    if (t === 'INCORRECT') return qr.status === 'incorrect';
                    if (t === 'SKIPPED') return qr.status === 'skipped';
                    if (t === 'MARKED') return qr.wasMarked;
                    return false;
                  });
                  if (firstMatching !== -1) setCurrentIndex(firstMatching);
                }}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  filter === t
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t.toLowerCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container: Question on Left, Palette on Right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Active Question Solution Card */}
        <div className="flex-1 w-full space-y-6">
          {activeResultItem && activeQuestion ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center">
                    {activeResultItem.questionNumber}
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {activeResultItem.section}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Topic: {activeResultItem.topic}
                    </h3>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {activeResultItem.timeSpentSeconds}s spent
                  </span>

                  {activeResultItem.status === 'correct' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Correct
                    </span>
                  ) : activeResultItem.status === 'incorrect' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Incorrect
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Skipped
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                <MathRenderer content={activeQuestion.questionText} />
              </div>

              {/* Visual Component Renderers */}
              {activeQuestion.visualData?.type === 'figure_sequence' && activeQuestion.visualData.figureData && (
                <FigureSequenceViewer data={activeQuestion.visualData.figureData} />
              )}

              {activeQuestion.visualData?.type === 'latin_square' && activeQuestion.visualData.latinSquareData && (
                <LatinSquareGrid data={activeQuestion.visualData.latinSquareData} />
              )}

              {activeQuestion.visualData?.type === 'academic_data' && activeQuestion.visualData.academicData && (
                <AcademicDataViewer data={activeQuestion.visualData.academicData} />
              )}

              {/* Options Evaluation List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Options & Your Answer:
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {activeQuestion.options.map((option, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isCorrect = activeQuestion.correctAnswer === optIdx;
                    const isUserPick = activeResultItem.userAnswer === optIdx;

                    let cardStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                    let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                    if (isCorrect) {
                      cardStyle = 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isUserPick && !isCorrect) {
                      cardStyle = 'border-rose-500 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20';
                      badgeStyle = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all ${cardStyle}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${badgeStyle}`}
                          >
                            {letter}
                          </span>
                          <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            <MathRenderer content={option} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isUserPick && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Your Choice
                            </span>
                          )}
                          {isCorrect && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comprehensive Solution & Step-by-Step Explanation */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Step-by-Step Solution & Pedagogical Explanation
                  </h4>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                  <MathRenderer content={activeResultItem.explanation} />
                </div>

                {activeResultItem.solutionSteps && activeResultItem.solutionSteps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Deduction Steps:
                    </span>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-600 dark:text-slate-400">
                      {activeResultItem.solutionSteps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-xs font-mono text-slate-400 font-bold">
                  Question {currentIndex + 1} of {result.questionResults.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === result.questionResults.length - 1}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Select a question to inspect its complete solution.
            </div>
          )}
        </div>

        {/* Right: Question Navigation Palette */}
        <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Question Palette
            </h3>
            <span className="text-[11px] font-mono text-slate-400 font-bold">
              {filteredIndices.length} items
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
            {result.questionResults.map((qr, idx) => {
              const isCurrent = idx === currentIndex;
              const isMatchFilter = filteredIndices.includes(idx);
              if (!isMatchFilter) return null;

              let btnBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
              if (qr.status === 'correct') {
                btnBg = 'bg-emerald-600 text-white';
              } else if (qr.status === 'incorrect') {
                btnBg = 'bg-rose-600 text-white';
              }

              return (
                <button
                  key={qr.questionId}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center relative ${btnBg} ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10' : ''
                  }`}
                  title={`Question ${qr.questionNumber}: ${qr.status}`}
                >
                  <span>{qr.questionNumber}</span>
                  {qr.wasMarked && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500 border border-white dark:border-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function MockReviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Opening test review room...</div>}>
      <MockReviewContent />
    </Suspense>
  );
}
