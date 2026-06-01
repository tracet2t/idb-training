import { useState } from 'react';
import { Plus, Play, Loader2, AlertCircle, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RuleRow from './RuleRow';
import ConnectorPill from './ConnectorPill';

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  navyMain: '#1a3a5c',
  navyPale: '#B0D4F1',
  idbRed: '#8B1A1A',
  idbGold: '#C8960C',
  pageBg: '#f0f4f8',
  cardBg: '#ffffff',
};

const COLUMNS = {
  Participants: ['businessName', 'ownerName', 'phone', 'district', 'sector', 'status'],
  Programs: ['name', 'province', 'district', 'mode', 'status', 'capacity', 'fee'],
  Enrollments: ['id', 'programId', 'participantId', 'completionStatus', 'ticketPrice', 'enrollmentDate'],
};

const MODULE_ENDPOINTS = {
  Participants: '/participants',
  Programs: '/programs',
  Enrollments: '/enrollments',
};

export default function QueryBuilder() {
  const [rules, setRules] = useState([
    { id: '1', module: 'Participants', field: 'search', value: '', connector: null }
  ]);
  const [results, setResults] = useState([]);
  const [resultMeta, setResultMeta] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

  const addRuleForModule = (module) => {
    const newRule = {
      id: `${Date.now()}-${Math.random()}`,
      module,
      field: module === 'Participants' ? 'search' : module === 'Programs' ? 'search' : 'completionStatus',
      value: '',
      connector: rules.length > 0 ? 'AND' : null,
    };
    setRules([...rules, newRule]);
    setActiveModule(null);
  };

  const deleteRule = (id) => {
    if (rules.length === 1) return;
    const newRules = rules.filter(r => r.id !== id);
    // If deleted rule had a connector, remove it from the next rule
    if (newRules.length > 0 && newRules[0].connector) {
      newRules[0].connector = null;
    }
    setRules(newRules);
  };

  const updateRule = (id, key, value) => {
    setRules(rules.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  const updateConnector = (index, connector) => {
    const newRules = [...rules];
    newRules[index].connector = connector;
    setRules(newRules);
  };

  const runQuery = async () => {
    setLoading(true);
    setError('');
    setHasRun(true);

    try {
      // Build query payload
      const query = {
        rules: rules.map(r => ({
          module: r.module,
          field: r.field,
          value: r.value,
        })),
        connectors: rules.slice(1).map(r => r.connector),
      };

      // Validate all rules have values
      if (query.rules.some(r => !r.value)) {
        throw new Error('All rules must have values');
      }

      // Call backend
      const res = await fetch(`${BASE_URL}/analytics-queries/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(query),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Query failed');
      }

      const json = await res.json();
      setResults(json.data || []);
      setResultMeta(json.meta || null);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Query Builder Card */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: colors.idbGold }} />
            <span className="text-lg font-semibold" style={{ color: colors.navyMain }}>
              Query Builder
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {rules.length} rule{rules.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Rules with Connectors */}
        <div className="space-y-3 mb-6">
          {rules.map((rule, idx) => (
            <div key={rule.id}>
              <RuleRow
                rule={rule}
                onUpdate={(key, value) => updateRule(rule.id, key, value)}
                onDelete={deleteRule}
                canDelete={rules.length > 1}
                colors={colors}
              />

              {/* Connector Pill (between rules) */}
              {idx < rules.length - 1 && (
                <div className="flex justify-center py-2">
                  <ConnectorPill
                    value={rules[idx + 1].connector}
                    onChange={(connector) => updateConnector(idx + 1, connector)}
                    colors={colors}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Rule Buttons */}
        <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b" style={{ borderColor: '#e2e8f0' }}>
          {['Participants', 'Programs', 'Enrollments'].map(module => (
            <button
              key={module}
              onClick={() => addRuleForModule(module)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all hover:shadow-sm"
              style={{
                backgroundColor: activeModule === module ? colors.navyPale : 'transparent',
                color: activeModule === module ? colors.navyMain : '#6b7280',
                borderColor: activeModule === module ? colors.navyPale : '#e2e8f0',
              }}
            >
              <Plus size={16} />
              + {module} rule
            </button>
          ))}
        </div>

        {/* Run Query Button */}
        <div className="flex justify-end">
          <Button
            className="text-white gap-2 hover:opacity-90 font-semibold"
            style={{ backgroundColor: colors.idbRed }}
            onClick={runQuery}
            disabled={loading || rules.some(r => !r.value)}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
              : <><Play className="w-4 h-4 fill-white" /> Run Query</>}
          </Button>
        </div>
      </div>

      {/* Results Card */}
      {hasRun && (
        <div className="rounded-xl border mt-6 flex flex-col overflow-hidden" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e2e8f0' }}>
            <span className="font-semibold text-base" style={{ color: colors.navyMain }}>
              Results
            </span>
            {resultMeta && (
              <span className="text-sm text-gray-500">
                {resultMeta.total} record{resultMeta.total !== 1 ? 's' : ''} found
              </span>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12 gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && results.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-400 text-sm">No results found for this query.</span>
            </div>
          )}

          {/* Results Table */}
          {!loading && !error && results.length > 0 && (
            <ResultsTable results={results} rules={rules} colors={colors} />
          )}
        </div>
      )}
    </div>
  );
}

function ResultsTable({ results, rules, colors }) {
  // Determine which columns to show based on modules used
  const modules = [...new Set(rules.map(r => r.module))];
  let columns = [];
  modules.forEach(m => {
    columns = [...new Set([...columns, ...COLUMNS[m]])];
  });

  return (
    <div className="overflow-auto">
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          minWidth: '600px',
          backgroundColor: colors.pageBg,
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        {columns.map(col => (
          <div key={col} className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.navyMain }}>
            {col.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        ))}
      </div>

      {/* Rows */}
      {results.map((row, idx) => (
        <div
          key={row.id || idx}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            minWidth: '600px',
            padding: '12px 16px',
            borderBottom: idx < results.length - 1 ? '1px solid #e2e8f0' : 'none',
            alignItems: 'center',
          }}
          className="hover:bg-gray-50 transition-colors"
        >
          {columns.map(col => (
            <div key={col} className="text-sm text-gray-700 truncate">
              {col === 'status' || col === 'completionStatus' ? (
                <Badge style={{
                  backgroundColor: row[col] === 'active' || row[col] === 'Active' || row[col] === 'enrolled'
                    ? '#dcfce7'
                    : row[col] === 'completed' || row[col] === 'Completed'
                    ? '#e0f2fe'
                    : '#fee2e2',
                  color: row[col] === 'active' || row[col] === 'Active' || row[col] === 'enrolled'
                    ? '#16a34a'
                    : row[col] === 'completed' || row[col] === 'Completed'
                    ? '#0369a1'
                    : '#991b1b',
                  textTransform: 'capitalize',
                }}>
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
  );
}
