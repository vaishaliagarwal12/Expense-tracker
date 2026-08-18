import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { transactionApi } from '../../services/transactionApi';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

import { useCurrency } from '../../context/CurrencyContext';

const INCOME_CATEGORIES = ['Salary', 'Freelancing', 'Scholarship', 'Business', 'Investment', 'Other Income'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel', 'Rent', 'Other Expense'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Wallet', 'Other'];

export default function TransactionModal({ isOpen, onClose, transactionToEdit = null, onSuccess }) {
  const { displayCurrency, displaySymbol, baseCurrency, convert } = useCurrency();

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    notes: '',
    receipt_url: ''
  });

  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formBodyRef = useRef(null);
  const amountInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        // Convert stored base currency amount to active display currency for editing
        const displayAmount = convert(transactionToEdit.amount, baseCurrency, displayCurrency);
        setFormData({
          type: transactionToEdit.type || 'expense',
          amount: displayAmount ? String(Math.round(displayAmount * 100) / 100) : '',
          category: transactionToEdit.category || (transactionToEdit.type === 'income' ? 'Salary' : 'Food'),
          description: transactionToEdit.description || '',
          date: transactionToEdit.date ? transactionToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0],
          payment_method: transactionToEdit.payment_method || 'UPI',
          notes: transactionToEdit.notes || '',
          receipt_url: transactionToEdit.receipt_url || ''
        });
      } else {
        setFormData({
          type: 'expense',
          amount: '',
          category: 'Food',
          description: '',
          date: new Date().toISOString().split('T')[0],
          payment_method: 'UPI',
          notes: '',
          receipt_url: ''
        });
      }
      setError('');
      // Focus amount input and scroll form body to top when modal opens
      setTimeout(() => {
        if (formBodyRef.current) {
          formBodyRef.current.scrollTop = 0;
        }
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
      }, 50);
    }
  }, [transactionToEdit, isOpen, displayCurrency, baseCurrency, convert]);

  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'income' ? 'Salary' : 'Food';
    setFormData(prev => ({ ...prev, type: newType, category: defaultCat }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('receipt', file);

    try {
      setUploadingReceipt(true);
      setError('');
      const res = await transactionApi.uploadReceipt(data);
      if (res.data && res.data.receipt_url) {
        setFormData(prev => ({ ...prev, receipt_url: res.data.receipt_url }));
      }
    } catch (err) {
      setError(err.message || 'Failed to upload receipt image');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid positive amount');
      if (amountInputRef.current) {
        amountInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        amountInputRef.current.focus();
      }
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      if (descriptionInputRef.current) {
        descriptionInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        descriptionInputRef.current.focus();
      }
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Convert amount entered in display currency back to user's base account currency for database storage
      const inputAmount = Number(formData.amount);
      const baseAmount = convert(inputAmount, displayCurrency, baseCurrency);
      const payload = { ...formData, amount: baseAmount };

      if (transactionToEdit) {
        await transactionApi.update(transactionToEdit.id, payload);
      } else {
        await transactionApi.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
      if (formBodyRef.current) {
        formBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}
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
            {loading ? 'Saving...' : transactionToEdit ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </>
      }
    >
      <div ref={formBodyRef} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Income / Expense Type Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              formData.type === 'expense'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              formData.type === 'income'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Amount ({displaySymbol})
          </label>
          <input
            ref={amountInputRef}
            type="number"
            step="0.01"
            placeholder="0.00"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {PAYMENT_METHODS.map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              ref={descriptionInputRef}
              type="text"
              placeholder="e.g. Grocery shopping"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add extra context or details..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Receipt Upload Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Receipt Attachment (Optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" />
              <span>{uploadingReceipt ? 'Uploading...' : 'Choose Receipt Image'}</span>
              <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
            </label>
            {formData.receipt_url && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Attached
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}


