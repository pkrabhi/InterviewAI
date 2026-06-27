import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const saveToken = async (token) => {
  await AsyncStorage.setItem('jwt_token', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('jwt_token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('jwt_token');
  await AsyncStorage.removeItem('user_data');
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem('user_data', JSON.stringify(user));
};

export const getUser = async () => {
  const data = await AsyncStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

export const googleLogin = async (idToken) => {
  const response = await api.post('/api/auth/google', { idToken });
  const { token, name, email, avatarUrl, plan } = response.data;
  await saveToken(token);
  await saveUser({ name, email, avatarUrl, plan });
  return response.data;
};

export const emailRegister = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  const { token, name: n, email: e, avatarUrl, plan } = response.data;
  await saveToken(token);
  await saveUser({ name: n, email: e, avatarUrl, plan });
  return response.data;
};

export const emailLogin = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  const { token, name, email: em, avatarUrl, plan } = response.data;
  await saveToken(token);
  await saveUser({ name, email: em, avatarUrl, plan });
  return response.data;
};

export const devLogin = async () => {
  const response = await api.post('/api/auth/dev-login');
  const { token, name, email, avatarUrl, plan } = response.data;
  await saveToken(token);
  await saveUser({ name, email, avatarUrl, plan });
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (_) {}
  await removeToken();
};

export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};
