import React, { useState } from 'react';
import Modal from '../common/Modal';
import { goalApi } from '../../services/goalApi';
import { AlertCircle } from 'lucide-react';

export default function DepositModal({ isOpen, onClose, goal, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a positive deposit amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await goalApi.deposit(goal.id, Number(amount));
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to deposit savings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Savings Deposit: ${goal.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-semibold text-rose-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
          <p className="text-slate-500 dark:text-slate-400">Target Amount: <span className="font-bold text-slate-800 dark:text-slate-200">₹{goal.target_amount.toLocaleString()}</span></p>
          <p className="text-slate-500 dark:text-slate-400">Currently Saved: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{goal.current_saved.toLocaleString()}</span></p>
          <p className="text-slate-500 dark:text-slate-400">Remaining to reach goal: <span className="font-bold text-sky-600 dark:text-sky-400">₹{goal.remaining.toLocaleString()}</span></p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deposit Amount (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 5000"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
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
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Deposit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
