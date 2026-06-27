import api from './api';

export const startSession = async ({ role, level, interviewType, jdText }) => {
  const response = await api.post('/api/interview/start', {
    role,
    level,
    interviewType,
    jdText: jdText || '',
  });
  return response.data;
};

export const sendMessage = async (sessionId, content) => {
  const response = await api.post('/api/interview/message', {
    sessionId,
    content,
  });
  return response.data;
};

export const getSessions = async () => {
  const response = await api.get('/api/interview/sessions');
  return response.data;
};

export const getSessionMessages = async (sessionId) => {
  const response = await api.get(`/api/interview/session/${sessionId}/messages`);
  return response.data;
};

export const endSession = async (sessionId) => {
  await api.post(`/api/interview/end?sessionId=${sessionId}`);
};
