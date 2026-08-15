import React, { useState, useEffect } from 'react';
import { transactionApi } from '../services/transactionApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import TransactionModal from '../components/transactions/TransactionModal';
import ReceiptViewerModal from '../components/transactions/ReceiptViewerModal';
import CsvImportModal from '../components/transactions/CsvImportModal';
import Badge from '../components/common/Badge';
import { TableRowSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Receipt, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  RotateCcw,
  Calendar
} from 'lucide-react';

const CATEGORIES = ['All', 'Salary', 'Freelancing', 'Scholarship', 'Business', 'Investment', 'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel', 'Rent', 'Other'];

export default function TransactionsPage() {
  const { user } = useAuth();
  const symbol = user?.currency_symbol || '₹';

  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const [viewReceiptUrl, setViewReceiptUrl] = useState(null);
  const [viewReceiptDesc, setViewReceiptDesc] = useState('');

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        category,
        type,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        page,
        limit: 10
      };
      const res = await transactionApi.getAll(params);
      setTransactions(res.data?.transactions || []);
      setTotalCount(res.data?.totalCount || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, category, type, startDate, endDate, sortBy, sortOrder, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await transactionApi.delete(id);
      fetchTransactions();
      window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
    } catch (err) {
      alert(err.message || 'Failed to delete transaction');
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await transactionApi.exportCsv({ search, category, type, startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fintrack_transactions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Transactions Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total {totalCount} transactions logged in workspace</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => { setEditingTx(null); setIsTxModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Multi-Column Search & Filter Toolbar */}
      <div className="fin-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search description or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="All">All Types (Income & Expense)</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>

          {/* Sorting */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="date_DESC">Sort: Date (Latest First)</option>
            <option value="date_ASC">Sort: Date (Oldest First)</option>
            <option value="amount_DESC">Sort: Amount (Highest First)</option>
            <option value="amount_ASC">Sort: Amount (Lowest First)</option>
          </select>
        </div>

        {/* Date Range Inputs Bar */}
        <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> Date Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
          />
          <span className="text-slate-400 font-medium">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
          />
          {(startDate || endDate || search || category !== 'All' || type !== 'All') && (
            <button
              onClick={() => { setSearch(''); setCategory('All'); setType('All'); setStartDate(''); setEndDate(''); setPage(1); }}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="fin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5 text-center">Receipt</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState 
                      icon={Receipt}
                      title="No Transactions Found" 
                      description="No records match your selected search terms or category filters."
                      actionLabel="Log New Transaction"
                      onAction={() => { setEditingTx(null); setIsTxModalOpen(true); }}
                      className="border-none shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {tx.description}
                      {tx.notes && <span className="block text-[11px] font-normal text-slate-400 truncate max-w-xs">{tx.notes}</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                      {tx.payment_method}
                    </td>
                    <td className={`px-5 py-4 text-right font-extrabold whitespace-nowrap ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, symbol)}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {tx.receipt_url ? (
                        <button
                          onClick={() => { setViewReceiptUrl(tx.receipt_url); setViewReceiptDesc(tx.description); }}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-xl transition-colors"
                          title="View Receipt Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => { setEditingTx(tx); setIsTxModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Page {page} of {totalPages} ({totalCount} items)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Add/Edit Modal */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          transactionToEdit={editingTx}
          onSuccess={() => {
            setIsTxModalOpen(false);
            fetchTransactions();
            window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
          }}
        />
      )}

      {/* Receipt Image Viewer Modal */}
      {viewReceiptUrl && (
        <ReceiptViewerModal
          isOpen={!!viewReceiptUrl}
          onClose={() => setViewReceiptUrl(null)}
          receiptUrl={viewReceiptUrl}
          description={viewReceiptDesc}
        />
      )}

      {/* CSV Batch Import Modal */}
      {isCsvModalOpen && (
        <CsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          onSuccess={() => {
            setIsCsvModalOpen(false);
            fetchTransactions();
            window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
          }}
        />
      )}
    </div>
  );
}
