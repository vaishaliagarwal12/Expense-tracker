import api from './api';

export const budgetApi = {
  getBudgets: (monthYear) => api.get('/budgets', { params: { monthYear } }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
};
