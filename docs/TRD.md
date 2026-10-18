# StudyBloom — Technical Requirements Document (TRD)

**Version:** 0.1 (draft) · **Date:** 14 Oct 2026
**Related:** [PRD](PRD.md) (IDs and decisions live there) · [Architecture](Architecture.md) · [database](database.md) · [Rules](Rules.md) · [phases](phases.md)

## 1. Purpose

Defines the technology, technical constraints, security rules, deployment approach and test catalog for StudyBloom. Requirement IDs (`FR-`, `NFR-`), decisions (`D-`) and proposals (`P-`) are defined in the PRD and only referenced here.

## 2. Technology stack

| Area | Choice | Status | Notes |
|---|---|---|---|
| Markup | HTML5 | Confirmed (D4) | Three pages |
| Styling | CSS3 (custom properties for themes, flexbox/grid) | Confirmed (D4) | No Sass, no CSS framework |
| Logic | Vanilla JavaScript (modern browser features) | Confirmed (D4) | No framework, no TypeScript, no bundler |
| Storage | Browser `localStorage` | Confirmed (D5) | See [database](database.md) |
| Backend / DB / auth | **None** | Confirmed (D3) | No accounts, no cloud |
| Libraries / packages | **None** | Proposed (P-13) | No npm, no CDN |
| Fonts | System font stacks | Proposed (P-13) | Avoids third-party requests |
| Hosting | GitHub Pages | **Proposed (P-01, OQ-01)** | Free static hosting |
| Version control | Git + GitHub | Confirmed in brief | Conventions proposed (P-20) |
| Editor | Any (VS Code suggested) | Proposed | Free |
| Runtime versions | None to pin (no dependencies) | Inferred | |

**Why this stack:** it is the simplest option that meets every approved requirement, needs nothing installed, is free, and is easiest for a beginner to read. A framework (e.g., React) would add tooling and learning time that does not fit a 1–3 day schedule (D4, D11).

**Trade-offs accepted:** no automatic code organization from a framework (mitigated by clear file separation, Architecture §3); no built-in tests (mitigated by P-19); data is per-browser (D3, D5).

## 3. Functional technical constraints

- **CON-1** All pages work when the files are served as static files. Because there is no backend, opening `index.html` directly from disk should also work for development. (To be verified in PH-01, because strict CSP and `file://` can interact; see §6.)
- **CON-2** Classic `<script>` files with one global namespace (`StudyBloom`) are used instead of ES modules, because browsers block modules on `file://` pages (P-18).
- **CON-3** All links and asset paths are **relative** (no leading `/`), because a GitHub project site is served from a sub-path such as `/studybloom/`.
- **CON-4** Dates: due dates are stored as local calendar strings `YYYY-MM-DD` (no time zones); timestamps as ISO 8601 UTC strings. See [database](database.md).
- **CON-5** IDs are generated in the browser (`crypto.randomUUID()` when available, otherwise a timestamp+random fallback).

## 4. Authentication and authorization

None (D3). Privacy comes from the browser sandbox: each browser profile has its own storage. This must be explained honestly in the footer notice (FR-026): it is **not** a security boundary against someone using the same device/browser profile.

## 5. APIs and integrations

No APIs and no external integrations. **Any network request from the app is a defect** (NFR-002, TC-36).

## 6. Security, privacy and validation requirements

| ID | Requirement | Reqs |
|---|---|---|
| SEC-01 | Render user data only with `textContent`, `createElement`, `setAttribute` of safe values, or `value`. **Never** use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` or `eval` with user or stored data | NFR-001 |
| SEC-02 | Treat everything read from `localStorage` as **untrusted** (users or other same-origin pages can change it). Parse in `try/catch`, check shape and types, discard invalid records | NFR-006 |
| SEC-03 | Validate all form input on save: required fields, length limits (P-10), allowed values (priority, theme id), real calendar dates | FR-025 |
| SEC-04 | No secrets, keys, tokens or credentials in code, docs or Git history | NFR-002 |
| SEC-05 | No inline scripts, inline event handlers (`onclick=`) or inline `style=` attributes. All JS/CSS in separate files, so a strict CSP can be used | NFR-001 |
| SEC-06 | Add a CSP `<meta>` tag to each page (P-14): `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'self'; form-action 'self'` | NFR-001, NFR-002 |
| SEC-07 | No third-party requests (fonts, CDNs, analytics, trackers) | NFR-002, NFR-003 |
| SEC-08 | Namespaced storage keys `studybloom:v1:*` to avoid collisions on shared `*.github.io` origins | database §2 |
| SEC-09 | Footer notice: data stays on this device; clearing browser data erases it; don't store passwords or sensitive info | FR-026, NFR-003 |
| SEC-10 | Dependencies: none. If one is ever proposed it needs owner approval (Rules §3) | NFR-002 |

**Known limitations (honest notes):** a `<meta>` CSP cannot enforce `frame-ancestors` and GitHub Pages does not allow custom HTTP headers, so clickjacking protection is limited; this is acceptable because the app holds no accounts or secrets. Anyone with access to the same browser profile can read the data via developer tools.

## 7. Deployment

| Item | Detail |
|---|---|
| Environments | Local (open files / simple local server) and production (GitHub Pages) — **Proposed (P-01)** |
| Build step | None; the repository root is the website |
| Config / environment variables | **None.** No `.env` files should exist |
| Release | Push to `main`, enable Pages for the `main` branch root, test the live URL on a phone and a laptop (PH-07) |
| Rollback | Revert the Git commit and push |

## 8. Performance and scalability

No numeric targets were set (none invented). Qualitative requirement (NFR-007): no frameworks, one small CSS base + one themes file, small JS files, and rendering that stays quick for ordinary personal task/note volumes. `localStorage` holds roughly a few megabytes per origin; note length is capped (P-10) and a "storage full" error must be handled (§6, SEC-02, database §6). Scalability to many users is by design (each user has their own browser; nothing is shared).

## 9. Observability

No server logs, analytics or error reporting (privacy, NFR-003). Developers use the browser DevTools console; **no console errors** are expected on normal use (TC-35). User-facing errors appear in the page's status area (appFlow §3).

## 10. Testing requirements

**Approach (Proposed, P-19):**
- **Unit tests:** a browser-run page `tests/tests.html` with a tiny assert helper (no tools to install) covering the pure logic listed below.
- **Integration tests:** manual, scripted walk-throughs in a real browser of UI ↔ storage ↔ refresh.
- **Regression:** re-run earlier checklists after each phase (phases §3).
- **Security/accessibility:** manual checks plus free browser tools (DevTools, Lighthouse in Chrome, a contrast checker). No tool results are claimed until actually run.

**Unit-testable logic (pure functions; no DOM):** `validateTask`, `validateNote`, `sortTasks`, `isOverdue`, `filterTasks`, `searchNotes`, `computeStats`, `selectTodayPriorities`, `selectUpcoming`, `quoteForDay`, `computeRemaining` (timer), stored-data parsing/validation in `storage`, and date helpers.

**Result categories:** *Passed* (performed and succeeded), *Failed*, *Not tested*, *Blocked*.

### Test catalog (single source of truth for test IDs)

| ID | Test | Reqs |
|---|---|---|
| TC-01 | Create a task with all fields; it appears in the list with correct subject, date, priority | FR-009, FR-010 |
| TC-02 | Save a task with an empty/whitespace title → message shown, nothing saved; too-long title rejected | FR-025 |
| TC-03 | Pending and completed tasks look different (more than color); order follows P-07 | FR-010 |
| TC-04 | Overdue pending task is flagged; "due today" is labelled | FR-010 |
| TC-05 | Edit a task; changes persist after refresh; Cancel leaves it unchanged | FR-011 |
| TC-06 | Delete asks confirmation; Cancel keeps the task; OK removes it | FR-012 |
| TC-07 | Toggle completed ↔ pending; Home counts update | FR-013, FR-003 |
| TC-08 | Filters All/Pending/Completed show the right tasks | FR-014 |
| TC-09 | Create a note with title, content, subject | FR-015 |
| TC-10 | Empty title/content rejected with a message | FR-025 |
| TC-11 | View notes; long note expands/collapses | FR-016 |
| TC-12 | Edit a note; changes persist | FR-017 |
| TC-13 | Delete a note with confirmation | FR-018 |
| TC-14 | Search by title (case-insensitive) | FR-019 |
| TC-15 | Search by content | FR-019 |
| TC-16 | Search with no matches shows a clear message; clearing search restores all | FR-019 |
| TC-17 | Subject and date shown on each note | FR-020 |
| TC-18 | Home totals match actual tasks (total, completed) and notes | FR-003 |
| TC-19 | Today's priorities and Upcoming lists contain exactly the right tasks | FR-004, FR-005 |
| TC-20 | Empty states on Home, Planner and Notes with no data | FR-008 |
| TC-21 | Quick actions open the right page/form | FR-006 |
| TC-22 | Quote shows; "Another quote" changes it | FR-007 |
| TC-23 | Each of the four themes visibly changes the page | FR-021 |
| TC-24 | Selected theme persists after refresh and on other pages | FR-022 |
| TC-25 | Tasks and notes persist after refresh | FR-024 |
| TC-26 | Corrupted/missing/wrong-shape stored data → app still loads, bad data ignored, message shown | NFR-006 |
| TC-27 | Storage unavailable/blocked → clear warning; no crash | NFR-006 |
| TC-28 | XSS payloads (e.g., `<img src=x onerror=alert(1)>`, `<script>`) in task title, subject, note title/content display literally; nothing executes | NFR-001 |
| TC-29 | Every nav link and button works on all pages | FR-001, NFR-012 |
| TC-30 | Widths 320, 375, 768, 1280 px: no horizontal scroll, no overlap, usable controls | NFR-004 |
| TC-31 | Whole app usable by keyboard; visible focus | NFR-005 |
| TC-32 | Text/controls meet the contrast target in all four themes | NFR-005 |
| TC-33 | Timer: start, pause, resume, reset, switch focus/break, finish message | FR-023 |
| TC-34 | Storage notice visible on every page | FR-026 |
| TC-35 | No console errors on any page during normal use | NFR-006 |
| TC-36 | DevTools Network tab shows no requests to other sites | NFR-002 |
| TC-37 | Greeting and today's date correct | FR-002 |

## 11. Technology decisions and alternatives

| Decision | Chosen | Alternatives considered | Why |
|---|---|---|---|
| UI approach | Plain HTML/CSS/JS | React/Vue | Install and learning cost; not needed (D4) |
| Persistence | localStorage | Cloud DB/backend | Needs accounts and servers (D3, D5) |
| Page structure | Multi-page | Single-page app | Simpler for beginners; each page is a small file (P-18) |
| Script style | Classic scripts + namespace | ES modules | Modules fail on `file://` |
| Hosting | GitHub Pages (proposed) | Netlify, Vercel | Same cost; Pages sits next to the repo |

## 12. Open items
See PRD §11 (OQ-01, OQ-04, OQ-06). Extra technical TODO: **verify** in PH-01 that the CSP `<meta>` does not break opening pages via `file://`; if it does, develop using a simple local server or rely on GitHub Pages and record the finding.
