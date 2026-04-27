import { useState, useEffect, useCallback } from "react";
import { Search, Bell, Plus, Eye, Trash2, Loader2, AlertCircle } from "lucide-react";
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

function getStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case "active":
    case "ongoing":     return { backgroundColor: '#dcfce7', color: '#16a34a' };
    case "completed":   return { backgroundColor: '#e0f2fe', color: '#0369a1' };
    case "scheduled":
    case "upcoming":    return { backgroundColor: '#ede9fe', color: '#7c3aed' };
    case "cancelled":   return { backgroundColor: '#fee2e2', color: '#991b1b' };
    default:            return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
}

const colStyle = "2fr 180px 140px 120px 90px 90px";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const handleLogout = () => { window.location.href = '/login'; };

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`${BASE_URL}/programs?${params}`, {
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (!res.ok) throw new Error('Failed to load programs');
      const json = await res.json();
      setPrograms(json.data || []);
      setMeta(json.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const startRecord = ((page - 1) * limit) + 1;
  const endRecord = Math.min(page * limit, meta.total);

  return (
    <div className="dashboard-container">
      <Sidebar handleLogout={handleLogout} />

      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>PROGRAMS</h1>
            <p className="header-subtitle">Manage all SME training initiatives and bootcamps.</p>
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Notifications"><Bell size={20} /></button>
            <Button className="text-white gap-2 hover:opacity-90" style={{ backgroundColor: colors.idbRed }}>
              <Plus className="w-4 h-4" /> Add Program
            </Button>
          </div>
        </header>

        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'hidden' }}>

          {/* Search & Filter Bar */}
          <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="relative" style={{ flex: '1 1 220px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search programs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ flex: '0 1 160px' }}>
              <SelectOption value="">All Statuses</SelectOption>
              <SelectOption value="Scheduled">Scheduled</SelectOption>
              <SelectOption value="Active">Active</SelectOption>
              <SelectOption value="Completed">Completed</SelectOption>
              <SelectOption value="Cancelled">Cancelled</SelectOption>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="flex-1 overflow-auto">

              {/* Header Row */}
              <div style={{ display: 'grid', gridTemplateColumns: colStyle, minWidth: '750px', backgroundColor: colors.pageBg, borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 5 }}>
                {['Program Name', 'District', 'Mode', 'Status', 'Capacity', 'Actions'].map((col) => (
                  <div key={col} className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.navyMain, textAlign: col === 'Capacity' ? 'center' : 'left' }}>{col}</div>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16 gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.idbRed }} />
                  <span className="text-sm text-gray-500">Loading programs...</span>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="flex items-center justify-center py-16 gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && programs.length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-400 text-sm">No programs found.</span>
                </div>
              )}

              {/* Rows */}
              {!loading && !error && programs.map((program, index) => (
                <div
                  key={program.id}
                  style={{ display: 'grid', gridTemplateColumns: colStyle, minWidth: '750px', padding: '12px 16px', borderBottom: index < programs.length - 1 ? '1px solid #e2e8f0' : 'none', alignItems: 'center' }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium truncate" style={{ color: colors.navyMain }}>{program.name}</div>
                  <div className="text-sm text-gray-600">{program.district || program.province || '—'}</div>
                  <div className="text-sm text-gray-600">{program.mode || '—'}</div>
                  <div>
                    <Badge style={getStatusStyle(program.status)}>{program.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 text-center">{program.capacity ?? '—'}</div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 rounded hover:bg-gray-100" title="View">
                      <Eye className="w-4 h-4" style={{ color: colors.idbGold }} />
                    </button>
                    <button className="p-1 rounded hover:bg-red-50" title="Delete">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t shrink-0" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {meta.total === 0 ? '0 results' : `${startRecord}–${endRecord} of ${meta.total}`}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" disabled={page === 1} onClick={() => setPage(1)} title="First">
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" /></svg>
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" disabled={page === 1} onClick={() => setPage(p => p - 1)} title="Previous">
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-sm px-2 font-medium" style={{ color: colors.navyMain }}>{page} / {meta.totalPages || 1}</span>
                  <button className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} title="Next">
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" disabled={page >= meta.totalPages} onClick={() => setPage(meta.totalPages)} title="Last">
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}