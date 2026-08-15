import api from './api';

export const goalApi = {
  getGoals: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  deposit: (id, amount) => api.post(`/goals/${id}/deposit`, { amount }),
  delete: (id) => api.delete(`/goals/${id}`)
};
