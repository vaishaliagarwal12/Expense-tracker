import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { budgetApi } from '../services/budgetApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import BudgetModal from '../components/budgets/BudgetModal';
import { Plus, Edit3, Trash2, PieChart, AlertCircle, AlertTriangle, Wallet, CreditCard, ShieldCheck } from 'lucide-react';

export default function BudgetsPage() {
  const { selectedMonth } = useOutletContext();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { format } = useCurrency();

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
      showSuccess('Budget deleted');
      fetchBudgets();
      window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
    } catch (err) {
      showError('Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('budgets.title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('budgets.subtitle')} ({selectedMonth})</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
        >
          {t('budgets.create')}
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fin-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('budgets.totalBudget')}</span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{format(summary.totalBudget)}</p>
        </div>

        <div className="fin-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('budgets.spentSoFar')}</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{format(summary.totalSpent)}</p>
          <p className="text-[11px] text-slate-400 font-medium">Usage: {summary.overallUsagePercentage}%</p>
        </div>

        <div className="fin-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('budgets.remaining')}</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${summary.totalRemaining >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
            {format(summary.totalRemaining)}
          </p>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState 
          icon={PieChart}
          title={t('budgets.emptyTitle')} 
          description={t('budgets.emptySub')}
          actionLabel={t('budgets.create')}
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
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{b.category}</h3>
                    <Badge variant={b.isExceeded ? 'danger' : b.isWarning ? 'warning' : 'success'}>
                      {b.isExceeded ? t('budgets.overBudget') : b.isWarning ? t('budgets.caution') : t('budgets.safe')}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Month: {b.month_year}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingBudget(b); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title={t('budgets.edit')}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Warning Pill */}
              {b.isExceeded && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Budget Exceeded! Over limit by {format(Math.abs(b.remaining))}.</span>
                </div>
              )}

              {b.isWarning && !b.isExceeded && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Approaching limit ({b.usagePercentage}% used).</span>
                </div>
              )}

              {/* Progress & Breakdown */}
              <div className="space-y-2">
                <ProgressBar value={b.spent} max={b.amount} status={b.status} showText={false} height="h-2.5" />
                
                <div className="grid grid-cols-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t('budgets.totalBudget')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{format(b.amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t('budgets.spentSoFar')}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{format(b.spent)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t('budgets.remaining')}</span>
                    <span className={`font-bold ${b.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {format(b.remaining)}
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
            showSuccess('Budget saved');
            fetchBudgets();
            window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
          }}
        />
      )}
    </div>
  );
}
