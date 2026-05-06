import api from './api';

// ── GET all programs (paginated, filtered) ────────────────────────
export const getPrograms = async ({
  page = 1,
  limit = 10,
  search = '',
  status = '',       // backend enum: upcoming | ongoing | completed | cancelled
  programType = '',  // backend enum: free | ticketed
  district = '',     // backend enum: Colombo | Gampaha | etc.
} = {}) => {
  const params = { page, limit };
  if (search)      params.search      = search;
  if (status)      params.status      = status;
  if (programType) params.programType = programType;
  if (district)    params.district    = district;

  // ✅ Actual backend route is /training-programs (not /programs)
  const response = await api.get('/training-programs', { params });
  return response.data;
};

// ── GET single program ────────────────────────────────────────────
export const getProgram = async (id) => {
  const response = await api.get(`/training-programs/${id}`);
  return response.data;
};

// ── CREATE program ────────────────────────────────────────────────
// Required fields matching TrainingProgram schema:
// title (String), sector (String), district (District enum),
// startDate (DateTime), endDate (DateTime),
// totalBudget (Decimal), createdById (String - NIC)
// Optional: description, status, programType
export const createProgram = async (data) => {
  const payload = {
    title:       data.title,
    description: data.description || undefined,
    sector:      data.sector,
    district:    data.district,
    startDate:   new Date(data.startDate).toISOString(),  // ✅ DateTime
    endDate:     new Date(data.endDate).toISOString(),    // ✅ DateTime
    status:      data.status      || 'upcoming',          // ✅ ProgramStatus enum
    programType: data.programType || 'free',              // ✅ ProgramType enum
    totalBudget: Number(data.totalBudget),                // ✅ Decimal → Number
    createdById: data.createdById,                        // ✅ String (NIC)
  };

  const response = await api.post('/training-programs', payload);
  return response.data;
};

// ── UPDATE program ────────────────────────────────────────────────
// rowVersion is REQUIRED for optimistic concurrency control
export const updateProgram = async (id, data) => {
  const payload = {
    rowVersion:  data.rowVersion,                         // ✅ Required - must match DB
    title:       data.title,
    description: data.description || undefined,
    sector:      data.sector,
    district:    data.district,
    startDate:   data.startDate ? new Date(data.startDate).toISOString() : undefined,
    endDate:     data.endDate   ? new Date(data.endDate).toISOString()   : undefined,
    status:      data.status,                             // ✅ ProgramStatus enum
    programType: data.programType,                        // ✅ ProgramType enum
    totalBudget: data.totalBudget !== undefined ? Number(data.totalBudget) : undefined,
  };

  const response = await api.put(`/training-programs/${id}`, payload);
  return response.data;
};

// ── DELETE program ────────────────────────────────────────────────
export const deleteProgram = async (id) => {
  const response = await api.delete(`/training-programs/${id}`);
  return response.data;
};

// ── CONSTANTS (export for use in Programs.jsx) ────────────────────
// ✅ Matches backend ProgramStatus enum exactly
export const PROGRAM_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

// ✅ Matches backend ProgramType enum exactly
export const PROGRAM_TYPES = ['free', 'ticketed'];

// ✅ Matches backend District enum exactly
export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kaluthara', 'Kurunegala', 'Kandy', 'Matale',
  'Nuwara_Eliya', 'Galle', 'Matara', 'Hambantota', 'Ampara', 'Trincomalee',
  'Batticaloa', 'Mullaitivu', 'Puttalam', 'Anuradhapura', 'Polonnaruwa',
  'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle', 'Jaffna', 'Kilinochchi',
  'Mannar', 'Vavuniya',
];