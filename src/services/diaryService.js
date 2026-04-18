import api from './api';

const API_BASE = '/api/diary';

export const diaryService = {
  // Field Notes CRUD Operations
  getFieldNotes: async (userId) => {
    return api.get(`${API_BASE}/field-notes?userId=${userId}`);
  },

  createFieldNote: async (data) => {
    return api.post(`${API_BASE}/field-notes`, data);
  },

  updateFieldNote: async (id, data) => {
    return api.put(`${API_BASE}/field-notes/${id}`, data);
  },

  deleteFieldNote: async (id) => {
    return api.delete(`${API_BASE}/field-notes/${id}`);
  },

  // Photo Attachments Operations
  uploadPhoto: async (file, noteId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('noteId', noteId);
    return api.post(`${API_BASE}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getPhotos: async (noteId) => {
    return api.get(`${API_BASE}/photos?noteId=${noteId}`);
  },

  deletePhoto: async (photoId) => {
    return api.delete(`${API_BASE}/photos/${photoId}`);
  },

  // Service Reports CRUD Operations
  getServiceReports: async (userId) => {
    return api.get(`${API_BASE}/service-reports?userId=${userId}`);
  },

  createServiceReport: async (data) => {
    return api.post(`${API_BASE}/service-reports`, data);
  },

  updateServiceReport: async (id, data) => {
    return api.put(`${API_BASE}/service-reports/${id}`, data);
  },

  deleteServiceReport: async (id) => {
    return api.delete(`${API_BASE}/service-reports/${id}`);
  },

  // Calendar Events CRUD Operations
  getCalendarEvents: async (userId, month, year) => {
    return api.get(
      `${API_BASE}/events?userId=${userId}&month=${month}&year=${year}`
    );
  },

  createCalendarEvent: async (data) => {
    return api.post(`${API_BASE}/events`, data);
  },

  updateCalendarEvent: async (id, data) => {
    return api.put(`${API_BASE}/events/${id}`, data);
  },

  deleteCalendarEvent: async (id) => {
    return api.delete(`${API_BASE}/events/${id}`);
  },

  getEventsByDate: async (userId, date) => {
    return api.get(`${API_BASE}/events-by-date?userId=${userId}&date=${date}`);
  },
};

export default diaryService;
