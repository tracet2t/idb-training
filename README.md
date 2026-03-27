# IDB Training & Development Analytics Platform — Frontend

Frontend application for the Industrial Development Board of Ceylon's Training & Development Analytics Platform.

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
| TanStack Query | Server state management — caching, loading, error handling |
| date-fns | Date formatting |
| Lucide React | Icons |
| jsPDF | PDF export |
| xlsx (SheetJS) | Excel import/export |

---

## Project Structure
```
src/
├── components/     → shared reusable UI pieces
├── pages/          → one file per route
├── services/       → all API call functions
├── store/          → Zustand global state
├── theme/          → MUI theme + IDB color palette
├── routes/         → route config + protected route
└── utils/          → date helpers, formatters
docs/
└── frontend-design.md   → framework decisions
```

---

## Getting Started

### Prerequisites

| Tool | Min Version |
|---|---|
| Node.js | v18.0+ |
| npm | v9.0+ |
| Git | v2.0+ |

### Installation
```bash
# clone the repo
git clone <repo-url>

# go into the project folder
cd idb-frontend

# install dependencies
npm install

# start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Color Palette

All pages use the IDB brand colors defined in `src/theme/colors.js`

| Color | Hex | Used for |
|---|---|---|
| Navy Main | `#1a3a5c` | Navbar, banner, headings |
| Navy Pale | `#B0D4F1` | Banner background |
| IDB Red | `#8B1A1A` | Buttons, badges |
| IDB Gold | `#C8960C` | Icons, links, focus |
| Page BG | `#f0f4f8` | Page background |
| Card BG | `#ffffff` | Cards |

---

## Pages

| Route | Page | Status |
|---|---|---|
| /login | LoginPage | ✅ Done |
| /dashboard | DashboardPage | 🔲 Pending |
| /programs | ProgramsPage | 🔲 Pending |
| /sme | SMEListPage | 🔲 Pending |
| /financial | FinancialPage | 🔲 Pending |
| /geographic | GeographicPage | 🔲 Pending |
| /admin | AdminPage | 🔲 Pending |

---

## Task Progress

| Task | Description | Status |
|---|---|---|
| T008 | Document frameworks | ✅ Done |
| T009 | Initialize project | ✅ Done |
| T011 | Login page UI | ✅ Done |
| T010 | Docker + CI/CD | 👉 Team 3 |
| T012 | Integrate auth APIs | ⏳ Phase 1 done, Phase 2 needs backend T007 |
| T013 | TanStack Query integration | 🔲 Pending |

---

## Team

Problem 2 Team — Frontend

---

## Notes

- All protected routes redirect to `/login` if not authenticated
- JWT token is stored in HTTP-only cookie — handled by backend
- Color palette is in `src/theme/colors.js` — do not hardcode hex values in components
- Framework decisions are documented in `docs/frontend-design.md`
- TanStack Query is used for all server data fetching — Zustand is used only for auth state