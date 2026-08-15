import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import Badge from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { Sparkles, AlertTriangle, CheckCircle2, Info, Lightbulb, Zap, ArrowRight } from 'lucide-react';

export default function InsightsPage() {
  const { selectedMonth } = useOutletContext();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchInsights();
  }, [selectedMonth]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'warning':
      case 'danger': return 'warning';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Financial Intelligence & Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Rule-based analytical observations extracted from your actual financial patterns ({selectedMonth})</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton className="h-24" />
          <CardSkeleton className="h-24" />
          <CardSkeleton className="h-24" />
        </div>
      ) : insights.length === 0 ? (
        <EmptyState 
          icon={Lightbulb}
          title="No Financial Insights Generated" 
          description="Log more transactions and set monthly category budgets to generate intelligent observations."
          className="py-16"
        />
      ) : (
        <div className="space-y-4">
          {insights.map(item => (
            <div
              key={item.id}
              className="fin-card fin-card-hover p-5 flex items-start gap-4"
            >
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 shrink-0">
                {getInsightIcon(item.type)}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
