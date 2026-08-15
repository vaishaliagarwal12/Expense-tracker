const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class UserRepository {
  async findByEmail(email) {
    const res = await db.query(
      'SELECT id, name, email, password_hash, currency_symbol, created_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return res.rows[0] || null;
  }

  async findById(id) {
    const res = await db.query(
      'SELECT id, name, email, currency_symbol, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async create({ name, email, password_hash, currency_symbol = '₹' }) {
    const id = uuidv4();
    await db.query(
      'INSERT INTO users (id, name, email, password_hash, currency_symbol) VALUES ($1, $2, $3, $4, $5)',
      [id, name, email, password_hash, currency_symbol]
    );
    return this.findById(id);
  }

  async updateProfile(id, { name, currency_symbol }) {
    await db.query(
      'UPDATE users SET name = $1, currency_symbol = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [name, currency_symbol, id]
    );
    return this.findById(id);
  }
}

module.exports = new UserRepository();
