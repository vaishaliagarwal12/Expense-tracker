const { Pool } = require('pg');
const env = require('./env');
const path = require('path');
const fs = require('fs');

let pgPool = null;
let dbMode = 'pg'; // 'pg' or 'json'

// Local JSON File Database Storage Engine Fallback
const dbFilePath = path.join(__dirname, '../fintrack_local_data.json');
let localStore = {
  users: [],
  categories: [],
  transactions: [],
  budgets: [],
  savings_goals: [],
  recurring_transactions: [],
  subscriptions: [],
  receipts: [],
  notifications: []
};

function saveLocalStore() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save local store:', err);
  }
}

function loadLocalStore() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      localStore = { ...localStore, ...JSON.parse(data) };
    } catch (err) {
      console.warn('Failed to parse local store, initializing empty store.');
    }
  } else {
    saveLocalStore();
  }
}

async function initDb() {
  const connectionString = env.DB.url || 
    `postgres://${env.DB.user}:${env.DB.password}@${env.DB.host}:${env.DB.port}/${env.DB.database}`;

  try {
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000
    });
    
    const client = await pool.connect();
    client.release();
    pgPool = pool;
    dbMode = 'pg';
    console.log('✅ Connected to PostgreSQL database');
    return;
  } catch (err) {
    console.log('⚠️ PostgreSQL connection unreachable locally:', err.message);
    console.log('🔄 Initializing zero-dependency file-backed local database engine...');
    loadLocalStore();
    dbMode = 'json';
    console.log('✅ Local database engine ready at:', dbFilePath);
  }
}

// Emulate PostgreSQL queries for local fallback
async function executeJsonQuery(text, params = []) {
  const sql = text.trim();
  const upper = sql.toUpperCase();

  // 1. Users Queries
  if (upper.includes('SELECT') && upper.includes('FROM USERS')) {
    if (upper.includes('WHERE LOWER(EMAIL)')) {
      const email = params[0]?.toLowerCase();
      const user = localStore.users.find(u => u.email.toLowerCase() === email);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (upper.includes('WHERE ID =')) {
      const user = localStore.users.find(u => u.id === params[0]);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    return { rows: localStore.users, rowCount: localStore.users.length };
  }

  if (upper.includes('INSERT INTO USERS')) {
    const user = {
      id: params[0],
      name: params[1],
      email: params[2],
      password_hash: params[3],
      currency_symbol: params[4] || '₹',
      created_at: new Date().toISOString()
    };
    localStore.users.push(user);
    saveLocalStore();
    return { rows: [user], rowCount: 1 };
  }

  if (upper.includes('UPDATE USERS SET')) {
    const user = localStore.users.find(u => u.id === params[2]);
    if (user) {
      user.name = params[0];
      user.currency_symbol = params[1];
      user.updated_at = new Date().toISOString();
      saveLocalStore();
      return { rows: [user], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 2. Transactions Queries
  if (upper.includes('SELECT') && upper.includes('FROM TRANSACTIONS')) {
    if (upper.includes('SELECT COUNT(*)')) {
      let filtered = localStore.transactions.filter(t => t.user_id === params[0]);
      if (params.length > 1 && typeof params[1] === 'string' && params[1].includes('%')) {
        const search = params[1].replace(/%/g, '').toLowerCase();
        filtered = filtered.filter(t => t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
      }
      return { rows: [{ total: filtered.length }], rowCount: 1 };
    }

    if (upper.includes('SUM(AMOUNT)')) {
      const userId = params[0];

      if (upper.includes('GROUP BY TYPE')) {
        const monthYear = params[1];
        const filtered = localStore.transactions.filter(t => t.user_id === userId && (t.date || '').slice(0, 7) === monthYear);
        let inc = 0, exp = 0;
        filtered.forEach(t => {
          if (t.type === 'income') inc += parseFloat(t.amount);
          if (t.type === 'expense') exp += parseFloat(t.amount);
        });
        return {
          rows: [
            { type: 'income', total: inc },
            { type: 'expense', total: exp }
          ],
          rowCount: 2
        };
      }

      if (upper.includes('GROUP BY CATEGORY')) {
        const catMap = {};
        const targetType = params[1]; // type (e.g. 'expense' or 'income')
        const targetMonth = params[2]; // monthYear (e.g. '2026-08')
        const filtered = localStore.transactions.filter(t => t.user_id === userId && t.type === targetType && (t.date || '').slice(0, 7) === targetMonth);
        filtered.forEach(t => {
          if (!catMap[t.category]) catMap[t.category] = { category: t.category, total: 0, count: 0 };
          catMap[t.category].total += parseFloat(t.amount);
          catMap[t.category].count += 1;
        });
        const rows = Object.values(catMap).sort((a, b) => b.total - a.total);
        return { rows, rowCount: rows.length };
      }
    }

    if (upper.includes('GROUP BY MONTH_YEAR, TYPE')) {
      const userId = params[0];
      const monthMap = {};
      const filtered = localStore.transactions.filter(t => t.user_id === userId);
      filtered.forEach(t => {
        const m = (t.date || '').slice(0, 7);
        const key = `${m}_${t.type}`;
        if (!monthMap[key]) monthMap[key] = { month_year: m, type: t.type, total: 0 };
        monthMap[key].total += parseFloat(t.amount);
      });
      const rows = Object.values(monthMap).sort((a, b) => a.month_year.localeCompare(b.month_year));
      return { rows, rowCount: rows.length };
    }

    if (upper.includes('WHERE ID =') && upper.includes('AND USER_ID =')) {
      const tx = localStore.transactions.find(t => t.id === params[0] && t.user_id === params[1]);
      return { rows: tx ? [tx] : [], rowCount: tx ? 1 : 0 };
    }

    // Default SELECT * FROM transactions WHERE user_id = $1
    let items = localStore.transactions.filter(t => t.user_id === params[0]);
    let pIdx = 1;
    if (text.includes('LOWER(description) LIKE')) {
      const search = params[pIdx]?.replace(/%/g, '').toLowerCase();
      if (search) {
        items = items.filter(t => t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
      }
      pIdx++;
    }
    if (text.includes('category = $')) {
      const cat = params[pIdx];
      if (cat) items = items.filter(t => t.category === cat);
      pIdx++;
    }
    if (text.includes('type = $')) {
      const typ = params[pIdx];
      if (typ) items = items.filter(t => t.type === typ.toLowerCase());
      pIdx++;
    }
    if (text.includes('date >= $')) {
      const sDate = params[pIdx];
      if (sDate) items = items.filter(t => t.date >= sDate);
      pIdx++;
    }
    if (text.includes('date <= $')) {
      const eDate = params[pIdx];
      if (eDate) items = items.filter(t => t.date <= eDate);
      pIdx++;
    }

    // Sort & Paginate
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    let limit = 20, offset = 0;
    if (text.includes('LIMIT $')) {
      limit = params[params.length - 2] || 20;
      offset = params[params.length - 1] || 0;
    }
    const paginated = items.slice(offset, offset + limit);
    return { rows: paginated, rowCount: items.length };
  }

  if (upper.includes('INSERT INTO TRANSACTIONS')) {
    const item = {
      id: params[0],
      user_id: params[1],
      amount: parseFloat(params[2]),
      type: params[3],
      category: params[4],
      description: params[5],
      date: params[6],
      payment_method: params[7],
      notes: params[8] || '',
      receipt_url: params[9] || '',
      created_at: new Date().toISOString()
    };
    localStore.transactions.push(item);
    saveLocalStore();
    return { rows: [item], rowCount: 1 };
  }

  if (upper.includes('UPDATE TRANSACTIONS')) {
    const id = params[0];
    const userId = params[1];
    const item = localStore.transactions.find(t => t.id === id && t.user_id === userId);
    if (item) {
      item.amount = parseFloat(params[2]);
      item.type = params[3];
      item.category = params[4];
      item.description = params[5];
      item.date = params[6];
      item.payment_method = params[7];
      item.notes = params[8] || '';
      if (params[9] !== undefined) item.receipt_url = params[9];
      item.updated_at = new Date().toISOString();
      saveLocalStore();
      return { rows: [item], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (upper.includes('DELETE FROM TRANSACTIONS')) {
    const id = params[0];
    const userId = params[1];
    const initialLen = localStore.transactions.length;
    localStore.transactions = localStore.transactions.filter(t => !(t.id === id && t.user_id === userId));
    saveLocalStore();
    return { rows: [], rowCount: initialLen - localStore.transactions.length };
  }

  // 3. Budgets Queries
  if (upper.includes('SELECT') && upper.includes('FROM BUDGETS')) {
    if (upper.includes('WHERE USER_ID =') && upper.includes('AND CATEGORY =') && upper.includes('AND MONTH_YEAR =')) {
      const b = localStore.budgets.find(item => item.user_id === params[0] && item.category === params[1] && item.month_year === params[2]);
      return { rows: b ? [b] : [], rowCount: b ? 1 : 0 };
    }
    if (upper.includes('WHERE ID =') && upper.includes('AND USER_ID =')) {
      const b = localStore.budgets.find(item => item.id === params[0] && item.user_id === params[1]);
      return { rows: b ? [b] : [], rowCount: b ? 1 : 0 };
    }
    const items = localStore.budgets.filter(item => item.user_id === params[0] && item.month_year === params[1]);
    return { rows: items, rowCount: items.length };
  }

  if (upper.includes('INSERT INTO BUDGETS')) {
    const item = {
      id: params[0],
      user_id: params[1],
      category: params[2],
      amount: parseFloat(params[3]),
      month_year: params[4],
      created_at: new Date().toISOString()
    };
    localStore.budgets.push(item);
    saveLocalStore();
    return { rows: [item], rowCount: 1 };
  }

  if (upper.includes('UPDATE BUDGETS SET')) {
    const b = localStore.budgets.find(item => item.id === params[0] && item.user_id === params[1]);
    if (b) {
      b.category = params[2];
      b.amount = parseFloat(params[3]);
      b.month_year = params[4];
      saveLocalStore();
      return { rows: [b], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (upper.includes('DELETE FROM BUDGETS')) {
    const initialLen = localStore.budgets.length;
    localStore.budgets = localStore.budgets.filter(item => !(item.id === params[0] && item.user_id === params[1]));
    saveLocalStore();
    return { rows: [], rowCount: initialLen - localStore.budgets.length };
  }

  // 4. Savings Goals Queries
  if (upper.includes('SELECT') && upper.includes('FROM SAVINGS_GOALS')) {
    if (upper.includes('WHERE ID =') && upper.includes('AND USER_ID =')) {
      const g = localStore.savings_goals.find(item => item.id === params[0] && item.user_id === params[1]);
      return { rows: g ? [g] : [], rowCount: g ? 1 : 0 };
    }
    const items = localStore.savings_goals.filter(item => item.user_id === params[0]);
    return { rows: items, rowCount: items.length };
  }

  if (upper.includes('INSERT INTO SAVINGS_GOALS')) {
    const item = {
      id: params[0],
      user_id: params[1],
      name: params[2],
      target_amount: parseFloat(params[3]),
      current_saved: parseFloat(params[4] || 0),
      deadline: params[5],
      description: params[6] || '',
      created_at: new Date().toISOString()
    };
    localStore.savings_goals.push(item);
    saveLocalStore();
    return { rows: [item], rowCount: 1 };
  }

  if (upper.includes('UPDATE SAVINGS_GOALS')) {
    const g = localStore.savings_goals.find(item => item.id === params[0] && item.user_id === params[1]);
    if (g) {
      if (text.includes('current_saved = current_saved + $3')) {
        g.current_saved = (g.current_saved || 0) + parseFloat(params[2]);
      } else {
        g.name = params[2];
        g.target_amount = parseFloat(params[3]);
        g.current_saved = parseFloat(params[4]);
        g.deadline = params[5];
        g.description = params[6] || '';
      }
      saveLocalStore();
      return { rows: [g], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (upper.includes('DELETE FROM SAVINGS_GOALS')) {
    const initialLen = localStore.savings_goals.length;
    localStore.savings_goals = localStore.savings_goals.filter(item => !(item.id === params[0] && item.user_id === params[1]));
    saveLocalStore();
    return { rows: [], rowCount: initialLen - localStore.savings_goals.length };
  }

  // 5. Subscriptions Queries
  if (upper.includes('SELECT') && upper.includes('FROM SUBSCRIPTIONS')) {
    if (upper.includes('WHERE ID =') && upper.includes('AND USER_ID =')) {
      const s = localStore.subscriptions.find(item => item.id === params[0] && item.user_id === params[1]);
      return { rows: s ? [s] : [], rowCount: s ? 1 : 0 };
    }
    const items = localStore.subscriptions.filter(item => item.user_id === params[0]);
    return { rows: items, rowCount: items.length };
  }

  if (upper.includes('INSERT INTO SUBSCRIPTIONS')) {
    const item = {
      id: params[0],
      user_id: params[1],
      name: params[2],
      amount: parseFloat(params[3]),
      billing_frequency: params[4],
      next_billing_date: params[5],
      category: params[6] || 'Entertainment',
      status: params[7] || 'Active',
      created_at: new Date().toISOString()
    };
    localStore.subscriptions.push(item);
    saveLocalStore();
    return { rows: [item], rowCount: 1 };
  }

  if (upper.includes('UPDATE SUBSCRIPTIONS SET')) {
    const s = localStore.subscriptions.find(item => item.id === params[0] && item.user_id === params[1]);
    if (s) {
      s.name = params[2];
      s.amount = parseFloat(params[3]);
      s.billing_frequency = params[4];
      s.next_billing_date = params[5];
      s.category = params[6];
      s.status = params[7];
      saveLocalStore();
      return { rows: [s], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (upper.includes('DELETE FROM SUBSCRIPTIONS')) {
    const initialLen = localStore.subscriptions.length;
    localStore.subscriptions = localStore.subscriptions.filter(item => !(item.id === params[0] && item.user_id === params[1]));
    saveLocalStore();
    return { rows: [], rowCount: initialLen - localStore.subscriptions.length };
  }

  // 6. Recurring Transactions Queries
  if (upper.includes('SELECT') && upper.includes('FROM RECURRING_TRANSACTIONS')) {
    if (upper.includes('CURRENT_DATE') || upper.includes('NEXT_OCCURRENCE <=')) {
      const today = new Date().toISOString().split('T')[0];
      const items = localStore.recurring_transactions.filter(item => (item.is_active === true || item.is_active === 1) && item.next_occurrence <= today);
      items.sort((a, b) => (a.next_occurrence || '').localeCompare(b.next_occurrence || ''));
      return { rows: items, rowCount: items.length };
    }
    if (upper.includes('WHERE ID =') && upper.includes('AND USER_ID =')) {
      const r = localStore.recurring_transactions.find(item => item.id === params[0] && item.user_id === params[1]);
      return { rows: r ? [r] : [], rowCount: r ? 1 : 0 };
    }
    const items = localStore.recurring_transactions.filter(item => item.user_id === params[0]);
    items.sort((a, b) => (a.next_occurrence || '').localeCompare(b.next_occurrence || ''));
    return { rows: items, rowCount: items.length };
  }

  if (upper.includes('INSERT INTO RECURRING_TRANSACTIONS')) {
    const item = {
      id: params[0],
      user_id: params[1],
      name: params[2],
      amount: parseFloat(params[3]),
      category: params[4],
      type: params[5] || 'expense',
      frequency: params[6],
      start_date: params[7],
      next_occurrence: params[8],
      is_active: params[9] === 1 || params[9] === true,
      created_at: new Date().toISOString()
    };
    localStore.recurring_transactions.push(item);
    saveLocalStore();
    return { rows: [item], rowCount: 1 };
  }

  if (upper.includes('UPDATE RECURRING_TRANSACTIONS')) {
    if (upper.includes('SET NEXT_OCCURRENCE =')) {
      const nextOcc = params[0];
      const id = params[1];
      const r = localStore.recurring_transactions.find(item => item.id === id);
      if (r) {
        r.next_occurrence = nextOcc;
        r.updated_at = new Date().toISOString();
        saveLocalStore();
        return { rows: [r], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    const r = localStore.recurring_transactions.find(item => item.id === params[0] && item.user_id === params[1]);
    if (r) {
      r.name = params[2];
      r.amount = parseFloat(params[3]);
      r.category = params[4];
      r.type = params[5];
      r.frequency = params[6];
      r.start_date = params[7];
      r.next_occurrence = params[8];
      r.is_active = params[9] === 1 || params[9] === true;
      saveLocalStore();
      return { rows: [r], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (upper.includes('DELETE FROM RECURRING_TRANSACTIONS')) {
    const initialLen = localStore.recurring_transactions.length;
    localStore.recurring_transactions = localStore.recurring_transactions.filter(item => !(item.id === params[0] && item.user_id === params[1]));
    saveLocalStore();
    return { rows: [], rowCount: initialLen - localStore.recurring_transactions.length };
  }

  // 7. Receipts Queries
  if (upper.includes('SELECT') && upper.includes('FROM RECEIPTS')) {
    if (upper.includes('WHERE USER_ID =') && upper.includes('AND FILE_PATH =')) {
      const rec = localStore.receipts.find(item => item.user_id === params[0] && item.file_path === params[1]);
      return { rows: rec ? [rec] : [], rowCount: rec ? 1 : 0 };
    }
    const items = localStore.receipts.filter(item => item.user_id === params[0]);
    return { rows: items, rowCount: items.length };
  }

  if (upper.includes('INSERT INTO RECEIPTS')) {
    const item = {
      id: params[0],
      user_id: params[1],
      transaction_id: params[2] || null,
      file_name: params[3],
      file_path: params[4],
      file_type: params[5] || 'image/png',
      file_size: parseInt(params[6] || 0),
      created_at: new Date().toISOString()
    };
    localStore.receipts.push(item);
    saveLocalStore();
    return { rows: [item], rowCount: 1 };
  }

  if (upper.includes('UPDATE RECEIPTS SET TRANSACTION_ID =') || (upper.includes('UPDATE RECEIPTS') && upper.includes('TRANSACTION_ID'))) {
    const transactionId = params[0];
    const userId = params[1];
    const filePath = params[2];
    const rec = localStore.receipts.find(item => item.user_id === userId && item.file_path === filePath);
    if (rec) {
      rec.transaction_id = transactionId;
      saveLocalStore();
      return { rows: [rec], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (upper.includes('DELETE FROM RECEIPTS')) {
    const initialLen = localStore.receipts.length;
    localStore.receipts = localStore.receipts.filter(item => !(item.id === params[0] && item.user_id === params[1]));
    saveLocalStore();
    return { rows: [], rowCount: initialLen - localStore.receipts.length };
  }

  return { rows: [], rowCount: 0 };
}

async function query(text, params = []) {
  if (dbMode === 'pg' && pgPool) {
    const res = await pgPool.query(text, params);
    return { rows: res.rows, rowCount: res.rowCount };
  } else {
    return executeJsonQuery(text, params);
  }
}

module.exports = {
  initDb,
  query,
  getDbMode: () => dbMode
};
