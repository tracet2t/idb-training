import api from './api';

const toInt = (val, fallback = undefined) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
};

const toStr = (val) => (val !== null && val !== undefined ? String(val).trim() : "");

const toEnum = (val, allowed, fallback = "") =>
  allowed.includes(String(val)) ? String(val) : fallback;

const DISTRICTS = [
  "Colombo", "Gampaha", "Kaluthara", "Kurunegala", "Kandy", "Matale", "Nuwara_Eliya",
  "Galle", "Matara", "Hambantota", "Ampara", "Trincomalee", "Batticaloa", "Mullaitivu",
  "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura",
  "Kegalle", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya",
];

const STATUSES = ["active", "inactive"];

export function validateCreatePayload(raw) {
  const errors = [];

  const businessName = toStr(raw.businessName);
  const ownerName = toStr(raw.ownerName);
  const email = toStr(raw.email);
  const phone = toStr(raw.phone);
  const district = toEnum(raw.district, DISTRICTS);
  const sector = toStr(raw.sector);
  const registrationNumber = toStr(raw.registrationNumber);

  if (!businessName) errors.push("Business name is required.");
  if (!ownerName) errors.push("Owner name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required.");
  }
  if (!phone || !/^[0-9+\-\s]{7,15}$/.test(phone)) {
    errors.push("A valid phone number is required (7–15 digits).");
  }
  if (!district) errors.push("A valid district must be selected.");
  if (!sector) errors.push("Sector is required.");
  if (!registrationNumber) errors.push("Registration number is required.");

  if (errors.length) throw new Error(errors.join(" "));

  return { businessName, ownerName, email, phone, district, sector, registrationNumber };
}

export function validateUpdatePayload(raw) {
  const errors = [];

  const businessName = toStr(raw.businessName);
  const ownerName = toStr(raw.ownerName);
  const email = toStr(raw.email);
  const phone = toStr(raw.phone);
  const district = toEnum(raw.district, DISTRICTS);
  const sector = toStr(raw.sector);
  const registrationNumber = toStr(raw.registrationNumber);
  const status = raw.status ? toEnum(raw.status, STATUSES) : undefined;

  if (!businessName) errors.push("Business name is required.");
  if (!ownerName) errors.push("Owner name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required.");
  }
  if (!phone || !/^[0-9+\-\s]{7,15}$/.test(phone)) {
    errors.push("A valid phone number is required.");
  }
  if (!district) errors.push("A valid district must be selected.");
  if (!sector) errors.push("Sector is required.");
  if (!registrationNumber) errors.push("Registration number is required.");
  if (raw.status && !status) errors.push("Status must be 'active' or 'inactive'.");

  if (errors.length) throw new Error(errors.join(" "));

  const payload = {
    businessName,
    ownerName,
    email,
    phone,
    district,
    sector,
    registrationNumber,
  };
  if (status) payload.status = status;

  return payload;
}

function unwrapBody(json) {
  if (json && typeof json === "object" && json.data !== undefined && json.status === "success") {
    return json.data;
  }
  return json;
}

function normalizeListResponse(json) {
  const body = unwrapBody(json);

  if (Array.isArray(body)) {
    return {
      data: body,
      meta: { total: body.length, totalPages: 1 },
    };
  }

  const list = Array.isArray(body?.data) ? body.data : Array.isArray(body?.items) ? body.items : [];

  return {
    data: list,
    meta: {
      total: toInt(body?.meta?.total ?? body?.total, list.length),
      totalPages: toInt(body?.meta?.totalPages ?? body?.totalPages, 1),
    },
  };
}

function getErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (Array.isArray(data?.message)) return data.message.join(" ");
  return data?.message || data?.error || err?.message || fallback;
}

/** GET /participants — page, limit, search, district */
export async function fetchParticipants({ page = 1, limit = 10, search = "", district = "" } = {}) {
  const params = {
    page: String(toInt(page, 1)),
    limit: String(toInt(limit, 10)),
  };
  if (search) params.search = toStr(search);
  if (district) params.district = toEnum(district, DISTRICTS);

  const response = await api.get("/participants", { params });
  return normalizeListResponse(response.data);
}

/** GET /participants/:id */
export async function fetchParticipantById(id) {
  const response = await api.get(`/participants/${id}`);
  return unwrapBody(response.data);
}

/** POST /participants */
export async function createParticipant(raw) {
  const payload = validateCreatePayload(raw);
  const response = await api.post("/participants", payload);
  return unwrapBody(response.data);
}

/** PATCH /participants/:id */
export async function updateParticipant(id, raw) {
  const payload = validateUpdatePayload(raw);

  try {
    const response = await api.patch(`/participants/${id}`, payload);
    return unwrapBody(response.data);
  } catch (err) {
    if (err.response?.status === 409 || err.response?.status === 422) {
      throw new Error("This record was updated by someone else. Please refresh and try again.");
    }
    throw new Error(getErrorMessage(err, "Update failed."));
  }
}

/** DELETE /participants/:id */
export async function deleteParticipant(id) {
  await api.delete(`/participants/${id}`);
  return true;
}

export { DISTRICTS, STATUSES };
