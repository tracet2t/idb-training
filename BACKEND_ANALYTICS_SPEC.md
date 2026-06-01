# Analytics Query Builder - Backend Implementation Guide

## Endpoint Specification

The frontend makes a POST request to `/api/analytics-queries/run` with the following payload:

```json
{
  "rules": [
    {
      "module": "Participants" | "Programs" | "Enrollments",
      "field": "search" | "district" | "status" | "sector" | "province" | "mode" | "completionStatus" | "programId" | "participantId",
      "value": "string"
    }
  ],
  "connectors": ["AND" | "OR" | "NOT"]
}
```

## Example Request

```json
{
  "rules": [
    {
      "module": "Participants",
      "field": "search",
      "value": "John Doe"
    },
    {
      "module": "Participants",
      "field": "district",
      "value": "Colombo"
    }
  ],
  "connectors": ["AND"]
}
```

## Response Format

The backend should return:

```json
{
  "data": [
    { "id": "...", "ownerName": "...", "businessName": "...", ... }
  ],
  "meta": {
    "total": 42,
    "limit": 50,
    "page": 1
  }
}
```

## Implementation Steps

1. **Create Route Handler** (`backend/routes/analytics.js` or similar)
   - POST `/api/analytics-queries/run`
   - Parse the rules and connectors
   - Build query filters based on module + field + value
   - Execute database query with AND/OR/NOT logic
   - Return results with metadata

2. **Field Mapping**
   - Participants search → Search in ownerName, businessName, email
   - Programs search → Search in name
   - Enrollments search → Search in corresponding fields

3. **Filter Logic**
   - Each rule generates a WHERE clause filter
   - Connectors combine multiple filters:
     - AND: `WHERE rule1 AND rule2 AND ...`
     - OR: `WHERE rule1 OR rule2 OR ...`
     - NOT: `WHERE NOT rule1`

4. **Error Handling**
   - Validate authentication (401 → redirect to login)
   - Validate module/field/value exist
   - Return 400 for invalid queries
   - Return 500 for server errors

## Field Options Reference

### Participants Module
- Fields: search (Name/Business/Email), district, status, sector
- Dropdowns: 25 districts, 4 statuses (Active/Inactive/Pending/Suspended), 8 sectors

### Programs Module
- Fields: search (Name), status, province, district, mode
- Dropdowns: 4 statuses, 9 provinces, 25 districts, 3 modes (Online/Offline/Hybrid)

### Enrollments Module
- Fields: completionStatus, programId, participantId
- Dropdowns: 4 completion statuses (Completed/In Progress/Not Started/Dropped)
- Search fields: programId (search programs), participantId (search participants)

## Integration with Existing Endpoints

The backend likely already has these working endpoints:
- GET `/api/participants?search=<query>&page=1&limit=50`
- GET `/programs?search=<query>&page=1&limit=50`
- GET `/enrollments?page=1&limit=50`

The `/analytics-queries/run` endpoint should build on these to support the complex multi-module, multi-connector queries.
