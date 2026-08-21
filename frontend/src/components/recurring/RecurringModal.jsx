import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { recurringApi } from '../../services/recurringApi';
import { AlertCircle } from 'lucide-react';

const CATEGORIES = ['Rent', 'Bills', 'Entertainment', 'Insurance', 'EMI', 'Transport', 'Food', 'Healthcare', 'Salary', 'Other'];
const FREQUENCIES = ['Monthly', 'Yearly', 'Weekly'];

export default function RecurringModal({ isOpen, onClose, itemToEdit = null, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Rent',
    type: 'expense',
    frequency: 'Monthly',
    start_date: new Date().toISOString().split('T')[0],
    next_occurrence: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || '',
        amount: itemToEdit.amount || '',
        category: itemToEdit.category || 'Rent',
        type: itemToEdit.type || 'expense',
        frequency: itemToEdit.frequency || 'Monthly',
        start_date: itemToEdit.start_date ? itemToEdit.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
        next_occurrence: itemToEdit.next_occurrence ? itemToEdit.next_occurrence.split('T')[0] : new Date().toISOString().split('T')[0],
        is_active: itemToEdit.is_active !== undefined ? Boolean(itemToEdit.is_active) : true
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        category: 'Rent',
        type: 'expense',
        frequency: 'Monthly',
        start_date: new Date().toISOString().split('T')[0],
        next_occurrence: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      });
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a recurring expense name');
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

      if (itemToEdit) {
        await recurringApi.update(itemToEdit.id, payload);
      } else {
        await recurringApi.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save recurring item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Recurring Item' : 'Add Recurring Transaction'}
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
            {loading ? 'Saving...' : 'Save Schedule'}
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
            Item Name
          </label>
          <input
            type="text"
            placeholder="e.g. Apartment Rent, Internet, Car EMI"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 22000"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {FREQUENCIES.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Next Occurrence Date
            </label>
            <input
              type="date"
              required
              value={formData.next_occurrence}
              onChange={(e) => setFormData({ ...formData, next_occurrence: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500"
          />
          <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            Active Schedule
          </label>
        </div>
      </div>
    </Modal>
  );
}

