const transactionRepository = require('../repositories/TransactionRepository');
const budgetRepository = require('../repositories/BudgetRepository');

class ForecastService {
  async calculateSpendingForecast(userId, monthYear) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
    const defaultMonthYear = `${currentYear}-${currentMonthStr}`;

    const targetMonthYear = monthYear || defaultMonthYear;

    const [year, month] = targetMonthYear.split('-').map(Number);
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    let daysElapsed = totalDaysInMonth;
    if (year === today.getFullYear() && month === (today.getMonth() + 1)) {
      daysElapsed = Math.min(today.getDate(), totalDaysInMonth);
    }
    const remainingDays = Math.max(0, totalDaysInMonth - daysElapsed);

    // Get current month summary
    const summary = await transactionRepository.getSummaryByMonth(userId, targetMonthYear);
    const currentSpending = summary.totalExpenses;
    const currentIncome = summary.totalIncome;

    // Average daily spending so far
    const avgDailySpending = daysElapsed > 0 ? (currentSpending / daysElapsed) : 0;

    // Projected monthly spending = spent so far + (avg daily x remaining days)
    const projectedSpending = Math.round(currentSpending + (avgDailySpending * remainingDays));

    // Get user's total budget for the month
    const budgets = await budgetRepository.findAllByMonth(userId, targetMonthYear);
    const totalMonthlyBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

    // Calculate expected surplus/deficit relative to budget (or income if budget not set)
    const baseline = totalMonthlyBudget > 0 ? totalMonthlyBudget : currentIncome;
    const expectedSurplusDeficit = baseline - projectedSpending; // positive = surplus, negative = deficit
    const isDeficit = expectedSurplusDeficit < 0;

    let warningLevel = 'safe'; // 'safe', 'caution', 'danger'
    let warningMessage = 'Your current spending pace is within budget.';

    if (totalMonthlyBudget > 0) {
      if (projectedSpending > totalMonthlyBudget) {
        warningLevel = 'danger';
        const overage = projectedSpending - totalMonthlyBudget;
        warningMessage = `Warning: At your current pace of ₹${Math.round(avgDailySpending)}/day, your projected monthly spending (₹${projectedSpending.toLocaleString()}) will exceed your monthly budget (₹${totalMonthlyBudget.toLocaleString()}) by ₹${overage.toLocaleString()}.`;
      } else if (projectedSpending >= totalMonthlyBudget * 0.9) {
        warningLevel = 'caution';
        warningMessage = `Caution: Projected spending (₹${projectedSpending.toLocaleString()}) is close to your total monthly budget (₹${totalMonthlyBudget.toLocaleString()}).`;
      }
    } else if (currentIncome > 0 && projectedSpending > currentIncome) {
      warningLevel = 'danger';
      warningMessage = `Warning: Projected spending (₹${projectedSpending.toLocaleString()}) is expected to exceed total income (₹${currentIncome.toLocaleString()}).`;
    }

    return {
      monthYear: targetMonthYear,
      daysElapsed,
      remainingDays,
      totalDaysInMonth,
      currentSpending,
      currentIncome,
      avgDailySpending: Math.round(avgDailySpending),
      projectedSpending,
      totalMonthlyBudget,
      expectedSurplusDeficit,
      isDeficit,
      warningLevel,
      warningMessage
    };
  }
}

module.exports = new ForecastService();
