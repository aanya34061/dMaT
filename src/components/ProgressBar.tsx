interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-350">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="text-blue-600 dark:text-blue-400">
              {value}/{max} ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ${sizeClasses[size]}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
