import api from './api';

export const startLearningSession = async (topic) => {
  const response = await api.post('/api/learning/start', { topic: topic || '' });
  return response.data;
};

export const sendLearningMessage = async (sessionId, content) => {
  const response = await api.post('/api/learning/message', { sessionId, content });
  return response.data;
};

export const getSuggestedTopics = async () => {
  const response = await api.get('/api/learning/topics');
  return response.data;
};

export const getLearningSessions = async () => {
  const response = await api.get('/api/learning/sessions');
  return response.data;
};

export const getLearningSessionMessages = async (sessionId) => {
  const response = await api.get(`/api/learning/session/${sessionId}/messages`);
  return response.data;
};
