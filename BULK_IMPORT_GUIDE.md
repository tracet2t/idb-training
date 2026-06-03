# Bulk Import Feature Guide

## Overview

The bulk import feature allows administrators to import multiple participants from Excel or CSV files in a single operation. This feature is designed to work seamlessly with Google Forms exports and standard spreadsheets.

## Feature Highlights

- ✅ Excel (.xlsx, .xls) and CSV file support
- ✅ Intuitive column mapping interface
- ✅ Real-time data validation
- ✅ Duplicate detection (file-level and database-level)
- ✅ Import summary with detailed statistics
- ✅ Automatic participant list refresh after successful import

## How to Use

### Step 1: Access Bulk Import

Navigate to the **Participants** page and click the **"Bulk Import Excel"** button (located next to "Add Participant" button).

### Step 2: Upload File

- Click the upload area or drag & drop an Excel/CSV file
- The system will automatically detect columns in the file
- A preview shows detected column names

### Step 3: Map Columns

The dialog will show dropdown selectors for each required field:

| Required Field | Description |
|---|---|
| **Business Name** | Legal business name or entity name |
| **Owner Name** | Full name of business owner/representative |
| **Email** | Contact email address |
| **Phone** | Contact phone number (7-15 digits) |
| **District** | Sri Lankan district from predefined list |
| **Sector** | Business sector/industry |
| **Registration Number** | Unique registration identifier (used for duplicate detection) |

Map each field to the corresponding Excel column using the dropdown selectors. All fields are required.

### Step 4: Review Data

The system validates all records and shows:

- ✅ **Valid records** - Number of records ready to import
- ❌ **Validation errors** - Records that don't meet requirements with specific error messages
- ⚠️ **Duplicate registration numbers** - Duplicates found within the import file itself
- 💡 **Next step** - Click "Check for Duplicates" to find existing records in database

### Step 5: Check Database for Duplicates

The system queries the database to find any existing participants with the same registration numbers. These records will be:

- Displayed as warnings
- Automatically skipped during import (not overwritten)
- Included in the final summary

### Step 6: Import Records

Click "Start Import" to begin the import process. The system will:

1. Filter out database duplicates
2. Import remaining valid records
3. Display progress indicator
4. Show final summary

### Step 7: Review Results

Import completion summary shows:

| Metric | Description |
|---|---|
| **Imported** | Number of records successfully added |
| **Skipped** | Records not imported (duplicates or validation errors) |
| **Total rows in file** | Original file size |
| **Validation errors** | Records with formatting/content errors |
| **Duplicates in file** | Duplicate registration numbers within import file |
| **Duplicates in database** | Existing records found in database |

After closing the dialog, the Participants list will automatically refresh.

## Expected File Format

### Excel/CSV Structure

**Required columns** (order doesn't matter):
- Business Name
- Owner Name
- Email
- Phone
- District
- Sector
- Registration Number

### Sample Data

```csv
Business Name,Owner Name,Email,Phone,District,Sector,Registration Number
"ABC Trading (Pvt) Ltd","John Doe","john@example.com","+94701234567","Colombo","Retail","REG-ABC-001"
"XYZ Manufacturing","Jane Smith","jane@example.com","+94712345678","Gampaha","Manufacturing","REG-XYZ-002"
"Tech Solutions","Bob Johnson","bob@example.com","+94723456789","Kandy","IT Services","REG-TECH-003"
```

### Google Forms Export Format

When exporting from Google Forms:
1. Open the linked Google Sheet
2. File → Download → Microsoft Excel (.xlsx)
3. Use "Bulk Import Excel" feature
4. Map columns to participant fields

The system will automatically detect all columns from the export.

## Validation Rules

### Email Validation
- Must be valid email format: `user@domain.com`
- Cannot be empty

### Phone Validation
- Must be 7-15 characters
- Supports digits, +, -, and spaces
- Example formats: `0701234567`, `+94701234567`, `070 1234 567`

### District Validation
- Must be from the predefined list of Sri Lankan districts:
  - Western Province: Colombo, Gampaha, Kaluthara
  - Central Province: Kandy, Matale, Nuwara Eliya
  - Southern Province: Galle, Matara, Hambantota
  - Eastern Province: Ampara, Trincomalee, Batticaloa
  - Northern Province: Jaffna, Mullaitivu
  - North-Central Province: Anuradhapura, Polonnaruwa
  - Uva Province: Badulla, Monaragala
  - Sabaragamuwa Province: Ratnapura, Kegalle
  - North-Western Province: Kurunegala, Puttalam

### Registration Number Validation
- Cannot be empty
- Used for duplicate detection
- Should be unique within your organization

## Duplicate Handling

### Within File Duplicates
- Detected during review step
- Only first occurrence is imported
- Others are skipped
- Shown in summary as "Duplicates in file"

### Database Duplicates
- Detected during "Check for Duplicates" step
- Existing records are NOT overwritten or updated
- New records are skipped entirely
- Shown in summary as "Duplicates in database"

### Recommended Best Practices
1. Use unique registration numbers for all participants
2. Review the import file before upload for obvious duplicates
3. Check database duplicates before proceeding with import
4. Use the final summary to track what was imported

## Error Messages and Troubleshooting

### "Invalid email format"
- **Cause**: Email doesn't follow standard format
- **Fix**: Ensure email is formatted as `user@domain.com`

### "Phone number must be 7-15 digits"
- **Cause**: Phone number is too short or has invalid characters
- **Fix**: Use 7-15 character format with digits, +, -, spaces only

### "A valid district must be selected"
- **Cause**: District not in predefined list or empty
- **Fix**: Check spelling and ensure it's a recognized Sri Lankan district

### "Registration number is required"
- **Cause**: Field is empty
- **Fix**: Provide a unique registration identifier for each participant

### "Failed to parse Excel file"
- **Cause**: File format not supported or corrupted
- **Fix**: Use .xlsx, .xls, or .csv format; download file again if corrupted

## Performance Notes

- **Recommended file size**: Up to 10,000 rows per import
- **Large files**: May take additional time for validation and duplicate checking
- **Network timeout**: Large imports may require 5-10 minutes

## Supported File Formats

- ✅ Excel 2007+ (.xlsx)
- ✅ Excel 97-2003 (.xls)
- ✅ Comma-Separated Values (.csv)
- ✅ Google Sheets export (.xlsx)

## Security Considerations

- All data is validated before import
- Registration numbers are used only for duplicate detection
- Bulk import requires authenticated user access
- Import history may be audited (depends on backend implementation)

## Technical Details

### Files Involved

**Frontend Components:**
- `src/components/BulkImportDialog.jsx` - Main import dialog UI
- `src/utils/excelParser.js` - Excel file parsing and validation

**Services:**
- `src/services/participantsService.js` - API communication

### Backend Requirements

The backend must implement two endpoints:

```javascript
// 1. Bulk import endpoint
POST /participants/bulk
Body: {
  participants: [
    {
      businessName: "string",
      ownerName: "string",
      email: "string",
      phone: "string",
      district: "string",
      sector: "string",
      registrationNumber: "string"
    },
    ...
  ]
}
Response: {
  imported: number,
  skipped: number,
  errors: [] 
}

// 2. Duplicate check endpoint
POST /participants/check-duplicates
Body: {
  registrationNumbers: ["string", ...]
}
Response: [
  { registrationNumber: "string" },
  ...
]
```

## FAQ

**Q: Can I update existing participants with bulk import?**
A: No, the import feature only creates new records. Duplicates are skipped without modification.

**Q: What happens if some rows fail validation?**
A: Invalid rows are skipped. Only valid rows are imported. You'll see details in the error display and final summary.

**Q: Can I import the same file twice?**
A: No, the duplicate detection will prevent reimporting the same records. You can modify registration numbers and reimport.

**Q: How do I fix errors in the import file?**
A: Cancel the import, fix the Excel file, and retry the import process.

**Q: Can I import without checking duplicates?**
A: No, the "Check for Duplicates" step is mandatory to prevent unintended overwrites.

**Q: Is there a way to undo an import?**
A: No direct undo; contact administrator for manual deletion of imported records if needed.

## Support

For issues or questions:
1. Check validation error messages in the import dialog
2. Review this guide for common problems
3. Verify file format matches expected structure
4. Contact system administrator if errors persist
