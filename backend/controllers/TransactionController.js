const transactionService = require('../services/TransactionService');
const { successResponse } = require('../utils/errorResponse');

class TransactionController {
  async getAll(req, res, next) {
    try {
      const data = await transactionService.getTransactions(req.user.id, req.query);
      return successResponse(res, 200, data, 'Transactions fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);
      return successResponse(res, 200, { transaction }, 'Transaction retrieved');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const transaction = await transactionService.createTransaction(req.user.id, req.body);
      return successResponse(res, 201, { transaction }, 'Transaction created successfully');
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);
      return successResponse(res, 200, { transaction }, 'Transaction updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await transactionService.deleteTransaction(req.user.id, req.params.id);
      return successResponse(res, 200, null, 'Transaction deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const csvText = await transactionService.exportCsv(req.user.id, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="fintrack_transactions_${Date.now()}.csv"`);
      return res.status(200).send(csvText);
    } catch (err) {
      next(err);
    }
  }

  async importCsv(req, res, next) {
    try {
      const { csvContent } = req.body;
      const result = await transactionService.parseAndImportCsv(req.user.id, csvContent);
      return successResponse(res, 200, result, `Successfully imported ${result.importedCount} transactions`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TransactionController();
