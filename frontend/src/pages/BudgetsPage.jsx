import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { budgetApi } from '../services/budgetApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import MetricCard from '../components/common/MetricCard';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import BudgetModal from '../components/budgets/BudgetModal';
import { Plus, Edit3, Trash2, PieChart, AlertCircle, AlertTriangle, Wallet, CreditCard, ShieldCheck } from 'lucide-react';

export default function BudgetsPage() {
  const { selectedMonth } = useOutletContext();
  const { user } = useAuth();
  const symbol = user?.currency_symbol || '₹';

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallUsagePercentage: 0 });
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetApi.getBudgets(selectedMonth);
      setBudgets(res.data?.budgets || []);
      setSummary(res.data?.summary || { totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallUsagePercentage: 0 });
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category budget?')) return;
    try {
      await budgetApi.delete(id);
      fetchBudgets();
      window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
    } catch (err) {
      alert('Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Category Budgets</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Set and monitor monthly category spending limits ({selectedMonth})</p>
        </div>

        <button
          onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Category Budget
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Monthly Budget"
          value={formatCurrency(summary.totalBudget, symbol)}
          subtitle="Allocated category limits"
          icon={Wallet}
          color="sky"
        />
        <MetricCard
          title="Spent So Far"
          value={formatCurrency(summary.totalSpent, symbol)}
          subtitle={`Overall Usage: ${summary.overallUsagePercentage}%`}
          icon={CreditCard}
          color="rose"
        />
        <MetricCard
          title="Remaining Budget"
          value={formatCurrency(summary.totalRemaining, symbol)}
          subtitle={summary.totalRemaining >= 0 ? 'Safe remaining allowance' : 'Budget overallocated'}
          icon={ShieldCheck}
          color={summary.totalRemaining >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Budget Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState 
          icon={PieChart}
          title="No Category Budgets Configured" 
          description="Set spending limits for Food, Transport, Bills, or Rent to prevent monthly overspending."
          actionLabel="Create First Budget"
          onAction={() => { setEditingBudget(null); setIsModalOpen(true); }}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => (
            <div key={b.id} className="fin-card fin-card-hover p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.category}</h3>
                    <Badge variant={b.isExceeded ? 'danger' : b.isWarning ? 'warning' : 'success'}>
                      {b.isExceeded ? 'Exceeded' : b.isWarning ? 'Warning' : 'Healthy'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Month: {b.month_year}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingBudget(b); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    title="Edit Budget"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Warning Pill */}
              {b.isExceeded && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Budget Exceeded! Over by {formatCurrency(Math.abs(b.remaining), symbol)}.</span>
                </div>
              )}

              {b.isWarning && !b.isExceeded && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Approaching limit ({b.usagePercentage}% used).</span>
                </div>
              )}

              {/* Progress Bar & Numerical Breakdown */}
              <div className="space-y-2">
                <ProgressBar value={b.spent} max={b.amount} status={b.status} showText={false} height="h-2.5" />
                
                <div className="grid grid-cols-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Budget Target</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(b.amount, symbol)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Spent So Far</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(b.spent, symbol)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Remaining</span>
                    <span className={`font-bold ${b.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(b.remaining, symbol)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Modal */}
      {isModalOpen && (
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          budgetToEdit={editingBudget}
          monthYear={selectedMonth}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchBudgets();
            window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
          }}
        />
      )}
    </div>
  );
}
