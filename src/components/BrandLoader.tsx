'use client';

import BrandLogo from './BrandLogo';
import { motion } from 'framer-motion';

interface BrandLoaderProps {
  label?: string;
}

export default function BrandLoader({ label = 'Loading...' }: BrandLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <BrandLogo variant="emblem" height={64} />
      </motion.div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
        {label}
      </p>
    </div>
  );
}
