'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProgress } from '../../hooks/useProgress';
import Sidebar from '../../components/Sidebar';
import QuestionCard from '../../components/QuestionCard';
import SolutionPanel from '../../components/SolutionPanel';
import ReportIssueModal from '../../components/ReportIssueModal';
import Link from 'next/link';
import { RefreshCw, AlertCircle, ShieldCheck, AlertTriangle, ChevronDown, ArrowRight } from 'lucide-react';

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isLoaded,
    questions,
    chapters,
    progress,
    submitAnswer,
    toggleBookmark,
    setLastQuestion,
  } = useProgress();

  const qChapter = searchParams.get('chapter');
  const qTopic = searchParams.get('topic');
  const qId = searchParams.get('id');

  const selectedChapter = qChapter;
  const selectedTopic = qTopic;
  
  let filteredQuestions = questions;
  if (selectedChapter) {
    filteredQuestions = filteredQuestions.filter((q) => q.chapter === selectedChapter);
  }
  if (selectedTopic) {
    filteredQuestions = filteredQuestions.filter((q) => q.topic.toLowerCase() === selectedTopic.toLowerCase() || q.topic.toLowerCase().includes(selectedTopic.toLowerCase()));
  }

  let currentIdx = 0;
  if (isLoaded && filteredQuestions.length > 0) {
    if (qId) {
      const idNum = parseInt(qId, 10);
      const idx = filteredQuestions.findIndex((q) => q.id === idNum);
      if (idx !== -1) {
        currentIdx = idx;
      }
    } else if (progress.lastQuestionId) {
      const idx = filteredQuestions.findIndex((q) => q.id === progress.lastQuestionId);
      if (idx !== -1) {
        currentIdx = idx;
      }
    }
  }

  const activeQuestion = filteredQuestions[currentIdx];
  const isRevealed = activeQuestion ? activeQuestion.id in progress.answers : false;

  const [prevQuestionId, setPrevQuestionId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [showRevisionDropdown, setShowRevisionDropdown] = useState<boolean>(false);

  // Sync selectedOption on render if activeQuestion changes
  if (activeQuestion && activeQuestion.id !== prevQuestionId) {
    setPrevQuestionId(activeQuestion.id);
    setSelectedOption(activeQuestion.id in progress.answers ? progress.answers[activeQuestion.id] : null);
    setIsSolutionOpen(false);
  }

  // Save progress last question ID on change
  useEffect(() => {
    if (activeQuestion) {
      setLastQuestion(activeQuestion.id);
    }
  }, [activeQuestion?.id, setLastQuestion]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">
        Loading practice room...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        No questions available. Please update questions.json.
      </div>
    );
  }

  // Calculate live practice stats
  let correctCount = 0;
  Object.entries(progress.answers).forEach(([qIdStr, selectedIdx]) => {
    const qIdNum = parseInt(qIdStr, 10);
    const q = questions.find((item) => item.id === qIdNum);
    if (q && q.correctAnswer === selectedIdx) {
      correctCount++;
    }
  });

  // Calculate topics needing revision
  const topicStats: { [topic: string]: { incorrect: number; chapter: string } } = {};
  questions.forEach((q) => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { incorrect: 0, chapter: q.chapter };
    }
    if (q.id in progress.answers && progress.answers[q.id] !== q.correctAnswer) {
      topicStats[q.topic].incorrect++;
    }
  });

  const topicsNeedingRevision = Object.entries(topicStats)
    .filter(([_, stats]) => stats.incorrect > 0)
    .map(([topicName, stats]) => ({
      topicName,
      ...stats,
    }))
    .sort((a, b) => b.incorrect - a.incorrect);

  const handlePrev = () => {
    if (filteredQuestions.length === 0) return;
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : filteredQuestions.length - 1;
    const prevQuestion = filteredQuestions[prevIdx];
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', String(prevQuestion.id));
    router.push(`/practice?${params.toString()}`);
  };

  const handleNext = () => {
    if (filteredQuestions.length === 0) return;
    const nextIdx = currentIdx < filteredQuestions.length - 1 ? currentIdx + 1 : 0;
    const nextQuestion = filteredQuestions[nextIdx];
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', String(nextQuestion.id));
    router.push(`/practice?${params.toString()}`);
  };

  const handleRandom = () => {
    if (filteredQuestions.length <= 1) return;
    let nextIdx = currentIdx;
    while (nextIdx === currentIdx) {
      nextIdx = Math.floor(Math.random() * filteredQuestions.length);
    }
    const randQuestion = filteredQuestions[nextIdx];
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', String(randQuestion.id));
    router.push(`/practice?${params.toString()}`);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !activeQuestion) return;
    const isCorrect = selectedOption === activeQuestion.correctAnswer;
    submitAnswer(activeQuestion.id, selectedOption, activeQuestion.question, isCorrect);
  };

  const handleRevealAnswer = () => {
    if (!activeQuestion) return;
    submitAnswer(activeQuestion.id, activeQuestion.correctAnswer, activeQuestion.question, true);
  };

  const handleOpenSolution = () => {
    if (!activeQuestion) return;
    setIsSolutionOpen(true);
  };

  const handleToggleBookmark = () => {
    if (!activeQuestion) return;
    toggleBookmark(activeQuestion.id, activeQuestion.question);
  };

  const handleSelectQuestion = (qId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', String(qId));
    router.push(`/practice?${params.toString()}`);
  };

  const handleSelectChapter = (chapterName: string | null) => {
    const params = new URLSearchParams();
    if (chapterName) {
      params.set('chapter', chapterName);
    }
    router.push(`/practice?${params.toString()}`);
  };

  const handleResetChapterProgress = () => {
    if (!confirm('Are you sure you want to clear answers for this chapter?')) return;
    const questionIdsToClear = filteredQuestions.map((q) => q.id);
    const updatedAnswers = { ...progress.answers };
    questionIdsToClear.forEach((id) => {
      delete updatedAnswers[id];
    });

    const newProgress = {
      ...progress,
      answers: updatedAnswers,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('dmat_practice_progress_v1', JSON.stringify(newProgress));
    }
    window.location.reload();
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar selection */}
      <Sidebar
        chapters={chapters}
        selectedChapter={selectedChapter}
        onSelectChapter={handleSelectChapter}
        questions={questions}
        progress={progress}
      />

      {/* Main Practice Viewer Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto h-full space-y-6">
          {/* Practice Summary Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Practice Overview
              </span>
              <Link
                href="/dashboard"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Full Analytics Dashboard
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Questions Solved</p>
                    <span className="text-xs text-slate-400">Correct answers</span>
                  </div>
                </div>
                <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-300">
                  {correctCount}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRevisionDropdown(!showRevisionDropdown)}
                className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-between hover:bg-rose-100/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Needs Revision</p>
                    <span className="text-xs text-slate-400">{topicsNeedingRevision.length} topics</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick dropdown for Topics Needing Revision */}
            {showRevisionDropdown && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Topics Needing Revision ({topicsNeedingRevision.length}):</span>
                  <button onClick={() => setShowRevisionDropdown(false)} className="text-slate-400 text-[10px]">Close</button>
                </div>
                {topicsNeedingRevision.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">No topics need revision right now!</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {topicsNeedingRevision.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-850 text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{t.topicName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-rose-600 font-bold mr-1">{t.incorrect} wrong</span>
                          <button
                            onClick={() => {
                              const params = new URLSearchParams();
                              params.set('topic', t.topicName);
                              router.push(`/practice?${params.toString()}`);
                              setShowRevisionDropdown(false);
                            }}
                            className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                          >
                            Practice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-805 dark:text-white">
                No questions found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                There are no questions matching this chapter filter.
              </p>
            </div>
          ) : (
            <>
              {/* Header stats row */}
              <div className="flex justify-between items-center text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">
                <div>
                  Filter: <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedChapter || 'All Chapters'}</span>
                </div>
                <button
                  onClick={handleResetChapterProgress}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Filter Answers
                </button>
              </div>

              <QuestionCard
                question={activeQuestion}
                questionNumber={currentIdx + 1}
                totalQuestions={filteredQuestions.length}
                selectedOption={selectedOption}
                isRevealed={isRevealed}
                isBookmarked={progress.bookmarks.includes(activeQuestion.id)}
                onSelectOption={setSelectedOption}
                onSubmit={handleSubmit}
                onRevealAnswer={handleRevealAnswer}
                onViewSolution={handleOpenSolution}
                onToggleBookmark={handleToggleBookmark}
                onReportIssue={() => setIsReportModalOpen(true)}
                onPrev={handlePrev}
                onNext={handleNext}
                onRandom={handleRandom}
              />
            </>
          )}
        </div>
      </main>

      {/* Solution Drawer / Modal Panel */}
      {activeQuestion && (
        <SolutionPanel
          question={activeQuestion}
          allQuestions={questions}
          isOpen={isSolutionOpen}
          onClose={() => setIsSolutionOpen(false)}
          onSelectQuestion={handleSelectQuestion}
        />
      )}

      {/* Report Issue Modal */}
      {activeQuestion && (
        <ReportIssueModal
          question={activeQuestion}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function Practice() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading practice engine...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
