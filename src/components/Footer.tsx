import BrandLogo from './BrandLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <BrandLogo variant="horizontal" height={36} linkToHome />
          <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-800 pl-4">
            Official Branding & Study Hub
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {currentYear} dMAT Exam Prep Platform. All rights reserved.
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              v1.0.0
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Offline-First Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

