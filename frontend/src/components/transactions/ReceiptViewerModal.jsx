import React from 'react';
import Modal from '../common/Modal';

export default function ReceiptViewerModal({ isOpen, onClose, receiptUrl, description }) {
  if (!receiptUrl) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Receipt: ${description || 'Attachment'}`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col items-center justify-center p-3 bg-slate-900/5 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 w-full">
        <img
          src={receiptUrl}
          alt="Transaction Receipt"
          className="max-h-[50vh] object-contain rounded-lg shadow-md"
        />
        <a
          href={receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          Open Full Original Image
        </a>
      </div>
    </Modal>
  );
}

