const transactionRepository = require('../repositories/TransactionRepository');

class AnalyticsService {
  async getAnalytics(userId, monthYear) {
    // monthYear is YYYY-MM
    const today = new Date();
    const currentYearStr = String(today.getFullYear());
    const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
    const defaultMonthYear = `${currentYearStr}-${currentMonthStr}`;

    const targetMonthYear = monthYear || defaultMonthYear;

    // Selected Month Summary
    const currSummary = await transactionRepository.getSummaryByMonth(userId, targetMonthYear);
    const income = currSummary.totalIncome;
    const expenses = currSummary.totalExpenses;
    const savings = Math.max(0, income - expenses);
    const savingsRate = income > 0 ? Math.round((savings / income) * 100 * 10) / 10 : 0;

    // Calculate days elapsed in selected month
    const [year, month] = targetMonthYear.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    let daysElapsed = daysInMonth;
    if (year === today.getFullYear() && month === (today.getMonth() + 1)) {
      daysElapsed = Math.min(today.getDate(), daysInMonth);
    }
    const avgDailySpending = daysElapsed > 0 ? Math.round(expenses / daysElapsed) : 0;

    // Expense Category Breakdown
    const expenseCategories = await transactionRepository.getCategoryBreakdown(userId, targetMonthYear, 'expense');
    const incomeCategories = await transactionRepository.getCategoryBreakdown(userId, targetMonthYear, 'income');

    const highestCategory = expenseCategories.length > 0 ? expenseCategories[0] : { category: 'None', total: 0 };

    // Previous Month calculation for MoM comparison
    const targetDate = new Date(year, month - 1, 1);
    const prevDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
    const prevMonthYear = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const prevSummary = await transactionRepository.getSummaryByMonth(userId, prevMonthYear);
    const prevIncome = prevSummary.totalIncome;
    const prevExpenses = prevSummary.totalExpenses;
    const prevSavings = Math.max(0, prevIncome - prevExpenses);

    const incomeChangePct = prevIncome > 0 ? Math.round(((income - prevIncome) / prevIncome) * 100) : 0;
    const expenseChangePct = prevExpenses > 0 ? Math.round(((expenses - prevExpenses) / prevExpenses) * 100) : 0;
    const savingsChangePct = prevSavings > 0 ? Math.round(((savings - prevSavings) / prevSavings) * 100) : 0;

    // 6-Month Trend
    const trendRaw = await transactionRepository.getMonthlyTrend(userId, 6);
    const trendMap = {};
    trendRaw.forEach(row => {
      if (!trendMap[row.month_year]) {
        trendMap[row.month_year] = { month_year: row.month_year, income: 0, expense: 0 };
      }
      if (row.type === 'income') trendMap[row.month_year].income = parseFloat(row.total);
      if (row.type === 'expense') trendMap[row.month_year].expense = parseFloat(row.total);
    });

    const monthlyTrend = Object.values(trendMap);

    return {
      monthYear: targetMonthYear,
      metrics: {
        income,
        expenses,
        savings,
        savingsRate,
        avgDailySpending,
        daysElapsed,
        daysInMonth,
        highestCategory
      },
      momComparison: {
        prevMonthYear,
        incomeChangePct,
        expenseChangePct,
        savingsChangePct,
        prevIncome,
        prevExpenses
      },
      expenseCategories,
      incomeCategories,
      monthlyTrend
    };
  }
}

module.exports = new AnalyticsService();
