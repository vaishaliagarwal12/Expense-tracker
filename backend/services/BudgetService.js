const budgetRepository = require('../repositories/BudgetRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const { AppError } = require('../utils/errorResponse');

class BudgetService {
  async getBudgetsWithProgress(userId, monthYear) {
    // monthYear is YYYY-MM
    const budgets = await budgetRepository.findAllByMonth(userId, monthYear);
    const categoryBreakdown = await transactionRepository.getCategoryBreakdown(userId, monthYear, 'expense');

    const spentMap = {};
    categoryBreakdown.forEach(item => {
      spentMap[item.category.toLowerCase()] = item.total;
    });

    const budgetsWithProgress = budgets.map(budget => {
      const spent = spentMap[budget.category.toLowerCase()] || 0;
      const amount = parseFloat(budget.amount);
      const remaining = amount - spent;
      const usagePercentage = Math.round((spent / amount) * 100 * 100) / 100; // 2 decimal places

      let status = 'normal'; // green
      let isWarning = false;
      let isExceeded = false;

      if (usagePercentage >= 100) {
        status = 'exceeded'; // red
        isExceeded = true;
      } else if (usagePercentage >= 80) {
        status = 'warning'; // yellow/amber
        isWarning = true;
      }

      return {
        ...budget,
        amount,
        spent,
        remaining,
        usagePercentage,
        status,
        isWarning,
        isExceeded
      };
    });

    // Summary metrics
    const totalBudget = budgetsWithProgress.reduce((sum, b) => sum + b.amount, 0);
    const totalSpentInBudgetedCategories = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpentInBudgetedCategories;
    const overallUsagePercentage = totalBudget > 0 ? Math.round((totalSpentInBudgetedCategories / totalBudget) * 100) : 0;

    return {
      monthYear,
      budgets: budgetsWithProgress,
      summary: {
        totalBudget,
        totalSpent: totalSpentInBudgetedCategories,
        totalRemaining,
        overallUsagePercentage
      }
    };
  }

  async createBudget(userId, data) {
    const existing = await budgetRepository.findByCategoryAndMonth(userId, data.category, data.month_year);
    if (existing) {
      throw new AppError(`A budget for ${data.category} in ${data.month_year} already exists. Please edit the existing budget.`, 400);
    }
    return budgetRepository.create(userId, data);
  }

  async updateBudget(userId, id, data) {
    const existing = await budgetRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Budget not found', 404);
    }
    return budgetRepository.update(userId, id, data);
  }

  async deleteBudget(userId, id) {
    const existing = await budgetRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Budget not found', 404);
    }
    return budgetRepository.delete(userId, id);
  }
}

module.exports = new BudgetService();
