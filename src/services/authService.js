import api from './api';
import { getEmailUsername } from '../utils/userDisplay';

export const normalizeUser = (payload) => {
  const data = payload?.data ?? payload?.user ?? payload;
  if (!data || typeof data !== 'object' || !data.email) return null;

  return {
    sub: data.sub,
    email: data.email,
    role: data.role,
    displayName: getEmailUsername(data.email),
  };
};

export const login = async (email, password) => {
  const loginRes = await api.post('/auth/login', { email, password });
  const profileRes = await api.get('/auth/profile');
  const user = normalizeUser(profileRes.data);

  if (!user) {
    throw new Error('Unable to load user profile after login.');
  }

  return {
    message: loginRes.data?.message,
    user,
  };
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return normalizeUser(response.data);
};
