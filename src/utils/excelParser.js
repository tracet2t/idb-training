import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract data
 * @param {File} file - Excel file to parse
 * @returns {Promise<{sheets: string[], data: Record<string, any[]>}>}
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const result = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          
          console.log('📋 Sheet:', sheetName, 'Ref:', worksheet['!ref']);
          
          if (!worksheet['!ref']) {
            result[sheetName] = [];
            return;
          }
          
          // Get the range to manually extract headers
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          console.log('📋 Range:', range);
          
          // Extract headers from first row manually
          const headers = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
            const headerValue = cell?.v || '';
            headers.push(String(headerValue).trim());
            console.log(`📋 Column ${XLSX.utils.encode_col(C)}: "${headerValue}"`);
          }
          
          console.log('📋 Headers extracted:', headers);
          
          // Use sheet_to_json with headers array
          const allRows = XLSX.utils.sheet_to_json(worksheet, {
            header: headers.length > 0 ? headers : undefined,
            defval: ''
          });
          
          // Filter out the header row (first row will have header names as values)
          const rows = allRows.filter((row, idx) => {
            // Skip if this appears to be a header row (all values match header names)
            if (idx === 0 && headers.length > 0) {
              const isHeaderRow = headers.every(h => row[h]?.toString().toLowerCase().trim() === h.toLowerCase().trim());
              if (isHeaderRow) {
                console.log('📋 Skipping header row');
                return false;
              }
            }
            return true;
          });
          
          console.log('📋 Parsed rows:', rows.length);
          if (rows.length > 0) {
            console.log('📋 First data row:', rows[0]);
            console.log('📋 First row keys:', Object.keys(rows[0]));
          }
          
          result[sheetName] = rows;
        });

        resolve({
          sheets: workbook.SheetNames,
          data: result,
        });
      } catch (error) {
        console.error('❌ Parse error:', error);
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

/**
 * Extract headers from first sheet
 * @param {Record<string, any[]>} data - Parsed sheet data
 * @returns {string[]}
 */
export const getAvailableColumns = (data) => {
  if (!data || Object.keys(data).length === 0) return [];
  const firstSheet = Object.values(data)[0];
  if (!firstSheet || firstSheet.length === 0) return [];
  return Object.keys(firstSheet[0]);
};

/**
 * Get preview of data (first N rows)
 * @param {Record<string, any[]>} data - Parsed sheet data
 * @param {number} count - Number of rows to preview
 * @returns {any[]}
 */
export const getDataPreview = (data, count = 5) => {
  if (!data || Object.keys(data).length === 0) return [];
  const firstSheet = Object.values(data)[0];
  return (firstSheet || []).slice(0, count);
};

/**
 * Get total row count
 * @param {Record<string, any[]>} data - Parsed sheet data
 * @returns {number}
 */
export const getTotalRowCount = (data) => {
  if (!data || Object.keys(data).length === 0) return 0;
  const firstSheet = Object.values(data)[0];
  return (firstSheet || []).length;
};

/**
 * Validate and map Excel data to participant format
 * @param {any[]} rows - Excel rows
 * @param {Record<string, string>} columnMap - Mapping of field names to Excel columns
 * @param {string[]} validDistricts - List of valid district names
 * @returns {{valid: any[], invalid: {row: number, errors: string[]}[]}}
 */
export const validateAndMapData = (rows, columnMap, validDistricts = []) => {
  const valid = [];
  const invalid = [];

  console.log('═══════════════════════════════════════');
  console.log('🔧 VALIDATION STARTING');
  console.log('═══════════════════════════════════════');
  console.log('📌 Column Map:', columnMap);
  console.log('📌 Total rows to validate:', rows.length);
  console.log('═══════════════════════════════════════\n');

  rows.forEach((row, idx) => {
    const errors = [];
    const mapped = {};
    
    console.log(`\n📝 Processing Row ${idx + 1}:`);
    console.log('  Raw data:', row);

    // Map Excel columns to participant fields
    if (columnMap.businessName) {
      const colName = columnMap.businessName;
      const val = row[colName]?.toString().trim();
      console.log(`  ✓ businessName [${colName}] = "${val}"`);
      if (!val) errors.push('Business Name is required');
      else mapped.businessName = val;
    } else {
      console.log(`  ✗ businessName: NOT MAPPED`);
      errors.push('businessName not mapped');
    }

    if (columnMap.ownerName) {
      const colName = columnMap.ownerName;
      const val = row[colName]?.toString().trim();
      console.log(`  ✓ ownerName [${colName}] = "${val}"`);
      if (!val) errors.push('Owner Name is required');
      else mapped.ownerName = val;
    } else {
      console.log(`  ✗ ownerName: NOT MAPPED`);
      errors.push('ownerName not mapped');
    }

    if (columnMap.email) {
      const colName = columnMap.email;
      const val = row[colName]?.toString().trim();
      console.log(`  ✓ email [${colName}] = "${val}"`);
      if (!val) {
        errors.push('Email is required');
        console.log(`    ❌ Empty email`);
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(val);
        console.log(`    📧 Email validation: ${isValid ? '✅ VALID' : '❌ INVALID'} (regex: ${emailRegex})`);
        if (!isValid) errors.push('Invalid email format');
        else mapped.email = val;
      }
    } else {
      console.log(`  ✗ email: NOT MAPPED`);
      errors.push('email not mapped');
    }

    if (columnMap.phone) {
      const colName = columnMap.phone;
      const val = row[colName]?.toString().trim();
      console.log(`  ✓ phone [${colName}] = "${val}"`);
      if (!val) {
        errors.push('Phone is required');
        console.log(`    ❌ Empty phone`);
      } else {
        const phoneRegex = /^[\d+\-\s()]{7,20}$/;
        const isValid = phoneRegex.test(val);
        console.log(`    📞 Phone validation: ${isValid ? '✅ VALID' : '❌ INVALID'} (length: ${val.length}, regex: ${phoneRegex})`);
        if (!isValid) errors.push('Invalid phone format (must be 7-20 characters with digits, +, -, space, or parentheses)');
        else mapped.phone = val;
      }
    } else {
      console.log(`  ✗ phone: NOT MAPPED`);
      errors.push('phone not mapped');
    }

    if (columnMap.district) {
      const colName = columnMap.district;
      const val = row[colName]?.toString().trim();
      console.log(`  ✓ district [${colName}] = "${val}"`);
      if (!val) {
        errors.push('District is required');
      } else if (validDistricts.length > 0 && !validDistricts.includes(val)) {
        errors.push(`Invalid district "${val}". Valid districts: ${validDistricts.slice(0, 3).join(', ')}...`);
      } else {
        mapped.district = val;
      }
    } else {
      console.log(`  ✗ district: NOT MAPPED`);
      errors.push('district not mapped');
    }

    if (columnMap.sector) {
      const colName = columnMap.sector;
      const val = row[colName]?.toString().trim();
      console.log(`  ✓ sector [${colName}] = "${val}"`);
      if (!val) errors.push('Sector is required');
      else mapped.sector = val;
    } else {
      console.log(`  ✗ sector: NOT MAPPED`);
      errors.push('sector not mapped');
    }

    if (columnMap.registrationNumber) {
      const colName = columnMap.registrationNumber;
      const val = row[colName]?.toString().trim();
      console.log(`  ✓ registrationNumber [${colName}] = "${val}"`);
      if (!val) errors.push('Registration Number is required');
      else mapped.registrationNumber = val;
    } else {
      console.log(`  ✗ registrationNumber: NOT MAPPED`);
      errors.push('registrationNumber not mapped');
    }

    if (errors.length === 0) {
      console.log(`  ✅ Row ${idx + 1} VALID - Ready to import`);
      console.log('  Mapped data:', mapped);
      valid.push(mapped);
    } else {
      console.log(`  ❌ Row ${idx + 1} INVALID - Errors:`, errors);
      invalid.push({ row: idx + 1, errors });
    }
  });

  console.log('\n═══════════════════════════════════════');
  console.log(`📊 VALIDATION COMPLETE: ${valid.length} valid, ${invalid.length} invalid`);
  console.log('═══════════════════════════════════════\n');

  return { valid, invalid };
};

/**
 * Check for duplicate registration numbers
 * @param {any[]} mappedData - Mapped participant data
 * @returns {{regNumber: string}[]} - Duplicates found within import data
 */
export const findDuplicatesWithinData = (mappedData) => {
  const seen = new Set();
  const duplicates = [];

  mappedData.forEach((item) => {
    const regNum = item.registrationNumber?.toLowerCase();
    if (seen.has(regNum)) {
      duplicates.push({ regNumber: item.registrationNumber });
    } else {
      seen.add(regNum);
    }
  });

  return duplicates;
};

/**
 * Suggested district based on common variations
 * @param {string} input - User input
 * @returns {string|null}
 */
export const suggestDistrict = (input) => {
  const DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matara",
    "Galle", "Hambantota", "Jaffna", "Mullaitivu", "Batticaloa",
    "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura",
    "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle"
  ];

  const normalize = (str) => str.toLowerCase().replace(/[_\s]/g, '');
  const inputNorm = normalize(input);

  return DISTRICTS.find(d => normalize(d) === inputNorm) || null;
};
