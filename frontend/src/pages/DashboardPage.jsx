import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import { budgetApi } from '../services/budgetApi';
import { goalApi } from '../services/goalApi';
import { transactionApi } from '../services/transactionApi';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/common/MetricCard';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import { CardSkeleton, ChartSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
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
  ChevronRight
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
  const symbol = user?.currency_symbol || '₹';

  const [analytics, setAnalytics] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, budgetsRes, goalsRes, txRes, healthRes, forecastRes] = await Promise.all([
        analyticsApi.getAnalytics(selectedMonth),
        budgetApi.getBudgets(selectedMonth),
        goalApi.getGoals(),
        transactionApi.getAll({ limit: 5, page: 1 }),
        analyticsApi.getHealthScore(selectedMonth),
        analyticsApi.getForecast(selectedMonth)
      ]);

      setAnalytics(analyticsRes.data);
      setBudgets(budgetsRes.data?.budgets || []);
      setGoals(goalsRes.data?.goals || []);
      setRecentTx(txRes.data?.transactions || []);
      setHealthScore(healthRes.data);
      setForecast(forecastRes.data);
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
          <CardSkeleton className="h-56" />
          <CardSkeleton className="h-56" />
          <CardSkeleton className="h-56" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const { metrics, momComparison, expenseCategories, monthlyTrend } = analytics;
  const currentBalance = metrics.income - metrics.expenses;

  const incomeVsExpenseData = [
    { name: 'Selected Month', Income: metrics.income, Expenses: metrics.expenses }
  ];

  const pieChartData = expenseCategories.map(cat => ({
    name: cat.category,
    value: cat.total
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good morning, {user?.name || 'User'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Here's your personal financial overview & cashflow metrics.
          </p>
        </div>
      </div>

      {/* Top Forecast Warning Banner */}
      {forecast && forecast.warningLevel !== 'safe' && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
          forecast.warningLevel === 'danger'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-sm">Spending Forecast Warning</p>
            <p>{forecast.warningMessage}</p>
          </div>
        </div>
      )}

      {/* 4 Primary Financial Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Balance"
          value={formatCurrency(currentBalance, symbol)}
          subtitle="Net monthly cashflow"
          icon={Wallet}
          color={currentBalance >= 0 ? 'sky' : 'rose'}
        />
        <MetricCard
          title="Total Income"
          value={formatCurrency(metrics.income, symbol)}
          trend={momComparison.incomeChangePct >= 0 ? 'up' : 'down'}
          trendText={`${Math.abs(momComparison.incomeChangePct)}% vs last month`}
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(metrics.expenses, symbol)}
          trend={momComparison.expenseChangePct <= 0 ? 'up' : 'down'}
          trendText={`${Math.abs(momComparison.expenseChangePct)}% vs last month`}
          icon={TrendingDown}
          color="rose"
        />
        <MetricCard
          title="Total Savings"
          value={formatCurrency(metrics.savings, symbol)}
          subtitle={`Savings Rate: ${metrics.savingsRate}%`}
          icon={PiggyBank}
          color="indigo"
        />
      </div>

      {/* Health Score, Forecast, & Budget Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        {healthScore && (
          <div className="fin-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-600" /> Financial Health Score
              </span>
              <Badge variant={healthScore.score >= 80 ? 'success' : healthScore.score >= 65 ? 'info' : 'warning'}>
                {healthScore.ratingGrade}
              </Badge>
            </div>

            <div className="my-4 text-center">
              <div className="text-4xl font-black tracking-tight" style={{ color: healthScore.color }}>
                {healthScore.score}<span className="text-xl font-normal text-slate-400">/100</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 px-2">
                {healthScore.disclaimer}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              {healthScore.factors.slice(0, 3).map((f, i) => (
                <div key={i} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{f.category}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{f.score}/{f.maxScore} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forecast Card */}
        {forecast && (
          <div className="fin-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Spending Forecast
              </span>
              <span className="text-xs text-slate-400 font-semibold">{forecast.remainingDays} days left</span>
            </div>

            <div className="my-3 space-y-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Projected Month-End</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(forecast.projectedSpending, symbol)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Avg Daily Pace</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(forecast.avgDailySpending, symbol)}/day</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Surplus/Deficit</span>
                  <span className={`font-bold ${forecast.isDeficit ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {formatCurrency(forecast.expectedSurplusDeficit, symbol)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2 flex items-center justify-between">
              <span>Pace calculation active</span>
              <span className="font-semibold">{forecast.daysElapsed} days elapsed</span>
            </div>
          </div>
        )}

        {/* Budget Utilization Progress Card */}
        <div className="fin-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-sky-600" /> Budget Utilization
            </span>
            <Link to="/budgets" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">Manage</Link>
          </div>

          <div className="my-3 space-y-3.5 overflow-y-auto max-h-48 pr-1">
            {budgets.length === 0 ? (
              <EmptyState 
                title="No Budgets Created" 
                description="Set monthly category budgets to monitor spending limits."
                actionLabel="Create Budget"
                onAction={() => window.location.href = '/budgets'}
                className="py-4 border-none shadow-none"
              />
            ) : (
              budgets.slice(0, 3).map((b) => (
                <div key={b.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{b.category}</span>
                    <span className={b.isExceeded ? 'text-rose-600' : 'text-slate-500'}>
                      {formatCurrency(b.spent, symbol)} / {formatCurrency(b.amount, symbol)}
                    </span>
                  </div>
                  <ProgressBar value={b.spent} max={b.amount} status={b.status} showText={false} />
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 flex justify-between">
            <span>Budgets set: {budgets.length}</span>
            <span className="font-bold text-slate-900 dark:text-white">{budgets.filter(b => b.isExceeded).length} exceeded</span>
          </div>
        </div>
      </div>

      {/* 4 Professional Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Income vs Expense Comparison */}
        <div className="fin-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Income vs Expense Comparison
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(value) => formatCurrency(value, symbol)} />
                <Legend />
                <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Spending Trend */}
        <div className="fin-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Spending & Income Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <XAxis dataKey="month_year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(value) => formatCurrency(value, symbol)} />
                <Area type="monotone" dataKey="income" stroke="#10B981" fill="#10B98120" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" fill="#F43F5E20" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Expense Distribution Donut */}
        <div className="fin-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Expense Distribution by Category
          </h3>
          <div className="h-64">
            {pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No expense records for this month</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, symbol)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Budget Progress Overview */}
        <div className="fin-card p-6 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Budget Usage Breakdown
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-60 pr-1">
            {budgets.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">Create monthly budgets to see category progress.</p>
            ) : (
              budgets.map(b => (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{b.category}</span>
                    <span className={b.isExceeded ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                      {formatCurrency(b.spent, symbol)} of {formatCurrency(b.amount, symbol)} ({b.usagePercentage}%)
                    </span>
                  </div>
                  <ProgressBar value={b.spent} max={b.amount} status={b.status} showText={false} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Savings Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Directory Table */}
        <div className="lg:col-span-2 fin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-600" /> Recent Transactions
            </h3>
            <Link to="/transactions" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
              View All Transactions <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {recentTx.length === 0 ? (
              <EmptyState 
                title="No Recent Transactions" 
                description="Start logging your income and expenses to view them here."
                actionLabel="Add Transaction"
                onAction={() => window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'))}
                className="py-6 border-none shadow-none"
              />
            ) : (
              recentTx.map(tx => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-colors">
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
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{tx.category} • {tx.payment_method} • {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, symbol)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Savings Goals Card */}
        <div className="fin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Savings Goals</h3>
            <Link to="/goals" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">Manage</Link>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-72">
            {goals.length === 0 ? (
              <EmptyState 
                title="No Savings Goals" 
                description="Set savings targets for emergency funds or purchases."
                actionLabel="Create Goal"
                onAction={() => window.location.href = '/goals'}
                className="py-6 border-none shadow-none"
              />
            ) : (
              goals.map(g => (
                <div key={g.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-900 dark:text-white truncate">{g.name}</span>
                    <span className="text-sky-600 dark:text-sky-400">{g.progressPercentage}%</span>
                  </div>
                  <ProgressBar value={g.current_saved} max={g.target_amount} showText={false} status="success" />
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Saved: {formatCurrency(g.current_saved, symbol)}</span>
                    <span>Target: {formatCurrency(g.target_amount, symbol)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
