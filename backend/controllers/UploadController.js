const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/errorResponse');

class UploadController {
  async uploadReceipt(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 400, 'No file uploaded');
      }

      const receiptUrl = `/uploads/receipts/${req.file.filename}`;
      const receiptId = uuidv4();
      const userId = req.user ? req.user.id : null;

      if (userId) {
        try {
          await db.query(
            `INSERT INTO receipts (id, user_id, transaction_id, file_name, file_path, file_type, file_size)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              receiptId,
              userId,
              null,
              req.file.originalname,
              receiptUrl,
              req.file.mimetype,
              req.file.size
            ]
          );
        } catch (dbErr) {
          console.error('Failed to store receipt record in db:', dbErr.message);
        }
      }

      return successResponse(res, 200, {
        id: receiptId,
        file_name: req.file.originalname,
        file_path: receiptUrl,
        receipt_url: receiptUrl,
        file_size: req.file.size,
        file_type: req.file.mimetype
      }, 'Receipt uploaded successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UploadController();
