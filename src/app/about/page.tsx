import { Award, Compass, Lightbulb, ShieldCheck } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12 flex-grow transition-colors duration-200 bg-white dark:bg-slate-950">
      {/* Brand Header & Logo Showcase */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogo variant="stacked" height={140} />
        </div>
        <div className="space-y-2 max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-955 dark:text-white">
            About dMAT Exam Platform
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A modern, private, and lightweight study workspace built specifically for dMAT exam aspirants with official branding.
          </p>
        </div>
      </div>

      {/* Purpose block */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5">
          <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Our Purpose
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
          The dMAT Prep platform was designed to give students a lightweight, focused practice workspace. Unlike traditional systems that require accounts or send data online, dMAT Prep is a <strong>100% offline-first application</strong>.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
          All your bookmarks, practice records, and performance analytics are stored and computed exclusively inside your local browser storage. No data ever leaves your device.
        </p>
      </section>

      {/* Exam Overview block */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          dMAT Examination Overview
        </h2>
        
        <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
          The dMAT tests advanced quantitative reasoning, digital health/medicine literacy, and clinical analytics. The exam focuses heavily on:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205 uppercase tracking-wider">Clinical Biostatistics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Evaluating diagnostic tools using sensitivity, specificity, and Predictive Value (PPV/NPV). Interpreting Type I and Type II errors and statistical significance thresholds (p-values).
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205 uppercase tracking-wider">Informatics Architectures</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Differentiating Electronic Medical Records (EMR) from Electronic Health Records (EHR), standard vocabulary systems, interoperability exchange models, and client patient portals.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205 uppercase tracking-wider">Privacy & Regulatory Compliance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Understanding HIPAA Privacy and Security mandates, protected health information (PHI/ePHI) criteria, administrative/physical/technical safeguards, and compliance guidelines.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205 uppercase tracking-wider">Analytical Critical Reasoning</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Applying logical deduplication algorithms, flow chart analysis, and solving computational math equations derived from clinical contexts.
            </p>
          </div>
        </div>
      </section>

      {/* Study Strategy block */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Recommended Study Strategy
        </h2>

        <div className="space-y-4">
          <div className="flex gap-3 text-left">
            <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Recall</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Practice makes perfect. As you read the official textbook, cross-reference concepts here. Use our &quot;Bookmark&quot; button to flag challenging questions so they stay listed on your dashboard for quick retrieval.
              </p>
            </div>
          </div>

          <div className="flex gap-3 text-left">
            <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Chapter-Wise Practice</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Go to the Chapters tab and practice questions dedicated to a single topic right after reading it. Research shows active self-testing immediately after studying dramatically increases long-term retention.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
