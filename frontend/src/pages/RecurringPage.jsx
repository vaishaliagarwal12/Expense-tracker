import React, { useState, useEffect } from 'react';
import { recurringApi } from '../services/recurringApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import Badge from '../components/common/Badge';
import MetricCard from '../components/common/MetricCard';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import RecurringModal from '../components/recurring/RecurringModal';
import { Plus, Repeat, Edit3, Trash2, Calendar, Clock, Zap } from 'lucide-react';

export default function RecurringPage() {
  const { user } = useAuth();
  const symbol = user?.currency_symbol || '₹';

  const [recurringItems, setRecurringItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const res = await recurringApi.getAll();
      setRecurringItems(res.data?.recurring || []);
    } catch (err) {
      console.error('Failed to fetch recurring items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring schedule?')) return;
    try {
      await recurringApi.delete(id);
      fetchRecurring();
    } catch (err) {
      alert('Failed to delete recurring transaction');
    }
  };

  const totalMonthlyCommitment = recurringItems.reduce((acc, item) => {
    if (item.frequency === 'Monthly') return acc + Number(item.amount);
    if (item.frequency === 'Weekly') return acc + (Number(item.amount) * 4);
    if (item.frequency === 'Yearly') return acc + (Number(item.amount) / 12);
    return acc + Number(item.amount);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recurring Expenses & Scheduler</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Automate and monitor fixed bills, rent, EMIs, and recurring payments</p>
        </div>

        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Recurring Schedule
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          title="Active Schedules"
          value={recurringItems.length.toString()}
          subtitle="Automated recurring items"
          icon={Repeat}
          color="sky"
        />
        <MetricCard
          title="Est. Monthly Commitment"
          value={formatCurrency(totalMonthlyCommitment, symbol)}
          subtitle="Total normalized monthly obligation"
          icon={Zap}
          color="indigo"
        />
      </div>

      {/* Grid of Recurring Items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
        </div>
      ) : recurringItems.length === 0 ? (
        <EmptyState 
          icon={Repeat}
          title="No Recurring Schedules Configured" 
          description="Define recurring rent, internet bills, EMIs, or insurance premiums to track future liabilities automatically."
          actionLabel="Create Recurring Schedule"
          onAction={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurringItems.map(item => (
            <div key={item.id} className="fin-card fin-card-hover p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{item.frequency}</Badge>
                      <span className="text-xs font-semibold text-slate-500">{item.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Edit Schedule"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(item.amount, symbol)}
                  <span className="text-xs font-normal text-slate-400"> / {item.frequency.toLowerCase()}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 text-xs border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(item.start_date)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-sky-600" /> Next Occurrence:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{formatDate(item.next_occurrence)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <RecurringModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemToEdit={editingItem}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRecurring();
          }}
        />
      )}
    </div>
  );
}
