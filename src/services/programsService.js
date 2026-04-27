import api from './api';

export const getPrograms = async ({ page = 1, limit = 10, status = '' } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  const response = await api.get('/programs', { params });
  return response.data;
};

export const getProgram = async (id) => {
  const response = await api.get(`/programs/${id}`);
  return response.data;
};

export const createProgram = async (data) => {
  const response = await api.post('/programs', data);
  return response.data;
};

export const updateProgram = async (id, data) => {
  const response = await api.put(`/programs/${id}`, data);
  return response.data;
};

export const deleteProgram = async (id) => {
  const response = await api.delete(`/programs/${id}`);
  return response.data;
};