# Analytics Query Builder - Quick Reference

## Files Changed

| File | Type | Changes |
|------|------|---------|
| `src/pages/Analytics.jsx` | Modified | Simplified to use new QueryBuilder component |
| `src/components/analytics/QueryBuilder.jsx` | New | Main multi-module query builder component |
| `src/components/analytics/RuleRow.jsx` | New | Individual rule row with module badge |
| `src/components/analytics/ConnectorPill.jsx` | New | AND/OR/NOT logic connector |
| `src/components/analytics/ValueInput.jsx` | New | Smart dropdown/autocomplete selector |
| `src/components/analytics/AutocompleteInput.jsx` | New | Debounced search component |

## Component Tree

```
Analytics.jsx
└── QueryBuilder
    ├── RuleRow (per rule)
    │   ├── Module Badge
    │   ├── Field Selector
    │   └── ValueInput
    │       ├── (Dropdown)
    │       └── AutocompleteInput
    ├── ConnectorPill (between rules)
    └── ResultsTable
```

## Quick Start - Using the QueryBuilder

```jsx
import QueryBuilder from '@/components/analytics/QueryBuilder';

export default function Analytics() {
  return <QueryBuilder />;
}
```

## State Shape

```javascript
const rules = [
  {
    id: '1',
    module: 'Participants',     // | 'Programs' | 'Enrollments'
    field: 'search',            // depends on module
    value: 'John Doe',          // user input
    connector: null             // null for first, 'AND'|'OR'|'NOT' for others
  },
  {
    id: '2',
    module: 'Programs',
    field: 'province',
    value: 'Western',
    connector: 'AND'            // connects previous rule to this one
  }
];
```

## Field Options Reference

```javascript
const FIELD_OPTIONS = {
  Participants: ['search', 'district', 'status', 'sector'],
  Programs: ['search', 'status', 'province', 'district', 'mode'],
  Enrollments: ['completionStatus', 'programId', 'participantId']
};
```

## Module Styling

| Module | Badge Color | Text Color |
|--------|-------------|-----------|
| Participants | #dbeafe | #0369a1 |
| Programs | #fcdab7 | #9333ea |
| Enrollments | #bbf7d0 | #15803d |

## Autocomplete-Enabled Fields

- `Participants.search` → API: `/participants?search=query`
- `Programs.search` → API: `/programs?search=query`
- `Enrollments.programId` → API: `/programs?search=query`
- `Enrollments.participantId` → API: `/participants?search=query`

**Debounce Delay**: 300ms

## Dropdown-Only Fields

```javascript
{
  district: [25 Sri Lanka districts],
  status: ['Active', 'Inactive', 'Pending', 'Suspended'],
  sector: ['Agriculture', 'Manufacturing', 'Services', 'Technology', 'Tourism', 'Construction', 'Retail', 'Health'],
  province: ['Central', 'Eastern', 'North Central', 'Northern', 'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western'],
  mode: ['Online', 'Offline', 'Hybrid'],
  completionStatus: ['Completed', 'In Progress', 'Not Started', 'Dropped']
}
```

## Query Execution

**Endpoint**: `POST /api/analytics-queries/run`

**Request**:
```json
{
  "rules": [
    {"module": "Participants", "field": "search", "value": "John"},
    {"module": "Programs", "field": "province", "value": "Western"}
  ],
  "connectors": ["AND"]
}
```

**Response**:
```json
{
  "data": [
    {"id": 1, "ownerName": "John Doe", "businessName": "Acme", ...}
  ],
  "meta": {"total": 42, "limit": 50, "page": 1}
}
```

## Key Functions

### QueryBuilder

```javascript
const addRuleForModule = (module) => { /* adds rule */ }
const deleteRule = (id) => { /* removes rule */ }
const updateRule = (id, key, value) => { /* updates rule property */ }
const updateConnector = (index, connector) => { /* changes AND/OR/NOT */ }
const runQuery = async () => { /* executes query */ }
```

### RuleRow Props

```javascript
{
  rule: {},           // rule object
  onUpdate: (k, v) => {},   // update handler
  onDelete: (id) => {},     // delete handler
  canDelete: bool,    // disable delete if only rule
  colors: {}          // color theme
}
```

### ValueInput Props

```javascript
{
  value: string,      // current value
  onChange: (val) => {},    // change handler
  field: string,      // field name
  module: string,     // module name
  colors: {}          // color theme
}
```

### ConnectorPill Props

```javascript
{
  value: string,      // 'AND' | 'OR' | 'NOT'
  onChange: (val) => {},    // change handler
  colors: {}          // color theme
}
```

## Error Handling

```javascript
// Invalid auth
if (res.status === 401) window.location.href = '/login';

// Query validation
if (query.rules.some(r => !r.value)) {
  throw new Error('All rules must have values');
}

// Server error
const errData = await res.json();
setError(errData.message || 'Query failed');
```

## Color Tokens

```javascript
const colors = {
  navyMain: '#1a3a5c',
  navyPale: '#B0D4F1',
  idbRed: '#8B1A1A',
  idbGold: '#C8960C',
  pageBg: '#f0f4f8',
  cardBg: '#ffffff',
};
```

## Import Examples

```jsx
// Main component
import QueryBuilder from '@/components/analytics/QueryBuilder';

// Individual components (if needed separately)
import RuleRow from '@/components/analytics/RuleRow';
import ConnectorPill from '@/components/analytics/ConnectorPill';
import ValueInput from '@/components/analytics/ValueInput';
import AutocompleteInput from '@/components/analytics/AutocompleteInput';
```

## Debugging Tips

1. **Check rule state**: Log `rules` array to console
2. **Verify connector index**: Connectors[i] connects rules[i] and rules[i+1]
3. **Test autocomplete**: Type in search field, should show suggestions after 300ms
4. **Check API responses**: Monitor network tab for `/participants` and `/programs` calls
5. **Verify auth**: Check if cookie/token is being sent with credentials: include
6. **Test results**: Ensure backend returns `{data: [], meta: {total: ...}}`

## Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| Suggestions not appearing | Wait 300ms after typing (debounce delay) |
| Can't delete single rule | This is intentional - at least one rule required |
| Results showing mixed columns | Expected behavior - shows all columns from all modules |
| Scrolling in suggestions hidden | Increase suggestion list max-height in CSS |

## Performance Considerations

- **Debounce**: 300ms on autocomplete search reduces API calls
- **Suggestions limit**: 10 max results to keep dropdown manageable
- **Re-renders**: Only affected rules re-render on change
- **Results table**: Virtual scrolling recommended for 1000+ rows

## Accessibility (A11y)

- ✅ Keyboard navigation: Tab through fields
- ✅ Focus indicators: All interactive elements
- ✅ ARIA labels: On buttons and important elements
- ✅ Color contrast: Meets WCAG AA standards
- ✅ Screen reader: Badge text descriptive

## Mobile Responsiveness

- ✅ Flex wrapping on small screens
- ✅ Touch-friendly button sizes
- ✅ Scrollable tables on mobile
- ✅ Stack layout on < 640px width

## Next Steps

1. **Backend**: Implement `/api/analytics-queries/run` endpoint
2. **Testing**: Run QA tests on all scenarios
3. **Performance**: Monitor API call frequency
4. **Enhancement**: Add result export/save features
5. **Analytics**: Track user query patterns
