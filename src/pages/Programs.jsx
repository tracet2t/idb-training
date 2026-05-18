import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, Loader2,
  AlertCircle, X, BookOpen, MapPin, Users, Hash, Tag,
  Calendar, DollarSign, Briefcase, CreditCard, ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import Sidebar from "../components/Sidebar";
import useAuthStore from "../store/authStore";
import "../styles/programs.css";

// ── Import all API calls and constants from programService ────────
import {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  PROGRAM_STATUSES as STATUSES,
  PROGRAM_TYPES,
  DISTRICTS,
} from "../services/programsService";

// ── Constants ─────────────────────────────────────────────────────
const EMPTY_CREATE = {
  title: "",
  description: "",
  sector: "",
  district: "",
  startDate: "",
  endDate: "",
  status: "upcoming",
  programType: "free",
  totalBudget: "",
};

// ── Badge helper ──────────────────────────────────────────────────
function getBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case "ongoing":   return "pg-badge pg-badge-active";
    case "completed": return "pg-badge pg-badge-completed";
    case "upcoming":  return "pg-badge pg-badge-scheduled";
    case "cancelled": return "pg-badge pg-badge-cancelled";
    default:          return "pg-badge pg-badge-default";
  }
}

// ── Highlight search match in text ────────────────────────────────
function HighlightMatch({ text, query }) {
  if (!query?.trim() || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#fef08a", color: "#713f12", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Field-level validation ────────────────────────────────────────
function validateForm(form, isEdit = false) {
  const errs = {};
  if (!form.title?.trim())    errs.title    = "Required";
  if (!form.sector?.trim())   errs.sector   = "Required";
  if (!form.district)         errs.district = "Select a district";
  if (!form.startDate)        errs.startDate = "Required";
  if (!form.endDate)          errs.endDate   = "Required";
  if (form.startDate && form.endDate && form.endDate < form.startDate)
                              errs.endDate   = "Must be after start date";
  const budget = form.totalBudget;
  if (budget === "" || budget === undefined || budget === null || isNaN(Number(budget)) || Number(budget) < 0)
                              errs.totalBudget = "Valid amount required";
  if (isEdit && !STATUSES.includes(form.status)) errs.status = "Select a status";
  return errs;
}

// ── Section header used inside the new dialog ─────────────────────
function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="pg-section-header">
      <div className="pg-section-icon">
        <Icon size={14} />
      </div>
      <span>{label}</span>
    </div>
  );
}

// ── Redesigned field label ────────────────────────────────────────
function NewField({ label, required, error, children }) {
  return (
    <div className="pg-new-field">
      <label className="pg-new-label">
        {label}
        {required && <span className="pg-field-required"> *</span>}
      </label>
      {children}
      {error && <div className="pg-field-error">{error}</div>}
    </div>
  );
}

// ── Icon-prefixed text input ──────────────────────────────────────
function IconInput({ icon: Icon, name, value, onChange, placeholder, type = "text", hasError }) {
  return (
    <div className={`pg-icon-input${hasError ? " pg-icon-input-error" : ""}`}>
      <Icon size={15} className="pg-icon-input-icon" />
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pg-icon-input-field"
      />
    </div>
  );
}

// ── Icon-prefixed select ──────────────────────────────────────────
function IconSelect({ icon: Icon, name, value, onChange, children, hasError, placeholder }) {
  return (
    <div className={`pg-icon-input${hasError ? " pg-icon-input-error" : ""}`}>
      <Icon size={15} className="pg-icon-input-icon" />
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="pg-icon-input-field pg-icon-select"
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children}
      </select>
      <ChevronDown size={13} className="pg-select-chevron" />
    </div>
  );
}

// ── Program Type toggle buttons ───────────────────────────────────
function TypeToggle({ value, onChange }) {
  return (
    <div className="pg-type-toggle">
      {PROGRAM_TYPES.map((t) => (
        <button
          key={t}
          type="button"
          className={`pg-type-btn${value === t ? " pg-type-btn-active" : ""}`}
          onClick={() => onChange(t)}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ── Step dots in footer ───────────────────────────────────────────
function StepDots({ total = 3, active = 0 }) {
  return (
    <div className="pg-step-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`pg-step-dot${i === active ? " pg-step-dot-active" : ""}`} />
      ))}
    </div>
  );
}

// ── Shared dialog header ──────────────────────────────────────────
function DialogHeader2({ badge, title, subtitle }) {
  return (
    <div className="pg-add-header">
      <div className="pg-add-header-badge">
        <span className="pg-add-header-dot" />
        {badge}
      </div>
      <h2 className="pg-add-title" style={{ fontSize: 20 }}>{title}</h2>
      <p className="pg-add-subtitle">{subtitle}</p>
      <div className="pg-add-header-rule" />
    </div>
  );
}

// ── Custom Dropdown (replaces native select for District & Status) ─
function CustomDropdown({ icon: Icon, value, onChange, options, placeholder, hasError }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`pg-icon-input${hasError ? " pg-icon-input-error" : ""}`}
        style={{ width: "100%", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}
      >
        <Icon size={15} className="pg-icon-input-icon" />
        <span style={{
          flex: 1, fontSize: 13,
          color: selected ? "#1e293b" : "#9ca3af",
          pointerEvents: "none", userSelect: "none",
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={13}
          className="pg-select-chevron"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, zIndex: 9999, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}>
          {/* Search — only show if more than 6 options */}
          {options.length > 6 && (
            <div style={{ padding: "8px 8px 4px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ position: "relative" }}>
                <Search size={12} style={{
                  position: "absolute", left: 8, top: "50%",
                  transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none",
                }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search..."
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "6px 8px 6px 26px", fontSize: 12,
                    border: "1px solid #e2e8f0", borderRadius: 6,
                    background: "#f8fafc", outline: "none", color: "#1e293b",
                  }}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "10px", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
                No results
              </div>
            ) : filtered.map(o => {
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

// ── Filter Bar Dropdown (no icon, matches native select look) ─────
function FilterDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`programs-filter-select${value ? " is-active" : ""}`}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, width: "100%",appearance: "none", WebkitAppearance: "none", backgroundImage: "none" }}
      >
        <span style={{ fontSize: 13 }}>{selected?.label || options[0]?.label}</span>
        <ChevronDown size={13} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, zIndex: 9999, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 140,
        }}>
          {options.length > 6 && (
            <div style={{ padding: "8px 8px 4px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ position: "relative" }}>
                <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search..."
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "6px 8px 6px 26px", fontSize: 12,
                    border: "1px solid #e2e8f0", borderRadius: 6,
                    background: "#f8fafc", outline: "none", color: "#1e293b",
                  }}
                />
              </div>
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "10px", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>No results</div>
            ) : filtered.map(o => {
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

// ── Add Program Dialog ────────────────────────────────────────────
function AddProgramDialog({ onSuccess }) {
  const user = useAuthStore((state) => state.user);
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

  const setField = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    setFieldErrs(f => ({ ...f, [name]: undefined }));
  };

  const handleSave = async () => {
    const createdById = user?.sub?.trim();
    if (!createdById) {
      setError("Unable to determine your NIC. Please sign in again.");
      document.querySelector(".pg-add-body")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const errs = validateForm(form);
    if (Object.keys(errs).length) {
      setFieldErrs(errs);
      document.querySelector(".pg-add-body")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError(""); setSaving(true);
    try {
      await createProgram({ ...form, createdById });
      setOpen(false);
      setForm(EMPTY_CREATE);
      setFieldErrs({});
      onSuccess?.();
    } catch (err) {
      console.error("createProgram error:", err?.response ?? err);
      const data = err?.response?.data;
      const msg =
        (typeof data === "string" ? data : null) ||
        data?.message ||
        data?.error ||
        data?.details ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
      document.querySelector(".pg-add-body")?.scrollTo({ top: 0, behavior: "smooth" });
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
          <Plus size={15} /> Add Program
        </button>
      </DialogTrigger>

      <DialogContent className="pg-add-dialog-content">

        <div className="pg-add-header">
          <div className="pg-add-header-badge">
            <span className="pg-add-header-dot" />
            PROGRAMS REGISTRY
          </div>
          <h2 className="pg-add-title">Add New Program</h2>
          <p className="pg-add-subtitle">
            Industrial Development Board of Ceylon — SME Initiatives
          </p>
          <div className="pg-add-header-rule" />
        </div>

        <div className="pg-add-body">

          {error && (
            <div className="pg-alert-error" style={{ marginBottom: 4 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <SectionHeader icon={BookOpen} label="PROGRAM IDENTITY" />

          <NewField label="Program Title" required error={fieldErrs.title}>
            <IconInput
              icon={BookOpen}
              name="title"
              value={form.title}
              onChange={set}
              placeholder="e.g. SME Digital Skills Bootcamp 2025"
              hasError={!!fieldErrs.title}
            />
          </NewField>

          <NewField label="Sector" required error={fieldErrs.sector}>
            <IconInput
              icon={Briefcase}
              name="sector"
              value={form.sector}
              onChange={set}
              placeholder="e.g. Manufacturing, Technology, Agribusiness"
              hasError={!!fieldErrs.sector}
            />
          </NewField>

          <SectionHeader icon={MapPin} label="LOCATION & STATUS" />

          <div className="pg-add-grid-2">
            <NewField label="District" required error={fieldErrs.district}>
              <CustomDropdown
                icon={MapPin}
                name="district"
                value={form.district}
                onChange={(v) => { setForm(f => ({ ...f, district: v })); setFieldErrs(f => ({ ...f, district: undefined })); }}
                options={DISTRICTS.map(d => ({ value: d, label: d.replace(/_/g, " ") }))}
                placeholder="Select district"
                hasError={!!fieldErrs.district}
              />
            </NewField>

            <NewField label="Status" required error={fieldErrs.status}>
              <CustomDropdown
                icon={Tag}
                name="status"
                value={form.status}
                onChange={(v) => { setForm(f => ({ ...f, status: v })); setFieldErrs(f => ({ ...f, status: undefined })); }}
                options={STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                placeholder="Select status"
                hasError={!!fieldErrs.status}
              />
            </NewField>
          </div>

          <SectionHeader icon={Calendar} label="SCHEDULE" />

          <div className="pg-add-grid-2">
            <NewField label="Start Date" required error={fieldErrs.startDate}>
              <IconInput
                icon={Calendar}
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={set}
                hasError={!!fieldErrs.startDate}
              />
            </NewField>

            <NewField label="End Date" required error={fieldErrs.endDate}>
              <IconInput
                icon={Calendar}
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={set}
                hasError={!!fieldErrs.endDate}
              />
            </NewField>
          </div>

          <SectionHeader icon={DollarSign} label="BUDGET & TYPE" />

          <div className="pg-add-grid-2">
            <NewField label="Total Budget (LKR)" required error={fieldErrs.totalBudget}>
              <div className={`pg-budget-input${fieldErrs.totalBudget ? " pg-icon-input-error" : ""}`}>
                <span className="pg-budget-prefix">LKR</span>
                <input
                  name="totalBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalBudget}
                  onChange={set}
                  placeholder="0.00"
                  className="pg-budget-field"
                />
              </div>
            </NewField>

            <NewField label="Program Type" required error={fieldErrs.programType}>
              <TypeToggle
                value={form.programType}
                onChange={(v) => setField("programType", v)}
              />
            </NewField>
          </div>

          <SectionHeader icon={Users} label="ADMINISTRATOR" />

          <NewField label="Created By (NIC)">
            <div className="pg-icon-input pg-created-by-readonly">
              <Users size={15} className="pg-icon-input-icon" />
              <span className="pg-created-by-value">
                {user?.sub ?? "—"}
              </span>
            </div>
          </NewField>

          <NewField label="Description" error={fieldErrs.description}>
            <div className="pg-textarea-wrap">
              <textarea
                name="description"
                value={form.description}
                onChange={set}
                placeholder="Brief program description..."
                rows={3}
                className="pg-textarea"
              />
            </div>
          </NewField>

        </div>

        <div className="pg-add-footer">
          <StepDots total={3} active={0} />
          <div className="pg-add-footer-actions">
            <button className="pg-cancel-btn" onClick={() => handleOpenChange(false)}>
              Cancel
            </button>
            <button className="pg-save-btn-new" onClick={handleSave} disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : "Save Program"}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ── View Program Dialog ───────────────────────────────────────────
function ViewProgramDialog({ program }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="pg-action-btn pg-action-btn-view" title="View program">
          <Eye size={15} style={{ color: "var(--pg-gold)" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="pg-dialog-content">
        <DialogHeader2
          badge="VIEW"
          title="Program details"
          subtitle="Industrial Development Board of Ceylon"
        />
        <div className="pg-view-body">
          <div className="pg-view-row pg-view-row-full">
            <span className="pg-detail-label">Program title</span>
            <span className="pg-detail-value" style={{ fontSize: 15, fontWeight: 600, color: "var(--pg-navy)" }}>
              {program.title}
            </span>
          </div>
          <div className="pg-view-divider" />
          <div className="pg-view-grid">
            <div className="pg-view-row">
              <span className="pg-detail-label">Sector</span>
              <span className="pg-detail-value">{program.sector || "—"}</span>
            </div>
            <div className="pg-view-row">
              <span className="pg-detail-label">District</span>
              <span className="pg-detail-value">{program.district?.replace(/_/g, " ") || "—"}</span>
            </div>
            <div className="pg-view-row">
              <span className="pg-detail-label">Status</span>
              <span className={getBadgeClass(program.status)} style={{ marginTop: 2 }}>{program.status}</span>
            </div>
            <div className="pg-view-row">
              <span className="pg-detail-label">Program type</span>
              <span className="pg-detail-value" style={{ textTransform: "capitalize" }}>{program.programType || "—"}</span>
            </div>
          </div>
          <div className="pg-view-divider" />
          <div className="pg-view-grid">
            <div className="pg-view-row">
              <span className="pg-detail-label">Start date</span>
              <span className="pg-detail-value">
                {program.startDate ? new Date(program.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
            <div className="pg-view-row">
              <span className="pg-detail-label">End date</span>
              <span className="pg-detail-value">
                {program.endDate ? new Date(program.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
          <div className="pg-view-row pg-view-row-full">
            <span className="pg-detail-label">Total budget</span>
            <span className="pg-detail-value" style={{ fontWeight: 600, color: "var(--pg-navy)" }}>
              {program.totalBudget ? `LKR ${Number(program.totalBudget).toLocaleString()}` : "—"}
            </span>
          </div>
          {program.description && (
            <>
              <div className="pg-view-divider" />
              <div className="pg-view-row pg-view-row-full">
                <span className="pg-detail-label">Description</span>
                <span className="pg-detail-value" style={{ lineHeight: 1.6 }}>{program.description}</span>
              </div>
            </>
          )}
        </div>
        <div className="pg-dialog-footer">
          <button className="pg-save-btn-new" onClick={() => setOpen(false)}>Close</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Program Dialog ───────────────────────────────────────────
function EditProgramDialog({ program, onSuccess }) {
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [form, setForm]           = useState({});
  const [fieldErrs, setFieldErrs] = useState({});

  useEffect(() => {
    if (program) {
      setForm({
        ...program,
        startDate: program.startDate ? program.startDate.slice(0, 10) : "",
        endDate:   program.endDate   ? program.endDate.slice(0, 10)   : "",
        totalBudget: program.totalBudget ?? "",
      });
    }
  }, [program]);

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
      await updateProgram(program.id, form);
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
        <button className="pg-action-btn pg-action-btn-edit" title="Edit program">
          <Pencil size={15} style={{ color: "var(--pg-gold)" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="pg-dialog-content">
        <DialogHeader2
          badge="EDIT"
          title="Edit program"
          subtitle="Update program details below"
        />
        <div className="pg-add-body">
          {error && (
            <div className="pg-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <SectionHeader icon={BookOpen} label="PROGRAM IDENTITY" />
          <NewField label="Program Title" required error={fieldErrs.title}>
            <IconInput icon={BookOpen} name="title" value={form.title || ""} onChange={set}
              placeholder="Program title" hasError={!!fieldErrs.title} />
          </NewField>
          <NewField label="Sector" required error={fieldErrs.sector}>
            <IconInput icon={Briefcase} name="sector" value={form.sector || ""} onChange={set}
              placeholder="e.g. Technology, Manufacturing" hasError={!!fieldErrs.sector} />
          </NewField>

          <SectionHeader icon={MapPin} label="LOCATION & STATUS" />
          <div className="pg-add-grid-2">
            <NewField label="District" required error={fieldErrs.district}>
              <CustomDropdown
                  icon={MapPin}
                  value={form.district}
                  onChange={(v) => { setForm(f => ({ ...f, district: v })); setFieldErrs(f => ({ ...f, district: undefined })); }}
                  options={DISTRICTS.map(d => ({ value: d, label: d.replace(/_/g, " ") }))}
                  placeholder="Select district"
                  hasError={!!fieldErrs.district}
              />
            </NewField>
            <NewField label="Status" required error={fieldErrs.status}>
              <CustomDropdown  
                  icon={Tag}
                  value={form.status}
                  onChange={(v) => { setForm(f => ({ ...f, status: v })); setFieldErrs(f => ({ ...f, status: undefined })); }}
                  options={STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                  placeholder="Select status"
                  hasError={!!fieldErrs.status}
              />
            </NewField>
          </div>

          <SectionHeader icon={Calendar} label="SCHEDULE" />
          <div className="pg-add-grid-2">
            <NewField label="Start Date" required error={fieldErrs.startDate}>
              <IconInput icon={Calendar} name="startDate" type="date" value={form.startDate || ""}
                onChange={set} hasError={!!fieldErrs.startDate} />
            </NewField>
            <NewField label="End Date" required error={fieldErrs.endDate}>
              <IconInput icon={Calendar} name="endDate" type="date" value={form.endDate || ""}
                onChange={set} hasError={!!fieldErrs.endDate} />
            </NewField>
          </div>

          <SectionHeader icon={DollarSign} label="BUDGET & TYPE" />
          <div className="pg-add-grid-2">
            <NewField label="Total Budget (LKR)" required error={fieldErrs.totalBudget}>
              <div className={`pg-budget-input${fieldErrs.totalBudget ? " pg-icon-input-error" : ""}`}>
                <span className="pg-budget-prefix">LKR</span>
                <input name="totalBudget" type="number" min="0" step="0.01"
                  value={form.totalBudget} onChange={set} placeholder="0.00" className="pg-budget-field" />
              </div>
            </NewField>
            <NewField label="Program Type" required error={fieldErrs.programType}>
              <TypeToggle
                value={form.programType || "free"}
                onChange={(v) => setForm(f => ({ ...f, programType: v }))}
              />
            </NewField>
          </div>

          <NewField label="Description" error={fieldErrs.description}>
            <div className="pg-textarea-wrap">
              <textarea name="description" value={form.description || ""} onChange={set}
                placeholder="Brief program description..." rows={3} className="pg-textarea" />
            </div>
          </NewField>
        </div>

        <div className="pg-add-footer">
          <StepDots total={3} active={1} />
          <div className="pg-add-footer-actions">
            <button className="pg-cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="pg-save-btn-new" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────
function DeleteConfirmDialog({ program, onSuccess }) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setBusy(true); setError("");
    try {
      await deleteProgram(program.id);
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
        <button className="pg-action-btn pg-action-btn-delete" title="Delete program">
          <Trash2 size={15} style={{ color: "#ef4444" }} />
        </button>
      </DialogTrigger>
      <DialogContent className="pg-dialog-content" style={{ maxWidth: 440 }}>
        <DialogHeader2
          badge="DELETE"
          title="Remove program"
          subtitle="This action cannot be undone"
        />
        <div className="pg-add-body" style={{ gap: 12 }}>
          <div className="pg-delete-warn">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1, color: "#dc2626" }} />
            <p>
              Permanently removing{" "}
              <strong style={{ color: "#1e293b" }}>{program.title}</strong>{" "}
              and all associated enrollments.
            </p>
          </div>
          <div className="pg-view-grid" style={{ marginTop: 4 }}>
            <div className="pg-view-row">
              <span className="pg-detail-label">Status</span>
              <span className={getBadgeClass(program.status)} style={{ marginTop: 2 }}>{program.status}</span>
            </div>
            <div className="pg-view-row">
              <span className="pg-detail-label">District</span>
              <span className="pg-detail-value">{program.district?.replace(/_/g, " ") || "—"}</span>
            </div>
          </div>
          {error && (
            <div className="pg-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
        </div>
        <div className="pg-dialog-footer">
          <button className="pg-cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
          <button className="pg-delete-btn" onClick={handleDelete} disabled={busy}>
            {busy ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Yes, delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Programs() {
  const [programs, setPrograms]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [searchInput, setSearchInput]       = useState("");
  const [search, setSearch]                 = useState("");
  const [statusFilter, setStatus]           = useState("");
  const [programTypeFilter, setProgramType] = useState("");
  const [page, setPage]                     = useState(1);
  const [limit, setLimit]                   = useState(10);
  const [meta, setMeta]                     = useState({ total: 0, totalPages: 1 });

  const searchRef = useRef(null);
  const handleLogout = () => { window.location.href = "/login"; };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const json = await getPrograms({
        page,
        limit,
        search,
        status:      statusFilter,
        programType: programTypeFilter,
      });
      setPrograms(json.data || []);
      setMeta({ total: json.total ?? 0, totalPages: json.totalPages ?? 1 });
    } catch (err) {
      if (err.message !== "Unauthorised") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, programTypeFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const clearSearch      = () => { setSearchInput(""); setSearch(""); setPage(1); searchRef.current?.focus(); };
  const clearStatus      = () => { setStatus("");      setPage(1); };
  const clearProgramType = () => { setProgramType(""); setPage(1); };

  const activeFilters = [
    statusFilter      && { label: statusFilter,      clear: clearStatus },
    programTypeFilter && { label: programTypeFilter, clear: clearProgramType },
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
    <div className="programs-wrapper">
      <Sidebar handleLogout={handleLogout} />

      <div className="programs-main">

        {/* ── Header ── */}
        <header className="programs-header">
          <div className="programs-header-left">
            <h1>PROGRAMS</h1>
            <p>Manage all SME training initiatives and bootcamps.</p>
          </div>
        </header>

        <main className="programs-inner">

          {/* ── Search & Filters ── */}
          <div className="programs-filter-bar">

            <div style={{ flex: '1 1 180px', maxWidth: 400, position: 'relative' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute', left: 11, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b', pointerEvents: 'none',
                  width: 15, height: 15, flexShrink: 0,
                }}
              />
              <input
                ref={searchRef}
                type="text"
                className="programs-search-input"
                placeholder="Search by program title..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Escape" && clearSearch()}
                style={{
                  width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '7px 34px 7px 34px',
                  fontSize: 13, color: '#1e293b', background: '#fff', outline: 'none',
                }}
              />
              {searchInput && (
                <button onClick={clearSearch} style={{
                  position: 'absolute', right: 8, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', display: 'flex', alignItems: 'center', padding: 2,
                }}>
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="programs-select-wrap">
               <FilterDropdown
                  value={statusFilter}
                  onChange={(v) => { setStatus(v); setPage(1); }}
                  options={[
                      { value: "", label: "All Statuses" },
                       ...STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))
                      ]}
                />
            </div>

            <div className="programs-select-wrap">
              <FilterDropdown
                 value={programTypeFilter}
                 onChange={(v) => { setProgramType(v); setPage(1); }}
                 options={[
                     { value: "", label: "All Types" },
                     ...PROGRAM_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))
                     ]}
              />
            </div>

            {activeFilters.length > 0 && (
              <div className="programs-filter-pills">
                <span className="programs-filter-pills-label">Active filters:</span>
                {activeFilters.map((f, i) => (
                  <span key={i} className="programs-filter-pill">
                    {f.label}
                    <button onClick={f.clear}><X size={11} /></button>
                  </span>
                ))}
                {activeFilters.length > 1 && (
                  <button className="programs-clear-all" onClick={() => { clearStatus(); clearProgramType(); }}>
                    Clear all
                  </button>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AddProgramDialog onSuccess={load} />
            </div>
          </div>

          {/* ── Table ── */}
          <div className="programs-table-card">
            <div className="programs-table-scroll">

              <div className="pg-thead">
                <div className="pg-row">
                  <div>Program Title</div>
                  <div>Sector</div>
                  <div>District</div>
                  <div>Status</div>
                  <div>Type</div>
                  <div>Start Date</div>
                  <div>Actions</div>
                </div>
              </div>

              {loading && (
                <div className="pg-state-center">
                  <Loader2 size={20} className="animate-spin" style={{ color: "var(--pg-red)" }} />
                  <span>Loading programs...</span>
                </div>
              )}

              {!loading && error && (
                <div className="pg-state-center">
                  <div className="pg-state-error"><AlertCircle size={18} /> {error}</div>
                  <button className="pg-retry-btn" onClick={load}>Try again</button>
                </div>
              )}

              {!loading && !error && programs.length === 0 && (
                <div className="pg-state-center">
                  <BookOpen size={32} style={{ opacity: 0.2, color: "var(--pg-navy)" }} />
                  <span>
                    {search || statusFilter || programTypeFilter
                      ? "No programs match your filters."
                      : "No programs yet."}
                  </span>
                  {(search || statusFilter || programTypeFilter) && (
                    <button className="pg-clear-filters-link"
                      onClick={() => { clearSearch(); clearStatus(); clearProgramType(); }}>
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && programs.map((prog) => (
                <div key={prog.id} className="pg-tbody-row">
                  <div className="pg-row">
                    <div className="pg-cell-main">
                      <HighlightMatch text={prog.title} query={search} />
                    </div>
                    <div className="pg-cell-sub">{prog.sector || "—"}</div>
                    <div className="pg-cell-sub">{prog.district?.replace(/_/g, " ") || "—"}</div>
                    <div>
                      <span className={getBadgeClass(prog.status)}>{prog.status}</span>
                    </div>
                    <div className="pg-cell-sub">{prog.programType || "—"}</div>
                    <div className="pg-cell-sub">
                      {prog.startDate ? new Date(prog.startDate).toLocaleDateString() : "—"}
                    </div>
                    <div className="pg-actions">
                      <ViewProgramDialog   program={prog} />
                      <EditProgramDialog   program={prog} onSuccess={load} />
                      <DeleteConfirmDialog program={prog} onSuccess={load} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            <div className="programs-pagination">
              <div className="pg-pag-left">
                <span>Rows per page:</span>
                <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                  {[10, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="pg-pag-right">
                <span className="pg-pag-count">
                  {meta.total === 0 ? "0 results" : `${startRecord}–${endRecord} of ${meta.total}`}
                </span>
                <div className="pg-nav-btns">
                  {NAV_BTNS.map(({ title, disabled, onClick, icon }) => (
                    <button key={title} title={title} disabled={disabled}
                      onClick={onClick} className="pg-nav-btn">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                    </button>
                  ))}
                  <span className="pg-page-indicator">{page} / {meta.totalPages}</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
