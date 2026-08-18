import React from 'react';

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`fin-card p-6 space-y-4 skeleton-shimmer ${className}`}>
      <div className="h-4 w-1/3 bg-slate-200/70 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-8 w-1/2 bg-slate-200/70 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-3 w-2/3 bg-slate-200/70 dark:bg-slate-800 rounded-lg"></div>
    </div>
  );
}

export function ChartSkeleton({ className = '' }) {
  return (
    <div className={`fin-card p-6 space-y-4 skeleton-shimmer h-72 ${className}`}>
      <div className="h-4 w-1/4 bg-slate-200/70 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-48 w-full bg-slate-200/70 dark:bg-slate-800 rounded-xl"></div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="skeleton-shimmer">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-200/70 dark:bg-slate-800 rounded-md w-full"></div>
        </td>
      ))}
    </tr>
  );
}
