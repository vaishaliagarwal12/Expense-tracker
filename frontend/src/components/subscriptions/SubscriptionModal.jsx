import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { subscriptionApi } from '../../services/subscriptionApi';
import { AlertCircle } from 'lucide-react';

const FREQUENCIES = ['Monthly', 'Yearly', 'Quarterly'];
const CATEGORIES = ['Entertainment', 'Software', 'Fitness', 'Utilities', 'Education', 'Gaming', 'Other'];
const STATUSES = ['Active', 'Paused', 'Cancelled'];

export default function SubscriptionModal({ isOpen, onClose, subToEdit = null, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billing_frequency: 'Monthly',
    next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Entertainment',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subToEdit) {
      setFormData({
        name: subToEdit.name || '',
        amount: subToEdit.amount || '',
        billing_frequency: subToEdit.billing_frequency || 'Monthly',
        next_billing_date: subToEdit.next_billing_date ? subToEdit.next_billing_date.split('T')[0] : new Date().toISOString().split('T')[0],
        category: subToEdit.category || 'Entertainment',
        status: subToEdit.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        billing_frequency: 'Monthly',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Entertainment',
        status: 'Active'
      });
    }
  }, [subToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a subscription name');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = { ...formData, amount: Number(formData.amount) };

      if (subToEdit) {
        await subscriptionApi.update(subToEdit.id, payload);
      } else {
        await subscriptionApi.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subToEdit ? 'Edit Subscription' : 'Add New Subscription'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-semibold text-rose-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Subscription Service Name
          </label>
          <input
            type="text"
            placeholder="e.g. Netflix, Spotify, Canva"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 649"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Billing Cycle
            </label>
            <select
              value={formData.billing_frequency}
              onChange={(e) => setFormData({ ...formData, billing_frequency: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {FREQUENCIES.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Next Billing Date
            </label>
            <input
              type="date"
              required
              value={formData.next_billing_date}
              onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
