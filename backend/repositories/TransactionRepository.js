const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class TransactionRepository {
  async findAll(userId, filters = {}) {
    const {
      search = '',
      category = '',
      type = '',
      startDate = '',
      endDate = '',
      sortBy = 'date',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = filters;

    let queryText = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (search) {
      queryText += ` AND (LOWER(description) LIKE LOWER($${paramIndex}) OR LOWER(category) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category && category !== 'All') {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (type && type !== 'All') {
      queryText += ` AND type = $${paramIndex}`;
      params.push(type.toLowerCase());
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Count Total matching
    const countQueryText = queryText.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countRes = await db.query(countQueryText, params);
    const totalCount = parseInt(
      countRes.rows[0]?.total || countRes.rows[0]?.['COUNT(*)'] || 0
    );

    // Sorting & Pagination
    const validSortColumns = ['date', 'amount', 'category', 'created_at', 'description'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'date';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;
    queryText += ` ORDER BY ${safeSortBy} ${safeOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const res = await db.query(queryText, params);

    return {
      transactions: res.rows,
      totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit) || 1
    };
  }

  async findById(userId, id) {
    const res = await db.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async _syncReceipt(userId, transactionId, receiptUrl) {
    if (!receiptUrl) return;
    try {
      const fileName = receiptUrl.split('/').pop() || 'receipt';
      const updateRes = await db.query(
        `UPDATE receipts SET transaction_id = $1 WHERE user_id = $2 AND file_path = $3`,
        [transactionId, userId, receiptUrl]
      );
      if (!updateRes || updateRes.rowCount === 0) {
        const receiptId = uuidv4();
        await db.query(
          `INSERT INTO receipts (id, user_id, transaction_id, file_name, file_path, file_type, file_size)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [receiptId, userId, transactionId, fileName, receiptUrl, 'image/png', 0]
        );
      }
    } catch (err) {
      console.error('Failed to sync receipt metadata:', err.message);
    }
  }

  async create(userId, data) {
    const id = uuidv4();
    const {
      amount,
      type,
      category,
      description,
      date,
      payment_method,
      notes = '',
      receipt_url = ''
    } = data;

    await db.query(
      `INSERT INTO transactions (
        id,
        user_id,
        amount,
        type,
        category,
        description,
        date,
        payment_method,
        notes,
        receipt_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        userId,
        amount,
        type.toLowerCase(),
        category,
        description,
        date,
        payment_method,
        notes,
        receipt_url
      ]
    );

    if (receipt_url) {
      await this._syncReceipt(userId, id, receipt_url);
    }

    return this.findById(userId, id);
  }

  async update(userId, id, data) {
    const {
      amount,
      type,
      category,
      description,
      date,
      payment_method,
      notes = '',
      receipt_url
    } = data;

    let updateFields = [
      'amount = $3',
      'type = $4',
      'category = $5',
      'description = $6',
      'date = $7',
      'payment_method = $8',
      'notes = $9',
      'updated_at = CURRENT_TIMESTAMP'
    ];

    let params = [
      id,
      userId,
      amount,
      type.toLowerCase(),
      category,
      description,
      date,
      payment_method,
      notes
    ];

    if (receipt_url !== undefined) {
      updateFields.push('receipt_url = $10');
      params.push(receipt_url);
    }

    await db.query(
      `UPDATE transactions
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND user_id = $2`,
      params
    );

    if (receipt_url) {
      await this._syncReceipt(userId, id, receipt_url);
    }

    return this.findById(userId, id);
  }

  async delete(userId, id) {
    const res = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return res.rowCount > 0;
  }

  async getSummaryByMonth(userId, monthYear) {
    // monthYear is YYYY-MM
    const res = await db.query(
      `SELECT type, SUM(amount) as total
       FROM transactions
       WHERE user_id = $1
       AND TO_CHAR(date, 'YYYY-MM') = $2
       GROUP BY type`,
      [userId, monthYear]
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    res.rows.forEach(row => {
      if (row.type === 'income') {
        totalIncome = parseFloat(row.total || 0);
      }

      if (row.type === 'expense') {
        totalExpenses = parseFloat(row.total || 0);
      }
    });

    return {
      totalIncome,
      totalExpenses,
      monthYear
    };
  }

  async getCategoryBreakdown(userId, monthYear, type = 'expense') {
    const res = await db.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE user_id = $1
       AND type = $2
       AND TO_CHAR(date, 'YYYY-MM') = $3
       GROUP BY category
       ORDER BY total DESC`,
      [userId, type, monthYear]
    );

    return res.rows.map(row => ({
      category: row.category,
      total: parseFloat(row.total),
      count: parseInt(row.count)
    }));
  }

  async getMonthlyTrend(userId, months = 6) {
    const res = await db.query(
      `SELECT TO_CHAR(date, 'YYYY-MM') as month_year,
              type,
              SUM(amount) as total
       FROM transactions
       WHERE user_id = $1
       GROUP BY month_year, type
       ORDER BY month_year ASC`,
      [userId]
    );

    return res.rows;
  }

  async bulkInsert(userId, transactionsArray) {
    const created = [];

    for (const item of transactionsArray) {
      const result = await this.create(userId, item);
      created.push(result);
    }

    return created;
  }
}

module.exports = new TransactionRepository();