'use client';

import Link from 'next/link';
import { Play, HelpCircle, LayoutGrid, ArrowRight, Award } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { motion } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';

// Hero animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 12,
    },
  },
};

export default function Home() {
  const { progress, questions, chapters, isLoaded } = useProgress();

  const totalQuestions = questions.length;
  const totalChapters = chapters.length;

  const getContinueLink = () => {
    if (progress.lastQuestionId) {
      return `/practice?id=${progress.lastQuestionId}`;
    }
    return '/practice';
  };

  const hasStarted = progress.lastQuestionId !== null || Object.keys(progress.answers).length > 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex-grow flex flex-col justify-center bg-white dark:bg-slate-950"
    >
      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div variants={itemVariants} className="flex justify-center py-2">
            <BrandLogo variant="stacked" height={130} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-750 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-900/30"
          >
            <Award className="w-3.5 h-3.5" />
            Official dMAT Examination Platform
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight"
          >
            Master the dMAT with <span className="text-blue-605 dark:text-blue-400">Targeted Practice</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-650 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Practice officially curated questions with full explanations, track progress, bookmark complex challenges, and measure diagnostic stats offline.
          </motion.p>

          {!isLoaded ? (
            <motion.div variants={itemVariants} className="text-slate-500 font-semibold py-4">Loading practice engine...</motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2"
            >
              <Link
                href="/practice"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all text-center flex items-center justify-center gap-2 hover:scale-105 active:scale-95 duration-150"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Practice
              </Link>

              {hasStarted && (
                <Link
                  href={getContinueLink()}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 duration-150"
                >
                  Continue Practice
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Counter Blocks */}
      <motion.section
        variants={statsContainerVariants}
        className="py-12 bg-slate-50/50 dark:bg-slate-950/20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div
            variants={statsCardVariants}
            whileHover={{ y: -6, scale: 1.015, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-5 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Questions
              </p>
              <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                {isLoaded ? totalQuestions : '...'}
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                Fully curated practice bank
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={statsCardVariants}
            whileHover={{ y: -6, scale: 1.015, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-5 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Chapters
              </p>
              <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                {isLoaded ? totalChapters : '...'}
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                Syllabus divisions covered
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
