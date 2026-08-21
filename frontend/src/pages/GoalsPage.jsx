import React, { useState, useEffect } from 'react';
import { goalApi } from '../services/goalApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/date';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import GoalModal from '../components/goals/GoalModal';
import DepositModal from '../components/goals/DepositModal';
import { Plus, Target, PiggyBank, Edit3, Trash2, Calendar } from 'lucide-react';

export default function GoalsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { format } = useCurrency();
  const symbol = user?.currency_symbol || '₹';

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [depositGoal, setDepositGoal] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalApi.getGoals();
      setGoals(res.data?.goals || []);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings milestone?')) return;
    try {
      await goalApi.delete(id);
      showSuccess('Savings goal deleted');
      fetchGoals();
    } catch (err) {
      showError('Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('goals.title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('goals.subtitle')}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
          className="w-full sm:w-auto"
        >
          {t('goals.create')}
        </Button>
      </div>

      {/* Goals Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <CardSkeleton className="h-52" />
          <CardSkeleton className="h-52" />
          <CardSkeleton className="h-52" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState 
          icon={Target}
          title={t('goals.emptyTitle')} 
          description={t('goals.emptySub')}
          actionLabel={t('goals.create')}
          onAction={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {goals.map(g => (
            <div key={g.id} className="fin-card fin-card-hover p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{g.name}</h3>
                    {g.target_date && (
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" /> {formatDate(g.target_date)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditingGoal(g); setIsGoalModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">{t('goals.progress')}</span>
                  <span className="text-sky-600 dark:text-sky-400">{g.progressPercentage}%</span>
                </div>
                <ProgressBar value={g.current_saved} max={g.target_amount} status="success" showText={false} height="h-3" />
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800 gap-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">{t('goals.saved')}</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 truncate block">{format(g.current_saved)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">{t('goals.target')}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white truncate block">{format(g.target_amount)}</span>
                </div>

              </div>

              {/* Deposit Quick Action */}
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={PiggyBank}
                onClick={() => setDepositGoal(g)}
              >
                {t('goals.deposit')}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Goal Add/Edit Modal */}
      {isGoalModalOpen && (
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          goalToEdit={editingGoal}
          onSuccess={() => {
            setIsGoalModalOpen(false);
            showSuccess('Goal updated');
            fetchGoals();
          }}
        />
      )}

      {/* Deposit Modal */}
      {depositGoal && (
        <DepositModal
          isOpen={!!depositGoal}
          onClose={() => setDepositGoal(null)}
          goal={depositGoal}
          onSuccess={() => {
            setDepositGoal(null);
            showSuccess('Deposit logged');
            fetchGoals();
          }}
        />
      )}
    </div>
  );
}
