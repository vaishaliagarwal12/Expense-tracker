import React, { useState, useEffect } from 'react';
import { goalApi } from '../services/goalApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import MetricCard from '../components/common/MetricCard';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import GoalModal from '../components/goals/GoalModal';
import DepositModal from '../components/goals/DepositModal';
import { Plus, Target, Edit3, Trash2, PiggyBank, Calendar, CheckCircle2, Award, Clock } from 'lucide-react';

export default function GoalsPage() {
  const { user } = useAuth();
  const symbol = user?.currency_symbol || '₹';

  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({ totalGoals: 0, totalTarget: 0, totalSaved: 0, overallProgress: 0 });
  const [loading, setLoading] = useState(true);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [depositGoal, setDepositGoal] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalApi.getGoals();
      setGoals(res.data?.goals || []);
      setSummary(res.data?.summary || { totalGoals: 0, totalTarget: 0, totalSaved: 0, overallProgress: 0 });
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
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await goalApi.delete(id);
      fetchGoals();
    } catch (err) {
      alert('Failed to delete savings goal');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Savings Goals</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Plan and save for major purchases, emergency funds, & life targets</p>
        </div>

        <button
          onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Savings Goal
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Target Amount"
          value={formatCurrency(summary.totalTarget, symbol)}
          subtitle={`Across ${summary.totalGoals} savings goals`}
          icon={Target}
          color="sky"
        />
        <MetricCard
          title="Total Currently Saved"
          value={formatCurrency(summary.totalSaved, symbol)}
          subtitle="Total accumulated savings"
          icon={PiggyBank}
          color="emerald"
        />
        <MetricCard
          title="Overall Progress"
          value={`${summary.overallProgress}%`}
          subtitle="Cumulative completion rate"
          icon={Award}
          color="indigo"
        />
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton className="h-56" />
          <CardSkeleton className="h-56" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState 
          icon={Target}
          title="No Savings Goals Defined" 
          description="Create savings targets (e.g. Emergency Fund, Laptop, Vacation) to compute required monthly savings."
          actionLabel="Create Savings Goal"
          onAction={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(g => (
            <div key={g.id} className="fin-card fin-card-hover p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{g.name}</h3>
                      {g.isCompleted ? (
                        <Badge variant="success" icon={CheckCircle2}>Completed</Badge>
                      ) : (
                        <Badge variant="info">{g.progressPercentage}% Complete</Badge>
                      )}
                    </div>
                    {g.description && <p className="text-xs text-slate-500 dark:text-slate-400">{g.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingGoal(g); setIsGoalModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Numerical Amounts */}
                <div className="mt-4 space-y-2">
                  <ProgressBar value={g.current_saved} max={g.target_amount} status={g.isCompleted ? 'success' : 'normal'} showText={false} height="h-2.5" />
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Saved: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(g.current_saved, symbol)}</strong></span>
                    <span className="text-slate-500">Target: <strong className="text-slate-900 dark:text-white">{formatCurrency(g.target_amount, symbol)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Deadline & Required Monthly Savings */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 text-xs border border-slate-100 dark:border-slate-700/60">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium"><Calendar className="w-3.5 h-3.5 text-sky-600" /> Target Deadline:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(g.deadline)}</span>
                </div>
                {!g.isCompleted && g.requiredMonthlySavings > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-amber-500" /> Required Monthly Savings:</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400">{formatCurrency(g.requiredMonthlySavings, symbol)}/mo</span>
                  </div>
                )}
              </div>

              {/* Deposit Action */}
              {!g.isCompleted && (
                <button
                  onClick={() => setDepositGoal(g)}
                  className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors"
                >
                  <PiggyBank className="w-4 h-4" /> Add Deposit To Goal
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isGoalModalOpen && (
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          goalToEdit={editingGoal}
          onSuccess={() => {
            setIsGoalModalOpen(false);
            fetchGoals();
          }}
        />
      )}

      {depositGoal && (
        <DepositModal
          isOpen={!!depositGoal}
          onClose={() => setDepositGoal(null)}
          goal={depositGoal}
          onSuccess={() => {
            setDepositGoal(null);
            fetchGoals();
          }}
        />
      )}
    </div>
  );
}
