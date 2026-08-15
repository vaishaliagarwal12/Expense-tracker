import React from 'react';

export default function ProgressBar({ value, max = 100, status = 'normal', showText = false, height = 'h-2' }) {
  const safeMax = max > 0 ? max : 1;
  const percentage = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)));

  let barColor = 'bg-sky-600 dark:bg-sky-500';
  if (status === 'warning' || (percentage >= 80 && percentage < 100 && status === 'normal')) {
    barColor = 'bg-amber-500';
  } else if (status === 'exceeded' || status === 'danger' || percentage >= 100) {
    barColor = 'bg-rose-500';
  } else if (status === 'success') {
    barColor = 'bg-emerald-500';
  }

  return (
    <div className="w-full space-y-1">
      <div className={`w-full bg-slate-100 dark:bg-slate-700/60 rounded-full ${height} overflow-hidden`}>
        <div 
          className={`h-full ${barColor} transition-all duration-300 rounded-full`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{percentage}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
    </div>
  );
}
