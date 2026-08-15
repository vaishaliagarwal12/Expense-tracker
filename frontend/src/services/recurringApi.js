import api from './api';

export const recurringApi = {
  getAll: () => api.get('/recurring-expenses'),
  create: (data) => api.post('/recurring-expenses', data),
  update: (id, data) => api.put(`/recurring-expenses/${id}`, data),
  delete: (id) => api.delete(`/recurring-expenses/${id}`)
};
