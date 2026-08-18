import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { ChartSkeleton } from '../components/ui/Skeleton';


import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CATEGORY_COLORS = ['#0284C7', '#F43F5E', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#06B6D4', '#64748B'];

export default function AnalyticsPage() {
  const { selectedMonth } = useOutletContext();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { format, formatRaw, convert } = useCurrency();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getAnalytics(selectedMonth);
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedMonth]);

  if (loading || !analytics) {
    return (
      <div className="space-y-6 pb-12">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const { metrics, momComparison, expenseCategories, monthlyTrend } = analytics;

  const incomeVsExpenseData = [
    { name: selectedMonth, Income: convert(metrics.income), Expenses: convert(metrics.expenses) }
  ];

  const pieChartData = (expenseCategories || []).map(cat => ({
    name: cat.category,
    value: convert(cat.total)
  }));

  const convertedMonthlyTrend = (monthlyTrend || []).map(item => ({
    month_year: item.month_year,
    income: convert(item.income),
    expense: convert(item.expense)
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('analytics.title')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.subtitle')} ({selectedMonth})</p>
      </div>

      {/* Decision-Making Question 1: "Where did my money go?" */}
      <div className="fin-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                {t('analytics.whereMoneyWent')}
              </h3>
              <p className="text-xs text-slate-400">Expense category allocation breakdown</p>
            </div>
          </div>

          <Badge variant="info">
            Top Category: {expenseCategories.length > 0 ? expenseCategories[0].category : 'N/A'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72">
            {pieChartData.length === 0 ? (
              <EmptyState title="No Expenses Recorded" description="Log expense entries to analyze category distribution." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatRaw(val)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Contextual Decision Explanation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" /> Executive Insight
            </h4>
            {expenseCategories.length > 0 ? (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Your highest spending concentration is in <strong className="text-slate-900 dark:text-white">{expenseCategories[0].category}</strong> ({format(expenseCategories[0].total)}). Consider reviewing category budgets if this exceeds target thresholds.
              </p>
            ) : (
              <p className="text-slate-400">No category expense records found for this month.</p>
            )}
          </div>
        </div>
      </div>

      {/* Decision-Making Question 2: "How is my spending changing?" */}
      <div className="fin-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                {t('analytics.howSpendingChanges')}
              </h3>
              <p className="text-xs text-slate-400">6-Month Cashflow Trajectory & Month-over-Month Shift</p>
            </div>
          </div>

          <Badge variant={momComparison.expenseChangePct <= 0 ? 'success' : 'danger'}>
            {momComparison.expenseChangePct > 0 ? (
              <span className="flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> +{momComparison.expenseChangePct}% vs Last Month</span>
            ) : (
              <span className="flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> {momComparison.expenseChangePct}% vs Last Month</span>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convertedMonthlyTrend}>
                <XAxis dataKey="month_year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(val) => formatRaw(val)} />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#10B981" fill="#10B98120" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" fill="#F43F5E20" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" /> Momentum Analysis
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Expenses moved by <strong className="text-slate-900 dark:text-white">{momComparison.expenseChangePct}%</strong> compared to the previous cycle. Maintaining a steady gap between income and expenses is key for long-term wealth stability.
            </p>
          </div>
        </div>
      </div>

      {/* Decision-Making Question 3: "Am I saving more?" */}
      <div className="fin-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                {t('analytics.amISavingMore')}
              </h3>
              <p className="text-xs text-slate-400">Net savings & monthly savings rate percentage</p>
            </div>
          </div>

          <Badge variant="indigo">
            Savings Rate: {metrics.savingsRate}%
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(val) => formatRaw(val)} />
                <Legend />
                <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Savings Guidance
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You retained <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{format(metrics.savings)}</strong> ({metrics.savingsRate}%) of your total income this month. Financial planners recommend targeting a minimum 20% savings rate.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
