const recurringRepository = require('../repositories/RecurringRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const { AppError } = require('../utils/errorResponse');

function calculateNextOccurrence(currentOccurrenceStr, frequency) {
  const [y, m, d] = currentOccurrenceStr.split('-').map(Number);

  if (frequency === 'Weekly') {
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + 7);
    return dt.toISOString().split('T')[0];
  }

  if (frequency === 'Monthly') {
    let targetYear = y;
    let targetMonth = m + 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
    const daysInMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
    const targetDay = Math.min(d, daysInMonth);
    return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
  }

  if (frequency === 'Yearly') {
    const targetYear = y + 1;
    const targetMonth = m;
    const daysInMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
    const targetDay = Math.min(d, daysInMonth);
    return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
  }

  // Fallback: +1 month
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCMonth(dt.getUTCMonth() + 1);
  return dt.toISOString().split('T')[0];
}

class RecurringService {
  async getRecurringTransactions(userId) {
    const items = await recurringRepository.findAll(userId);
    return {
      recurring: items,
      totalActiveCount: items.filter(i => i.is_active).length
    };
  }

  async createRecurring(userId, data) {
    return recurringRepository.create(userId, data);
  }

  async updateRecurring(userId, id, data) {
    const existing = await recurringRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Recurring transaction not found', 404);
    }
    return recurringRepository.update(userId, id, data);
  }

  async deleteRecurring(userId, id) {
    const existing = await recurringRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Recurring transaction not found', 404);
    }
    return recurringRepository.delete(userId, id);
  }

  async processDueRecurringTransactions() {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata'
    }).format(new Date());
    const dueItems = await recurringRepository.findDue();
    let totalGenerated = 0;

    for (const item of dueItems) {
      const isActive = item.is_active === true || item.is_active === 1;

      if (!isActive || !item.next_occurrence) {
        continue;
      }

      try {
        let currentOccurrence =
          item.next_occurrence instanceof Date
            ? item.next_occurrence.toISOString().split('T')[0]
            : String(item.next_occurrence).slice(0, 10);

        if (currentOccurrence > today) {
          continue;
        }
        while (currentOccurrence <= today) {
          await transactionRepository.create(item.user_id, {
            amount: parseFloat(item.amount),
            type: item.type || 'expense',
            category: item.category,
            description: item.name,
            date: currentOccurrence,
            payment_method: 'Other',
            notes: 'Automatically created from recurring transaction'
          });

          totalGenerated++;

          const nextDate = calculateNextOccurrence(currentOccurrence, item.frequency);
          if (nextDate <= currentOccurrence) {
            break;
          }
          currentOccurrence = nextDate;
        }

        await recurringRepository.updateNextOccurrence(item.id, currentOccurrence);
      } catch (err) {
        console.error(`❌ Error processing recurring transaction ID ${item.id}:`, err.message || err);
      }
    }

    return totalGenerated;
  }
}

module.exports = new RecurringService();
