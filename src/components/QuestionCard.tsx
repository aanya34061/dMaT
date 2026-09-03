'use client';

import React, { useState } from 'react';
import { Question } from '../types';
import OptionCard from './OptionCard';
import BookmarkButton from './BookmarkButton';
import MathRenderer from './MathRenderer';
import ImageZoomModal from './ImageZoomModal';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  XCircle,
  Eye,
  BookOpen,
  AlertTriangle,
  Send,
  HelpCircle,
  Maximize2,
  ZoomIn
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  isRevealed: boolean;
  isBookmarked: boolean;
  onSelectOption: (index: number | null) => void;
  onSubmit: () => void;
  onRevealAnswer: () => void;
  onViewSolution: () => void;
  onToggleBookmark: () => void;
  onReportIssue: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  isRevealed,
  isBookmarked,
  onSelectOption,
  onSubmit,
  onRevealAnswer,
  onViewSolution,
  onToggleBookmark,
  onReportIssue,
  onPrev,
  onNext,
  onRandom,
}: QuestionCardProps) {
  const isFigureSequence = question.chapter === 'Figure Sequences';

  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [img1Val, setImg1Val] = useState<number | null>(null);
  const [img2Val, setImg2Val] = useState<number | null>(null);

  React.useEffect(() => {
    if (selectedOption === null) {
      setImg1Val(null);
      setImg2Val(null);
    } else {
      setImg1Val(Math.floor(selectedOption / 3) + 1);
      setImg2Val((selectedOption % 3) + 1);
    }
  }, [selectedOption, question.id]);

  const difficultyColors = {
    Easy: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Hard: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const isCorrect = selectedOption === question.correctAnswer;

  const displayQuestionImage = question.questionImage || question.image;
  const optionImagesList = question.optionImages || question.options.map((_, idx) => `/images/figure-sequences/q${question.id}_opt_${idx}.png`);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-all space-y-6">
      {/* Zoom Modal */}
      <ImageZoomModal
        isOpen={zoomSrc !== null}
        src={zoomSrc || ''}
        alt="High Resolution Question Figure"
        onClose={() => setZoomSrc(null)}
      />

      {/* Top Header Row */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
              Question #{questionNumber} of {totalQuestions}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${difficultyColors[question.difficulty]}`}>
              {question.difficulty}
            </span>
          </div>
        </div>

        {/* Action icons: Random, Bookmark, Report Issue */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRandom}
            type="button"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Random Question"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <BookmarkButton isBookmarked={isBookmarked} onToggle={onToggleBookmark} />
          <button
            onClick={onReportIssue}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Report Issue"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chapter & Topic Badges */}
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {question.chapter}
        </span>
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
          Topic: {question.topic}
        </h3>
      </div>

      {/* Question Text with Math Support */}
      <div className="text-slate-900 dark:text-white font-semibold text-base sm:text-lg leading-relaxed pt-1">
        <MathRenderer content={question.question} />
      </div>

      {/* Diagram / Image with Zoom Button */}
      {displayQuestionImage && (
        <div className="relative group my-5 overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              Complete Figure Sequence
            </span>
            <button
              onClick={() => setZoomSrc(displayQuestionImage)}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Inspect Figure in High Resolution"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Zoom High-Res</span>
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayQuestionImage}
            alt="Question Diagram"
            className="w-full h-auto max-h-[600px] object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.005]"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
      )}

      {/* Options List */}
      {isFigureSequence ? (
        <div className="space-y-6">
          {/* 2-Step Matrix Figure Selector */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-5">
            {/* Matrix for Image 1 */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 1: Select Matrix for Image 1 (5th Matrix in sequence)
                </h4>
                {img1Val !== null && (
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    Selected: Matrix {img1Val}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((val) => {
                  const isSelected = img1Val === val;
                  const isCorrectVal = isRevealed && (Math.floor(question.correctAnswer / 3) + 1) === val;
                  const isWrongVal = isRevealed && isSelected && !isCorrectVal;
                  const thumbPath = `/images/matrix_choices/q${question.id}_img1_m${val}.png`;
                  return (
                    <button
                      key={val}
                      disabled={isRevealed}
                      onClick={() => {
                        const targetImg2 = img2Val !== null ? img2Val : 1;
                        setImg1Val(val);
                        if (img2Val === null) setImg2Val(1);
                        onSelectOption((val - 1) * 3 + (targetImg2 - 1));
                      }}
                      type="button"
                      className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-blue-50/50 dark:hover:bg-slate-800'
                      } ${
                        isRevealed && isCorrectVal
                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30'
                          : ''
                      } ${
                        isRevealed && isWrongVal
                          ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/30'
                          : ''
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbPath}
                        alt={`Image 1 Matrix ${val}`}
                        className="w-full h-16 sm:h-20 object-contain rounded-md bg-white p-1 border border-slate-100 dark:border-slate-800"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                      <span>Matrix {val}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matrix for Image 2 */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 2: Select Matrix for Image 2 (6th Matrix in sequence)
                </h4>
                {img2Val !== null && (
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    Selected: Matrix {img2Val}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((val) => {
                  const isSelected = img2Val === val;
                  const isCorrectVal = isRevealed && ((question.correctAnswer % 3) + 1) === val;
                  const isWrongVal = isRevealed && isSelected && !isCorrectVal;
                  const thumbPath = `/images/matrix_choices/q${question.id}_img2_m${val}.png`;
                  return (
                    <button
                      key={val}
                      disabled={isRevealed}
                      onClick={() => {
                        const targetImg1 = img1Val !== null ? img1Val : 1;
                        setImg2Val(val);
                        if (img1Val === null) setImg1Val(1);
                        onSelectOption((targetImg1 - 1) * 3 + (val - 1));
                      }}
                      type="button"
                      className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-blue-50/50 dark:hover:bg-slate-800'
                      } ${
                        isRevealed && isCorrectVal
                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30'
                          : ''
                      } ${
                        isRevealed && isWrongVal
                          ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/30'
                          : ''
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbPath}
                        alt={`Image 2 Matrix ${val}`}
                        className="w-full h-16 sm:h-20 object-contain rounded-md bg-white p-1 border border-slate-100 dark:border-slate-800"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                      <span>Matrix {val}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Option Summary Badge */}
            {selectedOption !== null && (
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>
                  Selected Combination: <strong className="font-extrabold text-blue-700 dark:text-blue-300">Option {String.fromCharCode(65 + selectedOption)}</strong> ({question.options[selectedOption]})
                </span>
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              </div>
            )}
          </div>

          {/* Clean 2-Column Grid of High-Resolution Image Option Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Answer Choice Cards (Official dMAT 2-Column Grid):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((_, index) => {
                const optLetter = String.fromCharCode(65 + index);
                const optImg = optionImagesList[index];
                const isSelected = selectedOption === index;
                const isCorrectOpt = isRevealed && question.correctAnswer === index;
                const isWrongOpt = isRevealed && isSelected && !isCorrectOpt;

                let cardBorder = 'border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md';
                let cardBg = 'bg-white dark:bg-slate-900';
                let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                if (isSelected) {
                  cardBorder = 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/30';
                  cardBg = 'bg-blue-50/40 dark:bg-blue-950/30';
                  badgeStyle = 'bg-blue-600 text-white';
                }

                if (isRevealed) {
                  if (isCorrectOpt) {
                    cardBorder = 'border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500/30';
                    cardBg = 'bg-emerald-50/40 dark:bg-emerald-950/20';
                    badgeStyle = 'bg-emerald-600 text-white';
                  } else if (isWrongOpt) {
                    cardBorder = 'border-rose-500 dark:border-rose-600 ring-2 ring-rose-500/30';
                    cardBg = 'bg-rose-50/40 dark:bg-rose-950/20';
                    badgeStyle = 'bg-rose-600 text-white';
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={isRevealed}
                    onClick={() => onSelectOption(index)}
                    type="button"
                    className={`relative w-full p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed ${cardBorder} ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-xs ${badgeStyle}`}>
                          {optLetter}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Option {optLetter}
                        </span>
                      </div>
                      {isSelected && !isRevealed && (
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                      {isRevealed && isCorrectOpt && (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      )}
                      {isRevealed && isWrongOpt && (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>

                    {/* High-Resolution Option Image */}
                    <div className="w-full bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-center min-h-[110px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={optImg}
                        alt={`Option ${optLetter}`}
                        className="w-full max-h-[140px] object-contain mx-auto"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <OptionCard
              key={index}
              index={index}
              text={option}
              isSelected={selectedOption === index}
              isRevealed={isRevealed}
              isCorrect={question.correctAnswer === index}
              onClick={() => onSelectOption(index)}
              disabled={isRevealed}
            />
          ))}
        </div>
      )}

      {/* Main Buttons Bar: Submit Answer, Reveal Correct Answer, View Solution */}
      <div className="pt-2 flex flex-wrap gap-3">
        {!isRevealed ? (
          <button
            onClick={onSubmit}
            disabled={selectedOption === null}
            type="button"
            className="flex-1 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-600 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-center flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <Send className="w-4 h-4" />
            Submit Answer
          </button>
        ) : (
          <div className="w-full p-4 rounded-xl border flex items-start gap-3 bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {isCorrect ? 'Correct Answer!' : 'Incorrect Attempt'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isCorrect
                  ? `Great job! Option ${String.fromCharCode(65 + question.correctAnswer)} is correct.`
                  : `You selected Option ${String.fromCharCode(65 + (selectedOption ?? 0))}. Correct Option is ${String.fromCharCode(65 + question.correctAnswer)}.`}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 w-full sm:w-auto">
          {!isRevealed && (
            <button
              onClick={onRevealAnswer}
              type="button"
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-amber-500" />
              Reveal Answer
            </button>
          )}

          <button
            onClick={onViewSolution}
            type="button"
            className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold rounded-xl shadow-xs hover:shadow transition-all text-xs flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            View Solution
          </button>
        </div>
      </div>

      {/* Bottom Navigation Row: Previous & Next */}
      <div className="flex justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onPrev}
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Question
        </button>

        <button
          onClick={onNext}
          type="button"
          className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          Next Question
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
