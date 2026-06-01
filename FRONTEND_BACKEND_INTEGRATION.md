# Analytics Query Builder - Frontend/Backend Integration

## Overview

This document defines the contract between the **Frontend Query Builder** and the **Backend API** for executing multi-module analytics queries.

---

## 📤 What Frontend SENDS to Backend

### Endpoint
```
POST http://localhost:3000/api/analytics-queries/run
```

### Headers
```
Content-Type: application/json
Credentials: include (for authentication)
```

### Request Body Structure

#### Minimal Request (Single Rule)
```json
{
  "rules": [
    {
      "module": "Participants",
      "field": "search",
      "value": "John Doe"
    }
  ],
  "connectors": []
}
```

#### Multi-Rule Query with AND
```json
{
  "rules": [
    {
      "module": "Participants",
      "field": "search",
      "value": "John"
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

#### Complex Multi-Module Query
```json
{
  "rules": [
    {
      "module": "Participants",
      "field": "status",
      "value": "Active"
    },
    {
      "module": "Programs",
      "field": "province",
      "value": "Western"
    },
    {
      "module": "Enrollments",
      "field": "completionStatus",
      "value": "Completed"
    }
  ],
  "connectors": ["AND", "OR"]
}
```

### Request Body Fields

| Field | Type | Description |
|-------|------|-------------|
| `rules` | array | Array of filter rules (min 1, max unlimited) |
| `rules[].module` | string | `"Participants"` \| `"Programs"` \| `"Enrollments"` |
| `rules[].field` | string | Field name specific to module (see Field Reference) |
| `rules[].value` | string | User-entered or selected value |
| `connectors` | array | Logic operators between rules (length = rules.length - 1) |
| `connectors[]` | string | `"AND"` \| `"OR"` \| `"NOT"` |

---

## 📥 What Frontend EXPECTS Back from Backend

### Success Response (HTTP 200)

```json
{
  "data": [
    {
      "id": "participant-1",
      "ownerName": "John Doe",
      "businessName": "Acme Corp",
      "email": "john@example.com",
      "phone": "+94712345678",
      "district": "Colombo",
      "sector": "Technology",
      "status": "Active",
      "createdAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "participant-2",
      "ownerName": "Jane Smith",
      "businessName": "Tech Solutions",
      "email": "jane@example.com",
      "phone": "+94723456789",
      "district": "Colombo",
      "sector": "Services",
      "status": "Active",
      "createdAt": "2026-02-20T14:15:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 50,
    "page": 1
  }
}
```

### Response Structure

```json
{
  "data": [],
  "meta": {
    "total": "number (total matching records)",
    "limit": "number (records per page)",
    "page": "number (current page)"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | array | Yes | Array of matching records (can be empty) |
| `meta.total` | number | Yes | Total count of matching records |
| `meta.limit` | number | Yes | Records per page (default 50) |
| `meta.page` | number | Yes | Current page number (default 1) |

---

## 🔗 Field Reference by Module

### Participants Module

| Field | Type | Example Value | Input Type |
|-------|------|----------------|-----------|
| `search` | string | "John Doe" or "john@email.com" | Autocomplete |
| `district` | string | "Colombo" | Dropdown |
| `status` | string | "Active" | Dropdown |
| `sector` | string | "Technology" | Dropdown |

#### Participants - Expected Response Fields
```json
{
  "id": "unique-id",
  "ownerName": "string",
  "businessName": "string",
  "email": "string",
  "phone": "string",
  "district": "string (25 Sri Lanka districts)",
  "sector": "string (8 sectors)",
  "status": "string (Active|Inactive|Pending|Suspended)",
  "createdAt": "ISO 8601 date string"
}
```

#### Participants - Allowed Values

**Status**: `Active`, `Inactive`, `Pending`, `Suspended`

**Sector**: 
- Agriculture
- Manufacturing
- Services
- Technology
- Tourism
- Construction
- Retail
- Health

**District** (25 options):
- Ampara, Anuradhapura, Badulla, Batticaloa, Colombo
- Galle, Gampaha, Hambantota, Jaffna, Kalutara
- Kandy, Kegalle, Kilinochchi, Kurunegala, Mannar
- Matale, Matara, Monaragala, Mullaitivu, Nuwara Eliya
- Polonnaruwa, Puttalam, Ratnapura, Trincomalee, Vavuniya

---

### Programs Module

| Field | Type | Example Value | Input Type |
|-------|------|----------------|-----------|
| `search` | string | "Python Basics" | Autocomplete |
| `status` | string | "Active" | Dropdown |
| `province` | string | "Western" | Dropdown |
| `district` | string | "Colombo" | Dropdown |
| `mode` | string | "Online" | Dropdown |

#### Programs - Expected Response Fields
```json
{
  "id": "unique-id",
  "name": "string",
  "status": "string",
  "province": "string",
  "district": "string",
  "mode": "string",
  "capacity": "number",
  "fee": "number",
  "createdAt": "ISO 8601 date string"
}
```

#### Programs - Allowed Values

**Status**: `Active`, `Inactive`, `Pending`, `Suspended`

**Province** (9 options):
- Central, Eastern, North Central, Northern, North Western
- Sabaragamuwa, Southern, Uva, Western

**Mode**: `Online`, `Offline`, `Hybrid`

**District**: Same 25 districts as Participants

---

### Enrollments Module

| Field | Type | Example Value | Input Type |
|-------|------|----------------|-----------|
| `completionStatus` | string | "Completed" | Dropdown |
| `programId` | string | "prog-123" | Autocomplete |
| `participantId` | string | "part-456" | Autocomplete |

#### Enrollments - Expected Response Fields
```json
{
  "id": "unique-id",
  "programId": "string",
  "participantId": "string",
  "completionStatus": "string",
  "ticketPrice": "number",
  "enrollmentDate": "ISO 8601 date string"
}
```

#### Enrollments - Allowed Values

**Completion Status** (4 options):
- Completed
- In Progress
- Not Started
- Dropped

---

## 🔍 Connector Logic

### Connectors Array

The `connectors` array contains the logical operators that connect consecutive rules:

```
rules: [rule1, rule2, rule3]
connectors: [connector_1_to_2, connector_2_to_3]
```

### Connector Meanings

| Connector | SQL Equivalent | Meaning |
|-----------|---|---------|
| `AND` | `WHERE rule1 AND rule2` | Both conditions must be true |
| `OR` | `WHERE rule1 OR rule2` | Either condition can be true |
| `NOT` | `WHERE NOT rule1 AND rule2` | First condition must be false |

### Query Logic Examples

#### Example 1: Simple AND
```json
{
  "rules": [
    {"module": "Participants", "field": "status", "value": "Active"},
    {"module": "Participants", "field": "district", "value": "Colombo"}
  ],
  "connectors": ["AND"]
}
// SQL: WHERE status = 'Active' AND district = 'Colombo'
```

#### Example 2: OR Logic
```json
{
  "rules": [
    {"module": "Participants", "field": "status", "value": "Active"},
    {"module": "Participants", "field": "status", "value": "Pending"}
  ],
  "connectors": ["OR"]
}
// SQL: WHERE status = 'Active' OR status = 'Pending'
```

#### Example 3: Mixed AND/OR
```json
{
  "rules": [
    {"module": "Participants", "field": "status", "value": "Active"},
    {"module": "Participants", "field": "district", "value": "Colombo"},
    {"module": "Participants", "field": "sector", "value": "Technology"}
  ],
  "connectors": ["AND", "OR"]
}
// SQL: WHERE (status = 'Active' AND district = 'Colombo') OR sector = 'Technology'
```

#### Example 4: Multi-Module with NOT
```json
{
  "rules": [
    {"module": "Participants", "field": "status", "value": "Suspended"},
    {"module": "Programs", "field": "mode", "value": "Online"}
  ],
  "connectors": ["NOT"]
}
// SQL: WHERE NOT (participants.status = 'Suspended') AND programs.mode = 'Online'
```

---

## 🌐 Autocomplete Search Endpoints

The frontend also calls these existing endpoints for autocomplete suggestions during user input:

### Participants Search
```
GET /api/participants?search=John&limit=10
```

**Query Parameters**:
- `search` (string): Search term (searches name, business, email)
- `limit` (number, optional): Max results (default: 10)

**Expected Response**:
```json
{
  "data": [
    {
      "id": "part-1",
      "ownerName": "John Doe",
      "email": "john@example.com",
      "businessName": "Acme"
    },
    {
      "id": "part-2",
      "ownerName": "John Smith",
      "email": "john.smith@example.com",
      "businessName": "Tech Corp"
    }
  ],
  "meta": {
    "total": 5
  }
}
```

### Programs Search
```
GET /api/programs?search=Python&limit=10
```

**Query Parameters**:
- `search` (string): Search term (searches name)
- `limit` (number, optional): Max results (default: 10)

**Expected Response**:
```json
{
  "data": [
    {
      "id": "prog-1",
      "name": "Python Basics",
      "province": "Western"
    },
    {
      "id": "prog-2",
      "name": "Advanced Python",
      "province": "Central"
    }
  ],
  "meta": {
    "total": 2
  }
}
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```
Status: 401
```
```json
{
  "message": "Authentication required",
  "status": 401
}
```
**Frontend Action**: Redirect to login page

### 400 Bad Request
```
Status: 400
```
```json
{
  "message": "Invalid query parameters: field 'district' not found in Participants module",
  "status": 400
}
```
**Frontend Action**: Show error message in red alert to user

### 500 Server Error
```
Status: 500
```
```json
{
  "message": "Internal server error",
  "status": 500
}
```
**Frontend Action**: Show error message in red alert to user

### Common Error Scenarios

| Scenario | Status | Message |
|----------|--------|---------|
| No authentication token | 401 | "Authentication required" |
| Invalid module name | 400 | "Invalid module: {module}" |
| Invalid field for module | 400 | "Field '{field}' not available in {module}" |
| Empty value | 400 | "All rules must have values" |
| Empty rules array | 400 | "At least one rule is required" |
| Database query failure | 500 | "Internal server error" |

---

## 🔐 Authentication & Headers

All requests to `/api/analytics-queries/run` must include:

```javascript
fetch('http://localhost:3000/api/analytics-queries/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',  // Include cookies/auth token
  body: JSON.stringify({
    rules: [...],
    connectors: [...]
  })
})
```

- **Method**: POST
- **Content-Type**: application/json
- **Credentials**: include (enables auth tokens via cookies)
- **Auth**: Uses existing session/cookie authentication

---

## 📋 Backend Implementation Checklist

- [ ] Create POST `/api/analytics-queries/run` endpoint
- [ ] Accept and validate `rules` array from request body
- [ ] Accept and validate `connectors` array from request body
- [ ] Validate each rule has: `module`, `field`, `value`
- [ ] Validate module is one of: Participants, Programs, Enrollments
- [ ] Validate field exists for the specified module
- [ ] Build database query filters based on module + field + value
- [ ] Apply connectors (AND/OR/NOT logic) between rules
- [ ] Handle multi-module queries (JOIN across tables if needed)
- [ ] Execute combined query against database
- [ ] Return successful response with `data` and `meta` objects
- [ ] Handle 401 errors (auth failures)
- [ ] Handle 400 errors (validation failures)
- [ ] Handle 500 errors (server failures)
- [ ] Ensure existing `/api/participants?search=` endpoint still works
- [ ] Ensure existing `/api/programs?search=` endpoint still works
- [ ] Test with single-module queries
- [ ] Test with multi-module queries
- [ ] Test with AND connectors
- [ ] Test with OR connectors
- [ ] Test with NOT connectors
- [ ] Test with empty results
- [ ] Test with large result sets
- [ ] Test error scenarios

---

## 🧪 Testing the Connection

### Using curl

#### Test 1: Single Rule Query
```bash
curl -X POST http://localhost:3000/api/analytics-queries/run \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "module": "Participants",
        "field": "district",
        "value": "Colombo"
      }
    ],
    "connectors": []
  }'
```

#### Test 2: Multi-Rule with AND
```bash
curl -X POST http://localhost:3000/api/analytics-queries/run \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "module": "Participants",
        "field": "status",
        "value": "Active"
      },
      {
        "module": "Participants",
        "field": "district",
        "value": "Colombo"
      }
    ],
    "connectors": ["AND"]
  }'
```

#### Test 3: Multi-Module Query
```bash
curl -X POST http://localhost:3000/api/analytics-queries/run \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "module": "Participants",
        "field": "status",
        "value": "Active"
      },
      {
        "module": "Programs",
        "field": "mode",
        "value": "Online"
      }
    ],
    "connectors": ["AND"]
  }'
```

### Expected Test Results

All tests should return:
```json
{
  "data": [...matching records...],
  "meta": {
    "total": <count>,
    "limit": 50,
    "page": 1
  }
}
```

Or an error with status code and message.

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Frontend User  │
└────────┬────────┘
         │ Fills Query Builder
         ▼
┌─────────────────────────────┐
│  Query Builder Component    │
│  - Add rules (Participants, │
│    Programs, Enrollments)   │
│  - Set AND/OR/NOT logic     │
└────────┬────────────────────┘
         │ Click "Run Query"
         ▼
┌─────────────────────────────────┐
│  POST /api/analytics-queries/run│
│  {rules, connectors}            │
└────────┬────────────────────────┘
         │ Network Request
         ▼
┌──────────────────────┐
│  Backend API Server  │
│  - Parse request     │
│  - Build SQL/query   │
│  - Execute query     │
└────────┬─────────────┘
         │ Database Query
         ▼
┌──────────────────┐
│  Database        │
│  - Participants  │
│  - Programs      │
│  - Enrollments   │
└────────┬─────────┘
         │ Results
         ▼
┌──────────────────────────────┐
│ Response JSON                 │
│ {data: [...], meta: {...}}   │
└────────┬─────────────────────┘
         │ Network Response
         ▼
┌──────────────────────────────┐
│  Frontend - Results Table     │
│  - Display records            │
│  - Show count                 │
│  - Color status badges        │
└──────────────────────────────┘
```

---

## 🚀 Frontend Code Example

How the frontend calls the backend:

```javascript
const runQuery = async () => {
  setLoading(true);
  setError('');
  
  try {
    // Build query payload
    const query = {
      rules: rules.map(r => ({
        module: r.module,
        field: r.field,
        value: r.value,
      })),
      connectors: rules.slice(1).map(r => r.connector),
    };

    // Make API call
    const res = await fetch('http://localhost:3000/api/analytics-queries/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(query),
    });

    // Handle response
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Query failed');
    }

    const json = await res.json();
    setResults(json.data || []);
    setResultMeta(json.meta || null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 📞 Support & Questions

For issues or questions about the integration:

1. Check this document for field/module specifications
2. Review error response examples
3. Test endpoint with curl command provided
4. Check browser console for frontend errors
5. Check server logs for backend errors

---

**Last Updated**: June 1, 2026  
**Version**: 1.0  
**Status**: Ready for Backend Implementation
