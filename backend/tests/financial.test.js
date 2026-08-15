const healthScoreService = require('../services/HealthScoreService');
const forecastService = require('../services/ForecastService');
const goalService = require('../services/GoalService');
const transactionRepository = require('../repositories/TransactionRepository');
const goalRepository = require('../repositories/GoalRepository');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

describe('Financial Calculation Services Tests', () => {
  const testUserId = uuidv4();
  const currentMonthYear = new Date().toISOString().slice(0, 7);

  beforeAll(async () => {
    await db.initDb();

    // Create sample income and expense transactions
    await transactionRepository.create(testUserId, {
      amount: 5000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly Salary',
      date: `${currentMonthYear}-01`,
      payment_method: 'Bank Transfer'
    });

    await transactionRepository.create(testUserId, {
      amount: 1500,
      type: 'expense',
      category: 'Rent',
      description: 'Monthly Rent',
      date: `${currentMonthYear}-05`,
      payment_method: 'UPI'
    });
  });

  test('ForecastService calculates daily average and projected spending accurately', async () => {
    const forecast = await forecastService.calculateSpendingForecast(testUserId, currentMonthYear);
    expect(forecast).toBeDefined();
    expect(forecast.currentIncome).toBe(5000);
    expect(forecast.currentSpending).toBe(1500);
    expect(forecast.projectedSpending).toBeGreaterThanOrEqual(1500);
    expect(forecast.warningLevel).toBeDefined();
  });

  test('GoalService calculates progress percentages and remaining target accurately', async () => {
    const goal = await goalRepository.create(testUserId, {
      name: 'Emergency Fund',
      target_amount: 10000,
      current_saved: 2500,
      deadline: '2027-12-31',
      description: '6 months expenses'
    });

    const result = await goalService.getGoalsWithCalculations(testUserId);
    expect(result.summary.totalGoals).toBeGreaterThanOrEqual(1);

    const createdGoal = result.goals.find(g => g.id === goal.id);
    expect(createdGoal).toBeDefined();
    expect(createdGoal.progressPercentage).toBe(25);
    expect(createdGoal.remaining).toBe(7500);
    expect(createdGoal.isCompleted).toBe(false);
  });

  test('HealthScoreService returns valid health score and factors', async () => {
    const healthData = await healthScoreService.calculateHealthScore(testUserId, currentMonthYear);
    expect(healthData).toBeDefined();
    expect(healthData.score).toBeGreaterThanOrEqual(0);
    expect(healthData.score).toBeLessThanOrEqual(100);
    expect(['Excellent', 'Good', 'Fair', 'Needs Improvement']).toContain(healthData.ratingGrade);
    expect(healthData.factors.length).toBe(5);
  });
});
