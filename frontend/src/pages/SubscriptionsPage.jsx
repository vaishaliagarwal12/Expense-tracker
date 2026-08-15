import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../services/subscriptionApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import Badge from '../components/common/Badge';
import MetricCard from '../components/common/MetricCard';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import SubscriptionModal from '../components/subscriptions/SubscriptionModal';
import { Plus, CreditCard, Edit3, Trash2, Calendar, RefreshCw, Layers } from 'lucide-react';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const symbol = user?.currency_symbol || '₹';

  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({ totalSubscriptions: 0, activeSubscriptionsCount: 0, totalMonthlyCost: 0, totalYearlyCost: 0 });
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.getAll();
      setSubscriptions(res.data?.subscriptions || []);
      setSummary(res.data?.summary || { totalSubscriptions: 0, activeSubscriptionsCount: 0, totalMonthlyCost: 0, totalYearlyCost: 0 });
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
    if (!window.confirm('Delete this subscription item?')) return;
    try {
      await subscriptionApi.delete(id);
      fetchSubscriptions();
    } catch (err) {
      alert('Failed to delete subscription');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Subscription Tracker</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monitor recurring SaaS, entertainment, and membership billing</p>
        </div>

        <button
          onClick={() => { setEditingSub(null); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Subscriptions"
          value={summary.activeSubscriptionsCount.toString()}
          subtitle={`Total tracked: ${summary.totalSubscriptions}`}
          icon={Layers}
          color="sky"
        />
        <MetricCard
          title="Total Monthly Cost"
          value={`${formatCurrency(summary.totalMonthlyCost, symbol)}/mo`}
          subtitle="Estimated monthly payout"
          icon={CreditCard}
          color="indigo"
        />
        <MetricCard
          title="Calculated Yearly Cost"
          value={`${formatCurrency(summary.totalYearlyCost, symbol)}/yr`}
          subtitle="Normalized annualized expenditure"
          icon={RefreshCw}
          color="rose"
        />
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
          <CardSkeleton className="h-44" />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState 
          icon={CreditCard}
          title="No Subscriptions Tracked" 
          description="Add subscriptions (e.g. Netflix, Spotify, AWS, Canva) to auto-calculate monthly and annual spending."
          actionLabel="Track Subscription"
          onAction={() => { setEditingSub(null); setIsModalOpen(true); }}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className="fin-card fin-card-hover p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{sub.category}</Badge>
                      <Badge variant={sub.status === 'Active' ? 'success' : 'warning'}>{sub.status}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">{sub.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingSub(sub); setIsModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Edit Subscription"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Delete Subscription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(sub.amount, symbol)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">/ {sub.billing_frequency.toLowerCase()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-1.5 font-medium"><Calendar className="w-3.5 h-3.5 text-sky-600" /> Next Billing:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(sub.next_billing_date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subToEdit={editingSub}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSubscriptions();
          }}
        />
      )}
    </div>
  );
}
