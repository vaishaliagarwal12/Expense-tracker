const recurringService = require('../services/RecurringService');
const recurringRepository = require('../repositories/RecurringRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

describe('Recurring Transactions & Scheduler Tests', () => {
  const testUserId = uuidv4();

  beforeAll(async () => {
    await db.initDb();
  });

  beforeEach(() => {
    // Reset test data in local store if running in JSON mode
  });

  test('Processes due recurring transactions and updates next_occurrence correctly (Weekly)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const rec = await recurringRepository.create(testUserId, {
      name: 'Weekly Internet',
      amount: 50,
      category: 'Bills',
      type: 'expense',
      frequency: 'Weekly',
      start_date: today,
      next_occurrence: today,
      is_active: true
    });

    const processedCount = await recurringService.processDueRecurringTransactions();
    expect(processedCount).toBeGreaterThanOrEqual(1);

    // Verify next_occurrence moved 7 days forward
    const updated = await recurringRepository.findById(testUserId, rec.id);
    expect(updated.next_occurrence > today).toBe(true);

    // Verify generated transaction details
    const txs = await transactionRepository.findAll(testUserId);
    const createdTx = txs.transactions.find(t => t.description === 'Weekly Internet');
    expect(createdTx).toBeDefined();
    expect(createdTx.payment_method).toBe('Other');
    expect(createdTx.notes).toContain('Automatically created from recurring transaction');
  });

  test('Does not process future or inactive recurring transactions', async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const futureRec = await recurringRepository.create(testUserId, {
      name: 'Future Gym Membership',
      amount: 100,
      category: 'Healthcare',
      type: 'expense',
      frequency: 'Monthly',
      start_date: tomorrow,
      next_occurrence: tomorrow,
      is_active: true
    });

    const inactiveRec = await recurringRepository.create(testUserId, {
      name: 'Inactive Streaming',
      amount: 15,
      category: 'Entertainment',
      type: 'expense',
      frequency: 'Monthly',
      start_date: '2026-01-01',
      next_occurrence: '2026-01-01',
      is_active: false
    });

    const count = await recurringService.processDueRecurringTransactions();
    // Neither futureRec nor inactiveRec should generate a transaction
    const txs = await transactionRepository.findAll(testUserId);
    expect(txs.transactions.find(t => t.description === 'Future Gym Membership')).toBeUndefined();
    expect(txs.transactions.find(t => t.description === 'Inactive Streaming')).toBeUndefined();
  });

  test('Handles catch-up for multiple missed occurrences without skipping', async () => {
    const pastDate = '2026-05-01';
    const rec = await recurringRepository.create(testUserId, {
      name: 'Catchup Rent',
      amount: 1000,
      category: 'Rent',
      type: 'expense',
      frequency: 'Monthly',
      start_date: pastDate,
      next_occurrence: pastDate,
      is_active: true
    });

    await recurringService.processDueRecurringTransactions();

    const txs = await transactionRepository.findAll(testUserId);
    const rentTxs = txs.transactions.filter(t => t.description === 'Catchup Rent');
    // Should have created multiple transactions for past months
    expect(rentTxs.length).toBeGreaterThan(1);

    const updatedRec = await recurringRepository.findById(testUserId, rec.id);
    const today = new Date().toISOString().split('T')[0];
    expect(updatedRec.next_occurrence > today).toBe(true);
  });

  test('Running processDueRecurringTransactions multiple times does not produce duplicate transactions', async () => {
    const firstRunCount = await recurringService.processDueRecurringTransactions();
    const secondRunCount = await recurringService.processDueRecurringTransactions();
    expect(secondRunCount).toBe(0);
  });
});
