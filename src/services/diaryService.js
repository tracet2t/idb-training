import api from './api';

const EVENTS_BASE = '/diary-events';

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const mapLegacyEventPayload = (data = {}) => {
  const eventDate = data.eventDate || data.date || data.dateTime?.split('T')[0];
  const eventTime =
    data.eventTime ||
    data.time ||
    data.dateTime?.split('T')[1]?.slice(0, 5) ||
    undefined;

  return {
    title: data.title,
    description: data.description,
    eventDate,
    eventTime,
    color: data.color,
    rowVersion: data.rowVersion,
  };
};

const unsupportedApiError = (featureName) =>
  Promise.reject(
    new Error(
      `${featureName} endpoints are not available in the current backend API. Use diary-events endpoints instead.`
    )
  );

export const diaryService = {
  // Deprecated: not available in current backend API docs
  getFieldNotes: async (userId) => {
    void userId;
    return unsupportedApiError('Field notes');
  },

  createFieldNote: async (data) => {
    void data;
    return unsupportedApiError('Field notes');
  },

  updateFieldNote: async (id, data) => {
    void id;
    void data;
    return unsupportedApiError('Field notes');
  },

  deleteFieldNote: async (id) => {
    void id;
    return unsupportedApiError('Field notes');
  },

  // Diary Events API (backend-aligned)
  getDiaryEvents: async (params = {}) => {
    const query = buildQueryString(params);
    return api.get(`${EVENTS_BASE}${query}`);
  },

  getDiaryEventsByUser: async (userId, params = {}) => {
    const query = buildQueryString(params);
    return api.get(`${EVENTS_BASE}/user/${userId}${query}`);
  },

  getDiaryEventById: async (id) => {
    return api.get(`${EVENTS_BASE}/${id}`);
  },

  createDiaryEvent: async (data) => {
    return api.post(`${EVENTS_BASE}`, data);
  },

  updateDiaryEvent: async (id, data) => {
    if (data?.rowVersion === undefined || data?.rowVersion === null) {
      throw new Error('rowVersion is required when updating a diary event.');
    }
    return api.put(`${EVENTS_BASE}/${id}`, data);
  },

  deleteDiaryEvent: async (id) => {
    return api.delete(`${EVENTS_BASE}/${id}`);
  },

  // Diary Attachments API (nested under event)
  getAttachments: async (eventId) => {
    return api.get(`${EVENTS_BASE}/${eventId}/attachments`);
  },

  getAttachmentById: async (eventId, attachmentId) => {
    return api.get(`${EVENTS_BASE}/${eventId}/attachments/${attachmentId}`);
  },

  uploadAttachment: async (eventId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`${EVENTS_BASE}/${eventId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAttachment: async (eventId, attachmentId) => {
    return api.delete(`${EVENTS_BASE}/${eventId}/attachments/${attachmentId}`);
  },

  // Legacy compatibility wrappers for existing frontend callers
  uploadPhoto: async (file, noteId) => {
    return diaryService.uploadAttachment(noteId, file);
  },

  getPhotos: async (noteId) => {
    return diaryService.getAttachments(noteId);
  },

  deletePhoto: async (photoId, noteId) => {
    if (!noteId) {
      throw new Error('noteId (eventId) is required to delete an attachment.');
    }
    return diaryService.deleteAttachment(noteId, photoId);
  },

  // Deprecated: not available in current backend API docs
  getServiceReports: async (userId) => {
    void userId;
    return unsupportedApiError('Service reports');
  },

  createServiceReport: async (data) => {
    void data;
    return unsupportedApiError('Service reports');
  },

  updateServiceReport: async (id, data) => {
    void id;
    void data;
    return unsupportedApiError('Service reports');
  },

  deleteServiceReport: async (id) => {
    void id;
    return unsupportedApiError('Service reports');
  },

  // Legacy calendar wrappers now point to /diary-events
  getCalendarEvents: async (userId, month, year) => {
    void userId;
    const query = {
      page: 1,
      limit: 100,
    };

    if (month && year) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      query.dateFrom = monthStart.toISOString().split('T')[0];
      query.dateTo = monthEnd.toISOString().split('T')[0];
    }

    return diaryService.getDiaryEvents(query);
  },

  createCalendarEvent: async (data) => {
    const mapped = mapLegacyEventPayload(data);
    return diaryService.createDiaryEvent(mapped);
  },

  updateCalendarEvent: async (id, data) => {
    const mapped = mapLegacyEventPayload(data);

    if (mapped.rowVersion === undefined || mapped.rowVersion === null) {
      const currentEvent = await diaryService.getDiaryEventById(id);
      mapped.rowVersion = currentEvent?.data?.rowVersion;
    }

    return diaryService.updateDiaryEvent(id, mapped);
  },

  deleteCalendarEvent: async (id) => {
    return diaryService.deleteDiaryEvent(id);
  },

  getEventsByDate: async (userId, date) => {
    void userId;
    return diaryService.getDiaryEvents({
      page: 1,
      limit: 100,
      dateFrom: date,
      dateTo: date,
    });
  },
};

export default diaryService;
