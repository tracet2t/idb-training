# IDB Color Palette

All pages must use these colors. Never hardcode hex values in components — always import from `src/theme/colors.js`.

---

## Primary — Navy Blue

| Name | Hex | Used for |
|---|---|---|
| Darkest | `#0f2035` | Page gradient, deep backgrounds |
| Main | `#1a3a5c` | Navbar, banner, headings |
| Medium | `#1e4d7b` | Hover on navy elements |
| Light | `#2d6a9f` | Secondary nav, active states |
| Pale | `#B0D4F1` | Banner backgrounds |
| Lightest | `#e8f2fb` | Table row hover |

---

## Accent — IDB Red

| Name | Hex | Used for |
|---|---|---|
| Darkest | `#4a0f0f` | Gradient accent |
| Dark | `#6e1414` | Button hover |
| Main | `#8B1A1A` | Buttons, badges |
| Light | `#c23b3b` | Light accents |
| Pale | `#f5d0d0` | Error backgrounds |

---

## Detail — IDB Gold

| Name | Hex | Used for |
|---|---|---|
| Dark | `#7a5c08` | Dark gold text |
| Medium | `#a07a0a` | Gold hover |
| Main | `#C8960C` | Icons, links, focus borders |
| Light | `#e0b030` | Light gold accents |
| Pale | `#fdf3d0` | Gold background highlights |

---

## Neutrals

| Name | Hex | Used for |
|---|---|---|
| Text Dark | `#1a1a2e` | Darkest text |
| Text Primary | `#1a3a5c` | Main text color |
| Text Muted | `#64748b` | Subtitles, captions |
| Divider | `#dce6f0` | Dividers, borders |
| Page BG | `#f0f4f8` | Page background |
| Card BG | `#ffffff` | Cards |

---

## How to use in your components
```js
import colors from '../theme/colors';

// navbar background
bgcolor: colors.navy.main

// button
bgcolor: colors.red.main

// icon
color: colors.gold.main

// divider
borderColor: colors.neutral.divider
```