import { useState, useEffect, useCallback } from "react";
import { Search, Bell, Plus, Pencil, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const DISTRICTS = [
  'Colombo','Gampaha','Kurunegala','Kandy','Matale','Nuwara_Eliya',
  'Galle','Matara','Hambantota','Ampara','Trincomalee','Batticaloa',
  'Mullaitivu','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle','Jaffna','Kilinochchi','Mannar','Vavuniya'
];

// ── Add Participant Dialog ──────────────────────────────────────────
function AddParticipantDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    businessName: '', ownerName: '', email: '',
    phone: '', district: '', sector: '', registrationNumber: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError('');
    if (!form.businessName || !form.ownerName || !form.email || !form.phone || !form.district || !form.sector || !form.registrationNumber) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create participant');
      }
      setOpen(false);
      setForm({ businessName: '', ownerName: '', email: '', phone: '', district: '', sector: '', registrationNumber: '' });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white gap-2 hover:opacity-90" style={{ backgroundColor: colors.idbRed }}>
          <Plus className="w-4 h-4" /> Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ color: colors.navyMain }}>Add New Participant</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Business Name *</label>
              <Input name="businessName" placeholder="e.g. Perera Textiles Pvt Ltd" value={form.businessName} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Owner Name *</label>
              <Input name="ownerName" placeholder="Full name of owner" value={form.ownerName} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
              <Input name="email" type="email" placeholder="email@business.lk" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
              <Input name="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">District *</label>
              <Select name="district" value={form.district} onChange={handleChange}>
                <SelectOption value="">Select district</SelectOption>
                {DISTRICTS.map(d => <SelectOption key={d} value={d}>{d.replace('_', ' ')}</SelectOption>)}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sector *</label>
              <Input name="sector" placeholder="e.g. Manufacturing" value={form.sector} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Registration Number *</label>
              <Input name="registrationNumber" placeholder="e.g. PV00123456" value={form.registrationNumber} onChange={handleChange} />
            </div>
          </div>
          <Button
            className="text-white w-full hover:opacity-90 mt-1"
            style={{ backgroundColor: colors.idbRed }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Participant'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Participant Dialog ─────────────────────────────────────────
function EditParticipantDialog({ participant, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});

  useEffect(() => {
    if (participant) setForm({ ...participant });
  }, [participant]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/participants/${participant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rowVersion: form.rowVersion,
          businessName: form.businessName,
          ownerName: form.ownerName,
          email: form.email,
          phone: form.phone,
          district: form.district,
          sector: form.sector,
          registrationNumber: form.registrationNumber,
          status: form.status,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 422 || res.status === 409) throw new Error('This record was updated by someone else. Please refresh and try again.');
        throw new Error(data.message || 'Update failed');
      }
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1 rounded hover:bg-gray-100">
          <Pencil className="w-4 h-4" style={{ color: colors.idbGold }} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ color: colors.navyMain }}>Edit Participant</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Business Name</label>
              <Input name="businessName" value={form.businessName || ''} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Owner Name</label>
              <Input name="ownerName" value={form.ownerName || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <Input name="email" value={form.email || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
              <Input name="phone" value={form.phone || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">District</label>
              <Select name="district" value={form.district || ''} onChange={handleChange}>
                {DISTRICTS.map(d => <SelectOption key={d} value={d}>{d.replace('_', ' ')}</SelectOption>)}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <Select name="status" value={form.status || ''} onChange={handleChange}>
                <SelectOption value="active">Active</SelectOption>
                <SelectOption value="inactive">Inactive</SelectOption>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sector</label>
              <Input name="sector" value={form.sector || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Reg. Number</label>
              <Input name="registrationNumber" value={form.registrationNumber || ''} onChange={handleChange} />
            </div>
          </div>
          <Button
            className="text-white w-full hover:opacity-90 mt-1"
            style={{ backgroundColor: colors.idbRed }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
const colStyle = "1.5fr 1.5fr 130px 120px 100px 100px 70px";

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const handleLogout = () => { window.location.href = '/login'; };

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (districtFilter) params.append('district', districtFilter);

      const res = await fetch(`${BASE_URL}/participants?${params}`, {
        credentials: 'include',
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (!res.ok) throw new Error('Failed to load participants');
      const json = await res.json();
      setParticipants(json.data || []);
      setMeta(json.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, districtFilter]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  // Search on Enter or after 500ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusChange = (e) => { setStatusFilter(e.target.value); setPage(1); };
  const handleDistrictChange = (e) => { setDistrictFilter(e.target.value); setPage(1); };
  const handleLimitChange = (e) => { setLimit(Number(e.target.value)); setPage(1); };

  const startRecord = ((page - 1) * limit) + 1;
  const endRecord = Math.min(page * limit, meta.total);

  return (
    <div className="dashboard-container">
      <Sidebar handleLogout={handleLogout} />

      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>PARTICIPANTS</h1>
            <p className="header-subtitle">Manage SME owners and training attendees.</p>
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Notifications"><Bell size={20} /></button>
            <AddParticipantDialog onSuccess={fetchParticipants} />
          </div>
        </header>

        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'hidden' }}>

          {/* Search & Filters */}
          <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="relative" style={{ flex: '1 1 220px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search by business, owner or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={handleStatusChange} style={{ flex: '0 1 140px' }}>
              <SelectOption value="">All Statuses</SelectOption>
              <SelectOption value="active">Active</SelectOption>
              <SelectOption value="inactive">Inactive</SelectOption>
            </Select>
            <Select value={districtFilter} onChange={handleDistrictChange} style={{ flex: '0 1 160px' }}>
              <SelectOption value="">All Districts</SelectOption>
              {DISTRICTS.map(d => <SelectOption key={d} value={d}>{d.replace('_', ' ')}</SelectOption>)}
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="flex-1 overflow-auto">

              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: colStyle, minWidth: '800px', backgroundColor: colors.pageBg, borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 5 }}>
                {['Business Name', 'Owner', 'Phone', 'District', 'Status', 'Sector', 'Actions'].map((col) => (
                  <div key={col} className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.navyMain }}>{col}</div>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16 gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.idbRed }} />
                  <span className="text-sm text-gray-500">Loading participants...</span>
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
              {!loading && !error && participants.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <span className="text-gray-400 text-sm">No participants found.</span>
                </div>
              )}

              {/* Rows */}
              {!loading && !error && participants.map((p, index) => (
                <div
                  key={p.id}
                  style={{ display: 'grid', gridTemplateColumns: colStyle, minWidth: '800px', padding: '12px 16px', borderBottom: index < participants.length - 1 ? '1px solid #e2e8f0' : 'none', alignItems: 'center' }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium truncate" style={{ color: colors.navyMain }}>{p.businessName}</div>
                  <div className="text-sm text-gray-600 truncate">{p.ownerName}</div>
                  <div className="text-sm text-gray-600">{p.phone}</div>
                  <div className="text-sm text-gray-600">{p.district?.replace('_', ' ')}</div>
                  <div>
                    <Badge style={p.status === "active"
                      ? { backgroundColor: '#dcfce7', color: '#16a34a', textTransform: 'capitalize' }
                      : { backgroundColor: '#fee2e2', color: colors.idbRed, textTransform: 'capitalize' }}>
                      {p.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{p.sector}</div>
                  <div>
                    <EditParticipantDialog participant={p} onSuccess={fetchParticipants} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Standard Pagination ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t shrink-0" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={limit}
                  onChange={handleLimitChange}
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
                  {/* First */}
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                    title="First page"
                  >
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {/* Prev */}
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    title="Previous page"
                  >
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {/* Page indicator */}
                  <span className="text-sm px-2 font-medium" style={{ color: colors.navyMain }}>
                    {page} / {meta.totalPages}
                  </span>
                  {/* Next */}
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    title="Next page"
                  >
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {/* Last */}
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(meta.totalPages)}
                    title="Last page"
                  >
                    <svg className="w-4 h-4" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
                    </svg>
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