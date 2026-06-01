# Analytics Query Builder - User Guide

## Overview

The new Query Builder enables advanced, multi-module filtering across Participants, Programs, and Enrollments data. Create complex queries with multiple conditions across different modules and combine them with AND, OR, or NOT logic.

## Key Features

### 1. Multi-Module Rules
- Each rule targets a specific module (Participants, Programs, or Enrollments)
- Module badges show which module each rule applies to:
  - 🔵 **Participants** (Light Blue)
  - 🟣 **Programs** (Light Orange)
  - 🟢 **Enrollments** (Light Green)
- Add multiple rules for the same or different modules

### 2. Smart Field Selection
Each module has specific fields available:

**Participants:**
- Name / Business / Email (searchable)
- District (dropdown: 25 districts)
- Status (dropdown: Active, Inactive, Pending, Suspended)
- Sector (dropdown: Agriculture, Manufacturing, Services, Technology, Tourism, Construction, Retail, Health)

**Programs:**
- Name (searchable)
- Status (dropdown: Active, Inactive, Pending, Suspended)
- Province (dropdown: 9 provinces)
- District (dropdown: 25 districts)
- Mode (dropdown: Online, Offline, Hybrid)

**Enrollments:**
- Completion Status (dropdown: Completed, In Progress, Not Started, Dropped)
- Program ID (searchable)
- Participant ID (searchable)

### 3. Two Types of Value Inputs

**Dropdown Fields (Fixed Options)**
- Fixed list of pre-defined values
- Click to select from dropdown
- Districts, Statuses, Sectors, Provinces, Modes, Completion Statuses

**Autocomplete Fields (Searchable)**
- Type freely to search
- See suggestions as you type (300ms debounce)
- Click a suggestion to select
- Works with: Name/Email, Program Name, Program ID, Participant ID
- Examples:
  - Search "John" → Shows participants named "John"
  - Search "101" → Shows programs/participants matching ID 101

### 4. Logic Connectors
- Between each pair of rules, use a connector pill
- Available options: AND, OR, NOT
- **AND**: Both conditions must be true
- **OR**: Either condition can be true
- **NOT**: First condition must be false
- Click the pill to change the connector

### 5. Building a Query

**Step 1: Add Rules**
```
1. Click "+ Participants rule" to add a participant filter
2. Select field: "Name / Business / Email"
3. Type in search box: "John Doe"
```

**Step 2: Add More Rules**
```
4. Click "+ Programs rule" to add a program filter
5. Select field: "Province"
6. Click dropdown and select "Western"
```

**Step 3: Set Logic**
```
7. By default, rules are connected with AND
8. Click the AND pill between rules to change to OR or NOT if needed
```

**Step 4: Run Query**
```
9. Click "Run Query" button
10. Results appear below showing matching records
```

### 6. Query Examples

**Example 1: Find active participants in Colombo district**
```
Rule 1 (Participants): Status = Active
Connector: AND
Rule 2 (Participants): District = Colombo
```

**Example 2: Find programs in provinces OR specific participants**
```
Rule 1 (Programs): Province = Western
Connector: OR
Rule 2 (Participants): Name = John Doe
```

**Example 3: Find enrollments NOT completed**
```
Rule 1 (Enrollments): Completion Status ≠ Completed
```

### 7. Results Display

- Results table appears below the query builder
- Shows record count: "42 records found"
- Columns adjust based on modules queried
- Status fields show colored badges:
  - 🟢 Green: Active/Completed/Enrolled
  - 🔵 Blue: In Progress/Pending
  - 🔴 Red: Inactive/Suspended/Not Started/Dropped
- Dates formatted as local date format
- Click any row to view details (feature to be added)

### 8. Tips & Best Practices

- **Start simple**: Begin with one rule, then add complexity
- **Test dropdowns first**: Ensure exact value matching
- **Use autocomplete for flexibility**: Partial matching helps find records
- **Check connectors**: Verify AND/OR/NOT logic before running
- **Clear invalid rules**: All rules must have values before running
- **Export results**: Save query results for reports (feature to be added)

## Technical Details

### REST API Integration

The Query Builder calls: `POST /api/analytics-queries/run`

**Request Payload:**
```json
{
  "rules": [
    { "module": "Participants", "field": "search", "value": "John" },
    { "module": "Programs", "field": "province", "value": "Western" }
  ],
  "connectors": ["AND"]
}
```

**Response:**
```json
{
  "data": [...records...],
  "meta": {
    "total": 42,
    "limit": 50,
    "page": 1
  }
}
```

### Autocomplete Search

- Triggers on every keystroke
- 300ms debounce to reduce API calls
- Calls: `GET /api/participants?search=<query>`
- Calls: `GET /api/programs?search=<query>`
- Shows up to 10 results
- Click outside to close suggestions

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No results found" | Check value spelling, try broader search |
| Autocomplete not showing | Start typing in search field, wait 300ms |
| Button disabled | Ensure all rules have values selected |
| 401 Unauthorized | Session expired, please log in again |
| Slow results | Reduce number of rules, use more specific values |

## Keyboard Shortcuts

- **Tab**: Move between fields and buttons
- **Enter**: Run query (when focus on Run button)
- **Escape**: Close autocomplete suggestions
- **Delete**: Remove rule (hover over rule and click delete icon)
