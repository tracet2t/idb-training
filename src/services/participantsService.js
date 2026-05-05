const BASE_URL = "http://localhost:3000/api";

// ── Type-safe helpers ────────────────────────────────────────────────
const toInt = (val, fallback = undefined) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
};

const toStr = (val) => (val !== null && val !== undefined ? String(val).trim() : "");

const toEnum = (val, allowed, fallback = "") =>
  allowed.includes(String(val)) ? String(val) : fallback;

const DISTRICTS = [
  "Colombo","Gampaha","Kaluthara","Kurunegala","Kandy","Matale","Nuwara_Eliya",
  "Galle","Matara","Hambantota","Ampara","Trincomalee","Batticaloa","Mullaitivu",
  "Puttalam","Anuradhapura","Polonnaruwa","Badulla","Monaragala","Ratnapura",
  "Kegalle","Jaffna","Kilinochchi","Mannar","Vavuniya",
];

const STATUSES = ["active", "inactive"];

/**
 * Validate & sanitize the create payload.
 * Throws a string error message if anything is wrong.
 */
export function validateCreatePayload(raw) {
  const errors = [];

  const businessName = toStr(raw.businessName);
  const ownerName    = toStr(raw.ownerName);
  const email        = toStr(raw.email);
  const phone        = toStr(raw.phone);
  const district     = toEnum(raw.district, DISTRICTS);
  const sector       = toStr(raw.sector);
  const registrationNumber = toStr(raw.registrationNumber);

  if (!businessName)       errors.push("Business name is required.");
  if (!ownerName)          errors.push("Owner name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                           errors.push("A valid email is required.");
  if (!phone || !/^[0-9+\-\s]{7,15}$/.test(phone))
                           errors.push("A valid phone number is required (7–15 digits).");
  if (!district)           errors.push("A valid district must be selected.");
  if (!sector)             errors.push("Sector is required.");
  if (!registrationNumber) errors.push("Registration number is required.");

  if (errors.length) throw errors.join(" ");

  return { businessName, ownerName, email, phone, district, sector, registrationNumber };
}

/**
 * Validate & sanitize the update payload.
 */
export function validateUpdatePayload(raw) {
  const errors = [];

  const businessName       = toStr(raw.businessName);
  const ownerName          = toStr(raw.ownerName);
  const email              = toStr(raw.email);
  const phone              = toStr(raw.phone);
  const district           = toEnum(raw.district, DISTRICTS);
  const sector             = toStr(raw.sector);
  const registrationNumber = toStr(raw.registrationNumber);
  const status             = toEnum(raw.status, STATUSES);
  const rowVersion         = toInt(raw.rowVersion);

  if (!businessName)       errors.push("Business name is required.");
  if (!ownerName)          errors.push("Owner name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                           errors.push("A valid email is required.");
  if (!phone || !/^[0-9+\-\s]{7,15}$/.test(phone))
                           errors.push("A valid phone number is required.");
  if (!district)           errors.push("A valid district must be selected.");
  if (!sector)             errors.push("Sector is required.");
  if (!registrationNumber) errors.push("Registration number is required.");
  if (!status)             errors.push("Status must be 'active' or 'inactive'.");
  if (rowVersion === undefined) errors.push("Row version is missing — cannot safely update.");

  if (errors.length) throw errors.join(" ");

  return { businessName, ownerName, email, phone, district, sector, registrationNumber, status, rowVersion };
}

// ── API functions ────────────────────────────────────────────────────

/**
 * GET /api/participants
 * Returns { data: Participant[], meta: { total, totalPages } }
 */
export async function fetchParticipants({ page = 1, limit = 10, search = "", status = "", district = "" } = {}) {
  const params = new URLSearchParams({
    page:  String(toInt(page,  1)),
    limit: String(toInt(limit, 10)),
  });
  if (search)   params.append("search",   toStr(search));
  if (status)   params.append("status",   toEnum(status, STATUSES));
  if (district) params.append("district", toEnum(district, DISTRICTS));

  const res = await fetch(`${BASE_URL}/participants?${params}`, { credentials: "include" });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorised");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to load participants.");
  }

  const json = await res.json();

  // Normalise response shape — backend may return raw array or { data, meta }
  if (Array.isArray(json)) {
    return { data: json, meta: { total: json.length, totalPages: 1 } };
  }
  return {
    data: Array.isArray(json.data) ? json.data : [],
    meta: {
      total:      toInt(json.meta?.total,      0),
      totalPages: toInt(json.meta?.totalPages, 1),
    },
  };
}

/**
 * GET /api/participants/:id
 */
export async function fetchParticipantById(id) {
  const safeId = toInt(id);
  if (!safeId) throw new Error("Invalid participant ID.");

  const res = await fetch(`${BASE_URL}/participants/${safeId}`, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Participant not found.");
  }
  return res.json();
}

/**
 * POST /api/participants
 */
export async function createParticipant(raw) {
  const payload = validateCreatePayload(raw); // throws on invalid

  const res = await fetch(`${BASE_URL}/participants`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to create participant.");
  }
  return res.json();
}

/**
 * PATCH /api/participants/:id
 */
export async function updateParticipant(id, raw) {
  const safeId  = toInt(id);
  if (!safeId) throw new Error("Invalid participant ID.");

  const payload = validateUpdatePayload(raw); // throws on invalid

  const res = await fetch(`${BASE_URL}/participants/${safeId}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (res.status === 409 || res.status === 422) {
    throw new Error("This record was updated by someone else. Please refresh and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Update failed.");
  }
  return res.json();
}

/**
 * DELETE /api/participants/:id
 */
export async function deleteParticipant(id) {
  const safeId = toInt(id);
  if (!safeId) throw new Error("Invalid participant ID.");

  const res = await fetch(`${BASE_URL}/participants/${safeId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to delete participant.");
  }
  return true;
}

export { DISTRICTS, STATUSES };