import { useState, useEffect } from "react";
import {
  Bell, Filter, Plus, Trash2, Play,
  Loader2, AlertCircle, Download, Database, SearchX,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getAnalyticsFields, runAnalyticsQuery, exportToCsv } from "../services/analyticsService";
import "../styles/Analytics.css";

// ── Helpers ───────────────────────────────────────────────────────────

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

// ── Change 1: Patch field labels after loading from backend ───────────
// Renames "Program ID" → "Program Name" in the enrollments fields
// without touching Sami's backend code.
function patchFieldLabels(fields) {
  if (!fields?.enrollments) return fields;
  return {
    ...fields,
    enrollments: fields.enrollments.map(f =>
      f.value === "programId" ? { ...f, label: "Program Name" } : f
    ),
  };
}

// ── Value input — renders text, select, date, or number based on field type
function ValueInput({ field, fieldDef, value, onChange }) {
  if (!fieldDef) return (
    <input className="rule-value-input" placeholder="Enter value..." value={value} onChange={e => onChange(e.target.value)} />
  );

  const noValue = ["is empty", "is not empty", "this month", "this year"].includes(field?.op);
  if (noValue) return <span style={{ flex: 2, fontSize: 12, color: "var(--color-text-tertiary, #888)", padding: "0 8px" }}>no value needed</span>;

  if (fieldDef.type === "select" && fieldDef.options) {
    return (
      <select className="rule-value-input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select...</option>
        {fieldDef.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (fieldDef.type === "date") {
    return field?.op === "between"
      ? <input className="rule-value-input" placeholder="2024-01-01, 2024-12-31" value={value} onChange={e => onChange(e.target.value)} />
      : <input className="rule-value-input" type="date" value={value} onChange={e => onChange(e.target.value)} />;
  }

  if (fieldDef.type === "number") {
    return <input className="rule-value-input" type="number" placeholder="Enter number..." value={value} onChange={e => onChange(e.target.value)} />;
  }

  return <input className="rule-value-input" placeholder="Enter value..." value={value} onChange={e => onChange(e.target.value)} />;
}

// ── Main component ────────────────────────────────────────────────────

export default function Analytics() {
  const [fields,    setFields]    = useState(null);
  const [rules,     setRules]     = useState([
    // Change 2: each rule now has its own "connector" property ("AND" | "OR")
    // The connector on rule[idx] is displayed BETWEEN rule[idx] and rule[idx+1].
    // The last rule's connector is unused (no rule follows it).
    { id: 1, entity: "participants", field: "", op: "", value: "", not: false, connector: "AND" },
  ]);
  const [results,  setResults]  = useState([]);
  const [count,    setCount]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [hasRun,   setHasRun]   = useState(false);
  const [fieldsErr, setFieldsErr] = useState("");

  // Load fields on mount
  useEffect(() => {
    getAnalyticsFields()
      .then(data => {
        // Change 1: patch labels before storing in state
        const patched = patchFieldLabels(data);
        setFields(patched);
        if (patched?.participants?.length) {
          const f = patched.participants[0];
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
      connector: "AND",  // new rules default to AND
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
        updated.op = fieldDef?.ops[0] || "";
        updated.value = "";
      }
      if (key === "op") updated.value = "";
      return updated;
    }));
  };

  // Change 2: toggle the connector on a specific rule by index
  const toggleConnector = (ruleId) => {
    setRules(prev => prev.map(r =>
      r.id === ruleId
        ? { ...r, connector: r.connector === "AND" ? "OR" : "AND" }
        : r
    ));
  };

  // Change 2: "Set all" helper — the header ALL/ANY buttons now set every
  // rule's connector at once instead of controlling a global matchMode.
  const setAllConnectors = (connector) => {
    setRules(prev => prev.map(r => ({ ...r, connector })));
  };

  // Derive the "active" state for the header toggle buttons
  const allConnectors = rules.map(r => r.connector);
  const headerActive = allConnectors.every(c => c === "AND") ? "AND"
                     : allConnectors.every(c => c === "OR")  ? "OR"
                     : null;  // null = mixed, neither button is fully active

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
      const validRules = rules.filter(r => r.field && r.op);
      // Change 2: pass per-rule connectors to the service.
      // matchMode is derived from connectors for backward-compat:
      // if all AND → "all", if all OR → "any", else "all" (backend handles mixed via connectors).
      const matchMode = allConnectors.every(c => c === "OR") ? "any" : "all";
      const json = await runAnalyticsQuery(validRules, matchMode);
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
        <header className="dashboard-header">
          <div className="header-left">
            <h1>ANALYTICS</h1>
            <p className="header-subtitle">Build queries to segment and analyse data.</p>
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Notifications"><Bell size={20} /></button>
          </div>
        </header>

        <main className="analytics-main">

          {/* Query Builder Card */}
          <div className="query-card">

            <div className="query-card__header">
              <div className="query-card__title">
                <Filter size={15} style={{ color: "var(--idb-gold)" }} />
                <span className="query-card__title-text">Query conditions</span>
              </div>

              {/* Change 2: header buttons now call setAllConnectors — they set ALL
                  rules at once. Neither is "active" when connectors are mixed. */}
              <div className="match-toggle-group">
                <button
                  className={`match-toggle-btn${headerActive === "AND" ? " active" : ""}`}
                  onClick={() => setAllConnectors("AND")}
                  title="Set all rules to AND"
                >
                  ALL (AND)
                </button>
                <button
                  className={`match-toggle-btn${headerActive === "OR" ? " active" : ""}`}
                  onClick={() => setAllConnectors("OR")}
                  title="Set all rules to OR"
                >
                  ANY (OR)
                </button>
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
                    const fieldDef = getFieldDef(rule.entity, rule.field);
                    const ops = getOpsForRule(rule);

                    return (
                      <div key={rule.id}>
                        <div className="rule-row">
                          <span className="rule-index">{idx + 1}</span>

                          {/* Entity badge */}
                          <span className={`entity-badge entity-badge--${rule.entity}`}>
                            {rule.entity}
                          </span>

                          {/* NOT toggle */}
                          <button
                            className={`not-btn${rule.not ? " active" : ""}`}
                            onClick={() => updateRule(rule.id, "not", !rule.not)}
                          >
                            NOT
                          </button>

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

                          {/* Operator selector */}
                          <select
                            className="rule-op-select"
                            value={rule.op}
                            onChange={e => updateRule(rule.id, "op", e.target.value)}
                          >
                            {ops.map(op => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>

                          {/* Value input */}
                          <ValueInput
                            field={rule}
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

                        {/* Change 2: per-rule connector pill — shown AFTER each rule
                            except the last one. Clicking toggles only THIS rule's connector. */}
                        {idx < rules.length - 1 && (
                          <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
                            <span
                              className="rule-connector"
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleConnector(rule.id)}
                              title="Click to toggle AND / OR"
                            >
                              {rule.connector}
                            </span>
                          </div>
                        )}
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
