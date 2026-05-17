import api from './api';

// ── GET all enrollments (paginated, filtered) ─────────────────────
export const getEnrollments = async ({
  page = 1,
  limit = 10,
  programId = '',
  participantId = '',
  completionStatus = '',
} = {}) => {
  const params = { page, limit };
  if (programId)        params.programId        = programId;
  if (participantId)    params.participantId    = participantId;
  if (completionStatus) params.completionStatus = completionStatus;

  const response = await api.get('/enrollments', { params });
  return response.data;
};

// ── GET enrollments for a specific program ────────────────────────
export const getEnrollmentsByProgram = async (programId) => {
  const response = await api.get(`/enrollments/program/${programId}`);
  return response.data;
};

// ── GET enrollments for a specific participant ────────────────────
export const getEnrollmentsByParticipant = async (participantId) => {
  const response = await api.get(`/enrollments/participant/${participantId}`);
  return response.data;
};

// ── GET single enrollment ─────────────────────────────────────────
export const getEnrollment = async (id) => {
  const response = await api.get(`/enrollments/${id}`);
  return response.data;
};

// ── CREATE enrollment ─────────────────────────────────────────────
// Required: programId (Int), participantId (Int)
// Optional: completionStatus (enrolled|completed|dropped), ticketPrice (Decimal)
export const createEnrollment = async (data) => {
  const payload = {
    programId:        Number(data.programId),
    participantId:    Number(data.participantId),
    completionStatus: data.completionStatus || 'enrolled',
    ticketPrice:      data.ticketPrice !== '' && data.ticketPrice !== undefined
                        ? Number(data.ticketPrice)
                        : undefined,
  };

  const response = await api.post('/enrollments', payload);
  return response.data;
};

// ── UPDATE enrollment ─────────────────────────────────────────────
// rowVersion is REQUIRED for optimistic concurrency control
export const updateEnrollment = async (id, data) => {
  const payload = {
    rowVersion:       data.rowVersion,                    // ✅ Required - must match DB
    completionStatus: data.completionStatus,              // ✅ CompletionStatus enum
    ticketPrice:      data.ticketPrice !== '' && data.ticketPrice !== undefined
                        ? Number(data.ticketPrice)
                        : undefined,
  };

  const response = await api.put(`/enrollments/${id}`, payload);
  return response.data;
};

// ── DELETE enrollment ─────────────────────────────────────────────
export const deleteEnrollment = async (id) => {
  const response = await api.delete(`/enrollments/${id}`);
  return response.data;
};

// ── CONSTANTS (export for use in ProgramEnrollments.jsx) ──────────
// ✅ Matches backend CompletionStatus enum exactly
export const COMPLETION_STATUSES = ['enrolled', 'completed', 'dropped'];