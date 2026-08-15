const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const { initDb } = require('./config/db');
const recurringScheduler = require('./services/RecurringScheduler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const insightRoutes = require('./routes/insightRoutes');
const healthRoutes = require('./routes/healthRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const globalErrorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Receipts Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'FinTrack REST API',
    timestamp: new Date().toISOString()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/health-score', healthRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/recurring-expenses', recurringRoutes);
app.use('/api/uploads', uploadRoutes);

// Global 404 Route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server & Initialize Database
async function startServer() {
  try {
    await initDb();
    app.listen(env.PORT, () => {
      console.log(`🚀 FinTrack Backend Server running on http://localhost:${env.PORT}`);
      recurringScheduler.start();
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
