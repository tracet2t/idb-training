import api from './api';

export const getParticipants = async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  const response = await api.get('/participants', { params });
  return response.data;
};

export const getParticipant = async (id) => {
  const response = await api.get(`/participants/${id}`);
  return response.data;
};

export const createParticipant = async (data) => {
  const response = await api.post('/participants', data);
  return response.data;
};

export const updateParticipant = async (id, data) => {
  const response = await api.put(`/participants/${id}`, data);
  return response.data;
};

export const deleteParticipant = async (id) => {
  const response = await api.delete(`/participants/${id}`);
  return response.data;
};