const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class RecurringRepository {
  async findAll(userId) {
    const res = await db.query(
      `SELECT * FROM recurring_transactions WHERE user_id = $1 ORDER BY next_occurrence ASC`,
      [userId]
    );
    return res.rows;
  }

  async findById(userId, id) {
    const res = await db.query(
      `SELECT * FROM recurring_transactions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(userId, { name, amount, category, type = 'expense', frequency, start_date, next_occurrence, is_active = true }) {
    const id = uuidv4();
    await db.query(
      `INSERT INTO recurring_transactions (id, user_id, name, amount, category, type, frequency, start_date, next_occurrence, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, userId, name, amount, category, type, frequency, start_date, next_occurrence, is_active ? 1 : 0]
    );
    return this.findById(userId, id);
  }

  async update(userId, id, { name, amount, category, type, frequency, start_date, next_occurrence, is_active }) {
    await db.query(
      `UPDATE recurring_transactions 
       SET name = $3, amount = $4, category = $5, type = $6, frequency = $7, start_date = $8, next_occurrence = $9, is_active = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [id, userId, name, amount, category, type, frequency, start_date, next_occurrence, is_active ? 1 : 0]
    );
    return this.findById(userId, id);
  }

  async findDue() {
    const res = await db.query(
      `SELECT * FROM recurring_transactions
       WHERE is_active = TRUE
       AND next_occurrence <= CURRENT_DATE
       ORDER BY next_occurrence ASC`,
      []
    );
    return res.rows;
  }

  async updateNextOccurrence(id, nextOccurrence) {
    await db.query(
      `UPDATE recurring_transactions
       SET next_occurrence = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [nextOccurrence, id]
    );
  }

  async delete(userId, id) {
    const res = await db.query(
      `DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rowCount > 0;
  }
}

module.exports = new RecurringRepository();
