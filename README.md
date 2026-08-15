# FinTrack — Personal Finance Management SaaS Web Application

**FinTrack** is a production-quality, responsive personal finance SaaS application designed for individuals to track income, control expenses, create monthly budgets, set savings goals, manage subscriptions, forecast spending, and calculate automated financial health scores.

> **Product Direction:** This is strictly an individual personal finance tool. It contains **no** social group expense splitting or friend management features.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with Vanilla CSS custom design tokens
- **Routing:** React Router v6
- **Charts & Visualizations:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime & Framework:** Node.js, Express.js
- **Architecture:** Layered Architecture (`Route → Middleware → Controller → Service → Repository → Database`)
- **Authentication:** JWT (JSON Web Tokens) with secure password hashing via `bcryptjs`
- **File Uploads:** Multer for receipt image attachments

### Database
- **Primary Database Target:** PostgreSQL with normalized schema (`database/schema.sql`)
- **Local Zero-Config Fallback:** Self-initializing file-backed database engine for out-of-the-box local execution

---

## 🏛️ Layered Backend Architecture

The backend strictly separates responsibilities into clean, decoupled layers:

```
Request
  │
  ▼
[ Routes ]          --> Define API endpoints and attach middleware
  │
  ▼
[ Middleware ]      --> Auth verification (JWT), validation, file upload, error handling
  │
  ▼
[ Controllers ]     --> Thin controllers extracting HTTP params & returning JSON responses
  │
  ▼
[ Services ]        --> Core business logic (Forecast, Insights, Health Score, Budgets)
  │
  ▼
[ Repositories ]    --> Data access, SQL execution, database queries (No HTTP logic)
  │
  ▼
[ Database ]        --> PostgreSQL / Local storage engine
```

---

## ✨ Features

1. **Secure Authentication & Isolation:** Registration, login, JWT protection, password hashing with bcrypt, strict per-user data isolation.
2. **Interactive Financial Dashboard:** Current balance, total income, total expenses, savings rate, recent transactions, and 4 meaningful charts:
   - Income vs Expense Comparison
   - Monthly Spending & Income Trend (6 months)
   - Expense Category Distribution
   - Budget Usage Overview
3. **Transactions Management:** Add/Edit/Delete income and expenses across 16+ categories and 7 payment methods. Filters by date range, category, type, text search, sorting, and pagination.
4. **Monthly Budgeting:** Category budgets with visual progress bars, remaining calculations, and warnings when spending reaches 80% or exceeds 100%.
5. **Savings Goals Tracker:** Target amount, current saved, deadline calculations, deposit modal, and required monthly savings calculator.
6. **Subscription Tracker:** Track subscriptions (Netflix, Spotify, Canva, etc.) with automatic monthly and yearly cost rollup.
7. **Recurring Expenses:** Manage scheduled bills (Rent, Internet, EMIs) ready for background cron job processing.
8. **Deterministic Spending Forecast:** Calculates projected monthly spending based on current daily spending pace and remaining days in the month.
9. **Automated Rule-Based Financial Insights:** Data-driven notifications regarding category spending surges, budget overages, and savings rate improvements.
10. **Financial Health Score (0-100):** Weighted health score considering savings rate, budget adherence, expense stability, goal progress, and fixed costs, complete with detailed factor explanations.
11. **CSV Import & Export:** Download transaction records as CSV or bulk import CSV files with row validation error reporting.
12. **Receipt Image Attachment:** Upload and store receipt images associated with individual transaction records.
13. **Modern SaaS UI:** Responsive layout with desktop sidebar, mobile drawer, top header date/month selector, and Light / Dark mode toggle.

---

## 🗄️ Database Schema Explanation (`database/schema.sql`)

The database uses a normalized relational structure:
- `users`: `id`, `name`, `email` (UNIQUE), `password_hash`, `currency_symbol`
- `categories`: Default global categories and custom user categories
- `transactions`: Logged financial transactions associated with `user_id`
- `budgets`: Category limits scoped by `user_id` and `month_year` (`YYYY-MM`)
- `savings_goals`: Target savings goals with deadlines and progress
- `subscriptions`: Active subscriptions and billing frequency
- `recurring_transactions`: Scheduled recurring transactions
- `receipts`: Image file attachments linked to transactions

---

## 📡 Key REST API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login & receive JWT token
- `GET /api/auth/me` — Get current user profile
- `PUT /api/auth/profile` — Update user name and currency preference

### Transactions
- `GET /api/transactions` — List transactions (supports search, filters, pagination)
- `POST /api/transactions` — Create new transaction
- `PUT /api/transactions/:id` — Update transaction
- `DELETE /api/transactions/:id` — Delete transaction
- `GET /api/transactions/export` — Download CSV export
- `POST /api/transactions/import` — Import transactions from CSV

### Budgets & Goals
- `GET /api/budgets` — Get monthly budgets with progress
- `POST /api/budgets` — Set category budget limit
- `GET /api/goals` — Get savings goals with monthly required savings
- `POST /api/goals/:id/deposit` — Deposit money towards goal

### Analytics & Intelligence
- `GET /api/analytics` — MoM comparison, daily averages, trend data
- `GET /api/forecast` — Deterministic spending projection
- `GET /api/insights` — Rule-based insights feed
- `GET /api/health-score` — 0-100 Financial health score evaluation

---

## 🛠️ Local Setup & Execution Guide

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Setup
Copy `.env.example` to `.env` in root or backend directory:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 4. Start Development Servers

**Option A — Run Backend and Frontend concurrently:**

In Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Open your browser at `http://localhost:5173`. You can register a new account or log in with the seeded demo credentials:
- **Email:** `demo@fintrack.com`
- **Password:** `password123`

---

## 🔮 Future Improvements
- AI-driven receipt OCR scanning using Tesseract / Vision API
- Integration with Open Banking APIs for direct bank statement sync
- Machine Learning models to replace deterministic spending forecast
