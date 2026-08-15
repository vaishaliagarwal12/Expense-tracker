const budgetService = require('../services/BudgetService');
const { successResponse } = require('../utils/errorResponse');

class BudgetController {
  async getBudgets(req, res, next) {
    try {
      const today = new Date();
      const monthYear = req.query.monthYear || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const data = await budgetService.getBudgetsWithProgress(req.user.id, monthYear);
      return successResponse(res, 200, data, 'Budgets fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const budget = await budgetService.createBudget(req.user.id, req.body);
      return successResponse(res, 201, { budget }, 'Budget created successfully');
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const budget = await budgetService.updateBudget(req.user.id, req.params.id, req.body);
      return successResponse(res, 200, { budget }, 'Budget updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await budgetService.deleteBudget(req.user.id, req.params.id);
      return successResponse(res, 200, null, 'Budget deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BudgetController();
