// analyticsService.js
// All API calls for the Enrollments module (used by the Analytics page).
// Import and use these functions in Analytics.jsx — no fetch() calls needed there.

const BASE_URL = "http://localhost:3000/api";

/**
 * Fetch a paginated, filtered list of enrollments.
 * @param {{ page, limit, completionStatus, programId, participantId }} params
 * @returns {{ data: Enrollment[], meta: { total, page, limit, totalPages } }}
 */
export async function getEnrollments({
  page = 1, limit = 50,
  completionStatus = "",
  programId = "",
  participantId = "",
} = {}) {
  const params = new URLSearchParams({ page, limit });
  if (completionStatus) params.append("completionStatus", completionStatus);
  if (programId)        params.append("programId",        programId);
  if (participantId)    params.append("participantId",    participantId);

  const res = await fetch(`${BASE_URL}/enrollments?${params}`, { credentials: "include" });
  if (res.status === 401) { window.location.href = "/login"; return; }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load enrollments");
  }
  return res.json(); // { data, meta }
}

/**
 * Fetch a single enrollment by ID.
 * @param {number} id
 * @returns {Enrollment}
 */
export async function getEnrollmentById(id) {
  const res = await fetch(`${BASE_URL}/enrollments/${id}`, { credentials: "include" });
  if (res.status === 401) { window.location.href = "/login"; return; }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Enrollment not found");
  }
  return res.json();
}

/**
 * Create a new enrollment (link participant to a program).
 * Roles allowed: system_admin, epo_do, ma_clerk
 *
 * @param {{ programId, participantId, ticketPrice?, completionStatus? }} body
 * @returns {Enrollment}  // 201 Created
 */
export async function createEnrollment(body) {
  const res = await fetch(`${BASE_URL}/enrollments`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401) { window.location.href = "/login"; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to create enrollment");
  return data;
}

/**
 * Update an existing enrollment.
 * rowVersion is REQUIRED — must come from the last GET response.
 * Throws a user-friendly message on 422 (optimistic concurrency conflict).
 *
 * @param {number} id
 * @param {{ rowVersion, completionStatus? }} body
 * @returns {Enrollment}
 */
export async function updateEnrollment(id, body) {
  const res = await fetch(`${BASE_URL}/enrollments/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401) { window.location.href = "/login"; return; }
  const data = await res.json().catch(() => ({}));
  if (res.status === 422) {
    throw new Error("This record was updated by someone else. Please refresh and try again.");
  }
  if (!res.ok) throw new Error(data.message || "Update failed");
  return data;
}

/**
 * Delete an enrollment by ID.
 * Role allowed: system_admin only.
 *
 * @param {number} id
 */
export async function deleteEnrollment(id) {
  const res = await fetch(`${BASE_URL}/enrollments/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 401) { window.location.href = "/login"; return; }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete enrollment");
  }
}

// ─── Generic query runner used by the Analytics query builder ────────────────

/**
 * Run an analytics query against participants, programs, or enrollments.
 * Automatically maps to the correct endpoint and passes the rule filters.
 *
 * @param {"participants"|"programs"|"enrollments"} entity
 * @param {Array<{ field: string, value: string }>} rules  — only rules with a value are sent
 * @param {{ page?, limit? }} pagination
 * @returns {{ data: object[], meta: object }}
 */
export async function runAnalyticsQuery(entity, rules, { page = 1, limit = 50 } = {}) {
  const ENDPOINTS = {
    participants: "/participants",
    programs:     "/programs",
    enrollments:  "/enrollments",
  };

  const endpoint = ENDPOINTS[entity];
  if (!endpoint) throw new Error(`Unknown entity: ${entity}`);

  const params = new URLSearchParams({ page, limit });
  rules.forEach(({ field, value }) => {
    if (value) params.append(field, value);
  });

  const res = await fetch(`${BASE_URL}${endpoint}?${params}`, { credentials: "include" });
  if (res.status === 401) { window.location.href = "/login"; return; }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Query failed");
  }
  return res.json();
}