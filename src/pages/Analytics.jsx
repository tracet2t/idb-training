import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, Filter, Plus, Trash2, Play,
  Loader2, AlertCircle, Download, Database, SearchX, ChevronDown,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getAnalyticsFields, runAnalyticsQuery, exportToCsv } from "../services/analyticsService";
import "../styles/analytics.css";

// ── Helpers ───────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function humanizeCol(col) {
  return col.replace(/([A-Z])/g, " $1").trim();
}

function StatusBadge({ value }) {
  const v = (value ?? "").toLowerCase();
  let cls = "status-badge";
  if (v === "active" || v === "enrolled") cls += " status-badge--active";
  else if (v === "completed")             cls += " status-badge--completed";
  else if (v)                             cls += " status-badge--other";
  return <span className={cls}>{value || "—"}</span>;
}

const STATUS_COLS = new Set(["status", "completionStatus"]);
const DATE_COLS   = (col) => col.includes("Date") || col.includes("At");

const RESULT_COLUMNS = [
  "businessName", "ownerName", "email", "phone", "district", "sector", "status"
];

const ENTITY_OPTIONS = [
  { value: "participants", label: "Participants" },
  { value: "programs",     label: "Programs"     },
  { value: "enrollments",  label: "Enrollments"  },
];

const CONNECTOR_OPTIONS = ["AND", "OR", "NOT"];

// ── Autocomplete fields (text fields that benefit from search suggestions)
const AUTOCOMPLETE_FIELDS = {
  participants: ["businessName", "ownerName", "email", "phone", "sector"],
  programs:     ["title", "sector"],
  enrollments:  ["programId", "participantId"],
};

// ── Autocomplete hook ─────────────────────────────────────────────────
function useAutocomplete(entity, field, query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }

    setLoading(true);
    try {
      let url = "";
      if (entity === "participants") {
        url = `${API_BASE}/participants/search?q=${encodeURIComponent(q)}`;
      } else if (entity === "programs" || entity === "enrollments") {
        url = `${API_BASE}/programs?search=${encodeURIComponent(q)}&limit=10`;
      }
      if (!url) return;

      const res  = await fetch(url);
      const json = await res.json();

      // Extract the relevant field value for suggestions
      let items = [];
      if (entity === "participants") {
        const rows = Array.isArray(json) ? json : (json.data ?? []);
        items = rows.map(r => r[field]).filter(Boolean);
      } else if (entity === "programs") {
        const rows = json.data ?? [];
        items = rows.map(r => field === "title" ? r.title : r[field]).filter(Boolean);
      } else if (entity === "enrollments") {
        // For programId/participantId: search programs and use their id/title
        const rows = json.data ?? [];
        if (field === "programId") {
          items = rows.map(r => String(r.id));
        } else {
          items = rows.map(r => r.title).filter(Boolean);
        }
      }

      // Deduplicate
      setSuggestions([...new Set(items)].slice(0, 8));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [entity, field]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  return { suggestions, loading };
}

// ── Autocomplete Input ────────────────────────────────────────────────
function AutocompleteInput({ entity, field, value, onChange }) {
  const [open, setOpen]     = useState(false);
  const wrapRef             = useRef(null);
  const { suggestions, loading } = useAutocomplete(entity, field, value);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 2 }}>
      <input
        className="rule-value-input"
        placeholder="Enter value..."
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => value?.length >= 2 && setOpen(true)}
        autoComplete="off"
        style={{ width: "100%" }}
      />
      {loading && (
        <Loader2
          size={12}
          className="spin"
          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#888" }}
        />
      )}
      {open && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="autocomplete-item"
              onMouseDown={() => { onChange(s); setOpen(false); }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Value input — renders text (with autocomplete), select, date, or number
function ValueInput({ rule, fieldDef, value, onChange }) {
  if (!fieldDef) return (
    <input className="rule-value-input" placeholder="Enter value..." value={value} onChange={e => onChange(e.target.value)} style={{ flex: 2 }} />
  );

  const noValue = ["is empty", "is not empty", "this month", "this year"].includes(rule?.op);
  if (noValue) return (
    <span style={{ flex: 2, fontSize: 12, color: "var(--color-text-tertiary, #888)", padding: "0 8px" }}>
      no value needed
    </span>
  );

  if (fieldDef.type === "select" && fieldDef.options) {
    return (
      <select className="rule-value-input" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 2 }}>
        <option value="">Select...</option>
        {fieldDef.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (fieldDef.type === "date") {
    return rule?.op === "between"
      ? <input className="rule-value-input" placeholder="2024-01-01, 2024-12-31" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 2 }} />
      : <input className="rule-value-input" type="date" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 2 }} />;
  }

  if (fieldDef.type === "number") {
    return <input className="rule-value-input" type="number" placeholder="Enter number..." value={value} onChange={e => onChange(e.target.value)} style={{ flex: 2 }} />;
  }

  // Text — check if this field supports autocomplete
  const isAutocomplete = AUTOCOMPLETE_FIELDS[rule.entity]?.includes(rule.field);
  if (isAutocomplete) {
    return <AutocompleteInput entity={rule.entity} field={rule.field} value={value} onChange={onChange} />;
  }

  return <input className="rule-value-input" placeholder="Enter value..." value={value} onChange={e => onChange(e.target.value)} style={{ flex: 2 }} />;
}

// ── Connector Dropdown (AND / OR / NOT) ───────────────────────────────
function ConnectorDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const colorMap = { AND: "#b89030", OR: "#b89030", NOT: "#c0392b" };

  return (
    <div ref={ref} style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
      <div style={{ position: "relative" }}>
        <button
          className="rule-connector connector-dropdown-btn"
          onClick={() => setOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: colorMap[value] ?? "#b89030", borderColor: colorMap[value] ?? "#b89030" }}
        >
          {value}
          <ChevronDown size={11} />
        </button>
        {open && (
          <ul className="connector-dropdown-menu">
            {CONNECTOR_OPTIONS.map(opt => (
              <li
                key={opt}
                className={`connector-dropdown-item${opt === value ? " active" : ""}`}
                onMouseDown={() => { onChange(opt); setOpen(false); }}
                style={{ color: colorMap[opt] }}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export default function Analytics() {
  const [fields,     setFields]     = useState(null);
  const [rules,      setRules]      = useState([
    { id: 1, entity: "participants", field: "", op: "", value: "", not: false, connector: "AND" },
  ]);
  const [results,   setResults]   = useState([]);
  const [count,     setCount]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [hasRun,    setHasRun]    = useState(false);
  const [fieldsErr, setFieldsErr] = useState("");

  // Load fields on mount
  useEffect(() => {
    getAnalyticsFields()
      .then(data => {
        setFields(data);
        if (data?.participants?.length) {
          const f = data.participants[0];
          setRules([{ id: 1, entity: "participants", field: f.value, op: f.ops[0], value: "", not: false, connector: "AND" }]);
        }
      })
      .catch(() => setFieldsErr("Failed to load fields from server."));
  }, []);

  // ── Rule helpers ──────────────────────────────────────────────────

  const addRule = (entity) => {
    if (!fields) return;
    const entityFields = fields[entity] || [];
    const f = entityFields[0];
    setRules(prev => [...prev, {
      id: Date.now(),
      entity,
      field: f?.value || "",
      op: f?.ops[0] || "",
      value: "",
      not: false,
      connector: "AND",
    }]);
  };

  const removeRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const updateRule = (id, key, val) => {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [key]: val };
      if (key === "field" && fields) {
        const entityFields = fields[updated.entity] || [];
        const fieldDef = entityFields.find(f => f.value === val);
        updated.op    = fieldDef?.ops[0] || "";
        updated.value = "";
      }
      if (key === "op") updated.value = "";
      return updated;
    }));
  };

  const updateConnector = (id, connector) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, connector } : r));
  };

  const getFieldDef = (entity, fieldValue) => {
    if (!fields) return null;
    return (fields[entity] || []).find(f => f.value === fieldValue);
  };

  const getOpsForRule = (rule) => {
    const def = getFieldDef(rule.entity, rule.field);
    return def?.ops || [];
  };

  // ── Run query ─────────────────────────────────────────────────────

  const handleRunQuery = async () => {
    setLoading(true);
    setError("");
    setHasRun(true);
    try {
      const validRules = rules.filter(r => r.field);
      // Pass connector per rule; backend uses rule.connector
      const json = await runAnalyticsQuery(validRules, "custom");
      setResults(json.data?.results || []);
      setCount(json.data?.count || 0);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => exportToCsv(results, "participants_query");

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="dashboard-container">
      <Sidebar handleLogout={() => { window.location.href = "/login"; }} />

      <div className="main-content">
       <header className="participants-header">
           <div className="participants-header-left">
                 <h1>ANALYTICS</h1>
                  <p>Build queries to segment and analyse data.</p>
           </div>
           <div className="participants-header-right">
                  <button className="participants-bell-btn" title="Notifications"><Bell size={20} /></button>
           </div>
       </header>

        <main className="analytics-main">

          {/* Query Builder Card */}
          <div className="query-card">

            {/* Header — NO match toggle anymore */}
            <div className="query-card__header">
              <div className="query-card__title">
                <Filter size={15} style={{ color: "var(--idb-gold)" }} />
                <span className="query-card__title-text">Query conditions</span>
              </div>
            </div>

            {fieldsErr && (
              <div className="results-error">
                <AlertCircle size={16} />
                <span>{fieldsErr}</span>
              </div>
            )}

            {!fields && !fieldsErr && (
              <div style={{ padding: "1rem", display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#888" }}>
                <Loader2 size={16} className="spin" /> Loading fields...
              </div>
            )}

            {/* Rules list */}
            {fields && (
              <>
                <div className="rules-list">
                  {rules.map((rule, idx) => {
                    const entityFields = fields[rule.entity] || [];
                    const fieldDef     = getFieldDef(rule.entity, rule.field);
                    const ops          = getOpsForRule(rule);

                    return (
                      <div key={rule.id}>
                        {/* Inline AND/OR/NOT connector between rules */}
                        {idx > 0 && (
                          <ConnectorDropdown
                            value={rule.connector}
                            onChange={(val) => updateConnector(rule.id, val)}
                          />
                        )}

                        <div className="rule-row">
                          <span className="rule-index">{idx + 1}</span>

                          {/* Entity badge */}
                          <span className={`entity-badge entity-badge--${rule.entity}`}>
                            {rule.entity}
                          </span>

                          

                          {/* Field selector */}
                          <select
                            className="rule-field-select"
                            value={rule.field}
                            onChange={e => updateRule(rule.id, "field", e.target.value)}
                          >
                            {entityFields.map(f => (
                              <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                          </select>

                

                          {/* Value input (with autocomplete for text fields) */}
                          <ValueInput
                            rule={rule}
                            fieldDef={fieldDef}
                            value={rule.value}
                            onChange={val => updateRule(rule.id, "value", val)}
                          />

                          {/* Remove */}
                          <button
                            className="remove-rule-btn"
                            onClick={() => removeRule(rule.id)}
                            disabled={rules.length === 1}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add rule buttons */}
                <div className="query-card__add-bar">
                  {ENTITY_OPTIONS.map(e => (
                    <button key={e.value} className="add-rule-btn" onClick={() => addRule(e.value)}>
                      <Plus size={13} style={{ color: "var(--idb-gold)" }} />
                      + {e.label} rule
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="query-card__footer">
                  <button
                    className="run-query-btn"
                    onClick={handleRunQuery}
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 size={14} className="spin" /> Running...</>
                      : <><Play size={14} style={{ fill: "#fff" }} /> Run Query</>}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Results Card */}
          {hasRun && (
            <div className="results-card">
              <div className="results-card__header">
                <div className="results-card__title">
                  <Database size={14} style={{ color: "var(--idb-gold)" }} />
                  Results
                </div>
                <div className="results-card__meta">
                  {!loading && <span className="results-count">{count} record{count !== 1 ? "s" : ""} found</span>}
                  {results.length > 0 && (
                    <button className="export-btn" onClick={handleExport}>
                      <Download size={12} /> Export CSV
                    </button>
                  )}
                </div>
              </div>

              {error && !loading && (
                <div className="results-error">
                  <AlertCircle size={20} style={{ color: "var(--idb-red)" }} />
                  <span className="results-error__text">{error}</span>
                </div>
              )}

              {loading && (
                <div className="results-empty">
                  <Loader2 size={22} className="spin" />
                  <span className="results-empty__text">Running query...</span>
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="results-empty">
                  <SearchX size={20} />
                  <span className="results-empty__text">No records match this query.</span>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <div className="results-table-wrap">
                  <div
                    className="results-table-head"
                    style={{ gridTemplateColumns: `repeat(${RESULT_COLUMNS.length}, 1fr)` }}
                  >
                    {RESULT_COLUMNS.map(col => (
                      <div key={col} className="results-table-head-cell">{humanizeCol(col)}</div>
                    ))}
                  </div>
                  {results.map((row, i) => (
                    <div
                      key={row.id ?? i}
                      className="results-table-row"
                      style={{ gridTemplateColumns: `repeat(${RESULT_COLUMNS.length}, 1fr)` }}
                    >
                      {RESULT_COLUMNS.map(col => (
                        <div key={col} className="results-table-cell">
                          {STATUS_COLS.has(col)
                            ? <StatusBadge value={row[col]} />
                            : DATE_COLS(col)
                              ? row[col] ? new Date(row[col]).toLocaleDateString() : "—"
                              : row[col] ?? "—"}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
