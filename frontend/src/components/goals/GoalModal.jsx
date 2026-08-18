import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { goalApi } from '../../services/goalApi';
import { AlertCircle } from 'lucide-react';

export default function GoalModal({ isOpen, onClose, goalToEdit = null, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_saved: '0',
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setFormData({
        name: goalToEdit.name || '',
        target_amount: goalToEdit.target_amount || '',
        current_saved: goalToEdit.current_saved || '0',
        deadline: goalToEdit.deadline ? goalToEdit.deadline.split('T')[0] : new Date().toISOString().split('T')[0],
        description: goalToEdit.description || ''
      });
    } else {
      setFormData({
        name: '',
        target_amount: '',
        current_saved: '0',
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ''
      });
    }
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a goal name');
      return;
    }
    if (!formData.target_amount || Number(formData.target_amount) <= 0) {
      setError('Target amount must be a positive number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        ...formData,
        target_amount: Number(formData.target_amount),
        current_saved: Number(formData.current_saved || 0)
      };

      if (goalToEdit) {
        await goalApi.update(goalToEdit.id, payload);
      } else {
        await goalApi.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Savings Goal' : 'Create New Savings Goal'}
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
            {loading ? 'Saving...' : 'Save Goal'}
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
            Goal Name
          </label>
          <input
            type="text"
            placeholder="e.g. Laptop Upgrade / Emergency Fund"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 80000"
              required
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Saved (₹)
            </label>
            <input
              type="number"
              placeholder="0"
              value={formData.current_saved}
              onChange={(e) => setFormData({ ...formData, current_saved: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Deadline Date
          </label>
          <input
            type="date"
            required
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Reason (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add notes on why you are saving for this goal..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}

