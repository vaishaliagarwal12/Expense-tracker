const goalRepository = require('../repositories/GoalRepository');
const { AppError } = require('../utils/errorResponse');

class GoalService {
  async getGoalsWithCalculations(userId) {
    const goals = await goalRepository.findAll(userId);
    const today = new Date();

    const formattedGoals = goals.map(goal => {
      const target = parseFloat(goal.target_amount);
      const saved = parseFloat(goal.current_saved);
      const remaining = Math.max(0, target - saved);
      const progressPercentage = target > 0 ? Math.min(100, Math.round((saved / target) * 100 * 10) / 10) : 0;

      // Calculate months remaining until deadline
      const deadlineDate = new Date(goal.deadline);
      let monthsRemaining = (deadlineDate.getFullYear() - today.getFullYear()) * 12 + (deadlineDate.getMonth() - today.getMonth());
      if (deadlineDate.getDate() < today.getDate()) {
        monthsRemaining -= 0.5;
      }
      monthsRemaining = Math.max(0.1, monthsRemaining);

      const requiredMonthlySavings = remaining > 0 ? Math.ceil(remaining / Math.max(1, Math.round(monthsRemaining))) : 0;

      return {
        ...goal,
        target_amount: target,
        current_saved: saved,
        remaining,
        progressPercentage,
        monthsRemaining: Math.max(0, Math.round(monthsRemaining)),
        requiredMonthlySavings,
        isCompleted: saved >= target
      };
    });

    const totalTarget = formattedGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalSaved = formattedGoals.reduce((sum, g) => sum + g.current_saved, 0);
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return {
      goals: formattedGoals,
      summary: {
        totalGoals: formattedGoals.length,
        totalTarget,
        totalSaved,
        overallProgress
      }
    };
  }

  async createGoal(userId, data) {
    return goalRepository.create(userId, data);
  }

  async updateGoal(userId, id, data) {
    const existing = await goalRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Savings goal not found', 404);
    }
    return goalRepository.update(userId, id, data);
  }

  async depositToGoal(userId, id, amount) {
    const existing = await goalRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Savings goal not found', 404);
    }
    if (isNaN(amount) || amount <= 0) {
      throw new AppError('Deposit amount must be greater than zero', 400);
    }
    return goalRepository.updateDeposit(userId, id, amount);
  }

  async deleteGoal(userId, id) {
    const existing = await goalRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Savings goal not found', 404);
    }
    return goalRepository.delete(userId, id);
  }
}

module.exports = new GoalService();
