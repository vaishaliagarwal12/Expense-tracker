import React from 'react';

const COLOR_MAP = {
  sky: { iconBg: 'bg-sky-50 dark:bg-sky-950/60', iconText: 'text-sky-600 dark:text-sky-400' },
  emerald: { iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', iconText: 'text-emerald-600 dark:text-emerald-400' },
  rose: { iconBg: 'bg-rose-50 dark:bg-rose-950/60', iconText: 'text-rose-600 dark:text-rose-400' },
  amber: { iconBg: 'bg-amber-50 dark:bg-amber-950/60', iconText: 'text-amber-600 dark:text-amber-400' },
  indigo: { iconBg: 'bg-indigo-50 dark:bg-indigo-950/60', iconText: 'text-indigo-600 dark:text-indigo-400' },
  navy: { iconBg: 'bg-slate-100 dark:bg-slate-700', iconText: 'text-slate-900 dark:text-white' }
};

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'sky', trend, trendText, className = '' }) {
  const styles = COLOR_MAP[color] || COLOR_MAP.sky;

  return (
    <div className={`fin-card fin-card-hover p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${styles.iconBg} ${styles.iconText} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>

        {(subtitle || trendText) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {trend ? (
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                trend === 'up' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400' 
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
              }`}>
                {trend === 'up' ? '↑' : '↓'} {trendText}
              </span>
            ) : (
              <span className="truncate">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
