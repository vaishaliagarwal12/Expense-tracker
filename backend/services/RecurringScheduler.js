const recurringService = require('./RecurringService');

class RecurringScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  async runTask() {
    try {
      console.log('⏰ Running recurring transaction check...');
      const count = await recurringService.processDueRecurringTransactions();
      console.log(`✅ Recurring transaction check completed. Processed ${count} transaction(s).`);
    } catch (err) {
      console.error('❌ Error in recurring transaction scheduler:', err.message || err);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Recurring transaction scheduler is already running.');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Recurring transaction scheduler started');

    // Process due recurring transactions immediately upon startup
    this.runTask();

    // Run automatically every hour (3600000 ms)
    this.intervalId = setInterval(() => {
      this.runTask();
    }, 60 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Recurring transaction scheduler stopped');
  }
}

module.exports = new RecurringScheduler();
