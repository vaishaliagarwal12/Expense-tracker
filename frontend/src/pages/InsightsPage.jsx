import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { Sparkles, AlertTriangle, Lightbulb, ArrowRight, ShieldCheck } from 'lucide-react';

export default function InsightsPage() {
  const { selectedMonth } = useOutletContext();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getInsights(selectedMonth);
        setInsights(res.data?.insights || []);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [selectedMonth]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('insights.title')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('insights.subtitle')} ({selectedMonth})</p>
      </div>

      {/* Insights Feed Grid */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
        </div>
      ) : insights.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Actionable Alerts Detected"
          description="Your monthly cashflow and category budgets are operating within expected healthy boundaries."
          className="py-16"
        />
      ) : (
        <div className="space-y-4">
          {insights.map((item, idx) => (
            <div key={idx} className="fin-card p-4 sm:p-6 space-y-4 border-l-4 border-l-sky-500 dark:border-l-sky-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">{item.title || 'Insight Alert'}</h3>
                </div>

                <Badge variant={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'info'}>
                  {item.severity ? item.severity.toUpperCase() : 'INFO'}
                </Badge>
              </div>

              {/* WHAT / WHY / WHAT TO DO STRUCTURE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-2 text-xs">
                {/* WHAT HAPPENED */}
                <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">{t('insights.whatHappened')}</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {item.whatHappened || item.description || item.message}
                  </p>
                </div>

                {/* WHY IT MATTERS */}
                <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {t('insights.whyItMatters')}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {item.whyItMatters || 'May impact your monthly budget limit or projected savings target.'}
                  </p>
                </div>

                {/* WHAT YOU CAN DO */}
                <div className="p-3 sm:p-3.5 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-800/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 block flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> {t('insights.whatYouCanDo')}
                  </span>
                  <p className="text-sky-950 dark:text-sky-200 font-bold leading-relaxed">
                    {item.actionableAdvice || item.recommendation || 'Review recent transactions in this category to eliminate non-essential expenses.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
