const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class GoalRepository {
  async findAll(userId) {
    const res = await db.query(
      `SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY deadline ASC`,
      [userId]
    );
    return res.rows;
  }

  async findById(userId, id) {
    const res = await db.query(
      `SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(userId, { name, target_amount, current_saved = 0, deadline, description = '' }) {
    const id = uuidv4();
    await db.query(
      `INSERT INTO savings_goals (id, user_id, name, target_amount, current_saved, deadline, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, name, target_amount, current_saved, deadline, description]
    );
    return this.findById(userId, id);
  }

  async update(userId, id, { name, target_amount, current_saved, deadline, description }) {
    await db.query(
      `UPDATE savings_goals 
       SET name = $3, target_amount = $4, current_saved = $5, deadline = $6, description = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [id, userId, name, target_amount, current_saved, deadline, description]
    );
    return this.findById(userId, id);
  }

  async updateDeposit(userId, id, amount) {
    await db.query(
      `UPDATE savings_goals 
       SET current_saved = current_saved + $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [id, userId, amount]
    );
    return this.findById(userId, id);
  }

  async delete(userId, id) {
    const res = await db.query(
      `DELETE FROM savings_goals WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rowCount > 0;
  }
}

module.exports = new GoalRepository();
