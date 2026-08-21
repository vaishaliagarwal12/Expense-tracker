import React, { useState } from 'react';
import Modal from '../common/Modal';
import { transactionApi } from '../../services/transactionApi';
import { generateSampleCsv, downloadFile } from '../../utils/csv';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CsvImportModal({ isOpen, onClose, onSuccess }) {
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvContent(evt.target.result);
      setError('');
      setValidationErrors([]);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCsv();
    downloadFile(sample, 'fintrack_sample_import.csv');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csvContent.trim()) {
      setError('Please select or paste valid CSV content');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setValidationErrors([]);
      const res = await transactionApi.importCsv(csvContent);
      setSuccessCount(res.data.importedCount);
      if (res.data.errors && res.data.errors.length > 0) {
        setValidationErrors(res.data.errors);
      }
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Transactions from CSV"
      maxWidth="max-w-xl"
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
            disabled={loading || !csvContent.trim()}
            className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Processing...' : 'Import CSV Data'}
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

        {successCount !== null && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Successfully imported {successCount} transactions!</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Need a template?</span>
            <span className="text-slate-500 dark:text-slate-400">Download formatted CSV sample file</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5" /> Sample CSV
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Choose CSV File
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-950 dark:file:text-sky-400 hover:file:bg-sky-100 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Or Paste CSV Raw Content
          </label>
          <textarea
            rows="5"
            placeholder="Date,Amount,Type,Category,Description,Payment Method&#10;2026-08-01,85000,income,Salary,Monthly Salary,Bank Transfer"
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {validationErrors.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <span className="font-semibold block">Row Validation Errors:</span>
            <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

