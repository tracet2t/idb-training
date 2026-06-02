const BASE_URL = "http://localhost:3000";

// Get all available fields per entity from backend
export async function getAnalyticsFields() {
  const res = await fetch(`${BASE_URL}/analytics-queries/fields`, {
    credentials: "include",
  });
  if (res.status === 401) { window.location.href = "/login"; return; }
  if (!res.ok) throw new Error("Failed to load fields");
  return res.json();
}

// Run a query with rules and matchMode
export async function runAnalyticsQuery(filterRules, matchMode = "all") {
  const res = await fetch(`${BASE_URL}/analytics-queries/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ filterRules, matchMode }),
  });
  if (res.status === 401) { window.location.href = "/login"; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Query failed");
  return data;
}

// Export results as CSV
export function exportToCsv(rows, filename = "export") {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]).filter(
    (k) => !["enrollments", "rowVersion", "createdById"].includes(k)
  );
  const header = columns.join(",");
  const body = rows.map((r) =>
    columns.map((c) => {
      const v = r[c] ?? "";
      return typeof v === "string" && (v.includes(",") || v.includes("\n"))
        ? `"${v.replace(/"/g, '""')}"`
        : v;
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}