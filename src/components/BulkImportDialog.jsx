import {
  Upload, AlertCircle, CheckCircle2, X, ChevronDown,
  Loader2, FileUp, MapPin, Hash, Mail, Phone, User, Building2, Briefcase,
} from "lucide-react";
import { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  parseExcelFile, getAvailableColumns, getDataPreview, getTotalRowCount,
  validateAndMapData, findDuplicatesWithinData, suggestDistrict,
} from '../utils/excelParser';
import { bulkImportParticipants, checkDuplicateRegistrationNumbers } from '../services/participantsService';
import { DISTRICTS } from '../services/participantsService';
import "../styles/participants.css";

const PARTICIPANT_FIELDS = [
  { id: 'businessName', label: 'Business Name', icon: Building2, required: true },
  { id: 'ownerName', label: 'Owner Name', icon: User, required: true },
  { id: 'email', label: 'Email', icon: Mail, required: true },
  { id: 'phone', label: 'Phone', icon: Phone, required: true },
  { id: 'district', label: 'District', icon: MapPin, required: true },
  { id: 'sector', label: 'Sector', icon: Briefcase, required: true },
  { id: 'registrationNumber', label: 'Registration Number', icon: Hash, required: true },
];

function PStepIndicator({ current, total }) {
  return (
    <div className="p-step-dots" style={{ justifyContent: 'center', marginBottom: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`p-step-dot${i === current ? " p-step-dot-active" : i < current ? " p-step-dot-completed" : ""}`}
          style={{ backgroundColor: i < current ? '#10b981' : undefined }}
        />
      ))}
    </div>
  );
}

export default function BulkImportDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Import, 4: Results
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [validRecords, setValidRecords] = useState([]);
  const [invalidRecords, setInvalidRecords] = useState([]);
  const [duplicatesInData, setDuplicatesInData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const availableColumns = excelData ? getAvailableColumns(excelData.data || excelData) : [];
  const totalRows = excelData ? getTotalRowCount(excelData.data || excelData) : 0;

  // ── Step 1: Upload ──
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'].includes(selectedFile.type)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setError("");
    setFile(selectedFile);

    try {
      const parsed = await parseExcelFile(selectedFile);
      console.log('📦 parseExcelFile returned:', parsed);
      setExcelData(parsed);
    } catch (err) {
      console.error('❌ parseExcelFile error:', err);
      setError(err.message);
      setFile(null);
    }
  };

  const handleContinueToMap = () => {
    if (!excelData) {
      setError('No file loaded');
      return;
    }
    if (availableColumns.length === 0) {
      setError('File is empty');
      return;
    }

    // Auto-detect columns and validate
    const firstSheet = Object.values(excelData.data || excelData)[0] || [];
    
    console.log('🔍 First sheet:', firstSheet);
    console.log('🔍 First sheet length:', firstSheet.length);
    if (firstSheet.length > 0) {
      console.log('🔍 First row:', firstSheet[0]);
      console.log('🔍 First row keys:', Object.keys(firstSheet[0]));
    }
    
    const columnMap = {};

    // Helper to normalize header names
    const headerNormalize = (str) => str.toLowerCase().trim();
    
    // Helper to convert camelCase to Title Case
    const camelCaseToTitleCase = (str) => {
      return str
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
        .trim();
    };
    
    if (firstSheet.length > 0) {
      const headers = Object.keys(firstSheet[0]);
      console.log('🔍 Available headers:', headers); // Debug
      
      PARTICIPANT_FIELDS.forEach(field => {
        const matchedHeader = headers.find(h => {
          const normalizedH = headerNormalize(h);
          const normalizedLabel = headerNormalize(field.label);
          const normalizedId = headerNormalize(field.id);
          const camelCaseConverted = headerNormalize(camelCaseToTitleCase(h));
          
          console.log(`  Checking "${h}" for field "${field.id}":`, { 
            normalizedH, 
            normalizedLabel, 
            normalizedId, 
            camelCaseConverted 
          });
          
          // Match if header matches the field's ID (direct match)
          if (normalizedH === normalizedId) {
            console.log(`    ✅ Direct ID match: "${h}" === "${field.id}"`);
            return true;
          }
          
          // Match if header matches the field's label
          if (normalizedH === normalizedLabel) {
            console.log(`    ✅ Label match: "${h}" === "${field.label}"`);
            return true;
          }
          
          // Match if camelCase header converts to label
          if (camelCaseConverted === normalizedLabel) {
            console.log(`    ✅ CamelCase match: "${camelCaseConverted}" === "${normalizedLabel}"`);
            return true;
          }
          
          return false;
        });
        
        if (matchedHeader) {
          columnMap[field.id] = matchedHeader;
          console.log(`✓ Matched ${field.id} -> ${matchedHeader}`);
        } else {
          console.log(`✗ Failed to match ${field.id} (${field.label})`);
        }
      });
      
      console.log('🔍 Final column map:', columnMap); // Debug
      
      // Check if all required fields were mapped
      const unmapped = PARTICIPANT_FIELDS.filter(f => f.required && !columnMap[f.id]);
      if (unmapped.length > 0) {
        setError(`Could not auto-detect columns: ${unmapped.map(f => f.label).join(', ')}. Found columns: ${headers.join(', ')}`);
        return;
      }
    }

    // Validate and map data
    const { valid, invalid } = validateAndMapData(firstSheet, columnMap, DISTRICTS);
    
    // Check for duplicates within import data
    const internalDups = findDuplicatesWithinData(valid);

    setValidRecords(valid);
    setInvalidRecords(invalid);
    setDuplicatesInData(internalDups);
    setStep(2);
  };

  // ── Step 2: Import ──
  const handlePerformImport = async () => {
    setError("");
    setImporting(true);

    try {
      // Send data to the backend API
      const result = await bulkImportParticipants(validRecords);
      
      setImportResults({
        totalInFile: totalRows,
        imported: result.imported || validRecords.length,
        skipped: result.skipped || 0,
        validationErrors: invalidRecords.length,
        duplicateInData: duplicatesInData.length,
      });

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  // ── Reset & Close ──
  const handleReset = () => {
    setFile(null);
    setExcelData(null);
    setValidRecords([]);
    setInvalidRecords([]);
    setDuplicatesInData([]);
    setImportResults(null);
    setError("");
    setStep(1);
  };

  const handleClose = (open) => {
    if (!open) {
      handleReset();
      if (importResults) {
        onSuccess?.();
      }
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <button
          className="user-btn"
          style={{
            background: '#0f2035',
            color: '#fff',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
            padding: '8px 14px',
          }}
          onClick={() => setOpen(true)}
        >
          <FileUp size={15} /> Bulk Import Excel
        </button>
      </DialogTrigger>

      <DialogContent className="p-dialog-content" style={{ maxWidth: 600 }}>
        <div className="p-dialog-header">
          <div className="p-dialog-header-badge">
            <span className="p-dialog-header-dot" />
            BULK IMPORT
          </div>
          <h2 className="p-dialog-title">Import Participants from Excel</h2>
          <p className="p-dialog-subtitle">Upload and map data from Google Forms export or CSV</p>
          <div className="p-dialog-header-rule" />
        </div>

        <PStepIndicator current={step - 1} total={3} />

        <div className="p-dialog-body">
          {error && (
            <div className="p-alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: Upload ── */}
          {step === 1 && (
            <div style={{ textAlign: 'center', paddingBottom: 20 }}>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 12,
                  padding: 40,
                  marginBottom: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: '#f8fafc',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} style={{ margin: '0 auto 12px', color: '#64748b', opacity: 0.6 }} />
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                  Click to upload or drag and drop
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  Excel (.xlsx, .xls) or CSV files
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {file && (
                <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
                      {file.name} ({totalRows} rows)
                    </span>
                  </div>
                </div>
              )}

              {file && availableColumns.length > 0 && (
                <div style={{ textAlign: 'left', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>
                    DETECTED COLUMNS:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {availableColumns.map(col => (
                      <span
                        key={col}
                        style={{
                          background: '#e0e7ff',
                          color: '#4f46e5',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Review Data ── */}
          {step === 2 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                  ✓ {validRecords.length} valid records ready to import
                </p>
              </div>

              {invalidRecords.length > 0 && (
                <div style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 8 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#dc2626' }}>
                    ✗ {invalidRecords.length} records with validation errors
                  </p>
                  <div style={{ fontSize: 12, color: '#991b1b', maxHeight: 150, overflowY: 'auto' }}>
                    {invalidRecords.slice(0, 5).map((inv, i) => (
                      <div key={i}>
                        <strong>Row {inv.row}:</strong> {inv.errors.join(', ')}
                      </div>
                    ))}
                    {invalidRecords.length > 5 && <div>... and {invalidRecords.length - 5} more</div>}
                  </div>
                </div>
              )}

              {duplicatesInData.length > 0 && (
                <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 8 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#b45309' }}>
                    ⚠ {duplicatesInData.length} duplicate registration numbers in file
                  </p>
                  <div style={{ fontSize: 12, color: '#78350f' }}>
                    {duplicatesInData.slice(0, 5).map((dup, i) => (
                      <div key={i}>{dup.regNumber}</div>
                    ))}
                  </div>
                </div>
              )}


            </div>
          )}

          {/* ── STEP 3: Results ── */}
          {step === 3 && importResults && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: 16, backgroundColor: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px', color: '#10b981' }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#16a34a' }}>Import Complete!</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>Imported</p>
                  <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#10b981' }}>
                    {importResults.imported}
                  </p>
                </div>
                <div style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>Skipped</p>
                  <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#dc2626' }}>
                    {importResults.skipped}
                  </p>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                <div>📄 Total rows in file: {importResults.totalInFile}</div>
                <div>❌ Validation errors: {importResults.validationErrors}</div>
                <div>⚠️  Duplicates within file: {importResults.duplicateInData}</div>
              </div>

              {validRecords.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>IMPORTED DATA:</p>
                  <div style={{ 
                    overflowX: 'auto', 
                    maxHeight: 300, 
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    backgroundColor: '#f8fafc'
                  }}>
                    <table style={{ 
                      width: '100%', 
                      fontSize: 11, 
                      borderCollapse: 'collapse',
                      minWidth: 800
                    }}>
                      <thead style={{ backgroundColor: '#f1f5f9', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>Business</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>Owner</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>Email</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>Phone</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>District</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>Sector</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>Reg #</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validRecords.map((record, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: 8, color: '#1e293b' }}>{record.businessName}</td>
                            <td style={{ padding: 8, color: '#1e293b' }}>{record.ownerName}</td>
                            <td style={{ padding: 8, color: '#1e293b', wordBreak: 'break-word' }}>{record.email}</td>
                            <td style={{ padding: 8, color: '#1e293b' }}>{record.phone}</td>
                            <td style={{ padding: 8, color: '#1e293b' }}>{record.district}</td>
                            <td style={{ padding: 8, color: '#1e293b' }}>{record.sector}</td>
                            <td style={{ padding: 8, color: '#1e293b' }}>{record.registrationNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-dialog-footer">
          <div className="p-dialog-footer-actions">
            <button
              className="p-cancel-btn"
              onClick={() => handleClose(false)}
            >
              {step === 3 ? "Done" : "Cancel"}
            </button>

            {step === 1 && (
              <button
                className="p-submit-btn"
                onClick={handleContinueToMap}
                disabled={!file}
              >
                Review Data
              </button>
            )}

            {step === 2 && (
              <button
                className="p-submit-btn"
                onClick={handlePerformImport}
                disabled={importing}
              >
                {importing ? (
                  <><Loader2 size={14} className="animate-spin" /> Importing...</>
                ) : (
                  "Start Import"
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
