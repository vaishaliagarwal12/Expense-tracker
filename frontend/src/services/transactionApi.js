import api from './api';

export const transactionApi = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  exportCsv: (params) => api.get('/transactions/export', { params, responseType: 'blob' }),
  importCsv: (csvContent) => api.post('/transactions/import', { csvContent }),
  uploadReceipt: (formData) => api.post('/uploads/receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
