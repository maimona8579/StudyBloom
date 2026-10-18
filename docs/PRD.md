# StudyBloom — Product Requirements Document (PRD)

**Tagline:** Small steps. Steady growth.
**Version:** 0.1 (draft for user review) · **Date:** 14 Oct 2026
**Related docs:** [TRD](TRD.md) · [Architecture](Architecture.md) · [appFlow](appFlow.md) · [database](database.md) · [design](design.md) · [Rules](Rules.md) · [phases](phases.md)

## 0. How to read this document

Every statement carries a status so proposals are never mistaken for decisions:

| Label | Meaning |
|---|---|
| **Confirmed** | Explicitly stated or approved by the project owner in the discovery chat or brief |
| **Inferred** | Strongly implied by the context but not explicitly confirmed |
| **Proposed** | A recommendation awaiting approval (tracked as `P-xx`) |
| **Unresolved** | A decision still missing (tracked as `OQ-xx`) |

This PRD is the **single source of truth** for requirement IDs (`FR-`, `NFR-`), decisions (`D-`), proposals (`P-`) and open questions (`OQ-`). Other documents reference these IDs instead of redefining them.

---

## 1. Product overview and problem statement

**StudyBloom** is a simple, attractive student productivity website. It helps students manage study tasks, keep notes, see upcoming deadlines, focus with a study timer, and stay motivated, all in a calm, customizable "study space" look.

**Problem (Inferred):** Students juggle deadlines, subjects and notes across scattered apps, paper lists and chat messages. Heavy planner tools feel complicated; a lightweight, pleasant tool that works instantly on a phone or laptop lowers the barrier to actually planning.

**Project context (Confirmed):** This is the owner's first website and a learning project. It must be buildable in **1–2 days (3 at most)** using a **free-tier AI assistant**, so scope is deliberately small.

## 2. Goals and non-goals

### Goals
1. A working MVP: Home dashboard, Study Planner, Study Notes (**D1**).
2. Four selectable themes that change the real appearance (**D2**).
3. Usable on mobile and laptop (**D12**).
4. Anyone with the link can use their own private planner with no login (**D3**).
5. Safe handling of user text and no secrets anywhere (**D10**).
6. Clear Markdown documentation and a project ready for GitHub (**D9**).
7. Beginner-friendly code and process, so the owner learns how the pieces fit.

### Non-goals (this version)
Accounts/login, cloud sync, shared planners between users, collaboration, backend/database, rich-text editing, attachments, drag-and-drop, full calendar, weekly timetable, export/import backup, custom color picker, separate dark/light toggle (see §8).

## 3. Target users and use cases

| User | Description | Status |
|---|---|---|
| **Student** | University/college student managing tasks, notes and deadlines | Confirmed |
| **Friends / lead of the owner** | Open the same website link and use their **own private** planner on their own device | Confirmed (D3) |

**Not users:** administrators, instructors or any role that sees other people's data. There are no roles or permissions (Confirmed: no login).

**Key use cases**
- UC-1: Add a study task with subject, due date and priority; tick it off later.
- UC-2: Glance at the dashboard to see what is due today and what is coming up.
- UC-3: Jot down and search study notes by subject, title or content.
- UC-4: Run a focus session with the study timer.
- UC-5: Switch the look to suit the mood (four themes).
- UC-6: Open the site on a phone or laptop and use it immediately.

## 4. Decision log (single source of truth)

| ID | Decision | Status |
|---|---|---|
| D1 | Scope "A": Dashboard, Planner, Notes only for the core build | Confirmed |
| D2 | Four themes: Soft Pastel, Lavender & White, Dark Academia, Sage Green; choice remembered | Confirmed |
| D3 | Each user has a **private planner in their own browser**; no login, no cloud, no data sharing between people | Confirmed |
| D4 | Plain HTML, CSS and JavaScript; no framework | Confirmed |
| D5 | Browser `localStorage` for tasks, notes and theme | Confirmed |
| D6 | Motivational quotes included | Confirmed |
| D7 | Study timer (Pomodoro-style) included in the first version | Confirmed |
| D8 | Simple "Upcoming deadlines" list on the dashboard instead of a full calendar | Confirmed |
| D9 | Deliver eight Markdown docs first; **no coding until the owner explicitly authorizes it** | Confirmed |
| D10 | Security basics: safe rendering of user text, no secrets, "don't store sensitive info" notice | Confirmed |
| D11 | Timeline 1–2 days (3 max) within free-plan limits; MVP over completeness | Confirmed |
| D12 | Must work on mobile and laptop | Confirmed |

### Proposals awaiting approval

| ID | Proposal | Where detailed |
|---|---|---|
| P-01 | Host on **GitHub Pages** (free) from the `main` branch | TRD §7 |
| P-02 | Timer is a **widget on the Home page** (no fourth nav item) | appFlow §5 |
| P-03 | Timer: fixed 25 min focus / 5 min break; no saved state, no sound, no notifications | appFlow §5 |
| P-04 | Subject is **free text** (max 30 chars), default "General" | database §3 |
| P-05 | Task due date is **optional**; past dates allowed | database §3 |
| P-06 | Planner filter tabs: All / Pending / Completed | appFlow §4.2 |
| P-07 | Task sort rule: pending first by due date (no date last), then priority; completed last | appFlow §4.2 |
| P-08 | Dashboard lists: "Today's priorities" = pending tasks due today or overdue (max 5); "Upcoming" = pending tasks due in the next 7 days (max 5) | appFlow §4.1 |
| P-09 | Delete asks for confirmation; delete is permanent (no recycle bin) | appFlow §4.2 and §4.3 |
| P-10 | Field limits: titles 100 chars, subject 30, note content 5000 | database §3 |
| P-11 | ~25 short, original, **unattributed** quotes; one per day plus an "Another quote" button | appFlow §4.1 |
| P-12 | Storage/privacy notice in the footer of every page | appFlow §3 |
| P-13 | System fonts only; no CDNs, web fonts, analytics or other third-party requests | TRD §6 |
| P-14 | Content-Security-Policy via `<meta>` tag | TRD §6 |
| P-15 | Exact color values for the three new themes and the token set | design §2 |
| P-16 | Theme selector = labeled dropdown in the header; default theme Soft Pastel | design §6 |
| P-17 | Navigation: top bar ≥640px, bottom tab bar <640px | design §5 |
| P-18 | Multi-page site (`index.html`, `planner.html`, `notes.html`), classic `<script>` files, one global namespace, no build step | Architecture §3 |
| P-19 | Unit tests in a browser-run page `tests/tests.html` (no tooling); integration/regression by manual checklist | TRD §10 |
| P-20 | Git: `main` branch, one commit per finished task group (`PH-02: planner CRUD`), `.gitignore` | Rules §9 |
| P-21 | Time-of-day greeting ("Good morning"), no personal name | appFlow §4.1 |
| P-22 | Seven implementation phases and day-by-day pacing | phases §1 |
| P-23 | Notes sorted newest-updated first; long notes use a "Show more/less" toggle | appFlow §4.3 |

## 5. Functional requirements

Priority: **Must** = core MVP. **Should** = approved for MVP but the first thing to cut if time runs out (cutting needs the owner's approval).

### Dashboard (Home)
| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-001 | Every page shows StudyBloom branding and working navigation to Home, Planner and Notes | Must | Brief |
| FR-002 | Home shows a friendly welcome message and today's date | Must | Brief, P-21 |
| FR-003 | Home shows real totals: all tasks, completed tasks, saved notes, computed from saved data (never hard-coded) | Must | Brief |
| FR-004 | Home shows "Today's priorities" (P-08) | Must | Brief |
| FR-005 | Home shows an "Upcoming deadlines" list (P-08) | Must | D8 |
| FR-006 | Home has quick actions: Add task, Create note, Open planner | Must | Brief |
| FR-007 | Home shows a motivational quote (P-11) | Should | D6 |
| FR-008 | Helpful empty states appear when there are no tasks or notes | Must | Brief |

### Planner (tasks)
| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-009 | Create a task with title (required), subject, due date, priority (low/medium/high) | Must | Brief |
| FR-010 | View saved tasks in a simple list; completed tasks are clearly distinct from pending; overdue pending tasks are flagged | Must | Brief |
| FR-011 | Edit a task | Must | Brief |
| FR-012 | Delete a task (with confirmation, P-09) | Must | Brief |
| FR-013 | Mark a task completed or pending | Must | Brief |
| FR-014 | Filter tasks: All / Pending / Completed (P-06) | Should | Proposed |

### Notes
| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-015 | Create a note with title, content and subject/category | Must | Brief |
| FR-016 | View saved notes | Must | Brief |
| FR-017 | Edit a note | Must | Brief |
| FR-018 | Delete a note (with confirmation, P-09) | Must | Brief |
| FR-019 | Search notes by title or content | Must | Brief |
| FR-020 | Each note shows subject/category and a date indicator | Must | Brief |

### Cross-cutting
| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-021 | Four themes selectable via a working selector; switching changes the real appearance | Must | D2 |
| FR-022 | Selected theme is remembered after refresh | Must | D2 |
| FR-023 | Pomodoro-style study timer (P-02, P-03) | Should | D7 |
| FR-024 | Tasks and notes persist in `localStorage` across refreshes | Must | D5 |
| FR-025 | Forms validate required fields and input, show understandable messages, and give success feedback | Must | Brief |
| FR-026 | A visible notice states: data is saved only in this browser/device, clearing browser data erases it, and sensitive info should not be stored (P-12) | Must | D3, D10 |

## 6. Non-functional requirements

| ID | Requirement | Source |
|---|---|---|
| NFR-001 | **Safe rendering:** user-written text is always shown as plain text and never executed as HTML/JavaScript | D10 |
| NFR-002 | **No secrets / no third parties:** no keys, passwords or tokens anywhere; no external scripts, fonts or analytics (P-13) | D10 |
| NFR-003 | **Privacy:** data never leaves the user's browser; footer notice (FR-026) | D3, D10 |
| NFR-004 | **Responsive:** works from very small phones to laptops with no horizontal overflow, overlap or unusable controls | D12 |
| NFR-005 | **Accessibility:** readable contrast in all four themes, keyboard operable, labelled form fields, meaning not conveyed by color alone (AA contrast is the proposed target) | Brief |
| NFR-006 | **Reliability:** missing, corrupted or unavailable stored data never crashes a page; user sees a friendly message | Brief |
| NFR-007 | **Performance:** no build step and no heavy libraries; pages feel instant for normal personal use (no numeric target set) | D4 |
| NFR-008 | **Browser support:** current versions of Chrome, Edge, Firefox and Safari on desktop and mobile (Inferred) | Inferred |
| NFR-009 | **Maintainability:** small, commented, consistently named files a beginner can follow | Brief |
| NFR-010 | **Cost:** free tools and hosting only; no paid dependencies | Brief |
| NFR-011 | **Schedule:** deliverable within 1–2 days, 3 at most | D11 |
| NFR-012 | **Honest controls:** every visible link and button performs its function | Brief |

## 7. User stories and acceptance criteria

| ID | Story | Acceptance criteria | Reqs |
|---|---|---|---|
| US-01 | As a student, I add a task so I remember it | Valid task appears in the list immediately and after refresh; empty title shows a message and saves nothing | FR-009, FR-024, FR-025 |
| US-02 | I tick tasks off | Toggling changes the look (not color only), counts on Home update | FR-013, FR-010, FR-003 |
| US-03 | I fix or remove a task | Edit pre-fills the form and saves changes; delete asks first and removes it only on confirm | FR-011, FR-012 |
| US-04 | I see what is urgent | Home lists pending tasks due today/overdue and the next 7 days of deadlines | FR-004, FR-005 |
| US-05 | I write and find notes | Notes can be created, edited, deleted; typing in search narrows results by title or content; no matches shows a message | FR-015–FR-019 |
| US-06 | I choose a look | Four themes switch instantly and persist after refresh | FR-021, FR-022 |
| US-07 | I focus with a timer | Start/pause/reset work; finishing shows a clear message | FR-023 |
| US-08 | I get started with an empty app | Home and lists show friendly empty states with a next action | FR-008 |
| US-09 | I trust my text is safe | Text like `<b>hi</b>` or `<img onerror=...>` is displayed literally, nothing runs | NFR-001 |
| US-10 | I know where my data lives | Footer notice visible on every page | FR-026 |

Detailed test cases: see [TRD §10](TRD.md).

## 8. MVP scope, exclusions and future enhancements

**In MVP:** everything in §5.

**Version 2 candidates (not in the first build; Confirmed as deferred except where noted):**
- Full month calendar and weekly timetable
- Export/import backup (helps move data between phone and laptop)
- Custom colors; separate light/dark toggle on top of themes
- Pomodoro settings, sound and notifications (Proposed)
- Subject filters, statistics charts (Proposed)

**Explicitly out of scope:** login, cloud storage, sharing data between users, backend, database, rich text, attachments, collaboration.

## 9. Success criteria

No numeric targets have been set (**Unresolved by design**; none invented). Proposed qualitative criteria:
- All **Must** requirements pass their test cases (TC-xx in TRD §10).
- Works on one phone and one laptop browser, tested by the owner.
- Delivered within the 1–3 day window.
- Owner can explain how the project's parts fit together.

## 10. Assumptions, constraints, dependencies, risks

**Assumptions:** one person per browser profile; users are comfortable with English UI (Inferred); users have a modern browser with JavaScript enabled.

**Constraints:** 1–3 days; free AI plan (limited messages); no paid services; no backend.

**Dependencies:** a free GitHub account (only for sharing the link, P-01).

| Risk | Impact | Mitigation |
|---|---|---|
| Browser data cleared → tasks/notes lost | High for users | Footer notice (FR-026); backup is a Version 2 item |
| Phone and laptop data are separate | Medium | State this in the notice; Version 2 export/import |
| Scope creep with a 3-day limit | High | Strict MVP; Should-items cut first |
| Free-plan message limits mid-build | Medium | One phase at a time; ask for complete files (Rules §10) |
| All sites on `username.github.io` share one storage origin | Low | Namespaced storage keys (database §2) |
| Low contrast in a theme | Medium | Contrast checks in PH-06 (TC-32) |

## 11. Open questions

| ID | Question | Blocks |
|---|---|---|
| OQ-01 | Is **GitHub Pages** (P-01) approved for hosting? | PH-07 only |
| OQ-02 | The original brief named "Soft Pastel" and "Minimal Academic". The chat then replaced them with four themes. Is "Minimal Academic" simply replaced by "Lavender & White" (**Inferred yes**)? | design |
| OQ-03 | The brief mentions "eight project phases" defined elsewhere, but only the documentation prompt was supplied, which defines `phases.md` adaptively. `phases.md` proposes **seven** phases (P-22). Is there a separate eight-phase list to follow instead? | phases |
| OQ-04 | Are proposals P-01 to P-23 approved as a batch, or individually? | all |
| OQ-05 | If time runs short, may the timer/quotes/filter (Should items) be deferred? | phases |
| OQ-06 | GitHub username and repository name (for the live link) | PH-07 |

## 12. Glossary

- **localStorage:** a small storage area built into the browser that keeps text data on this device.
- **MVP:** minimum viable product — the smallest version that is useful.
- **Pomodoro:** a technique of focused work in short blocks (here 25 min) with short breaks.
- **XSS:** an attack where malicious text runs as code in a page; prevented by showing text safely.
- **Empty state:** the friendly message shown when a list has nothing in it yet.
- **GitHub Pages:** free hosting for static websites from a GitHub repository.
