const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/UploadController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate);
router.post('/receipt', upload.single('receipt'), (req, res, next) => uploadController.uploadReceipt(req, res, next));

module.exports = router;
