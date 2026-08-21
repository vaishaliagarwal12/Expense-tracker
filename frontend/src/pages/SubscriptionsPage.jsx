import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../services/subscriptionApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/date';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import SubscriptionModal from '../components/subscriptions/SubscriptionModal';
import { Plus, CreditCard, Edit3, Trash2, Calendar, AlertCircle } from 'lucide-react';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { format } = useCurrency();

  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({ totalMonthly: 0, totalAnnual: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.getAll();
      setSubscriptions(res.data?.subscriptions || []);
      setSummary(res.data?.summary || { totalMonthly: 0, totalAnnual: 0, activeCount: 0 });
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscription record?')) return;
    try {
      await subscriptionApi.delete(id);
      showSuccess('Subscription deleted');
      fetchSubscriptions();
    } catch (err) {
      showError('Failed to delete subscription');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('subscriptions.title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('subscriptions.subtitle')}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => { setEditingSub(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto"
        >
          {t('subscriptions.create')}
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="fin-card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('subscriptions.monthlyCost')}</span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{format(summary.totalMonthly)}</p>
          <p className="text-[11px] text-slate-400 font-medium">Active subscriptions: {summary.activeCount}</p>
        </div>

        <div className="fin-card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('subscriptions.annualCost')}</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{format(summary.totalAnnual)}</p>
          <p className="text-[11px] text-slate-400 font-medium">Cumulative annual commitment</p>
        </div>

        <div className="fin-card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Commitment Audit</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {subscriptions.length > 0 ? `${subscriptions.length} services billed automatically.` : 'No recurring subscriptions.'}
          </p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState 
          icon={CreditCard}
          title={t('subscriptions.emptyTitle')} 
          description={t('subscriptions.emptySub')}
          actionLabel={t('subscriptions.create')}
          onAction={() => { setEditingSub(null); setIsModalOpen(true); }}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className="fin-card fin-card-hover p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{sub.name}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{sub.category} • {sub.billing_cycle}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditingSub(sub); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{format(sub.amount)}</span>
                <span className="text-xs text-slate-400 font-medium"> / {sub.billing_cycle}</span>
              </div>


              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">{t('subscriptions.nextBilling')}:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {sub.next_billing_date ? formatDate(sub.next_billing_date) : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Modal */}
      {isModalOpen && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subscriptionToEdit={editingSub}
          onSuccess={() => {
            setIsModalOpen(false);
            showSuccess('Subscription saved');
            fetchSubscriptions();
          }}
        />
      )}
    </div>
  );
}
