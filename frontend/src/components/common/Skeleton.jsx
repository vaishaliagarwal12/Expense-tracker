import React from 'react';

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 rounded-md skeleton-shimmer" />
        <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
      </div>
      <div className="h-7 w-36 rounded-lg skeleton-shimmer" />
      <div className="h-3 w-24 rounded-md skeleton-shimmer" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-700/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 rounded-md skeleton-shimmer w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton({ height = 'h-64' }) {
  return (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4`}>
      <div className="h-5 w-40 rounded-md skeleton-shimmer" />
      <div className={`${height} w-full rounded-xl skeleton-shimmer`} />
    </div>
  );
}
