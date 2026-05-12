import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Bell, Plus, Pencil, Trash2, Loader2,
  AlertCircle, X, Building2, User, Mail, Phone,
  MapPin, Briefcase, Hash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import Sidebar from "../components/Sidebar";
import {
  fetchParticipants, createParticipant, updateParticipant, deleteParticipant,
  DISTRICTS, STATUSES,
} from "../services/participantsService";
import "../styles/participants.css";

// ── Constants ─────────────────────────────────────────────────────
const EMPTY_CREATE = {
  businessName: "", ownerName: "", email: "",
  phone: "", district: "", sector: "", registrationNumber: "",
};

// ── Field-level validation ────────────────────────────────────────
function validateForm(form, isEdit = false) {
  const errs = {};
  if (!form.businessName?.trim())       errs.businessName = "Required";
  if (!form.ownerName?.trim())          errs.ownerName    = "Required";
  if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                        errs.email        = "Valid email required";
  if (!form.phone?.trim() || !/^[0-9+\-\s]{7,15}$/.test(form.phone))
                                        errs.phone        = "7–15 digit number";
  if (!form.district)                   errs.district     = "Select a district";
  if (!form.sector?.trim())             errs.sector       = "Required";
  if (!form.registrationNumber?.trim()) errs.registrationNumber = "Required";
  if (isEdit && !STATUSES.includes(form.status)) errs.status = "Select a status";
  return errs;
}

// ── Reusable form field ───────────────────────────────────────────
function Field({ label, required, icon: Icon, error, children }) {
  return (
    <div>
      <div className="p-field-label">
        {Icon && <Icon size={13} style={{ opacity: 0.6 }} />}
        {label}
        {required && <span className="p-field-required">*</span>}
      </div>
      {children}
      {error && <div className="p-field-error">{error}</div>}
    </div>
  );
}

// ── Styled select (used inside dialogs) ──────────────────────────
function FormSelect({ name, value, onChange, placeholder, children }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="participants-filter-select"
      style={{ flex: "unset", width: "100%", padding: "8px 28px 8px 10px" }}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {children}
    </select>
  );
}

// ── Add Participant Dialog ────────────────────────────────────────
function AddParticipantDialog({ onSuccess }) {
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [form, setForm]           = useState(EMPTY_CREATE);
  const [fieldErrs, setFieldErrs] = useState({});

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setFieldErrs(f => ({ ...f, [name]: undefined }));
  };

  const handleSave = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setFieldErrs(errs); return; }
    setError(""); setSaving(true);
    try {
      await createParticipant(form);
      setOpen(false);
      setForm(EMPTY_CREATE);
      setFieldErrs({});
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (v) => {
    setOpen(v);
    if (!v) { setForm(EMPTY_CREATE); setFieldErrs({}); setError(""); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="user-btn" onClick={() => setOpen(true)}>
          <Plus size={15} />
          Add Participant
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" style={{ maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
        <DialogHeader style={{ marginBottom: "12px" }}>
          <DialogTitle style={{ color: "var(--p-navy)", fontSize: "16px", fontWeight: "700" }}>Add New Participant</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div className="p-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
          <div className="p-form-grid">
            <div className="col-span-2">
              <Field label="Business Name" required icon={Building2} error={fieldErrs.businessName}>
                <Input name="businessName" placeholder="e.g. Perera Textiles Pvt Ltd"
                  value={form.businessName} onChange={set}
                  className={fieldErrs.businessName ? "border-red-400" : ""} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Owner Name" required icon={User} error={fieldErrs.ownerName}>
                <Input name="ownerName" placeholder="Full name of owner"
                  value={form.ownerName} onChange={set}
                  className={fieldErrs.ownerName ? "border-red-400" : ""} />
              </Field>
            </div>
            <Field label="Email" required icon={Mail} error={fieldErrs.email}>
              <Input name="email" type="email" placeholder="email@business.lk"
                value={form.email} onChange={set}
                className={fieldErrs.email ? "border-red-400" : ""} />
            </Field>
            <Field label="Phone" required icon={Phone} error={fieldErrs.phone}>
              <Input name="phone" placeholder="07XXXXXXXX"
                value={form.phone} onChange={set}
                className={fieldErrs.phone ? "border-red-400" : ""} />
            </Field>
            <Field label="District" required icon={MapPin} error={fieldErrs.district}>
              <FormSelect name="district" value={form.district} onChange={set} placeholder="Select district">
                {DISTRICTS.map(d => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
              </FormSelect>
            </Field>
            <Field label="Sector" required icon={Briefcase} error={fieldErrs.sector}>
              <Input name="sector" placeholder="e.g. Manufacturing"
                value={form.sector} onChange={set}
                className={fieldErrs.sector ? "border-red-400" : ""} />
            </Field>
            <div className="col-span-2">
              <Field label="Registration Number" required icon={Hash} error={fieldErrs.registrationNumber}>
                <Input name="registrationNumber" placeholder="e.g. PV00123456"
                  value={form.registrationNumber} onChange={set}
                  className={fieldErrs.registrationNumber ? "border-red-400" : ""} />
              </Field>
            </div>
          </div>
          <button className="p-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Save Participant"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Participant Dialog ────────────────────────────────────────
function EditParticipantDialog({ participant, onSuccess }) {
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [form, setForm]           = useState({});
  const [fieldErrs, setFieldErrs] = useState({});

  useEffect(() => { if (participant) setForm({ ...participant }); }, [participant]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setFieldErrs(f => ({ ...f, [name]: undefined }));
  };

  const handleSave = async () => {
    const errs = validateForm(form, true);
    if (Object.keys(errs).length) { setFieldErrs(errs); return; }
    setError(""); setSaving(true);
    try {
      await updateParticipant(participant.id, form);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFieldErrs({}); setError(""); } }}>
      <DialogTrigger asChild>
        <button className="p-action-btn p-action-btn-edit" title="Edit participant">
          <Pencil size={15} style={{ color: "var(--p-gold)" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" style={{ maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
        <DialogHeader style={{ marginBottom: "12px" }}>
          <DialogTitle style={{ color: "var(--p-navy)", fontSize: "16px", fontWeight: "700" }}>Edit Participant</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div className="p-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
          <div className="p-form-grid">
            <div className="col-span-2">
              <Field label="Business Name" required icon={Building2} error={fieldErrs.businessName}>
                <Input name="businessName" value={form.businessName || ""} onChange={set}
                  className={fieldErrs.businessName ? "border-red-400" : ""} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Owner Name" required icon={User} error={fieldErrs.ownerName}>
                <Input name="ownerName" value={form.ownerName || ""} onChange={set}
                  className={fieldErrs.ownerName ? "border-red-400" : ""} />
              </Field>
            </div>
            <Field label="Email" required icon={Mail} error={fieldErrs.email}>
              <Input name="email" value={form.email || ""} onChange={set}
                className={fieldErrs.email ? "border-red-400" : ""} />
            </Field>
            <Field label="Phone" required icon={Phone} error={fieldErrs.phone}>
              <Input name="phone" value={form.phone || ""} onChange={set}
                className={fieldErrs.phone ? "border-red-400" : ""} />
            </Field>
            <Field label="District" required icon={MapPin} error={fieldErrs.district}>
              <FormSelect name="district" value={form.district || ""} onChange={set}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
              </FormSelect>
            </Field>
            <Field label="Status" required error={fieldErrs.status}>
              <FormSelect name="status" value={form.status || ""} onChange={set}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </FormSelect>
            </Field>
            <Field label="Sector" required icon={Briefcase} error={fieldErrs.sector}>
              <Input name="sector" value={form.sector || ""} onChange={set}
                className={fieldErrs.sector ? "border-red-400" : ""} />
            </Field>
            <Field label="Reg. Number" required icon={Hash} error={fieldErrs.registrationNumber}>
              <Input name="registrationNumber" value={form.registrationNumber || ""} onChange={set}
                className={fieldErrs.registrationNumber ? "border-red-400" : ""} />
            </Field>
          </div>
          <button className="p-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────
function DeleteConfirmDialog({ participant, onSuccess }) {
  const [open, setOpen]  = useState(false);
  const [busy, setBusy]  = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setBusy(true); setError("");
    try {
      await deleteParticipant(participant.id);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-action-btn p-action-btn-delete" title="Delete participant">
          <Trash2 size={15} style={{ color: "#ef4444" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm" style={{ padding: "28px" }}>
        <DialogHeader style={{ marginBottom: "12px" }}>
          <DialogTitle style={{ color: "var(--p-navy)", fontSize: "16px", fontWeight: "700" }}>Delete Participant?</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--p-muted)", lineHeight: 1.6 }}>
            This will permanently remove{" "}
            <strong style={{ color: "#1e293b" }}>{participant.businessName}</strong>{" "}
            and all associated enrollments. This cannot be undone.
          </p>
          {error && (
            <div className="p-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                flex: 1, padding: "8px", borderRadius: 8, border: "1px solid var(--p-border)",
                background: "var(--p-card)", color: "var(--p-muted)", fontSize: 13,
                cursor: "pointer", fontWeight: 500,
              }}
            >Cancel</button>
            <button
              onClick={handleDelete}
              disabled={busy}
              style={{
                flex: 1, padding: "8px", borderRadius: 8, background: "#dc2626",
                color: "#fff", fontSize: 13, fontWeight: 600, border: "none",
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {busy ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Yes, Delete"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [districtFilter, setDistrict] = useState("");
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(10);
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 });

  const searchRef = useRef(null);
  const handleLogout = () => { window.location.href = "/login"; };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await fetchParticipants({
        page, limit, search, status: statusFilter, district: districtFilter,
      });
      setParticipants(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (err.message !== "Unauthorised") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, districtFilter]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const clearSearch   = () => { setSearchInput(""); setSearch(""); setPage(1); searchRef.current?.focus(); };
  const clearStatus   = () => { setStatus("");   setPage(1); };
  const clearDistrict = () => { setDistrict(""); setPage(1); };

  const activeFilters = [
    statusFilter   && { label: statusFilter,                     clear: clearStatus },
    districtFilter && { label: districtFilter.replace(/_/g, " "), clear: clearDistrict },
  ].filter(Boolean);

  const startRecord = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord   = Math.min(page * limit, meta.total);

  const NAV_BTNS = [
    { title: "First",    disabled: page === 1,              onClick: () => setPage(1),               icon: "M11 19l-7-7 7-7M18 19l-7-7 7-7" },
    { title: "Previous", disabled: page === 1,              onClick: () => setPage(p => p - 1),      icon: "M15 19l-7-7 7-7" },
    { title: "Next",     disabled: page >= meta.totalPages, onClick: () => setPage(p => p + 1),      icon: "M9 5l7 7-7 7" },
    { title: "Last",     disabled: page >= meta.totalPages, onClick: () => setPage(meta.totalPages), icon: "M13 5l7 7-7 7M6 5l7 7-7 7" },
  ];

  return (
    <div className="participants-wrapper">
      <Sidebar handleLogout={handleLogout} />

      <div className="participants-main">

        {/* ── Header ── */}
        <header className="participants-header">
          <div className="participants-header-left">
            <h1>PARTICIPANTS</h1>
            <p>Manage SME owners and training attendees.</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className="icon-btn" title="Notifications">
              <Bell size={20} />
            </button>
            <AddParticipantDialog onSuccess={load} />
          </div>
        </header>

        <main className="participants-inner">

          {/* ── Search & Filters ── */}
          <div className="participants-filter-bar">

            {/* Search */}
            <div style={{ flex:'1 1 180px', maxWidth:400, position:'relative' }}>
              <Search
                size={15}
                style={{
                  position:'absolute', left:14, top:'50%',
                  transform:'translateY(-50%)',
                  color:'#64748b', pointerEvents:'none',
                  width:15, height:15, flexShrink:0,
                }}
              />
              <input
                ref={searchRef}
                type="text"
                className="participants-search-input"
                placeholder="Search by business name, owner or email..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Escape" && clearSearch()}
                style={{
                  width:'100%', border:'1px solid #e2e8f0', borderRadius:8,
                  padding:'7px 34px 7px 34px',
                  fontSize:13, color:'#1e293b', background:'#fff',
                  outline:'none',
                }}
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  style={{
                    position:'absolute', right:8, top:'50%',
                    transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer',
                    color:'#64748b', display:'flex', alignItems:'center', padding:2,
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status filter */}
            <select
              className={`participants-filter-select${statusFilter ? " is-active" : ""}`}
              value={statusFilter}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* District filter */}
            <select
              className={`participants-district-select${districtFilter ? " is-active" : ""}`}
              value={districtFilter}
              onChange={e => { setDistrict(e.target.value); setPage(1); }}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
            </select>

            {/* Active filter pills */}
            {activeFilters.length > 0 && (
              <div className="participants-filter-pills" style={{ width: "100%" }}>
                <span className="participants-filter-pills-label">Active filters:</span>
                {activeFilters.map((f, i) => (
                  <span key={i} className="participants-filter-pill">
                    {f.label}
                    <button onClick={f.clear}><X size={11} /></button>
                  </span>
                ))}
                {activeFilters.length > 1 && (
                  <button className="participants-clear-all" onClick={() => { clearStatus(); clearDistrict(); }}>
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Table ── */}
          <div className="participants-table-card">
            <div className="participants-table-scroll">

              {/* Table header */}
              <div className="p-thead">
                <div className="p-row">
                  <div>Business Name</div>
                  <div>Owner</div>
                  <div className="p-col-phone">Phone</div>
                  <div>District</div>
                  <div>Status</div>
                  <div className="p-col-sector">Sector</div>
                  <div>Actions</div>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="p-state-center">
                  <Loader2 size={20} className="animate-spin" style={{ color: "var(--p-red)" }} />
                  <span>Loading participants...</span>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="p-state-center">
                  <div className="p-state-error">
                    <AlertCircle size={18} /> {error}
                  </div>
                  <button className="p-retry-btn" onClick={load}>Try again</button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && participants.length === 0 && (
                <div className="p-state-center">
                  <Building2 size={32} style={{ opacity: 0.2, color: "var(--p-navy)" }} />
                  <span>
                    {search || statusFilter || districtFilter
                      ? "No participants match your filters."
                      : "No participants yet."}
                  </span>
                  {(search || statusFilter || districtFilter) && (
                    <button className="p-clear-filters-link"
                      onClick={() => { clearSearch(); clearStatus(); clearDistrict(); }}>
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {/* Rows */}
              {!loading && !error && participants.map((p, i) => (
                <div key={p.id} className="p-tbody-row">
                  <div className="p-row">
                    <div className="p-cell-main">{p.businessName}</div>
                    <div className="p-cell-sub">{p.ownerName}</div>
                    <div className="p-cell-sub p-col-phone">{p.phone}</div>
                    <div className="p-cell-sub">{p.district?.replace(/_/g, " ")}</div>
                    <div>
                      <span className={`p-badge ${p.status === "active" ? "p-badge-active" : "p-badge-inactive"}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="p-cell-sub p-col-sector">{p.sector}</div>
                    <div className="p-actions">
                      <EditParticipantDialog participant={p} onSuccess={load} />
                      <DeleteConfirmDialog participant={p} onSuccess={load} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            <div className="participants-pagination">
              <div className="pag-left">
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  {[10, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="pag-right">
                <span className="pag-result-count">
                  {meta.total === 0 ? "0 results" : `${startRecord}–${endRecord} of ${meta.total}`}
                </span>
                <div className="pag-nav-btns">
                  {NAV_BTNS.map(({ title, disabled, onClick, icon }) => (
                    <button key={title} title={title} disabled={disabled}
                      onClick={onClick} className="pag-nav-btn">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                    </button>
                  ))}
                  <span className="pag-page-indicator">{page} / {meta.totalPages}</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
