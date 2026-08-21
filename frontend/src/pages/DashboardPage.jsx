import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import { budgetApi } from '../services/budgetApi';
import { goalApi } from '../services/goalApi';
import { transactionApi } from '../services/transactionApi';
import { subscriptionApi } from '../services/subscriptionApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/date';

import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Activity, 
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Receipt,
  PieChart as PieIcon,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  CheckCircle2,
  Calendar
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

export default function DashboardPage() {
  const { selectedMonth } = useOutletContext();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { format, formatRaw, convert } = useCurrency();


  const [analytics, setAnalytics] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, budgetsRes, goalsRes, txRes, healthRes, forecastRes, subRes] = await Promise.all([
        analyticsApi.getAnalytics(selectedMonth),
        budgetApi.getBudgets(selectedMonth),
        goalApi.getGoals(),
        transactionApi.getAll({ limit: 5, page: 1 }),
        analyticsApi.getHealthScore(selectedMonth),
        analyticsApi.getForecast(selectedMonth),
        subscriptionApi.getAll().catch(() => ({ data: { subscriptions: [] } }))
      ]);

      setAnalytics(analyticsRes.data);
      setBudgets(budgetsRes.data?.budgets || []);
      setGoals(goalsRes.data?.goals || []);
      setRecentTx(txRes.data?.transactions || []);
      setHealthScore(healthRes.data);
      setForecast(forecastRes.data);
      setSubscriptions(subRes.data?.subscriptions || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  useEffect(() => {
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('fintrack_transaction_updated', handleUpdate);
    return () => window.removeEventListener('fintrack_transaction_updated', handleUpdate);
  }, [selectedMonth]);

  if (loading || !analytics) {
    return (
      <div className="space-y-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const { metrics, momComparison, expenseCategories, monthlyTrend } = analytics;
  const netBalance = metrics.income - metrics.expenses;

  // Contextual Greeting by time of day
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const greetingText = t(`greeting.${greetingTime}`, { name: user?.name || 'User' });

  // Dynamic Narrative Bullet Generation ("WHAT'S HAPPENING")
  const narratives = [];

  if (momComparison.expenseChangePct > 0) {
    narratives.push({
      type: 'warning',
      text: `You're spending ${momComparison.expenseChangePct}% faster than last month.`,
      reason: expenseCategories.length > 0 ? `${expenseCategories[0].category} is currently your largest expense.` : 'Expenses increased.'
    });
  } else if (momComparison.expenseChangePct < 0) {
    narratives.push({
      type: 'success',
      text: `You reduced monthly spending by ${Math.abs(momComparison.expenseChangePct)}% compared to last month.`,
      reason: 'Great job maintaining cashflow control!'
    });
  }

  const exceededBudgets = budgets.filter(b => b.isExceeded);
  if (exceededBudgets.length > 0) {
    narratives.push({
      type: 'danger',
      text: `${exceededBudgets.length} budget ${exceededBudgets.length === 1 ? 'category' : 'categories'} exceeded (${exceededBudgets.map(b => b.category).join(', ')}).`,
      reason: 'Review your limit allocations.'
    });
  }

  if (metrics.savingsRate >= 20) {
    narratives.push({
      type: 'success',
      text: `Healthy savings rate of ${metrics.savingsRate}%.`,
      reason: 'You are saving a strong portion of your income.'
    });
  }

  // Trajectory chart data
  const trajectoryData = (monthlyTrend || []).map(item => ({
    month: item.month_year,
    Income: convert(item.income),
    Expenses: convert(item.expense),
    Savings: convert(Math.max(0, item.income - item.expense))
  }));

  const pieChartData = (expenseCategories || []).map(cat => ({
    name: cat.category,
    value: convert(cat.total)
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Greeting & Personalization Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {greetingText}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('greeting.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={netBalance >= 0 ? 'success' : 'danger'} size="lg">
            {netBalance >= 0 ? 'Surplus State' : 'Deficit State'}
          </Badge>
        </div>
      </div>

      {/* CORE UX CONCEPT: FINANCIAL PULSE HERO BANNER */}
      <div className="fin-card p-4 sm:p-6 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white dark:border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-sky-400 animate-pulse-subtle" />
              {t('pulse.title')}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">
              {selectedMonth}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">{t('pulse.netPosition')}</span>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mt-1">
                {format(netBalance)}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block">{t('pulse.spendingPace')}</span>
              <p className={`text-sm sm:text-base font-bold mt-1 flex items-center gap-1 ${
                momComparison.expenseChangePct > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {momComparison.expenseChangePct > 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    {t('pulse.faster', { pct: momComparison.expenseChangePct })}
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    {t('pulse.slower', { pct: Math.abs(momComparison.expenseChangePct) })}
                  </>
                )}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block">{t('metrics.savingsRate')}</span>
              <p className="text-sm sm:text-base font-bold text-sky-300 mt-1">
                {metrics.savingsRate}% ({format(metrics.savings)})
              </p>
            </div>

            <div className="flex justify-start sm:justify-end">
              <Link to="/transactions">
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  {t('nav.transactions')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC NARRATIVE SECTION: "WHAT'S HAPPENING" (WHAT / WHY / SO WHAT / WHAT NEXT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 fin-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              {t('pulse.whatHappened')}
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Live API Insights</span>
          </div>

          <div className="space-y-3">
            {narratives.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">Your cashflow and budget activity is steady with no unusual spikes.</p>
            ) : (
              narratives.map((item, i) => (
                <div key={i} className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                  item.type === 'warning' || item.type === 'danger'
                    ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                }`}>
                  {item.type === 'warning' || item.type === 'danger' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs min-w-0">
                    <p className="font-extrabold text-xs sm:text-sm">{item.text}</p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      <strong className="uppercase text-[10px] text-slate-400 mr-1">{t('pulse.why')}</strong>
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FINANCIAL HEALTH SCORE CARD */}
        {healthScore && (
          <div className="fin-card p-4 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                {t('health.title')}
              </span>
              <Badge variant={healthScore.score >= 80 ? 'success' : healthScore.score >= 65 ? 'info' : 'warning'}>
                {healthScore.ratingGrade}
              </Badge>
            </div>

            <div className="text-center my-2">
              <div className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: healthScore.color }}>
                {healthScore.score}<span className="text-lg sm:text-xl font-normal text-slate-400">/100</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 px-2 leading-relaxed">
                {healthScore.disclaimer}
              </p>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              {healthScore.factors.slice(0, 3).map((f, i) => (
                <div key={i} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">{f.category}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{f.score}/{f.maxScore} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="fin-card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('metrics.totalBalance')}</span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{format(netBalance)}</p>
          <p className="text-[11px] text-slate-400 font-medium">{t('metrics.netMonthlyCashflow')}</p>
        </div>

        <div className="fin-card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('metrics.totalIncome')}</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{format(metrics.income)}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            {t('metrics.vsLastMonth', { change: momComparison.incomeChangePct })}
          </p>
        </div>

        <div className="fin-card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('metrics.totalExpenses')}</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{format(metrics.expenses)}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
            {t('metrics.vsLastMonth', { change: momComparison.expenseChangePct })}
          </p>
        </div>

        <div className="fin-card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('metrics.totalSavings')}</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{format(metrics.savings)}</p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
            {t('metrics.savingsRate')}: {metrics.savingsRate}%
          </p>
        </div>
      </div>

      {/* CHARTS ROW: SPENDING TRAJECTORY & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* SPENDING TRAJECTORY CHART */}
        <div className="fin-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('forecast.title')}
            </h3>
            {forecast && (
              <span className="text-xs font-semibold text-slate-400">{forecast.remainingDays} days left</span>
            )}
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(val) => formatRaw(val)} />
                <Legend />
                <Area type="monotone" dataKey="Income" stroke="#10B981" fill="#10B98120" />
                <Area type="monotone" dataKey="Expenses" stroke="#F43F5E" fill="#F43F5E20" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP SPENDING CATEGORIES DONUT */}
        <div className="fin-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('analytics.categoryDistribution')}
            </h3>
            <Link to="/analytics" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
          <div className="h-56 sm:h-64">
            {pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No expense records for this month</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
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
        </div>
      </div>

      {/* UPCOMING COMMITMENTS & RECENT TRANSACTIONS LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT TRANSACTIONS */}
        <div className="lg:col-span-2 fin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-600" /> {t('transactions.title')}
            </h3>
            <Link to="/transactions" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
              {t('common.viewAll')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTx.length === 0 ? (
              <EmptyState 
                title={t('transactions.emptyTitle')} 
                description={t('transactions.emptySub')}
                actionLabel={t('transactions.add')}
                onAction={() => window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'))}
                className="py-6 border-none shadow-none"
              />
            ) : (
              recentTx.map(tx => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.type === 'income' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{tx.category} • {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* UPCOMING RECURRING COMMITMENTS & SUBSCRIPTIONS */}
        <div className="fin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" /> {t('subscriptions.title')}
            </h3>
            <Link to="/subscriptions" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <EmptyState 
                title={t('subscriptions.emptyTitle')}
                description={t('subscriptions.emptySub')}
                className="py-4 border-none shadow-none"
              />
            ) : (
              subscriptions.slice(0, 4).map(sub => (
                <div key={sub.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{sub.name}</p>
                    <p className="text-[11px] text-slate-400">{sub.billing_cycle} • Due {sub.next_billing_date ? formatDate(sub.next_billing_date) : '-'}</p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {format(sub.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
