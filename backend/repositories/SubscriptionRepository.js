const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class SubscriptionRepository {
  async findAll(userId) {
    const res = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY next_billing_date ASC`,
      [userId]
    );
    return res.rows;
  }

  async findById(userId, id) {
    const res = await db.query(
      `SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(userId, { name, amount, billing_frequency, next_billing_date, category = 'Entertainment', status = 'Active' }) {
    const id = uuidv4();
    await db.query(
      `INSERT INTO subscriptions (id, user_id, name, amount, billing_frequency, next_billing_date, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, userId, name, amount, billing_frequency, next_billing_date, category, status]
    );
    return this.findById(userId, id);
  }

  async update(userId, id, { name, amount, billing_frequency, next_billing_date, category, status }) {
    await db.query(
      `UPDATE subscriptions 
       SET name = $3, amount = $4, billing_frequency = $5, next_billing_date = $6, category = $7, status = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [id, userId, name, amount, billing_frequency, next_billing_date, category, status]
    );
    return this.findById(userId, id);
  }

  async delete(userId, id) {
    const res = await db.query(
      `DELETE FROM subscriptions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rowCount > 0;
  }
}

module.exports = new SubscriptionRepository();
