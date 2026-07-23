'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial theme from documentElement class list (since layout script sets it before rendering)
    const isDark = document.documentElement.classList.contains('dark');
    const timer = setTimeout(() => {
      setTheme(isDark ? 'dark' : 'light');
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer focus:outline-none"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-200 hover:rotate-45" />
      )}
    </button>
  );
}
