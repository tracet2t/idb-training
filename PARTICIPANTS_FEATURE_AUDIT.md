# Participants Page - Feature Audit Report

**Date:** May 21, 2026  
**File:** `src/pages/Participants.jsx`

---

## Requirement 1: Bulk Excel Import

### Requirement:
- Ability to upload an Excel file (collected via Google Forms export)
- Bulk-import participant data into the system
- Map Excel columns to participant fields
- Skip duplicates by NIC
- Show summary of imported vs skipped records

### Current Status: ❌ **NOT IMPLEMENTED**

**What's Missing:**
- [ ] No file upload input element
- [ ] No Excel file parser/reader
- [ ] No column mapping interface
- [ ] No duplicate detection logic
- [ ] No import summary modal/report
- [ ] No bulk import API endpoint handler

**Current Implementation:**
```jsx
// Only "Add Participant" button exists (manual add only)
<AddParticipantDialog onSuccess={load} />
```

---

## Requirement 2: Manual Add Participant

### Requirement:
- If participant doesn't exist, user can manually add them
- Immediately enroll them in a program after adding

### Current Status: ✅ **PARTIALLY IMPLEMENTED**

#### ✅ What's Done:
- Manual Add dialog exists
- Form validation implemented
- Database insert working
- Reload after save

#### ❌ What's Missing:
- **NO immediate enrollment flow after adding**
- After adding participant, user must:
  1. Close dialog
  2. Go to Program Enrollments page
  3. Manually enroll the new participant
  
**Current Code Flow:**
```jsx
const handleSave = async () => {
  await createParticipant(form);      // ✅ Add to system
  setOpen(false);                      // ❌ Just closes dialog
  setForm(EMPTY_CREATE);
  onSuccess?.();                       // ❌ Only reloads table
  // Missing: Redirect to enrollment OR show enrollment dialog
};
```

---

## Complete Feature Requirements vs Implementation

| Feature | Required | Implemented | Status |
|---------|----------|-------------|--------|
| **Bulk Import** | YES | NO | ❌ **MISSING** |
| - File upload | YES | NO | ❌ |
| - Excel parser | YES | NO | ❌ |
| - Column mapping | YES | NO | ❌ |
| - NIC duplicate check | YES | NO | ❌ |
| - Import summary | YES | NO | ❌ |
| **Manual Add** | YES | YES | ✅ |
| - Add form | YES | YES | ✅ |
| - Form validation | YES | YES | ✅ |
| - Save to DB | YES | YES | ✅ |
| **Immediate Enrollment** | YES | NO | ❌ **MISSING** |
| - Post-add enrollment flow | YES | NO | ❌ |
| - Redirect to enrollment | YES | NO | ❌ |
| - Enrollment dialog | YES | NO | ❌ |

---

## What Needs to be Built

### 1. Bulk Excel Import Component
```jsx
<BulkImportDialog onSuccess={load} />
```

**Features needed:**
- File input accepting `.xlsx`, `.xls`, `.csv`
- Column mapping interface (match Excel columns to fields)
- Preview of data to be imported
- Duplicate detection by NIC/Registration Number
- Import summary showing:
  - Total rows in file
  - Successfully imported count
  - Skipped/duplicate count
  - Failed records with error messages

**Flow:**
```
1. User clicks "Bulk Import" button
   ↓
2. Upload Excel file
   ↓
3. Map columns (Business Name → Column A, Owner → Column B, etc.)
   ↓
4. Review & confirm
   ↓
5. Import with progress indicator
   ↓
6. Show summary report
   ↓
7. Refresh participant table
```

---

### 2. Enhanced Manual Add with Enrollment

**Current:**
```jsx
<AddParticipantDialog onSuccess={load} />
// Adds participant, closes dialog, reloads table
```

**Enhanced:**
```jsx
<AddParticipantDialog onSuccess={(newParticipant) => {
  // Option 1: Show "Enroll Now?" dialog
  // Option 2: Redirect to enrollment page with pre-filled participant
  // Option 3: Show Step 2 of same dialog for enrollment
}}
```

**Two-Step Process:**
- **Step 1:** Add participant (current)
- **Step 2:** Immediately enroll in program
  - Select program
  - Set enrollment date
  - Add enrollment notes
  - Save enrollment

---

## Code Areas Affected

### Files to Modify/Create:

1. **New Component:** `src/components/BulkImportDialog.jsx`
   - File upload handler
   - Column mapping interface
   - Duplicate detection
   - Import summary display

2. **Modify:** `src/pages/Participants.jsx`
   - Add `<BulkImportDialog />` button next to `<AddParticipantDialog />`
   - Enhance `AddParticipantDialog` to support enrollment step
   - Add progress states for bulk import

3. **Modify:** `src/services/participantsService.js`
   - Add bulk import API method: `bulkImportParticipants(data)`
   - Add duplicate check method: `checkDuplicateNIC(nic)`
   - Update to return summary report

4. **New:** Helper library for Excel parsing
   - Install: `npm install xlsx` (Excel parser)
   - Create: `src/utils/excelParser.js` (column mapping, data validation)

5. **Modify:** `src/components/ProgramEnrollmentDialog.jsx` (or create)
   - Support pre-filling participant field when opened after add
   - Show enrollment as part of add workflow

---

## Frontend Enhancements Needed

### Button Layout (Header)
```jsx
<div style={{ display:'flex', gap:10 }}>
  <button className="bulk-import-btn">
    <Upload size={15} /> Bulk Import Excel
  </button>
  <AddParticipantDialog onSuccess={load} />
</div>
```

### Bulk Import Dialog Flow
```
Step 1: Select File
├─ Choose Excel file
├─ Show preview (first 5 rows)
└─ Proceed to mapping

Step 2: Column Mapping
├─ Map Excel columns → DB fields
│  ├─ Business Name
│  ├─ Owner Name
│  ├─ Email
│  ├─ Phone
│  ├─ District
│  ├─ Sector
│  └─ Registration Number (NIC equivalent)
└─ Validate data types

Step 3: Review & Confirm
├─ Show total records
├─ Highlight duplicates found
├─ Option to skip or update duplicates
└─ Final confirmation

Step 4: Import Results
├─ Progress bar
├─ Real-time import count
├─ Final summary:
│  ├─ ✅ Imported: 45 records
│  ├─ ⚠️  Skipped: 3 duplicates
│  ├─ ❌ Failed: 2 validation errors
│  └─ 📊 Show failed details
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Install `xlsx` library for Excel parsing
- [ ] Create `excelParser.js` utility
- [ ] Create `BulkImportDialog.jsx` component
- [ ] Add bulk import API endpoint handler
- [ ] Add duplicate detection logic

### Phase 2: UI/UX
- [ ] File upload interface
- [ ] Column mapping UI
- [ ] Data preview table
- [ ] Import progress indicator
- [ ] Summary report modal

### Phase 3: Enhanced Add Flow
- [ ] Modify `AddParticipantDialog` for 2-step process
- [ ] Create enrollment step in add dialog
- [ ] Program selection dropdown
- [ ] Link to enrollments API

### Phase 4: Testing
- [ ] Test with sample Google Forms export
- [ ] Test duplicate detection
- [ ] Test error handling
- [ ] Test large file imports

---

## Estimated Effort

| Task | Complexity | Effort |
|------|-----------|--------|
| Excel parser setup | Low | 30 min |
| Bulk import component | Medium | 2-3 hours |
| Column mapping UI | Medium | 1-2 hours |
| Duplicate detection | Low | 30 min |
| Summary report | Low | 1 hour |
| Enhanced add flow | Medium | 1-2 hours |
| Testing | Medium | 1 hour |
| **Total** | | **6-8 hours** |

---

## Recommendation

### Immediate Actions:
1. ✅ Keep current manual add (working well)
2. ❌ **ADD** bulk import capability (missing critical feature)
3. ❌ **ENHANCE** manual add with enrollment step (user experience)

### Priority:
1. **HIGH:** Bulk Excel Import (new feature, solves batch data entry)
2. **MEDIUM:** Enrollment after manual add (improves workflow)
3. **LOW:** Advanced duplicate handling (edge case)

---

## Questions for Product Team

1. **Excel Column Names:** What are the exact column names from Google Forms export?
   - Sample: "Business Name", "Owner Email", "Contact Phone", etc.

2. **NIC vs Registration Number:** Which field identifies duplicates?
   - Is it `registrationNumber` field?
   - Or is there a separate NIC field?

3. **Duplicate Strategy:** When duplicate found:
   - Skip entirely?
   - Update existing record?
   - Show user and let them choose?

4. **Enrollment Details:** When auto-enrolling after manual add:
   - Which program field is required?
   - Enrollment date = today or user selectable?
   - Any other mandatory fields?

5. **Bulk Import Limits:** Maximum file size or record count?
   - Warn if > 1000 records?
   - Recommend batch import for very large files?

---

## Sample Excel Structure Expected

```
Business Name | Owner Name | Email | Phone | District | Sector | Registration Number
------|------|------|------|------|------|------
Perera Textiles | Amara Perera | amara@... | 0712345678 | Colombo | Manufacturing | PV00123456
Silva Foods | Rajith Silva | rajith@... | 0765432109 | Gampaha | Food & Beverage | PV00123457
...
```

