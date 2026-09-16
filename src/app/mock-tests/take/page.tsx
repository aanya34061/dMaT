'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MockQuestion,
  MockSessionState,
  QuestionAttemptStatus,
  QuestionSection,
} from '@/types/mockTest';
import { MOCK_TEST_CONFIGS } from '@/lib/mockTestConfig';
import { selectMockQuestions, getAllMockQuestions } from '@/data/mockQuestions';
import {
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  evaluateMockSubmission,
  saveMockResult,
} from '@/lib/mockEngine';
import MockTimer from '@/components/mock/MockTimer';
import MockQuestionPalette from '@/components/mock/MockQuestionPalette';
import SubmitConfirmModal from '@/components/mock/SubmitConfirmModal';
import LatinSquareGrid from '@/components/mock/LatinSquareGrid';
import FigureSequenceViewer from '@/components/mock/FigureSequenceViewer';
import AcademicDataViewer from '@/components/mock/AcademicDataViewer';
import MathRenderer from '@/components/MathRenderer';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Send,
  Shield,
  EyeOff,
  Menu,
  X,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';

function MockTestRunner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const configIdParam = searchParams.get('configId');
  const modeParam = searchParams.get('mode');
  const sectionParam = searchParams.get('section') as QuestionSection | null;
  const difficultyParam = searchParams.get('difficulty');
  const countParam = searchParams.get('count');
  const timeParam = searchParams.get('time');

  const [session, setSession] = useState<MockSessionState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  // Question timer reference
  const questionStartTimeRef = useRef<number>(Date.now());

  // Initialize or resume session
  useEffect(() => {
    const existing = getActiveSession();

    // Check if we should resume existing active session
    if (existing && !existing.isSubmitted && (!configIdParam || existing.configId === configIdParam)) {
      setSession(existing);
      setIsReady(true);
      questionStartTimeRef.current = Date.now();
      return;
    }

    // Determine config and create new session
    let selectedQuestions: MockQuestion[] = [];
    let testTitle = 'dMAT Aptitude Mock';
    let totalMinutes = 60;
    let mode: 'full' | 'sectional' | 'custom' = 'full';
    let activeConfigId = configIdParam || 'full-standard';

    if (configIdParam && MOCK_TEST_CONFIGS[configIdParam]) {
      const cfg = MOCK_TEST_CONFIGS[configIdParam];
      testTitle = cfg.title;
      totalMinutes = cfg.totalTimeMinutes;
      mode = cfg.section ? 'sectional' : 'full';
      selectedQuestions = selectMockQuestions(cfg);
    } else if (modeParam === 'custom') {
      mode = 'custom';
      testTitle = sectionParam ? `${sectionParam} Custom Drill` : 'Custom dMAT Aptitude Mock';
      const qCount = countParam ? parseInt(countParam, 10) : 20;
      totalMinutes = timeParam ? parseInt(timeParam, 10) : 30;

      const dummyConfig = {
        id: 'custom',
        title: testTitle,
        subtitle: 'Customized Practice Simulation',
        description: 'User-configured test drill',
        module: 'all' as const,
        totalTimeMinutes: totalMinutes,
        questionCount: qCount,
        passingPercentage: 65,
        difficultyDistribution: { Easy: 5, Medium: 10, Hard: 5 },
      };

      selectedQuestions = selectMockQuestions(
        dummyConfig,
        [],
        sectionParam || undefined,
        difficultyParam || undefined
      );
      activeConfigId = 'custom';
    } else {
      // Default to Standard Full Mock
      const cfg = MOCK_TEST_CONFIGS['full-standard'];
      testTitle = cfg.title;
      totalMinutes = cfg.totalTimeMinutes;
      mode = 'full';
      selectedQuestions = selectMockQuestions(cfg);
    }

    if (selectedQuestions.length === 0) {
      selectedQuestions = getAllMockQuestions().slice(0, 20);
    }

    const totalSecs = totalMinutes * 60;
    const newSession: MockSessionState = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      configId: activeConfigId,
      testTitle,
      mode,
      sectionName: sectionParam || undefined,
      questions: selectedQuestions,
      answers: {},
      statuses: {},
      questionTimes: {},
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      timeRemainingSeconds: totalSecs,
      totalTimeSeconds: totalSecs,
      examMode: true,
      isSubmitted: false,
    };

    setSession(newSession);
    saveActiveSession(newSession);
    setIsReady(true);
    questionStartTimeRef.current = Date.now();
  }, [configIdParam, modeParam, sectionParam, difficultyParam, countParam, timeParam]);

  // Record time spent on question before switching
  const recordQuestionTime = useCallback(() => {
    if (!session) return;
    const currentQ = session.questions[session.currentIndex];
    if (!currentQ) return;

    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const existing = session.questionTimes[currentQ.id] || 0;
    session.questionTimes[currentQ.id] = existing + elapsed;
    questionStartTimeRef.current = Date.now();
  }, [session]);

  // Timer Tick handler
  const handleTimerTick = useCallback(
    (newRemaining: number) => {
      setSession((prev) => {
        if (!prev || prev.isSubmitted) return prev;
        const updated = { ...prev, timeRemainingSeconds: newRemaining };
        saveActiveSession(updated);
        return updated;
      });
    },
    []
  );

  // Submit Evaluation
  const handleFinalSubmit = useCallback(() => {
    if (!session || session.isSubmitted) return;

    recordQuestionTime();

    const finalSession = {
      ...session,
      isSubmitted: true,
      submittedAt: new Date().toISOString(),
    };

    const result = evaluateMockSubmission(finalSession);
    saveMockResult(result);
    clearActiveSession();

    router.push(`/mock-tests/result?id=${result.id}`);
  }, [session, recordQuestionTime, router]);

  // Time-Up auto-submit
  const handleTimeUp = useCallback(() => {
    handleFinalSubmit();
  }, [handleFinalSubmit]);

  // Navigation handlers
  const handleSelectOption = (optIndex: number) => {
    if (!session || session.isSubmitted) return;
    const currentQ = session.questions[session.currentIndex];
    if (!currentQ) return;

    const currentStatus = session.statuses[currentQ.id] || 'unanswered';
    const newStatus: QuestionAttemptStatus =
      currentStatus === 'marked' || currentStatus === 'marked_answered'
        ? 'marked_answered'
        : 'answered';

    const updated: MockSessionState = {
      ...session,
      answers: { ...session.answers, [currentQ.id]: optIndex },
      statuses: { ...session.statuses, [currentQ.id]: newStatus },
    };

    setSession(updated);
    saveActiveSession(updated);
  };

  const handleClearResponse = () => {
    if (!session || session.isSubmitted) return;
    const currentQ = session.questions[session.currentIndex];
    if (!currentQ) return;

    const updatedAnswers = { ...session.answers };
    delete updatedAnswers[currentQ.id];

    const currentStatus = session.statuses[currentQ.id] || 'unanswered';
    const newStatus: QuestionAttemptStatus =
      currentStatus === 'marked_answered' ? 'marked' : 'unanswered';

    const updated: MockSessionState = {
      ...session,
      answers: updatedAnswers,
      statuses: { ...session.statuses, [currentQ.id]: newStatus },
    };

    setSession(updated);
    saveActiveSession(updated);
  };

  const handleToggleMark = () => {
    if (!session || session.isSubmitted) return;
    const currentQ = session.questions[session.currentIndex];
    if (!currentQ) return;

    const isAnswered = currentQ.id in session.answers;
    const currentStatus = session.statuses[currentQ.id] || 'unanswered';

    let newStatus: QuestionAttemptStatus = 'marked';
    if (currentStatus === 'marked') {
      newStatus = 'unanswered';
    } else if (currentStatus === 'marked_answered') {
      newStatus = 'answered';
    } else if (isAnswered) {
      newStatus = 'marked_answered';
    }

    const updated: MockSessionState = {
      ...session,
      statuses: { ...session.statuses, [currentQ.id]: newStatus },
    };

    setSession(updated);
    saveActiveSession(updated);
  };

  const handleGoToIndex = (targetIndex: number) => {
    if (!session || targetIndex < 0 || targetIndex >= session.questions.length) return;
    recordQuestionTime();

    const updated: MockSessionState = {
      ...session,
      currentIndex: targetIndex,
    };
    setSession(updated);
    saveActiveSession(updated);
    setIsMobilePaletteOpen(false);
  };

  const handleNext = () => {
    if (!session) return;
    if (session.currentIndex < session.questions.length - 1) {
      handleGoToIndex(session.currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!session) return;
    if (session.currentIndex > 0) {
      handleGoToIndex(session.currentIndex - 1);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitModalOpen) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        handlePrev();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMark();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        handleSelectOption(parseInt(e.key, 10) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleToggleMark, isSubmitModalOpen]);

  if (!isReady || !session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-semibold text-sm">Preparing CBT exam room & test booklet...</p>
      </div>
    );
  }

  const currentQ = session.questions[session.currentIndex];
  const isFirst = session.currentIndex === 0;
  const isLast = session.currentIndex === session.questions.length - 1;
  const selectedOption = session.answers[currentQ?.id] ?? null;
  const qStatus = session.statuses[currentQ?.id] || 'unanswered';
  const isMarked = qStatus === 'marked' || qStatus === 'marked_answered';

  const attemptedCount = Object.keys(session.answers).length;
  const markedCount = Object.values(session.statuses).filter(
    (s) => s === 'marked' || s === 'marked_answered'
  ).length;
  const unansweredCount = session.questions.length - attemptedCount;

  const formatMinSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 flex flex-col justify-between">
      {/* TOP CBT HEADER */}
      <header className="sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Test Info */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40">
                {currentQ.section}
              </span>
              <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200">
                {session.testTitle}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Question <strong className="text-slate-900 dark:text-white">{session.currentIndex + 1}</strong> of{' '}
              {session.questions.length} • Difficulty:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{currentQ.difficulty}</strong>
            </p>
          </div>

          {/* Right controls: Timer, Palette toggle, Submit */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MockTimer
              secondsRemaining={session.timeRemainingSeconds}
              totalSeconds={session.totalTimeSeconds}
              onTick={handleTimerTick}
              onTimeUp={handleTimeUp}
            />

            <button
              onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Question Palette"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Test</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN TEST INTERFACE */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT / CENTER: QUESTION PAPER */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Question Top Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {session.currentIndex + 1}
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Topic
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {currentQ.topic}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isMarked && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                    <Bookmark className="w-3 h-3 fill-purple-600" />
                    Marked for Review
                  </span>
                )}
                <span className="text-[11px] font-mono text-slate-400">
                  Est. {currentQ.estimatedTime}s
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
              <MathRenderer content={currentQ.questionText} />
            </div>

            {/* Visual Component Renderers */}
            {currentQ.visualData?.type === 'figure_sequence' && currentQ.visualData.figureData && (
              <FigureSequenceViewer data={currentQ.visualData.figureData} />
            )}

            {currentQ.visualData?.type === 'latin_square' && currentQ.visualData.latinSquareData && (
              <LatinSquareGrid
                data={currentQ.visualData.latinSquareData}
                selectedSymbol={selectedOption !== null ? currentQ.options[selectedOption] : null}
              />
            )}

            {currentQ.visualData?.type === 'academic_data' && currentQ.visualData.academicData && (
              <AcademicDataViewer data={currentQ.visualData.academicData} />
            )}

            {/* Options Selector Grid */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Select Your Answer:
              </span>

              {/* If Figure Sequence with Option SVGs */}
              {currentQ.visualData?.figureData?.optionFrames && currentQ.visualData.figureData.optionFrames.length === 4 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentQ.options.map((optText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const frame = currentQ.visualData?.figureData?.optionFrames?.[optIdx];
                    const letter = String.fromCharCode(65 + optIdx);

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">Option {letter}</span>
                        </div>

                        {frame && (
                          <div className="w-full aspect-square max-h-36 bg-slate-50 dark:bg-slate-950 rounded-xl p-2 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: frame.svgContent }}
                            />
                          </div>
                        )}

                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Standard Math & Text Options */
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 text-left ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {letter}
                          </span>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            <MathRenderer content={option} />
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMark}
                  type="button"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isMarked
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isMarked ? 'Marked' : 'Mark for Review'}
                </button>

                {selectedOption !== null && (
                  <button
                    onClick={handleClearResponse}
                    type="button"
                    className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={isFirst}
                  type="button"
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {isLast ? (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    type="button"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Test
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    type="button"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: CBT QUESTION PALETTE */}
        <aside className="hidden lg:block w-80 shrink-0 sticky top-32 h-[calc(100vh-10rem)]">
          <MockQuestionPalette
            totalQuestions={session.questions.length}
            currentIndex={session.currentIndex}
            statuses={session.statuses}
            answers={session.answers}
            questionIds={session.questions.map((q) => q.id)}
            onSelectIndex={handleGoToIndex}
          />
        </aside>

        {/* MOBILE DRAWER PALETTE */}
        {isMobilePaletteOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="w-80 max-w-full h-full bg-white dark:bg-slate-900 p-4 shadow-2xl flex flex-col justify-between">
              <div className="flex justify-end pb-2">
                <button
                  onClick={() => setIsMobilePaletteOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MockQuestionPalette
                  totalQuestions={session.questions.length}
                  currentIndex={session.currentIndex}
                  statuses={session.statuses}
                  answers={session.answers}
                  questionIds={session.questions.map((q) => q.id)}
                  onSelectIndex={handleGoToIndex}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SUBMISSION CONFIRMATION MODAL */}
      <SubmitConfirmModal
        isOpen={isSubmitModalOpen}
        totalQuestions={session.questions.length}
        attemptedCount={attemptedCount}
        markedCount={markedCount}
        unansweredCount={unansweredCount}
        timeRemainingFormatted={formatMinSec(session.timeRemainingSeconds)}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={handleFinalSubmit}
      />
    </div>
  );
}

export default function MockTestTakePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Starting CBT testing room...</div>}>
      <MockTestRunner />
    </Suspense>
  );
}
