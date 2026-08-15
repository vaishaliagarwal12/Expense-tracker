const goalService = require('../services/GoalService');
const { successResponse } = require('../utils/errorResponse');

class GoalController {
  async getGoals(req, res, next) {
    try {
      const data = await goalService.getGoalsWithCalculations(req.user.id);
      return successResponse(res, 200, data, 'Savings goals fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const goal = await goalService.createGoal(req.user.id, req.body);
      return successResponse(res, 201, { goal }, 'Savings goal created successfully');
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const goal = await goalService.updateGoal(req.user.id, req.params.id, req.body);
      return successResponse(res, 200, { goal }, 'Savings goal updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deposit(req, res, next) {
    try {
      const goal = await goalService.depositToGoal(req.user.id, req.params.id, req.body.amount);
      return successResponse(res, 200, { goal }, 'Deposit added to goal successfully');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await goalService.deleteGoal(req.user.id, req.params.id);
      return successResponse(res, 200, null, 'Savings goal deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GoalController();
