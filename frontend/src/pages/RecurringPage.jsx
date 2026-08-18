import React, { useState, useEffect } from 'react';
import { recurringApi } from '../services/recurringApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/date';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RecurringModal from '../components/recurring/RecurringModal';
import { Plus, Repeat, Edit3, Trash2, Calendar, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function RecurringPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { format } = useCurrency();

  const [recurringItems, setRecurringItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const res = await recurringApi.getAll();
      setRecurringItems(res.data?.recurringExpenses || res.data?.recurring || []);
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
    if (!window.confirm('Delete this recurring transaction schedule?')) return;
    try {
      await recurringApi.delete(id);
      showSuccess('Recurring schedule deleted');
      fetchRecurring();
    } catch (err) {
      showError('Failed to delete schedule');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('recurring.title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('recurring.subtitle')}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
        >
          {t('recurring.create')}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl flex items-start gap-3 text-xs text-sky-900 dark:text-sky-200">
        <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-sm">Automatic Transaction Generation</p>
          <p className="mt-0.5 text-sky-700 dark:text-sky-300">
            When due dates arrive, recurring entries automatically log matching transactions into your ledger.
          </p>
        </div>
      </div>

      {/* Recurring Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
        </div>
      ) : recurringItems.length === 0 ? (
        <EmptyState 
          icon={Repeat}
          title={t('recurring.emptyTitle')} 
          description={t('recurring.emptySub')}
          actionLabel={t('recurring.create')}
          onAction={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringItems.map(item => (
            <div key={item.id} className="fin-card fin-card-hover p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    item.type === 'income' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{item.description}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{item.category} • {item.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className={`text-2xl font-black ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {item.type === 'income' ? '+' : '-'}{format(item.amount)}

                </span>
                <span className="text-xs text-slate-400 font-medium"> / {item.frequency}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">{t('recurring.nextOccurrence')}:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  {item.next_due_date ? formatDate(item.next_due_date) : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recurring Modal */}
      {isModalOpen && (
        <RecurringModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemToEdit={editingItem}
          onSuccess={() => {
            setIsModalOpen(false);
            showSuccess('Recurring schedule saved');
            fetchRecurring();
          }}
        />
      )}
    </div>
  );
}
