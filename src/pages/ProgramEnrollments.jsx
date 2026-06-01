import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, Loader2,
  AlertCircle, X, Users, Hash, Tag, Calendar, DollarSign,
  ChevronDown, ClipboardList, BookOpen,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import Sidebar from "../components/Sidebar";
import "../styles/programEnrollments.css";

// ── Import all API calls and constants from enrollmentService ─────
import {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  COMPLETION_STATUSES,
} from "../services/programEnrollmentsService";
import { getPrograms } from "../services/programsService";
import { fetchParticipants } from "../services/participantsService";

// ── Constants ─────────────────────────────────────────────────────
const EMPTY_CREATE = {
  programId: "",
  participantId: "",
  completionStatus: "enrolled",
  ticketPrice: "",
};

function formatParticipantLabel(p) {
  if (p.businessName && p.ownerName) return `${p.businessName} — ${p.ownerName}`;
  return p.businessName || p.ownerName || `Participant #${p.id}`;
}

function lookupName(map, id) {
  if (id === null || id === undefined || id === "") return "—";
  if (!map) return `#${id}`;
  return map[id] ?? map[String(id)] ?? `#${id}`;
}

// ── Badge helper ──────────────────────────────────────────────────
function getBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case "enrolled":  return "en-badge en-badge-enrolled";
    case "completed": return "en-badge en-badge-completed";
    case "dropped":   return "en-badge en-badge-dropped";
    default:          return "en-badge en-badge-default";
  }
}

// ── Field-level validation ────────────────────────────────────────
function validateForm(form, isEdit = false) {
  const errs = {};
  if (!isEdit) {
    if (!form.programId) errs.programId = "Select a program";
    if (!form.participantId) errs.participantId = "Select a participant";
  }
  if (!COMPLETION_STATUSES.includes(form.completionStatus))
    errs.completionStatus = "Select a status";
  if (form.ticketPrice !== "" && form.ticketPrice !== undefined) {
    if (isNaN(Number(form.ticketPrice)) || Number(form.ticketPrice) < 0)
      errs.ticketPrice = "Valid amount required";
  }
  return errs;
}

// ── Section header ────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="en-section-header">
      <div className="en-section-icon"><Icon size={14} /></div>
      <span>{label}</span>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────
function NewField({ label, required, error, children }) {
  return (
    <div className="en-new-field">
      <label className="en-new-label">
        {label}
        {required && <span className="en-field-required"> *</span>}
      </label>
      {children}
      {error && <div className="en-field-error">{error}</div>}
    </div>
  );
}

// ── Icon-prefixed text input ──────────────────────────────────────
function IconInput({ icon: Icon, name, value, onChange, placeholder, type = "text", hasError }) {
  return (
    <div className={`en-icon-input${hasError ? " en-icon-input-error" : ""}`}>
      <Icon size={15} className="en-icon-input-icon" />
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="en-icon-input-field"
      />
    </div>
  );
}

// ── Custom Dropdown ───────────────────────────────────────────────
function CustomDropdown({ icon: Icon, value, onChange, options, placeholder, hasError }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`en-icon-input${hasError ? " en-icon-input-error" : ""}`}
        style={{ width: "100%", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}
      >
        <Icon size={15} className="en-icon-input-icon" />
        <span style={{
          flex: 1, fontSize: 13,
          color: selected ? "#1e293b" : "#9ca3af",
          pointerEvents: "none", userSelect: "none",
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={13}
          className="en-select-chevron"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, zIndex: 9999, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}>
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px" }}>
            {options.map(o => {
              const isSelected = value === o.value;
              return (
                <div
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  style={{
                    padding: "8px 10px", fontSize: 13, cursor: "pointer",
                    borderRadius: 6, display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    background: isSelected ? "#eff6ff" : "transparent",
                    color: isSelected ? "#1d4ed8" : "#1e293b",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {o.label}
                  {isSelected && (
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter Bar Dropdown ───────────────────────────────────────────
function FilterDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`enrollments-filter-select${value ? " is-active" : ""}`}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, width: "100%", appearance: "none", WebkitAppearance: "none", backgroundImage: "none" }}
      >
        <span style={{ fontSize: 13 }}>{selected?.label || options[0]?.label}</span>
        <ChevronDown size={13} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, zIndex: 9999, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160,
        }}>
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px" }}>
            {options.map(o => {
              const isSelected = value === o.value;
              return (
                <div
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  style={{
                    padding: "8px 10px", fontSize: 13, cursor: "pointer",
                    borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: isSelected ? "#eff6ff" : "transparent",
                    color: isSelected ? "#1d4ed8" : "#1e293b",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {o.label}
                  {isSelected && (
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared dialog header ──────────────────────────────────────────
function DialogHeader2({ badge, title, subtitle }) {
  return (
    <div className="en-add-header">
      <div className="en-add-header-badge">
        <span className="en-add-header-dot" />
        {badge}
      </div>
      <h2 className="en-add-title">{title}</h2>
      <p className="en-add-subtitle">{subtitle}</p>
      <div className="en-add-header-rule" />
    </div>
  );
}

// ── Step dots ─────────────────────────────────────────────────────
function StepDots({ total = 2, active = 0 }) {
  return (
    <div className="en-step-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`en-step-dot${i === active ? " en-step-dot-active" : ""}`} />
      ))}
    </div>
  );
}

// ── Add Enrollment Dialog ─────────────────────────────────────────
function AddEnrollmentDialog({
  onSuccess,
  programOptions = [],
  participantOptions = [],
  optionsLoading = false,
}) {
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
    if (Object.keys(errs).length) {
      setFieldErrs(errs);
      document.querySelector(".en-add-body")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError(""); setSaving(true);
    try {
      await createEnrollment(form);
      setOpen(false);
      setForm(EMPTY_CREATE);
      setFieldErrs({});
      onSuccess?.();
    } catch (err) {
      console.error("createEnrollment error:", err?.response ?? err);
      const data = err?.response?.data;
      const msg =
        (typeof data === "string" ? data : null) ||
        data?.message ||
        data?.error ||
        data?.details ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
      document.querySelector(".en-add-body")?.scrollTo({ top: 0, behavior: "smooth" });
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
          <Plus size={15} /> Add Enrollment
        </button>
      </DialogTrigger>

      <DialogContent className="en-add-dialog-content">
        <div className="en-add-header">
          <div className="en-add-header-badge">
            <span className="en-add-header-dot" />
            ENROLLMENTS REGISTRY
          </div>
          <h2 className="en-add-title">Add New Enrollment</h2>
          <p className="en-add-subtitle">
            Industrial Development Board of Ceylon — SME Initiatives
          </p>
          <div className="en-add-header-rule" />
        </div>

        <div className="en-add-body">
          {error && (
            <div className="en-alert-error" style={{ marginBottom: 4 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <SectionHeader icon={ClipboardList} label="ENROLLMENT DETAILS" />

          <div className="en-add-grid-2">
            <NewField label="Program" required error={fieldErrs.programId}>
              <CustomDropdown
                icon={BookOpen}
                value={form.programId}
                onChange={(v) => {
                  setForm((f) => ({ ...f, programId: v }));
                  setFieldErrs((f) => ({ ...f, programId: undefined }));
                }}
                options={programOptions}
                placeholder={optionsLoading ? "Loading programs..." : "Select program"}
                hasError={!!fieldErrs.programId}
              />
            </NewField>

            <NewField label="Participant" required error={fieldErrs.participantId}>
              <CustomDropdown
                icon={Users}
                value={form.participantId}
                onChange={(v) => {
                  setForm((f) => ({ ...f, participantId: v }));
                  setFieldErrs((f) => ({ ...f, participantId: undefined }));
                }}
                options={participantOptions}
                placeholder={optionsLoading ? "Loading participants..." : "Select participant"}
                hasError={!!fieldErrs.participantId}
              />
            </NewField>
          </div>

          <SectionHeader icon={Tag} label="STATUS & PAYMENT" />

          <div className="en-add-grid-2">
            <NewField label="Completion Status" required error={fieldErrs.completionStatus}>
              <CustomDropdown
                icon={Tag}
                value={form.completionStatus}
                onChange={(v) => { setForm(f => ({ ...f, completionStatus: v })); setFieldErrs(f => ({ ...f, completionStatus: undefined })); }}
                options={COMPLETION_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                placeholder="Select status"
                hasError={!!fieldErrs.completionStatus}
              />
            </NewField>

            <NewField label="Ticket Price (LKR)" error={fieldErrs.ticketPrice}>
              <div className={`en-budget-input${fieldErrs.ticketPrice ? " en-icon-input-error" : ""}`}>
                <span className="en-budget-prefix">LKR</span>
                <input
                  name="ticketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ticketPrice}
                  onChange={set}
                  placeholder="0.00"
                  className="en-budget-field"
                />
              </div>
            </NewField>
          </div>
        </div>

        <div className="en-add-footer">
          <StepDots total={2} active={0} />
          <div className="en-add-footer-actions">
            <button className="en-cancel-btn" onClick={() => handleOpenChange(false)}>
              Cancel
            </button>
            <button className="en-save-btn-new" onClick={handleSave} disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : "Save Enrollment"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── View Enrollment Dialog ────────────────────────────────────────
function ViewEnrollmentDialog({ enrollment, programById, participantById }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="en-action-btn en-action-btn-view" title="View enrollment">
          <Eye size={15} style={{ color: "var(--en-gold)" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="en-dialog-content">
        <DialogHeader2
          badge="VIEW"
          title="Enrollment details"
          subtitle="Industrial Development Board of Ceylon"
        />
        <div className="en-view-body">
          <div className="en-view-grid">
            <div className="en-view-row">
              <span className="en-detail-label">Enrollment ID</span>
              <span className="en-detail-value" style={{ fontWeight: 600, color: "var(--en-navy)" }}>
                #{enrollment.id}
              </span>
            </div>
            <div className="en-view-row">
              <span className="en-detail-label">Completion Status</span>
              <span className={getBadgeClass(enrollment.completionStatus)} style={{ marginTop: 2 }}>
                {enrollment.completionStatus}
              </span>
            </div>
          </div>
          <div className="en-view-divider" />
          <div className="en-view-grid">
            <div className="en-view-row">
              <span className="en-detail-label">Program</span>
              <span className="en-detail-value">{lookupName(programById, enrollment.programId)}</span>
            </div>
            <div className="en-view-row">
              <span className="en-detail-label">Participant</span>
              <span className="en-detail-value">{lookupName(participantById, enrollment.participantId)}</span>
            </div>
          </div>
          <div className="en-view-divider" />
          <div className="en-view-grid">
            <div className="en-view-row">
              <span className="en-detail-label">Enrollment Date</span>
              <span className="en-detail-value">
                {enrollment.enrollmentDate
                  ? new Date(enrollment.enrollmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </span>
            </div>
            <div className="en-view-row">
              <span className="en-detail-label">Ticket Price</span>
              <span className="en-detail-value" style={{ fontWeight: 600, color: "var(--en-navy)" }}>
                {enrollment.ticketPrice ? `LKR ${Number(enrollment.ticketPrice).toLocaleString()}` : "—"}
              </span>
            </div>
          </div>
        </div>
        <div className="en-dialog-footer">
          <button className="en-save-btn-new" onClick={() => setOpen(false)}>Close</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Enrollment Dialog ────────────────────────────────────────
function EditEnrollmentDialog({ enrollment, onSuccess }) {
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [form, setForm]           = useState({});
  const [fieldErrs, setFieldErrs] = useState({});

  useEffect(() => {
    if (enrollment) {
      setForm({
        ...enrollment,
        ticketPrice: enrollment.ticketPrice ?? "",
      });
    }
  }, [enrollment]);

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
      await updateEnrollment(enrollment.id, form);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        (typeof data === "string" ? data : null) ||
        data?.message ||
        data?.error ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFieldErrs({}); setError(""); } }}>
      <DialogTrigger asChild>
        <button className="en-action-btn en-action-btn-edit" title="Edit enrollment">
          <Pencil size={15} style={{ color: "var(--en-gold)" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="en-dialog-content">
        <DialogHeader2
          badge="EDIT"
          title="Edit enrollment"
          subtitle="Update enrollment details below"
        />
        <div className="en-add-body">
          {error && (
            <div className="en-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <SectionHeader icon={Tag} label="STATUS & PAYMENT" />

          <NewField label="Completion Status" required error={fieldErrs.completionStatus}>
            <CustomDropdown
              icon={Tag}
              value={form.completionStatus}
              onChange={(v) => { setForm(f => ({ ...f, completionStatus: v })); setFieldErrs(f => ({ ...f, completionStatus: undefined })); }}
              options={COMPLETION_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              placeholder="Select status"
              hasError={!!fieldErrs.completionStatus}
            />
          </NewField>

          <NewField label="Ticket Price (LKR)" error={fieldErrs.ticketPrice}>
            <div className={`en-budget-input${fieldErrs.ticketPrice ? " en-icon-input-error" : ""}`}>
              <span className="en-budget-prefix">LKR</span>
              <input
                name="ticketPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.ticketPrice}
                onChange={set}
                placeholder="0.00"
                className="en-budget-field"
              />
            </div>
          </NewField>
        </div>

        <div className="en-add-footer">
          <StepDots total={2} active={1} />
          <div className="en-add-footer-actions">
            <button className="en-cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="en-save-btn-new" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────
function DeleteConfirmDialog({ enrollment, onSuccess, programById, participantById }) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setBusy(true); setError("");
    try {
      await deleteEnrollment(enrollment.id);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        (typeof data === "string" ? data : null) ||
        data?.message ||
        err?.message ||
        "Something went wrong.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="en-action-btn en-action-btn-delete" title="Delete enrollment">
          <Trash2 size={15} style={{ color: "#ef4444" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="en-dialog-content" style={{ maxWidth: 440 }}>
        <DialogHeader2
          badge="DELETE"
          title="Remove enrollment"
          subtitle="This action cannot be undone"
        />
        <div className="en-add-body" style={{ gap: 12 }}>
          <div className="en-delete-warn">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1, color: "#dc2626" }} />
            <p>
              Permanently removing enrollment{" "}
              <strong style={{ color: "#1e293b" }}>#{enrollment.id}</strong>{" "}
              ({lookupName(programById, enrollment.programId)} / {lookupName(participantById, enrollment.participantId)}).
            </p>
          </div>
          <div className="en-view-grid" style={{ marginTop: 4 }}>
            <div className="en-view-row">
              <span className="en-detail-label">Status</span>
              <span className={getBadgeClass(enrollment.completionStatus)} style={{ marginTop: 2 }}>
                {enrollment.completionStatus}
              </span>
            </div>
            <div className="en-view-row">
              <span className="en-detail-label">Ticket Price</span>
              <span className="en-detail-value">
                {enrollment.ticketPrice ? `LKR ${Number(enrollment.ticketPrice).toLocaleString()}` : "—"}
              </span>
            </div>
          </div>
          {error && (
            <div className="en-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
        </div>
        <div className="en-dialog-footer">
          <button className="en-cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
          <button className="en-delete-btn" onClick={handleDelete} disabled={busy}>
            {busy ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Yes, delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProgramEnrollments() {
  const [enrollments, setEnrollments]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [completionStatusFilter, setStatus]   = useState("");
  const [page, setPage]                       = useState(1);
  const [limit, setLimit]                     = useState(10);
  const [meta, setMeta]                       = useState({ total: 0, totalPages: 1 });
  const [programs, setPrograms]               = useState([]);
  const [participants, setParticipants]       = useState([]);
  const [optionsLoading, setOptionsLoading]   = useState(true);

  const handleLogout = () => { window.location.href = "/login"; };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOptionsLoading(true);
      try {
        const [programsJson, participantsResult] = await Promise.all([
          getPrograms({ page: 1, limit: 500 }),
          fetchParticipants({ page: 1, limit: 500 }),
        ]);
        if (cancelled) return;
        setPrograms(programsJson.data || []);
        setParticipants(participantsResult.data || []);
      } catch (err) {
        console.error("Failed to load program/participant options:", err);
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const programById = useMemo(() => {
    const map = {};
    for (const p of programs) {
      const label = p.title || `Program #${p.id}`;
      map[p.id] = label;
      map[String(p.id)] = label;
    }
    return map;
  }, [programs]);

  const participantById = useMemo(() => {
    const map = {};
    for (const p of participants) {
      const label = formatParticipantLabel(p);
      map[p.id] = label;
      map[String(p.id)] = label;
    }
    return map;
  }, [participants]);

  const programOptions = useMemo(
    () => programs.map((p) => ({ value: String(p.id), label: programById[p.id] })),
    [programs, programById]
  );

  const participantOptions = useMemo(
    () => participants.map((p) => ({ value: String(p.id), label: participantById[p.id] })),
    [participants, participantById]
  );

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const json = await getEnrollments({
        page,
        limit,
        completionStatus: completionStatusFilter,
      });
      setEnrollments(json.data || []);
      setMeta({
        total:      json.meta?.total      ?? 0,
        totalPages: json.meta?.totalPages ?? 1,
      });
    } catch (err) {
      if (err.message !== "Unauthorised") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, completionStatusFilter]);

  useEffect(() => { load(); }, [load]);

  const clearStatus = () => { setStatus(""); setPage(1); };

  const activeFilters = [
    completionStatusFilter && { label: completionStatusFilter, clear: clearStatus },
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
    <div className="enrollments-wrapper">
      <Sidebar handleLogout={handleLogout} />

      <div className="enrollments-main">

        {/* ── Header ── */}
        <header className="enrollments-header">
          <div className="enrollments-header-left">
            <h1>ENROLLMENTS</h1>
            <p>Manage all program enrollment records.</p>
          </div>
        </header>

        <main className="enrollments-inner">

          {/* ── Filter Bar ── */}
          <div className="enrollments-filter-bar">
            <div className="enrollments-select-wrap">
              <FilterDropdown
                value={completionStatusFilter}
                onChange={(v) => { setStatus(v); setPage(1); }}
                options={[
                  { value: "", label: "All Statuses" },
                  ...COMPLETION_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
                ]}
              />
            </div>

            {activeFilters.length > 0 && (
              <div className="enrollments-filter-pills">
                <span className="enrollments-filter-pills-label">Active filters:</span>
                {activeFilters.map((f, i) => (
                  <span key={i} className="enrollments-filter-pill">
                    {f.label}
                    <button onClick={f.clear}><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AddEnrollmentDialog
                onSuccess={load}
                programOptions={programOptions}
                participantOptions={participantOptions}
                optionsLoading={optionsLoading}
              />
            </div>
          </div>

          {/* ── Table ── */}
          <div className="enrollments-table-card">
            <div className="enrollments-table-scroll">

              <div className="en-thead">
                <div className="en-row">
                  <div>ID</div>
                  <div>Program</div>
                  <div>Participant</div>
                  <div>Status</div>
                  <div>Ticket Price</div>
                  <div>Enrollment Date</div>
                  <div>Actions</div>
                </div>
              </div>

              {loading && (
                <div className="en-state-center">
                  <Loader2 size={20} className="animate-spin" style={{ color: "var(--en-red)" }} />
                  <span>Loading enrollments...</span>
                </div>
              )}

              {!loading && error && (
                <div className="en-state-center">
                  <div className="en-state-error"><AlertCircle size={18} /> {error}</div>
                  <button className="en-retry-btn" onClick={load}>Try again</button>
                </div>
              )}

              {!loading && !error && enrollments.length === 0 && (
                <div className="en-state-center">
                  <ClipboardList size={32} style={{ opacity: 0.2, color: "var(--en-navy)" }} />
                  <span>
                    {completionStatusFilter
                      ? "No enrollments match your filters."
                      : "No enrollments yet."}
                  </span>
                  {completionStatusFilter && (
                    <button className="en-clear-filters-link" onClick={clearStatus}>
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && enrollments.map((enr) => (
                <div key={enr.id} className="en-tbody-row">
                  <div className="en-row">
                    <div className="en-cell-main">#{enr.id}</div>
                    <div className="en-cell-main">{lookupName(programById, enr.programId)}</div>
                    <div className="en-cell-sub">{lookupName(participantById, enr.participantId)}</div>
                    <div>
                      <span className={getBadgeClass(enr.completionStatus)}>{enr.completionStatus}</span>
                    </div>
                    <div className="en-cell-sub">
                      {enr.ticketPrice ? `LKR ${Number(enr.ticketPrice).toLocaleString()}` : "—"}
                    </div>
                    <div className="en-cell-sub">
                      {enr.enrollmentDate ? new Date(enr.enrollmentDate).toLocaleDateString() : "—"}
                    </div>
                    <div className="en-actions">
                      <ViewEnrollmentDialog enrollment={enr} programById={programById} participantById={participantById} />
                      <EditEnrollmentDialog   enrollment={enr} onSuccess={load} />
                      <DeleteConfirmDialog enrollment={enr} onSuccess={load} programById={programById} participantById={participantById} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            <div className="enrollments-pagination">
              <div className="en-pag-left">
                <span>Rows per page:</span>
                <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                  {[10, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="en-pag-right">
                <span className="en-pag-count">
                  {meta.total === 0 ? "0 results" : `${startRecord}–${endRecord} of ${meta.total}`}
                </span>
                <div className="en-nav-btns">
                  {NAV_BTNS.map(({ title, disabled, onClick, icon }) => (
                    <button key={title} title={title} disabled={disabled}
                      onClick={onClick} className="en-nav-btn">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                    </button>
                  ))}
                  <span className="en-page-indicator">{page} / {meta.totalPages}</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
