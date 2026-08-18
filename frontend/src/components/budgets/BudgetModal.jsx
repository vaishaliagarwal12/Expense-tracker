import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { budgetApi } from '../../services/budgetApi';
import { getCurrentMonthYear } from '../../utils/date';
import { AlertCircle } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel', 'Rent', 'Other Expense'];

export default function BudgetModal({ isOpen, onClose, budgetToEdit = null, monthYear, onSuccess }) {
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    month_year: monthYear || getCurrentMonthYear()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budgetToEdit) {
      setFormData({
        category: budgetToEdit.category || 'Food',
        amount: budgetToEdit.amount || '',
        month_year: budgetToEdit.month_year || monthYear || getCurrentMonthYear()
      });
    } else {
      setFormData({
        category: 'Food',
        amount: '',
        month_year: monthYear || getCurrentMonthYear()
      });
    }
  }, [budgetToEdit, monthYear, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Budget amount must be a positive number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (budgetToEdit) {
        await budgetApi.update(budgetToEdit.id, { ...formData, amount: Number(formData.amount) });
      } else {
        await budgetApi.create({ ...formData, amount: Number(formData.amount) });
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Monthly Budget' : 'Set Category Budget'}
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Saving...' : 'Save Budget'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Monthly Budget Limit (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 8000"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Month & Year (YYYY-MM)
          </label>
          <input
            type="month"
            required
            value={formData.month_year}
            onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}

