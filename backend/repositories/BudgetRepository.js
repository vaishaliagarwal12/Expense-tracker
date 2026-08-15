const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class BudgetRepository {
  async findAllByMonth(userId, monthYear) {
    const res = await db.query(
      `SELECT * FROM budgets WHERE user_id = $1 AND month_year = $2 ORDER BY category ASC`,
      [userId, monthYear]
    );
    return res.rows;
  }

  async findById(userId, id) {
    const res = await db.query(
      `SELECT * FROM budgets WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async findByCategoryAndMonth(userId, category, monthYear) {
    const res = await db.query(
      `SELECT * FROM budgets WHERE user_id = $1 AND category = $2 AND month_year = $3`,
      [userId, category, monthYear]
    );
    return res.rows[0] || null;
  }

  async create(userId, { category, amount, month_year }) {
    const id = uuidv4();
    await db.query(
      `INSERT INTO budgets (id, user_id, category, amount, month_year)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, category, amount, month_year]
    );
    return this.findById(userId, id);
  }

  async update(userId, id, { category, amount, month_year }) {
    await db.query(
      `UPDATE budgets SET category = $3, amount = $4, month_year = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [id, userId, category, amount, month_year]
    );
    return this.findById(userId, id);
  }

  async delete(userId, id) {
    const res = await db.query(
      `DELETE FROM budgets WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rowCount > 0;
  }
}

module.exports = new BudgetRepository();
