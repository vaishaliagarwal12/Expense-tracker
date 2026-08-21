import React, { useState, useEffect } from 'react';
import { transactionApi } from '../services/transactionApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/date';
import TransactionModal from '../components/transactions/TransactionModal';
import ReceiptViewerModal from '../components/transactions/ReceiptViewerModal';
import CsvImportModal from '../components/transactions/CsvImportModal';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
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
  Calendar,
  Filter
} from 'lucide-react';

const CATEGORIES = ['All', 'Salary', 'Freelancing', 'Scholarship', 'Business', 'Investment', 'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel', 'Rent', 'Other'];

export default function TransactionsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { format } = useCurrency();




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
    if (!window.confirm(t('transactions.deleteConfirm'))) return;
    try {
      await transactionApi.delete(id);
      showSuccess('Transaction deleted');
      fetchTransactions();
      window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
    } catch (err) {
      showError(err.message || 'Failed to delete transaction');
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
      showSuccess('CSV exported successfully');
    } catch (err) {
      showError('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('transactions.title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('transactions.subtitle', { count: totalCount })}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button variant="secondary" size="sm" icon={Upload} onClick={() => setIsCsvModalOpen(true)} className="flex-1 sm:flex-initial">
            {t('transactions.importCsv')}
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCsv} className="flex-1 sm:flex-initial">
            {t('transactions.exportCsv')}
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditingTx(null); setIsTxModalOpen(true); }} className="w-full sm:w-auto">
            {t('transactions.add')}
          </Button>
        </div>
      </div>

      {/* Multi-Column Search & Filter Toolbar */}
      <div className="fin-card p-3.5 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <Input
            icon={Search}
            placeholder={t('transactions.search')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          <Select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? t('transactions.allCategories') : c}</option>
            ))}
          </Select>

          <Select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option value="All">{t('transactions.allTypes')}</option>
            <option value="income">{t('transactions.income')}</option>
            <option value="expense">{t('transactions.expense')}</option>
          </Select>

          <Select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_');
              setSortBy(sb);
              setSortOrder(so);
            }}
          >
            <option value="date_DESC">Sort: Date (Latest First)</option>
            <option value="date_ASC">Sort: Date (Oldest First)</option>
            <option value="amount_DESC">Sort: Amount (Highest First)</option>
            <option value="amount_ASC">Sort: Amount (Lowest First)</option>
          </Select>
        </div>

        {/* Date Range Inputs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
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
          </div>
          {(startDate || endDate || search || category !== 'All' || type !== 'All') && (
            <button
              onClick={() => { setSearch(''); setCategory('All'); setType('All'); setStartDate(''); setEndDate(''); setPage(1); }}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline sm:ml-auto flex items-center gap-1 self-start sm:self-auto pt-1 sm:pt-0"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Ledger Container */}
      <div className="fin-card overflow-hidden">
        {/* Mobile View: Card-Based Ledger (<640px) */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-4 space-y-3 text-center text-xs text-slate-400">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="py-8">
              <EmptyState 
                icon={Receipt}
                title={t('transactions.emptyTitle')} 
                description={t('transactions.emptySub')}
                actionLabel={t('transactions.add')}
                onAction={() => { setEditingTx(null); setIsTxModalOpen(true); }}
                className="border-none shadow-none"
              />
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{tx.category}</Badge>
                    <span className="text-[11px] text-slate-400">{formatDate(tx.date)}</span>
                  </div>
                  <span className={`text-sm font-extrabold ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{tx.payment_method}</p>
                    {tx.notes && <p className="text-[11px] text-slate-400 mt-0.5">{tx.notes}</p>}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    {tx.receipt_url && (
                      <button
                        onClick={() => { setViewReceiptUrl(tx.receipt_url); setViewReceiptDesc(tx.description); }}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-xl transition-colors"
                        title={t('transactions.viewReceipt')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingTx(tx); setIsTxModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title={t('transactions.edit')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title={t('transactions.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop/Tablet View: Full HTML Data Table (>=640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">{t('transactions.date')}</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">{t('transactions.category')}</th>
                <th className="px-5 py-3.5">{t('transactions.paymentMethod')}</th>
                <th className="px-5 py-3.5 text-right">{t('transactions.amount')}</th>
                <th className="px-5 py-3.5 text-center">{t('transactions.receipt')}</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState 
                      icon={Receipt}
                      title={t('transactions.emptyTitle')} 
                      description={t('transactions.emptySub')}
                      actionLabel={t('transactions.add')}
                      onAction={() => { setEditingTx(null); setIsTxModalOpen(true); }}
                      className="border-none shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {tx.description}
                      {tx.notes && <span className="block text-[11px] font-normal text-slate-400 truncate max-w-xs">{tx.notes}</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge variant="neutral">
                        {tx.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                      {tx.payment_method}
                    </td>
                    <td className={`px-5 py-4 text-right font-extrabold whitespace-nowrap ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}

                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {tx.receipt_url ? (
                        <button
                          onClick={() => { setViewReceiptUrl(tx.receipt_url); setViewReceiptDesc(tx.description); }}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-xl transition-colors"
                          title={t('transactions.viewReceipt')}
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
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title={t('transactions.edit')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title={t('transactions.delete')}
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
          <div className="px-4 sm:px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
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
            showSuccess('Transaction saved');
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
            showSuccess('CSV imported successfully');
            fetchTransactions();
            window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
          }}
        />
      )}
    </div>
  );
}
