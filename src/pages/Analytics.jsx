import { useState } from "react";
import { Bell, Filter, Plus, Trash2, Play, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import Sidebar from "../components/Sidebar";

const BASE_URL = "http://localhost:3000/api";

const colors = {
  navyMain: '#1a3a5c',
  navyPale: '#B0D4F1',
  idbRed: '#8B1A1A',
  idbGold: '#C8960C',
  pageBg: '#f0f4f8',
  cardBg: '#ffffff',
};

const FIELD_OPTIONS = [
  { value: 'participants', label: 'Participants', endpoint: '/participants' },
  { value: 'programs',     label: 'Programs',     endpoint: '/programs' },
  { value: 'enrollments',  label: 'Enrollments',  endpoint: '/enrollments' },
];

const FILTER_FIELDS = {
  participants: [
    { value: 'search',   label: 'Name / Business / Email' },
    { value: 'status',   label: 'Status' },
    { value: 'district', label: 'District' },
    { value: 'sector',   label: 'Sector' },
  ],
  programs: [
    { value: 'search',   label: 'Program Name' },
    { value: 'status',   label: 'Status' },
    { value: 'province', label: 'Province' },
    { value: 'district', label: 'District' },
    { value: 'mode',     label: 'Mode' },
  ],
  enrollments: [
    { value: 'completionStatus', label: 'Completion Status' },
    { value: 'programId',        label: 'Program ID' },
    { value: 'participantId',    label: 'Participant ID' },
  ],
};

// Result table columns per entity
const COLUMNS = {
  participants: ['businessName', 'ownerName', 'phone', 'district', 'sector', 'status'],
  programs:     ['name', 'province', 'district', 'mode', 'status', 'capacity', 'fee'],
  enrollments:  ['id', 'programId', 'participantId', 'completionStatus', 'ticketPrice', 'enrollmentDate'],
};

export default function Analytics() {
  const [matchType, setMatchType] = useState("ALL");
  const [entity, setEntity] = useState("participants");
  const [rules, setRules] = useState([
    { id: 1, not: false, field: "search", value: "" },
  ]);
  const [results, setResults] = useState([]);
  const [resultMeta, setResultMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

  const handleLogout = () => { window.location.href = '/login'; };

  const addRule = () => setRules([...rules, { id: Date.now(), not: false, field: FILTER_FIELDS[entity][0].value, value: "" }]);
  const removeRule = (id) => setRules(rules.filter(r => r.id !== id));
  const updateRule = (id, key, value) => setRules(rules.map(r => r.id === id ? { ...r, [key]: value } : r));

  const handleEntityChange = (e) => {
    setEntity(e.target.value);
    setRules([{ id: 1, not: false, field: FILTER_FIELDS[e.target.value][0].value, value: "" }]);
    setResults([]);
    setHasRun(false);
  };

  const runQuery = async () => {
    setLoading(true);
    setError('');
    setHasRun(true);
    try {
      const endpoint = FIELD_OPTIONS.find(f => f.value === entity)?.endpoint;
      const params = new URLSearchParams({ page: 1, limit: 50 });

      rules.forEach(rule => {
        if (rule.value) {
          // If NOT rule, we still pass the param — backend filtering handles it
          params.append(rule.field, rule.value);
        }
      });

      const res = await fetch(`${BASE_URL}${endpoint}?${params}`, {
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (!res.ok) throw new Error('Query failed');
      const json = await res.json();
      setResults(json.data || []);
      setResultMeta(json.meta || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = COLUMNS[entity] || [];

  return (
    <div className="dashboard-container">
      <Sidebar handleLogout={handleLogout} />

      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>ANALYTICS</h1>
            <p className="header-subtitle">Build queries to segment and analyze data.</p>
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Notifications"><Bell size={20} /></button>
          </div>
        </header>

        <main style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Query Builder Card */}
          <div className="rounded-xl border p-6" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>

            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: colors.idbGold }} />
                <span className="font-semibold text-base" style={{ color: colors.navyMain }}>Query Builder</span>
              </div>

              {/* Entity selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Query:</span>
                <Select value={entity} onChange={handleEntityChange}>
                  {FIELD_OPTIONS.map(f => <SelectOption key={f.value} value={f.value}>{f.label}</SelectOption>)}
                </Select>
              </div>

              {/* Match type */}
              <div className="flex items-center gap-2">
                {["ALL", "ANY"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMatchType(type)}
                    className="px-3 py-1.5 text-sm rounded border transition-colors"
                    style={matchType === type
                      ? { backgroundColor: colors.navyPale, color: colors.navyMain, borderColor: colors.navyMain, fontWeight: 600 }
                      : { backgroundColor: 'transparent', color: '#6b7280', borderColor: '#e2e8f0' }}
                  >
                    Match {type} ({type === "ALL" ? "AND" : "OR"})
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="flex flex-col gap-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg border" style={{ borderColor: '#e2e8f0' }}>

                  {/* NOT toggle — simple styled button, NOT a checkbox */}
                  <button
                    onClick={() => updateRule(rule.id, 'not', !rule.not)}
                    className="px-2.5 py-1 rounded text-xs font-semibold border transition-colors"
                    style={rule.not
                      ? { backgroundColor: colors.idbRed, color: '#fff', borderColor: colors.idbRed }
                      : { backgroundColor: 'transparent', color: '#9ca3af', borderColor: '#e2e8f0' }}
                  >
                    NOT
                  </button>

                  {/* Field selector */}
                  <Select
                    value={rule.field}
                    onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
                    style={{ flex: '0 1 180px' }}
                  >
                    {(FILTER_FIELDS[entity] || []).map(f => (
                      <SelectOption key={f.value} value={f.value}>{f.label}</SelectOption>
                    ))}
                  </Select>

                  {/* Value input */}
                  <Input
                    style={{ flex: '1 1 160px' }}
                    placeholder="Enter value..."
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                  />

                  {/* Remove */}
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-2 rounded hover:bg-red-50 transition-colors shrink-0"
                    disabled={rules.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={addRule}
                className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
                style={{ color: colors.navyMain }}
              >
                <Plus className="w-4 h-4" style={{ color: colors.idbGold }} />
                Add Rule
              </button>
              <Button
                className="text-white gap-2 hover:opacity-90"
                style={{ backgroundColor: colors.idbRed }}
                onClick={runQuery}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
                  : <><Play className="w-4 h-4 fill-white" /> Run Query</>}
              </Button>
            </div>
          </div>

          {/* Results */}
          {hasRun && (
            <div className="rounded-xl border flex flex-col overflow-hidden" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#e2e8f0' }}>
                <span className="font-semibold text-sm" style={{ color: colors.navyMain }}>
                  Results — {entity.charAt(0).toUpperCase() + entity.slice(1)}
                </span>
                {resultMeta && (
                  <span className="text-xs text-gray-500">
                    {resultMeta.total} record{resultMeta.total !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center justify-center py-10 gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && results.length === 0 && (
                <div className="flex items-center justify-center py-10">
                  <span className="text-gray-400 text-sm">No results found for this query.</span>
                </div>
              )}

              {/* Table */}
              {!loading && !error && results.length > 0 && (
                <div className="overflow-auto">
                  {/* Table header */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                      minWidth: '600px',
                      backgroundColor: colors.pageBg,
                      borderBottom: '1px solid #e2e8f0',
                      padding: '10px 16px',
                      position: 'sticky', top: 0, zIndex: 5
                    }}
                  >
                    {columns.map(col => (
                      <div key={col} className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.navyMain }}>
                        {col.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {results.map((row, index) => (
                    <div
                      key={row.id || index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                        minWidth: '600px',
                        padding: '10px 16px',
                        borderBottom: index < results.length - 1 ? '1px solid #e2e8f0' : 'none',
                        alignItems: 'center'
                      }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columns.map(col => (
                        <div key={col} className="text-sm text-gray-600 truncate">
                          {col === 'status' || col === 'completionStatus' ? (
                            <Badge style={
                              row[col] === 'active' || row[col] === 'enrolled'
                                ? { backgroundColor: '#dcfce7', color: '#16a34a', textTransform: 'capitalize' }
                                : row[col] === 'completed'
                                ? { backgroundColor: '#e0f2fe', color: '#0369a1', textTransform: 'capitalize' }
                                : { backgroundColor: '#fee2e2', color: '#991b1b', textTransform: 'capitalize' }
                            }>
                              {row[col] || '—'}
                            </Badge>
                          ) : col.includes('Date') || col.includes('At') ? (
                            row[col] ? new Date(row[col]).toLocaleDateString() : '—'
                          ) : (
                            row[col] ?? '—'
                          )}
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