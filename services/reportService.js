import api from './api';

export const getReport = async (sessionId) => {
  const response = await api.get(`/api/report/${sessionId}`);
  return response.data;
};
