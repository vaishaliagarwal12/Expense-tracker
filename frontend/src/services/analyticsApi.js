import api from './api';

export const analyticsApi = {
  getAnalytics: (monthYear) => api.get('/analytics', { params: { monthYear } }),
  getForecast: (monthYear) => api.get('/forecast', { params: { monthYear } }),
  getInsights: (monthYear) => api.get('/insights', { params: { monthYear } }),
  getHealthScore: (monthYear) => api.get('/health-score', { params: { monthYear } })
};
