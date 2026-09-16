'use client';

import React, { useState } from 'react';
import { Question, QuestionSolution } from '../types';
import MathRenderer, { VisualExplanationRenderer } from './MathRenderer';
import Link from 'next/link';
import {
  BookOpen,
  Calculator,
  BarChart3,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  AlertTriangle,
  X,
  ArrowRight,
  Sparkles,
  Maximize2,
  Sidebar,
  ChevronDown,
  ChevronUp,
  Share2,
  ZoomIn
} from 'lucide-react';
import ImageZoomModal from './ImageZoomModal';

interface SolutionPanelProps {
  question: Question;
  allQuestions: Question[];
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (questionId: number) => void;
}

export function getFullQuestionSolution(question: Question): QuestionSolution {
  if (question.solution) {
    return {
      understanding: question.solution.understanding || `This problem tests your comprehension of ${question.topic} within ${question.chapter}. It asks us to analyze: "${question.question}".`,
      steps: question.solution.steps && question.solution.steps.length > 0
        ? question.solution.steps
        : [
            `Analyze the given problem constraints and parameters: "${question.question}".`,
            `Apply fundamental principles of ${question.topic}.`,
            `Evaluate the options systematically to determine the correct result.`
          ],
      diagram: question.solution.diagram || undefined,
      finalAnswer: question.solution.finalAnswer || `Option ${String.fromCharCode(65 + question.correctAnswer)}: "${question.options[question.correctAnswer]}". ${question.explanation}`,
      wrongOptions: question.solution.wrongOptions && question.solution.wrongOptions.length > 0
        ? question.solution.wrongOptions
        : question.options.map((opt, idx) => {
            if (idx === question.correctAnswer) return `Option ${String.fromCharCode(65 + idx)} is correct.`;
            return `Option ${String.fromCharCode(65 + idx)} ("${opt}") is incorrect because it violates the rule for ${question.topic} or gives an invalid calculation.`;
          }),
      keyConcept: question.solution.keyConcept || `${question.topic} principles in ${question.chapter}: ${question.explanation}`,
      examTip: question.solution.examTip || `For ${question.topic} questions, look out for key terms in the question prompt and test boundary values quickly.`,
      commonMistakes: question.solution.commonMistakes || `Students often confuse integer vs floating-point rules or misread operator precedence in ${question.topic}.`
    };
  }

  // Generate complete 8-section fallback for legacy questions
  const correctOptLetter = String.fromCharCode(65 + question.correctAnswer);
  const correctOptText = question.options[question.correctAnswer] || '';

  const steps = [
    `Identify the core question requirements in ${question.topic}.`,
    `Break down the given problem statement: "${question.question.substring(0, 100)}..."`,
    `Apply formula / logical rules for ${question.topic} to compute the answer.`,
    `Match the computed result with the provided options to confirm Option ${correctOptLetter}.`
  ];

  const wrongOptions = question.options.map((opt, idx) => {
    if (idx === question.correctAnswer) {
      return `Option ${String.fromCharCode(65 + idx)} ("${opt}") is CORRECT.`;
    }
    return `Option ${String.fromCharCode(65 + idx)} ("${opt}") is INCORRECT because it does not satisfy the requirements of ${question.topic}.`;
  });

  return {
    understanding: `This question evaluates your understanding of ${question.topic} in ${question.chapter}. It asks: "${question.question}"`,
    steps,
    diagram: undefined,
    finalAnswer: `Option ${correctOptLetter}: "${correctOptText}". ${question.explanation}`,
    wrongOptions,
    keyConcept: `Core Concept (${question.topic}): ${question.explanation}`,
    examTip: `Speed Shortcut: Pay close attention to standard patterns in ${question.topic} to eliminate obvious wrong options immediately.`,
    commonMistakes: `Common Trap: Rushing through calculations or misinterpreting the specific constraints of ${question.chapter}.`
  };
}

export default function SolutionPanel({
  question,
  allQuestions,
  isOpen,
  onClose,
  onSelectQuestion,
}: SolutionPanelProps) {
  const [layoutMode, setLayoutMode] = useState<'drawer' | 'accordion' | 'modal'>('drawer');
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const isFigureSequence = question.chapter === 'Figure Sequences';

  if (!isOpen) return null;

  const sol = getFullQuestionSolution(question);

  // Find 3 to 5 similar questions from same topic or chapter
  const similarQuestions = allQuestions
    .filter((q) => q.id !== question.id && (q.topic.toLowerCase() === question.topic.toLowerCase() || q.chapter === question.chapter))
    .slice(0, 4);

  const correctLetter = String.fromCharCode(65 + question.correctAnswer);

  const solutionContent = (
    <div className="space-y-6 pb-6 text-slate-800 dark:text-slate-200">
      {/* Top Header info */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-blue-100 uppercase tracking-wider">
          <span>Question {question.id} • {question.chapter}</span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-white font-bold">{question.difficulty}</span>
        </div>
        <h2 className="text-xl font-bold leading-snug">
          Detailed Teacher Solution & Walkthrough
        </h2>
        <p className="text-xs text-blue-100 font-medium">
          Master the complete step-by-step reasoning process to solve similar questions effortlessly.
        </p>
      </div>

      {/* Layout mode switcher bar */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-850 p-1.5 rounded-xl text-xs font-semibold">
        <span className="text-slate-500 dark:text-slate-400 pl-2">Layout View:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLayoutMode('drawer')}
            className={`px-3 py-1 rounded-lg transition-all ${
              layoutMode === 'drawer'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sidebar className="w-3.5 h-3.5 inline mr-1" />
            Drawer
          </button>
          <button
            onClick={() => setLayoutMode('modal')}
            className={`px-3 py-1 rounded-lg transition-all ${
              layoutMode === 'modal'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 inline mr-1" />
            Modal
          </button>
          <button
            onClick={() => setLayoutMode('accordion')}
            className={`px-3 py-1 rounded-lg transition-all ${
              layoutMode === 'accordion'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Accordion
          </button>
        </div>
      </div>

      {/* 1. Problem Understanding */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg">📖</span>
          <h3>Understand the Question</h3>
        </div>
        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <MathRenderer content={sol.understanding} />
        </div>
      </div>

      {/* 2. Step-by-Step Solution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">🧮</span>
          <h3>Step-by-Step Solution</h3>
        </div>
        <div className="space-y-3">
          {sol.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed pt-0.5">
                <MathRenderer content={step} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Visual Explanation (Diagram / Truth Table / Matrix) */}
      {sol.diagram && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-base">
              <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">📊</span>
              <h3>{isFigureSequence ? 'Complete Solved Sequence (Steps 1 to 6)' : 'Diagram / Visual Explanation'}</h3>
            </div>
            {isFigureSequence && (
              <button
                onClick={() => setZoomSrc(`/images/figure-sequences/q${question.id}_solved_sequence.png`)}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Inspect High-Resolution Sequence"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom High-Res</span>
              </button>
            )}
          </div>
          <VisualExplanationRenderer diagram={sol.diagram} />

          {/* Figure Sequences Candidate Matrix Breakdown */}
          {isFigureSequence && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Candidate Matrix Breakdown & Selection:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image 1 Choices */}
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Image 1 (Step 5) Choices:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Correct: Matrix {Math.floor(question.correctAnswer / 3) + 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((val) => {
                      const isCorrectVal = (Math.floor(question.correctAnswer / 3) + 1) === val;
                      return (
                        <div
                          key={val}
                          onClick={() => setZoomSrc(`/images/matrix_choices/q${question.id}_img1_m${val}.png`)}
                          className={`p-2 rounded-lg border text-center text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                            isCorrectVal
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/images/matrix_choices/q${question.id}_img1_m${val}.png`}
                            alt={`Image 1 Matrix ${val}`}
                            className="w-full h-14 object-contain bg-white rounded p-0.5"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                          <div className="flex items-center gap-1 font-bold">
                            <span>Matrix {val}</span>
                            {isCorrectVal ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-rose-500 text-[10px]">✕</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Image 2 Choices */}
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Image 2 (Step 6) Choices:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Correct: Matrix {(question.correctAnswer % 3) + 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((val) => {
                      const isCorrectVal = ((question.correctAnswer % 3) + 1) === val;
                      return (
                        <div
                          key={val}
                          onClick={() => setZoomSrc(`/images/matrix_choices/q${question.id}_img2_m${val}.png`)}
                          className={`p-2 rounded-lg border text-center text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                            isCorrectVal
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/images/matrix_choices/q${question.id}_img2_m${val}.png`}
                            alt={`Image 2 Matrix ${val}`}
                            className="w-full h-14 object-contain bg-white rounded p-0.5"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                          <div className="flex items-center gap-1 font-bold">
                            <span>Matrix {val}</span>
                            {isCorrectVal ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-rose-500 text-[10px]">✕</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Final Answer */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-base border-b border-emerald-200/60 dark:border-emerald-900/40 pb-2">
          <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg">✅</span>
          <h3>Final Answer</h3>
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-sm rounded-xl">
            <span>Correct Option:</span>
            <span>Option {correctLetter}</span>
          </div>
          <div className="text-sm font-semibold text-emerald-950 dark:text-emerald-200 leading-relaxed pt-1">
            <MathRenderer content={sol.finalAnswer} />
          </div>
        </div>
      </div>

      {/* 5. Why the Other Options Are Wrong */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg">❌</span>
          <h3>Why Other Options Are Incorrect</h3>
        </div>
        <div className="space-y-2.5">
          {sol.wrongOptions.map((explanation, idx) => {
            const optLetter = String.fromCharCode(65 + idx);
            const isCorrectOption = idx === question.correctAnswer;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isCorrectOption
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className={`font-bold mr-2 inline-block px-2 py-0.5 rounded text-[11px] ${
                  isCorrectOption
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}>
                  Option {optLetter}
                </span>
                <MathRenderer content={explanation} inline />
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Key Concept */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-bold text-base border-b border-amber-200/60 dark:border-amber-900/40 pb-2">
          <span className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg">💡</span>
          <h3>Key Concept</h3>
        </div>
        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          <MathRenderer content={sol.keyConcept} />
        </div>
      </div>

      {/* 7. Exam Tip */}
      {sol.examTip && (
        <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-purple-800 dark:text-purple-300 font-bold text-base border-b border-purple-200/60 dark:border-purple-900/40 pb-2">
            <span className="p-1.5 bg-purple-100 dark:bg-purple-900/60 rounded-lg">🎯</span>
            <h3>Exam Tip & Shortcuts</h3>
          </div>
          <div className="text-xs sm:text-sm text-purple-950 dark:text-purple-200 leading-relaxed font-medium">
            <MathRenderer content={sol.examTip} />
          </div>
        </div>
      )}

      {/* 8. Common Mistakes */}
      {sol.commonMistakes && (
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300 font-bold text-base border-b border-rose-200/60 dark:border-rose-900/40 pb-2">
            <span className="p-1.5 bg-rose-100 dark:bg-rose-900/60 rounded-lg">⚠️</span>
            <h3>Common Student Mistakes</h3>
          </div>
          <div className="text-xs sm:text-sm text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
            <MathRenderer content={sol.commonMistakes} />
          </div>
        </div>
      )}

      {/* RELATED THEORY BUTTON */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Deep Dive Into Theory</span>
        </div>
        <h4 className="text-base font-bold">
          Master {question.topic} in depth
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Need a refresher on the foundational rules and formula derivations? Explore interactive lessons in the Learn Section.
        </p>
        <Link
          href={`/learn?topic=${encodeURIComponent(question.topic)}&chapter=${encodeURIComponent(question.chapter)}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm w-full sm:w-auto"
        >
          📚 Learn This Concept
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* PRACTICE SIMILAR QUESTIONS */}
      {similarQuestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Practice Similar Questions ({similarQuestions.length})
            </h3>
            <span className="text-xs text-slate-400">Same Topic</span>
          </div>

          <div className="grid gap-3">
            {similarQuestions.map((simQ) => (
              <button
                key={simQ.id}
                onClick={() => {
                  onSelectQuestion(simQ.id);
                  if (layoutMode === 'drawer') {
                    onClose();
                  }
                }}
                className="w-full text-left p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    Question #{simQ.id} • {simQ.topic}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    simQ.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    simQ.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {simQ.difficulty}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {simQ.question}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Accordion Layout Mode
  if (layoutMode === 'accordion') {
    return (
      <>
        <ImageZoomModal
          isOpen={zoomSrc !== null}
          src={zoomSrc || ''}
          alt="Solution Figure Zoom"
          onClose={() => setZoomSrc(null)}
        />
        <div className="my-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => setAccordionOpen(!accordionOpen)}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="p-2 bg-blue-600 text-white rounded-xl font-bold text-sm">💡</span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Detailed Teacher Solution & Walkthrough
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete 8-step explanation & visual breakdown
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
              >
                Hide Solution
              </button>
              {accordionOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </div>
          </button>

          {accordionOpen && (
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
              {solutionContent}
            </div>
          )}
        </div>
      </>
    );
  }

  // Render Modal Layout Mode (or mobile full screen)
  if (layoutMode === 'modal') {
    return (
      <>
        <ImageZoomModal
          isOpen={zoomSrc !== null}
          src={zoomSrc || ''}
          alt="Solution Figure Zoom"
          onClose={() => setZoomSrc(null)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-600 text-white rounded-xl font-bold text-xs">📖</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Solution Panel • Question #{question.id}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{question.topic}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {solutionContent}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Default Drawer Layout (Slide-in Right Drawer on desktop, bottom sheet / full view on mobile)
  return (
    <>
      <ImageZoomModal
        isOpen={zoomSrc !== null}
        src={zoomSrc || ''}
        alt="Solution Figure Zoom"
        onClose={() => setZoomSrc(null)}
      />

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Side Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-600 text-white rounded-xl font-bold text-xs">📖</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Solution Panel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Question #{question.id} • {question.topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close Solution Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {solutionContent}
        </div>
      </div>
    </>
  );
}
