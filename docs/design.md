# StudyBloom — UI/UX and Design System

**Version:** 0.1 (draft) · **Date:** 14 Oct 2026
**Related:** [PRD](PRD.md) · [appFlow](appFlow.md) (behavior) · [Architecture](Architecture.md) · [Rules](Rules.md)

This document defines **how StudyBloom looks**. How it behaves lives in `appFlow.md`. No brand guidelines or design references were supplied, so the direction below is built from the brief (Confirmed) and clearly labeled proposals (P-15, P-16, P-17).

## 1. Design goals and principles

**Feel:** a peaceful, aesthetic study space. Modern, gentle, welcoming, easy to use. "Pinterest meets a university student's digital planner" (Confirmed theme from the brief).

1. **Calm over busy:** generous spacing, few colors per theme, no clutter.
2. **Readable first:** no tiny text; contrast always wins over decoration.
3. **Soft shapes:** rounded cards and buttons, subtle shadows, small decorative touches (an emoji or small shape), never blocking content.
4. **Clear feedback:** completed tasks, errors and successes are obvious, and **never communicated by color alone**.
5. **Consistent:** one layout system and component set shared by all four themes; themes change only color/shadow values.
6. **Gentle motion:** short fades/transitions only where useful; disabled for users who prefer reduced motion.

## 2. Themes and color tokens

Components use **only** the CSS variables below (never hard-coded colors). A theme is activated by `data-theme="<id>"` on `<html>`.

| Token | Purpose |
|---|---|
| `--color-bg` | Page background |
| `--color-surface` | Cards, forms |
| `--color-surface-alt` | Chips, hover areas, inputs' background |
| `--color-text` | Main text |
| `--color-text-muted` | Secondary text |
| `--color-primary` | Main buttons, active nav, accents |
| `--color-on-primary` | Text/icons on primary |
| `--color-secondary` | Soft accent areas (stat cards, quote card) |
| `--color-on-secondary` | Text on secondary (same as `--color-text` unless stated) |
| `--color-success` / `--color-on-success` | Completed tasks, success messages |
| `--color-danger` | Error text, delete outlines |
| `--color-border` | Borders, dividers |
| `--color-focus` | Keyboard focus ring |
| `--shadow-card` | Card shadow |

### 2.1 Soft Pastel — `soft-pastel` (default, P-16)
Hex values for bg, primary, secondary, text, surface and success are **Confirmed from the brief**; the rest are proposed.

| Token | Value | Source |
|---|---|---|
| bg | `#FFF9F2` | Brief (warm cream) |
| surface | `#FFFFFF` | Brief (white cards) |
| surface-alt | `#F7EEF3` | Proposed |
| text | `#332B40` | Brief (deep plum) |
| text-muted | `#6B6178` | Proposed |
| primary / on-primary | `#B8A7E8` / `#332B40` | Brief (lavender) / proposed |
| secondary | `#F3C6D3` | Brief (blush pink) |
| success / on-success | `#A8C3A0` / `#332B40` | Brief (sage) / proposed |
| danger | `#B3261E` | Proposed |
| border | `#EADFE6` | Proposed |
| focus | `#5B45B0` | Proposed |
| shadow-card | `0 2px 10px rgba(51,43,64,0.08)` | Proposed |

### 2.2 Lavender & White — `lavender-white` (all values proposed, P-15)
| Token | Value |
|---|---|
| bg / surface / surface-alt | `#FAF8FF` / `#FFFFFF` / `#F1ECFC` |
| text / text-muted | `#2E2A3B` / `#655F78` |
| primary / on-primary | `#B8A7E8` / `#2E2A3B` |
| secondary | `#E7E0FA` |
| success / on-success | `#A8C3A0` / `#2E2A3B` |
| danger / border / focus | `#B3261E` / `#E4DDF5` / `#5B45B0` |
| shadow-card | `0 2px 10px rgba(46,42,59,0.07)` |

### 2.3 Dark Academia — `dark-academia` (all values proposed, P-15)
Brown, black and beige; a dark theme.

| Token | Value |
|---|---|
| bg / surface / surface-alt | `#1E1915` / `#2A231D` / `#342C24` |
| text / text-muted | `#EFE6D5` / `#BDAE96` |
| primary / on-primary | `#C8A27A` / `#1E1915` |
| secondary | `#4A382B` (text on it: `#EFE6D5`) |
| success / on-success | `#8FA886` / `#1E1915` |
| danger / border / focus | `#FF9A8F` / `#4A3F35` / `#E6C79C` |
| shadow-card | `0 2px 12px rgba(0,0,0,0.45)` |

### 2.4 Sage Green — `sage-green` (all values proposed, P-15)
| Token | Value |
|---|---|
| bg / surface / surface-alt | `#F4F7F1` / `#FFFFFF` / `#E9F0E5` |
| text / text-muted | `#26352B` / `#56655A` |
| primary / on-primary | `#A8C3A0` / `#26352B` |
| secondary | `#DCE8D7` |
| success / on-success | `#7FB07A` / `#1B2B1F` |
| danger / border / focus | `#B3261E` / `#D5E1D0` / `#2F6B3A` |
| shadow-card | `0 2px 10px rgba(38,53,43,0.08)` |

**Contrast rule (NFR-005):** use the `on-*` token for text on colored backgrounds (dark text on pastel buttons; white text is **not** used on pastel primaries). The proposed target is WCAG AA (4.5:1 for normal text, 3:1 for large text and UI outlines). **These pairings have not yet been measured**; they must be verified with a contrast checker in PH-06 (TC-32) and adjusted if any fail.

## 3. Typography

System fonts only (P-13, no downloads):
- **Headings:** `Georgia, "Times New Roman", serif` — gives the academic feel.
- **Body/UI:** `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.

| Use | Size |
|---|---|
| Body | `1rem` (16px), line-height 1.5 |
| Small/meta | `0.875rem` minimum |
| H1 | `clamp(1.75rem, 4vw, 2.5rem)` |
| H2 | `clamp(1.25rem, 3vw, 1.75rem)` |
| Timer digits | `clamp(2.5rem, 10vw, 4rem)`, `font-variant-numeric: tabular-nums` |

## 4. Spacing, shape and motion tokens

| Token | Values |
|---|---|
| Spacing scale (4px base) | 4, 8, 12, 16, 24, 32, 48 |
| Radius | small 8px · card 16px · pill 999px |
| Border | 1px solid `--color-border` |
| Min tap target | 44 × 44 px |
| Transition | 150–200 ms ease for color/transform; disabled under `prefers-reduced-motion` |

## 5. Layout and responsive behavior

Mobile-first. Breakpoints (P-17): **≥640px** (tablet) and **≥1024px** (desktop). Content max-width 1100px, centered. Page padding 16 / 24 / 32px.

| Area | <640px (phone) | ≥640px | ≥1024px |
|---|---|---|---|
| Navigation | Bottom tab bar (Home, Planner, Notes) with safe-area padding; page gets bottom padding so content is not covered | Top bar with logo, links, theme selector | Same as tablet |
| Header (phone) | Logo + theme selector in a compact top bar | — | — |
| Home stat cards | 1–3 compact cards (stack if narrow) | 3 across | 3 across |
| Home lists | Stacked | Stacked | Two columns (priorities / upcoming) |
| Planner | Form above list, full width | Form above list | Form (≈360px) beside list |
| Notes grid | 1 column | 2 columns | 3 columns |
| Timer / quote | Full-width cards | Side by side | Side by side |

Required: no horizontal overflow from 320px up; long words/titles wrap (`overflow-wrap: anywhere`); images/SVG have `max-width: 100%`.

## 6. Components

| Component | Description | States |
|---|---|---|
| **Header/Logo** | Wordmark "StudyBloom" with a small bloom emoji/SVG (decorative, `aria-hidden`) and tagline | — |
| **Nav link** | Pill-shaped; current page uses primary background + `aria-current` | default, hover, focus, active/current |
| **Theme selector (P-16)** | Native labeled `<select>` ("Theme") with four options | default, focus, hover |
| **Button — primary** | Primary background, `on-primary` text, pill/rounded | default, hover (slight lift/brightness), focus ring, active (pressed), disabled (reduced opacity + not-allowed cursor) |
| **Button — secondary** | Surface background + border | same |
| **Button — danger (Delete)** | Outline in `--color-danger` + text label "Delete" | same |
| **Card** | Surface, 16px radius, `--shadow-card`, 1px border | hover optional |
| **Form field** | Visible label above input; input on surface-alt with border; helper text; error text below in `--color-danger` with "⚠" prefix | default, focus, error, disabled |
| **Chip (subject)** | Small pill on surface-alt | — |
| **Priority chip** | Text + symbol: High ▲, Medium ●, Low ▼ (symbol + word, not color only) | — |
| **Task item** | Card row: checkbox, title, chips, due label, Edit/Delete | pending, **completed** (strikethrough title, sage check mark, "Done" label, softer text), overdue ("Overdue" label with ⚠) |
| **Filter tabs** | Three pill buttons; selected has primary background + `aria-pressed` | default, hover, selected |
| **Stat card** | Secondary background, big number, label | — |
| **Note card** | Card: title, subject chip, date, preview text (3 lines), Show more/less, Edit/Delete | collapsed, expanded |
| **Search box** | Labeled input with Clear button | default, focus, has-text |
| **Status message** | Success: sage background + ✓ + text. Error: border in danger + ⚠ + text | success, error |
| **Quote card** | Secondary background, serif italic text, "Another quote" button | — |
| **Timer widget** | Mode buttons (Focus/Break), big digits, Start/Pause, Reset | idle, running, paused, finished |
| **Empty state** | Small decorative emoji + one friendly sentence + action button | — |
| **Footer notice** | Small muted text, still ≥ `0.875rem` and passing contrast | — |

## 7. Screen-specific visual notes

- **Home:** greeting in the heading font; stat cards form a friendly row; the quote and timer are "soft" accent cards. A few small decorative shapes (bloom/flower emoji) are allowed in headers but must not overlap text.
- **Planner:** task rows are compact and scannable; completed tasks fade slightly but remain readable.
- **Notes:** masonry is **not** required; an even card grid is enough ("Pinterest-like" feel through rounded cards and soft colors).

## 8. Accessibility (NFR-005)

- Semantic landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page; headings in order.
- Every input has a `<label>`; errors are tied with `aria-describedby`; invalid fields get `aria-invalid="true"`.
- Status messages in a polite live region; filter and nav states exposed with `aria-pressed` / `aria-current`.
- Visible `:focus-visible` outline (3px, `--color-focus`) on all interactive elements; tab order follows visual order.
- Do not rely on color alone (completed, overdue, priority, errors all have text/symbols).
- Respect `prefers-reduced-motion`; page zoomable (no `user-scalable=no`).
- Decorative emoji are `aria-hidden="true"`; meaningful ones have text alternatives.

## 9. Assets and icons

No supplied assets or references. Use emoji/Unicode symbols and, optionally, one small inline SVG favicon in `assets/favicon.svg`. No icon libraries or image downloads (P-13).

## 10. Requirement coverage

FR-001, FR-010, FR-021, FR-022, FR-025, NFR-004, NFR-005, NFR-009.
