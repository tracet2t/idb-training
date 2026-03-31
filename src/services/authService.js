import api from './api';

// LOGIN — sends email and password to backend
export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

// LOGOUT — clears the cookie on backend
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// GET PROFILE — checks if user is still logged in
export const getProfile = async () => {
  const response = await api.post('/auth/profile');
  return response.data;
};