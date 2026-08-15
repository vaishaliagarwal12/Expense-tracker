const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

describe('FinTrack REST API Endpoint Tests', () => {
  let authToken = '';
  const testUser = {
    name: 'Test Security User',
    email: `test_api_${Date.now()}@example.com`,
    password: 'Password123!'
  };

  beforeAll(async () => {
    await db.initDb();
  });

  test('POST /api/auth/register registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  test('POST /api/auth/login authenticates user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('GET /api/transactions fetches user transactions with auth header', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.transactions)).toBe(true);
  });

  test('POST /api/transactions creates a transaction', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 250,
        type: 'expense',
        category: 'Food',
        description: 'Groceries API Test',
        date: today,
        payment_method: 'Credit Card',
        notes: 'API test transaction'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transaction.description).toBe('Groceries API Test');
  });

  test('GET /api/recurring-expenses fetches recurring transactions', async () => {
    const res = await request(app)
      .get('/api/recurring-expenses')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.recurring)).toBe(true);
  });

  test('POST /api/recurring-expenses creates recurring transaction', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/recurring-expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Streaming Sub',
        amount: 15,
        category: 'Entertainment',
        type: 'expense',
        frequency: 'Monthly',
        start_date: today,
        next_occurrence: today,
        is_active: true
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recurring.name).toBe('Streaming Sub');
  });

  test('PUT /api/transactions/:id updates transaction and persists changes', async () => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Create transaction
    const createRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        type: 'expense',
        category: 'Food',
        description: 'database test',
        date: today,
        payment_method: 'UPI',
        notes: 'Initial note'
      });

    expect(createRes.status).toBe(201);
    const createdTx = createRes.body.data.transaction;
    expect(createdTx.description).toBe('database test');

    // 2. Update transaction
    const updateRes = await request(app)
      .put(`/api/transactions/${createdTx.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 150,
        type: 'expense',
        category: 'Shopping',
        description: 'Database Edit Test',
        date: today,
        payment_method: 'Debit Card',
        notes: 'Updated note'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.transaction.description).toBe('Database Edit Test');
    expect(updateRes.body.data.transaction.amount).toBe(150);
    expect(updateRes.body.data.transaction.category).toBe('Shopping');
    expect(updateRes.body.data.transaction.payment_method).toBe('Debit Card');

    // 3. Fetch transaction again
    const fetchRes1 = await request(app)
      .get(`/api/transactions/${createdTx.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(fetchRes1.status).toBe(200);
    expect(fetchRes1.body.data.transaction.description).toBe('Database Edit Test');
    expect(fetchRes1.body.data.transaction.amount).toBe(150);

    // 4. Reinitialize database engine to simulate backend restart/refresh
    await db.initDb();

    // 5. Fetch again and assert persistence
    const fetchRes2 = await request(app)
      .get(`/api/transactions/${createdTx.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(fetchRes2.status).toBe(200);
    expect(fetchRes2.body.data.transaction.description).toBe('Database Edit Test');
    expect(fetchRes2.body.data.transaction.amount).toBe(150);
    expect(fetchRes2.body.data.transaction.category).toBe('Shopping');
    expect(fetchRes2.body.data.transaction.payment_method).toBe('Debit Card');
  });
});

