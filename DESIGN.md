# ChatPulse Design System

## Colors

### Primary — Indigo
| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#eef2ff` | Backgrounds, hover states |
| `primary-100` | `#e0e7ff` | Light fills |
| `primary-200` | `#c7d2fe` | Borders |
| `primary-300` | `#a5b4fc` | Icons (inactive) |
| `primary-400` | `#818cf8` | Icons (active) |
| `primary-500` | `#6366f1` | **Primary buttons, links** |
| `primary-600` | `#4f46e5` | Button hover |
| `primary-700` | `#4338ca` | Button active / pressed |
| `primary-800` | `#3730a3` | Dark accents |
| `primary-900` | `#312e81` | Headings on dark bg |

### Accent — Warm Pink
| Token | Hex | Usage |
|-------|-----|-------|
| `accent-50` | `#fdf2f8` | Badge backgrounds |
| `accent-100` | `#fce7f3` | Notification dots bg |
| `accent-200` | `#fbcfe8` | Light accent borders |
| `accent-300` | `#f9a8d4` | Decorative elements |
| `accent-400` | `#f472b6` | Icons |
| `accent-500` | `#ec4899` | **Accent buttons, highlights** |
| `accent-600` | `#db2777` | Hover states |
| `accent-700` | `#be185d` | Active states |

### Neutrals — Slate
| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#f8fafc` | Page background |
| `neutral-100` | `#f1f5f9` | Card backgrounds, sidebar |
| `neutral-200` | `#e2e8f0` | Borders, dividers |
| `neutral-300` | `#cbd5e1` | Disabled text |
| `neutral-400` | `#94a3b8` | Placeholder text |
| `neutral-500` | `#64748b` | Secondary text |
| `neutral-600` | `#475569` | Body text |
| `neutral-700` | `#334155` | Headings |
| `neutral-800` | `#1e293b` | Dark headings |
| `neutral-900` | `#0f172a` | Near-black |
| `neutral-950` | `#020617` | True dark |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#10b981` | Success states |
| `warning` | `#f59e0b` | Warning states |
| `error` | `#ef4444` | Error states, destructive |
| `info` | `#3b82f6` | Info states |

---

## Typography

### Font Families
- **Headings:** Space Grotesk (variable, via `next/font/google`)
- **Body:** Inter (variable, via `next/font/google`)
- **Mono:** JetBrains Mono (code blocks, via `next/font/google`)

### Scale
| Level | Size | Weight | Line Height | Font |
|-------|------|--------|-------------|------|
| `h1` | 2.25rem (36px) | 700 | 1.2 | Space Grotesk |
| `h2` | 1.875rem (30px) | 700 | 1.25 | Space Grotesk |
| `h3` | 1.5rem (24px) | 600 | 1.3 | Space Grotesk |
| `h4` | 1.25rem (20px) | 600 | 1.4 | Space Grotesk |
| `body-lg` | 1.125rem (18px) | 400 | 1.6 | Inter |
| `body` | 1rem (16px) | 400 | 1.6 | Inter |
| `body-sm` | 0.875rem (14px) | 400 | 1.5 | Inter |
| `caption` | 0.75rem (12px) | 500 | 1.5 | Inter |

---

## Spacing

Base unit: **4px**

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Small elements (badges, chips) |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards, dialogs |
| `radius-xl` | 16px | Large panels |
| `radius-full` | 9999px | Avatars, pills |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)` | Dialogs, popovers |
| `shadow-glow` | `0 0 20px rgba(99,102,241,0.15)` | Primary focus glow |

---

## Component Styles (shadcn/ui overrides)

### Button
- **Primary:** bg `primary-500`, text white, hover `primary-600`, rounded `radius-md`
- **Secondary:** bg `neutral-100`, text `neutral-700`, hover `neutral-200`
- **Accent:** bg `accent-500`, text white, hover `accent-600`
- **Ghost:** transparent bg, text `neutral-600`, hover `neutral-100`
- **Destructive:** bg `error`, text white
- Height: 40px default, 36px sm, 48px lg
- Font: Inter 500

### Input
- Border: `neutral-200`, focus ring `primary-500/20` with border `primary-500`
- Rounded: `radius-md`
- Height: 40px
- Placeholder: `neutral-400`

### Card
- Background: white
- Border: `neutral-200`
- Rounded: `radius-lg`
- Shadow: `shadow-md`
- Padding: `space-6`

### Dialog
- Overlay: black/50 with backdrop blur
- Rounded: `radius-lg`
- Shadow: `shadow-lg`
- Max-width: 480px default

### Sidebar
- Background: white
- Width: 260px (desktop), full-width sheet (mobile)
- Border-right: `neutral-200`
- Active item: bg `primary-50`, text `primary-700`, left border `primary-500`
- Hover item: bg `neutral-50`

### Avatar
- Rounded: `radius-full`
- Fallback: bg `primary-100`, text `primary-700`
- Sizes: 32px (sm), 40px (md), 48px (lg)
