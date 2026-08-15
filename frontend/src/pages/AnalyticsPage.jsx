import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import MetricCard from '../components/common/MetricCard';
import Badge from '../components/common/Badge';
import { CardSkeleton, ChartSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar, 
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon
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

const COLORS = ['#0284C7', '#F43F5E', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#06B6D4', '#64748B'];

export default function AnalyticsPage() {
  const { selectedMonth } = useOutletContext();
  const { user } = useAuth();
  const symbol = user?.currency_symbol || '₹';

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAnalytics(selectedMonth);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const { metrics, momComparison, expenseCategories, monthlyTrend } = analytics;

  const pieChartData = expenseCategories.map(c => ({
    name: c.category,
    value: c.total
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Analytics & MoM Breakdown</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Deep-dive into income vs expense ratios, spending pace, and category distributions ({selectedMonth})</p>
      </div>

      {/* Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(metrics.income, symbol)}
          trend={momComparison.incomeChangePct >= 0 ? 'up' : 'down'}
          trendText={`${Math.abs(momComparison.incomeChangePct)}% vs prev month`}
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(metrics.expenses, symbol)}
          trend={momComparison.expenseChangePct <= 0 ? 'up' : 'down'}
          trendText={`${Math.abs(momComparison.expenseChangePct)}% vs prev month`}
          icon={TrendingDown}
          color="rose"
        />
        <MetricCard
          title="Net Savings"
          value={formatCurrency(metrics.savings, symbol)}
          subtitle={`Savings Rate: ${metrics.savingsRate}%`}
          icon={PiggyBank}
          color="indigo"
        />
        <MetricCard
          title="Avg Daily Pace"
          value={`${formatCurrency(metrics.avgDailySpending, symbol)}/day`}
          subtitle={`${metrics.daysElapsed} days elapsed in month`}
          icon={Clock}
          color="sky"
        />
      </div>

      {/* Month-over-Month Performance Banner */}
      <div className="fin-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" /> Month-over-Month (MoM) Performance
          </h3>
          <Badge variant="info">Comparison Active</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Income Shift</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(metrics.income, symbol)}</span>
              <span className={`text-xs font-bold flex items-center ${momComparison.incomeChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {momComparison.incomeChangePct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(momComparison.incomeChangePct)}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">Prev month: {formatCurrency(momComparison.prevIncome, symbol)}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expense Shift</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(metrics.expenses, symbol)}</span>
              <span className={`text-xs font-bold flex items-center ${momComparison.expenseChangePct <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {momComparison.expenseChangePct <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                {Math.abs(momComparison.expenseChangePct)}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">Prev month: {formatCurrency(momComparison.prevExpenses, symbol)}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Expense Category</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.highestCategory?.category || 'None'}</span>
              <Award className="w-5 h-5 text-amber-500 shrink-0" />
            </div>
            <span className="text-[11px] text-slate-400 block">Spent: {formatCurrency(metrics.highestCategory?.total || 0, symbol)}</span>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="fin-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category Distribution</h3>
          <div className="h-64">
            {pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No expense records for selected month</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, symbol)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 6 Month Trend Bar Chart */}
        <div className="fin-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Income & Expense Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <XAxis dataKey="month_year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(value) => formatCurrency(value, symbol)} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="fin-card p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Expense Category Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Transaction Count</th>
                <th className="px-4 py-3 text-right">Total Spent</th>
                <th className="px-4 py-3 text-right">% of Total Expenses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {expenseCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No expense categories logged for this month.</td>
                </tr>
              ) : (
                expenseCategories.map(cat => {
                  const pct = metrics.expenses > 0 ? Math.round((cat.total / metrics.expenses) * 100) : 0;
                  return (
                    <tr key={cat.category} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{cat.category}</td>
                      <td className="px-4 py-3 text-center text-slate-500 font-medium">{cat.count} txns</td>
                      <td className="px-4 py-3 text-right font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(cat.total, symbol)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">{pct}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
