const transactionRepository = require('../repositories/TransactionRepository');
const { AppError } = require('../utils/errorResponse');

class TransactionService {
  async getTransactions(userId, filters) {
    return transactionRepository.findAll(userId, filters);
  }

  async getTransactionById(userId, id) {
    const tx = await transactionRepository.findById(userId, id);
    if (!tx) {
      throw new AppError('Transaction not found', 404);
    }
    return tx;
  }

  async createTransaction(userId, data) {
    return transactionRepository.create(userId, data);
  }

  async updateTransaction(userId, id, data) {
    await this.getTransactionById(userId, id); // Verify ownership
    return transactionRepository.update(userId, id, data);
  }

  async deleteTransaction(userId, id) {
    await this.getTransactionById(userId, id); // Verify ownership
    return transactionRepository.delete(userId, id);
  }

  async exportCsv(userId, filters = {}) {
    const result = await transactionRepository.findAll(userId, { ...filters, limit: 10000, page: 1 });
    const transactions = result.transactions;

    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Description', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type.toUpperCase(),
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.payment_method || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvText = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return csvText;
  }

  async parseAndImportCsv(userId, csvRawText) {
    if (!csvRawText || typeof csvRawText !== 'string') {
      throw new AppError('Invalid CSV content received', 400);
    }

    const lines = csvRawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      throw new AppError('CSV file is empty or missing data rows', 400);
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    const requiredHeaders = ['date', 'amount', 'type', 'category', 'description'];

    for (const reqH of requiredHeaders) {
      if (!headers.includes(reqH)) {
        throw new AppError(`Missing required CSV header column: "${reqH}". Expected headers: Date, Amount, Type, Category, Description, Payment Method`, 400);
      }
    }

    const dateIdx = headers.indexOf('date');
    const amountIdx = headers.indexOf('amount');
    const typeIdx = headers.indexOf('type');
    const catIdx = headers.indexOf('category');
    const descIdx = headers.indexOf('description');
    const pmIdx = headers.indexOf('payment method') !== -1 ? headers.indexOf('payment method') : headers.indexOf('payment_method');
    const notesIdx = headers.indexOf('notes');

    const validRows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex CSV parse split
      const columns = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanCols = columns.map(c => c.trim().replace(/^["']|["']$/g, ''));

      const rawDate = cleanCols[dateIdx];
      const rawAmount = cleanCols[amountIdx];
      const rawType = cleanCols[typeIdx];
      const rawCategory = cleanCols[catIdx];
      const rawDesc = cleanCols[descIdx];
      const rawPm = pmIdx !== -1 && cleanCols[pmIdx] ? cleanCols[pmIdx] : 'UPI';
      const rawNotes = notesIdx !== -1 && cleanCols[notesIdx] ? cleanCols[notesIdx] : '';

      const rowNum = i + 1;
      const rowErrors = [];

      if (!rawDate || isNaN(Date.parse(rawDate))) rowErrors.push('Invalid Date');
      if (!rawAmount || isNaN(parseFloat(rawAmount)) || parseFloat(rawAmount) <= 0) rowErrors.push('Amount must be > 0');
      if (!rawType || !['income', 'expense'].includes(rawType.toLowerCase())) rowErrors.push('Type must be income or expense');
      if (!rawCategory) rowErrors.push('Missing Category');
      if (!rawDesc) rowErrors.push('Missing Description');

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
      } else {
        validRows.push({
          date: new Date(rawDate).toISOString().split('T')[0],
          amount: parseFloat(rawAmount),
          type: rawType.toLowerCase(),
          category: rawCategory,
          description: rawDesc,
          payment_method: rawPm,
          notes: rawNotes
        });
      }
    }

    if (validRows.length === 0) {
      throw new AppError(`Failed to import CSV: All rows contained validation errors. Details: ${errors.join('; ')}`, 400);
    }

    const imported = await transactionRepository.bulkInsert(userId, validRows);
    return {
      importedCount: imported.length,
      errors
    };
  }
}

module.exports = new TransactionService();
