import {
  Search, Bell, Plus, Pencil, Trash2, Loader2,
  AlertCircle, X, Building2, User, Mail, Phone,
  MapPin, Briefcase, Hash, ChevronDown,   
} from "lucide-react";
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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

// ── Section header ────────────────────────────────────────────────
function PSectionHeader({ icon: Icon, label }) {
  return (
    <div className="p-section-header">
      <div className="p-section-icon"><Icon size={14} /></div>
      <span>{label}</span>
    </div>
  );
}

// ── Dialog gradient header ────────────────────────────────────────
function PDialogHeader({ badge, title, subtitle }) {
  return (
    <div className="p-dialog-header">
      <div className="p-dialog-header-badge">
        <span className="p-dialog-header-dot" />
        {badge}
      </div>
      <h2 className="p-dialog-title">{title}</h2>
      <p className="p-dialog-subtitle">{subtitle}</p>
      <div className="p-dialog-header-rule" />
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────
function PField({ label, required, error, children }) {
  return (
    <div className="p-new-field">
      <label className="p-new-label">
        {label}{required && <span className="p-field-required"> *</span>}
      </label>
      {children}
      {error && <div className="p-field-error">{error}</div>}
    </div>
  );
}

// ── Icon input ────────────────────────────────────────────────────
function PIconInput({ icon: Icon, name, value, onChange, placeholder, type = "text", hasError }) {
  return (
    <div className={`p-icon-input${hasError ? " p-icon-input-error" : ""}`}>
      <Icon size={15} className="p-icon-input-icon" />
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} className="p-icon-input-field"
      />
    </div>
  );
}

// ── Icon select ───────────────────────────────────────────────────
function PIconSelect({ icon: Icon, name, value, onChange, children, hasError, placeholder }) {
  return (
    <div className={`p-icon-input${hasError ? " p-icon-input-error" : ""}`}>
      <Icon size={15} className="p-icon-input-icon" />
      <select name={name} value={value} onChange={onChange}
        className="p-icon-input-field p-icon-select">
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children}
      </select>
      <ChevronDown size={13} className="p-select-chevron" />
    </div>
  );
}

// ── Step dots ─────────────────────────────────────────────────────
function PStepDots({ total = 2, active = 0 }) {
  return (
    <div className="p-step-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`p-step-dot${i === active ? " p-step-dot-active" : ""}`} />
      ))}
    </div>
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
      setOpen(false); setForm(EMPTY_CREATE); setFieldErrs({}); onSuccess?.();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleOpenChange = (v) => {
    setOpen(v);
    if (!v) { setForm(EMPTY_CREATE); setFieldErrs({}); setError(""); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="user-btn" onClick={() => setOpen(true)}>
          <Plus size={15} /> Add Participant
        </button>
      </DialogTrigger>
      <DialogContent className="p-dialog-content">
        <PDialogHeader
          badge="PARTICIPANTS REGISTRY"
          title="Add New Participant"
          subtitle="Industrial Development Board of Ceylon — SME Directory"
        />
        <div className="p-dialog-body">
          {error && (
            <div className="p-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <PSectionHeader icon={Building2} label="BUSINESS INFORMATION" />
          <PField label="Business Name" required error={fieldErrs.businessName}>
            <PIconInput icon={Building2} name="businessName" value={form.businessName}
              onChange={set} placeholder="e.g. Perera Textiles Pvt Ltd"
              hasError={!!fieldErrs.businessName} />
          </PField>
          <PField label="Owner Name" required error={fieldErrs.ownerName}>
            <PIconInput icon={User} name="ownerName" value={form.ownerName}
              onChange={set} placeholder="Full name of owner"
              hasError={!!fieldErrs.ownerName} />
          </PField>

          <PSectionHeader icon={Mail} label="CONTACT DETAILS" />
          <div className="p-form-grid-2">
            <PField label="Email" required error={fieldErrs.email}>
              <PIconInput icon={Mail} name="email" type="email" value={form.email}
                onChange={set} placeholder="email@business.lk"
                hasError={!!fieldErrs.email} />
            </PField>
            <PField label="Phone" required error={fieldErrs.phone}>
              <PIconInput icon={Phone} name="phone" value={form.phone}
                onChange={set} placeholder="07XXXXXXXX"
                hasError={!!fieldErrs.phone} />
            </PField>
          </div>

          <PSectionHeader icon={MapPin} label="LOCATION & SECTOR" />
          <div className="p-form-grid-2">
            <PField label="District" required error={fieldErrs.district}>
              <PIconSelect icon={MapPin} name="district" value={form.district}
                onChange={set} placeholder="Select district"
                hasError={!!fieldErrs.district}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
              </PIconSelect>
            </PField>
            <PField label="Sector" required error={fieldErrs.sector}>
              <PIconInput icon={Briefcase} name="sector" value={form.sector}
                onChange={set} placeholder="e.g. Manufacturing"
                hasError={!!fieldErrs.sector} />
            </PField>
          </div>

          <PSectionHeader icon={Hash} label="REGISTRATION" />
          <PField label="Registration Number" required error={fieldErrs.registrationNumber}>
            <PIconInput icon={Hash} name="registrationNumber" value={form.registrationNumber}
              onChange={set} placeholder="e.g. PV00123456"
              hasError={!!fieldErrs.registrationNumber} />
          </PField>
        </div>

        <div className="p-dialog-footer">
          <PStepDots total={2} active={0} />
          <div className="p-dialog-footer-actions">
            <button className="p-cancel-btn" onClick={() => handleOpenChange(false)}>Cancel</button>
            <button className="p-submit-btn" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Participant"}
            </button>
          </div>
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
      setOpen(false); onSuccess?.();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFieldErrs({}); setError(""); } }}>
      <DialogTrigger asChild>
        <button className="p-action-btn p-action-btn-edit" title="Edit participant">
          <Pencil size={15} style={{ color: "var(--p-gold)" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="p-dialog-content">
        <PDialogHeader
          badge="EDIT"
          title="Edit Participant"
          subtitle="Update participant details below"
        />
        <div className="p-dialog-body">
          {error && (
            <div className="p-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <PSectionHeader icon={Building2} label="BUSINESS INFORMATION" />
          <PField label="Business Name" required error={fieldErrs.businessName}>
            <PIconInput icon={Building2} name="businessName" value={form.businessName || ""}
              onChange={set} placeholder="Business name" hasError={!!fieldErrs.businessName} />
          </PField>
          <PField label="Owner Name" required error={fieldErrs.ownerName}>
            <PIconInput icon={User} name="ownerName" value={form.ownerName || ""}
              onChange={set} placeholder="Owner name" hasError={!!fieldErrs.ownerName} />
          </PField>

          <PSectionHeader icon={Mail} label="CONTACT DETAILS" />
          <div className="p-form-grid-2">
            <PField label="Email" required error={fieldErrs.email}>
              <PIconInput icon={Mail} name="email" type="email" value={form.email || ""}
                onChange={set} placeholder="email@business.lk" hasError={!!fieldErrs.email} />
            </PField>
            <PField label="Phone" required error={fieldErrs.phone}>
              <PIconInput icon={Phone} name="phone" value={form.phone || ""}
                onChange={set} placeholder="07XXXXXXXX" hasError={!!fieldErrs.phone} />
            </PField>
          </div>

          <PSectionHeader icon={MapPin} label="LOCATION & SECTOR" />
          <div className="p-form-grid-2">
            <PField label="District" required error={fieldErrs.district}>
              <PIconSelect icon={MapPin} name="district" value={form.district || ""}
                onChange={set} hasError={!!fieldErrs.district}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
              </PIconSelect>
            </PField>
            <PField label="Status" required error={fieldErrs.status}>
              <PIconSelect icon={Hash} name="status" value={form.status || ""}
                onChange={set} hasError={!!fieldErrs.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </PIconSelect>
            </PField>
          </div>
          <div className="p-form-grid-2">
            <PField label="Sector" required error={fieldErrs.sector}>
              <PIconInput icon={Briefcase} name="sector" value={form.sector || ""}
                onChange={set} placeholder="e.g. Manufacturing" hasError={!!fieldErrs.sector} />
            </PField>
            <PField label="Reg. Number" required error={fieldErrs.registrationNumber}>
              <PIconInput icon={Hash} name="registrationNumber" value={form.registrationNumber || ""}
                onChange={set} placeholder="e.g. PV00123456" hasError={!!fieldErrs.registrationNumber} />
            </PField>
          </div>
        </div>

        <div className="p-dialog-footer">
          <PStepDots total={2} active={1} />
          <div className="p-dialog-footer-actions">
            <button className="p-cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="p-submit-btn" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ── Delete Confirm Dialog ─────────────────────────────────────────
function DeleteConfirmDialog({ participant, onSuccess }) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setBusy(true); setError("");
    try {
      await deleteParticipant(participant.id);
      setOpen(false); onSuccess?.();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-action-btn p-action-btn-delete" title="Delete participant">
          <Trash2 size={15} style={{ color: "#ef4444" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="p-dialog-content" style={{ maxWidth: 440, width: 440 }}>
        <PDialogHeader
          badge="DELETE"
          title="Remove Participant"
          subtitle="This action cannot be undone"
        />
        <div className="p-dialog-body" style={{ gap: 12 }}>
          <div className="p-delete-warn">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1, color: "#dc2626" }} />
            <p>
              Permanently removing{" "}
              <strong style={{ color: "#1e293b" }}>{participant.businessName}</strong>{" "}
              and all associated enrollments.
            </p>
          </div>
          <div className="p-form-grid-2" style={{ marginTop: 4 }}>
            <div className="p-new-field">
              <span className="p-detail-label">District</span>
              <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                {participant.district?.replace(/_/g, " ") || "—"}
              </span>
            </div>
            <div className="p-new-field">
              <span className="p-detail-label">Status</span>
              <span className={`p-badge ${participant.status === "active" ? "p-badge-active" : "p-badge-inactive"}`}
                style={{ marginTop: 2 }}>
                {participant.status}
              </span>
            </div>
          </div>
          {error && (
            <div className="p-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
        </div>
        <div className="p-dialog-footer">
          <button className="p-cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
          <button className="p-delete-btn" onClick={handleDelete} disabled={busy}>
            {busy ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Yes, delete"}
          </button>
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
                  position:'absolute', left:11, top:'50%',
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
