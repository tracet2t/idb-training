# IDB Training & Development Analytics Platform

Welcome to the frontend documentation for the IDB Training & Development Analytics Platform.

---

## Quick Links

- [Framework Design](frontend_frameworks.md)
- [Color Palette](color-palette.md)

---

## Tech Stack

| Library | Purpose |
|---|---|
| React.js 18 | Core UI framework |
| Vite | Build tool |
| MUI v5 | Component library |
| MUI X Data Grid | Advanced tables |
| MUI X Date Pickers | Date range inputs |
| Chart.js | Dashboard charts |
| React Router DOM | Routing + protected routes |
| Leaflet + react-leaflet | Sri Lanka interactive map |
| React Hook Form | Form validation |
| Zustand | Global state — auth, session |
| Axios | API calls |
| TanStack Query | Server state management |
| date-fns | Date formatting |
| Lucide React | Icons |
| jsPDF | PDF export |
| xlsx (SheetJS) | Excel import/export |

---

## Notes

- All protected routes redirect to `/login` if not authenticated
- JWT token stored in HTTP-only cookie — handled by backend
- Color palette defined in `src/theme/colors.js`
- Framework decisions documented in `docs/frontend_frameworks.md`