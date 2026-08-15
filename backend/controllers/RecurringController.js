const recurringService = require('../services/RecurringService');
const { successResponse } = require('../utils/errorResponse');

class RecurringController {
  async getAll(req, res, next) {
    try {
      const data = await recurringService.getRecurringTransactions(req.user.id);
      return successResponse(res, 200, data, 'Recurring transactions fetched');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const item = await recurringService.createRecurring(req.user.id, req.body);
      return successResponse(res, 201, { recurring: item }, 'Recurring transaction created');
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const item = await recurringService.updateRecurring(req.user.id, req.params.id, req.body);
      return successResponse(res, 200, { recurring: item }, 'Recurring transaction updated');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await recurringService.deleteRecurring(req.user.id, req.params.id);
      return successResponse(res, 200, null, 'Recurring transaction deleted');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecurringController();
