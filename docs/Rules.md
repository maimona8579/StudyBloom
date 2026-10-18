# StudyBloom — AI Development Rules

**Version:** 0.1 (draft) · **Date:** 14 Oct 2026
**Audience:** any AI coding assistant (ChatGPT, Gemini, Claude, others) working on StudyBloom.
**Related:** [PRD](PRD.md) · [TRD](TRD.md) · [Architecture](Architecture.md) · [appFlow](appFlow.md) · [database](database.md) · [design](design.md) · [phases](phases.md)

Each rule is written so that it can be checked. "MUST" and "MUST NOT" are mandatory.

## 1. Before you do anything

- **R-01** MUST read `PRD.md`, `TRD.md`, `Architecture.md`, `database.md`, `appFlow.md`, `design.md` and `phases.md` before writing code in a session. If you cannot see them, ask the owner to paste or upload them.
- **R-02** MUST work on **one phase at a time**, in the order in `phases.md`. Do not start a phase until the previous one meets its exit criteria.
- **R-03** MUST NOT start coding until the owner has explicitly authorized implementation (D9).
- **R-04** MUST treat **Confirmed** decisions (D1–D12) as authoritative. Proposals (`P-xx`) are only usable once the owner approves them; until then, state which proposal you are assuming.
- **R-05** MUST NOT turn a proposal, inference or your own idea into a requirement silently. Ask first.

## 2. Scope control

- **R-06** MUST implement only requirements listed in the PRD (`FR-`, `NFR-`). Anything else (calendar, timetable, export/import, custom colors, dark/light toggle, accounts, sharing) is **out of scope** and MUST NOT be added.
- **R-07** If time is short, defer only **Should** items (FR-007 quotes, FR-014 filters, FR-023 timer) and **only with the owner's approval** (OQ-05).
- **R-08** MUST NOT refactor or restyle unrelated code while working on a task.

## 3. Technology rules

- **R-09** MUST use plain HTML, CSS and JavaScript (D4). MUST NOT add frameworks, build tools, package managers, CDNs, web fonts, icon libraries, analytics or any third-party code. A new dependency needs the owner's approval and a recorded reason.
- **R-10** MUST NOT add a backend, database, login, cloud storage or network requests (D3, D5). Check: DevTools Network tab shows no requests to other sites (TC-36).
- **R-11** MUST use classic `<script>` files and the single global namespace `StudyBloom`; no ES modules (P-18).
- **R-12** MUST use **relative** paths for all links and assets.
- **R-13** MUST follow the folder structure in `Architecture.md` §6. New files need a stated purpose and a documentation update.

## 4. Security and privacy (must-pass)

- **R-14** MUST render user or stored text only with `textContent`, `createElement`, or `.value`. MUST NOT use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` or string-based timers with such data (SEC-01). Check: search the code for these names; each match must be justified (static, non-user text only).
- **R-15** MUST NOT use inline `<script>` blocks, inline event attributes (`onclick=`) or inline `style=` attributes (SEC-05).
- **R-16** MUST keep the CSP `<meta>` tag from TRD §6 on every page.
- **R-17** MUST treat data read from `localStorage` as untrusted: `try/catch`, shape and type checks, drop invalid records (SEC-02, database §4).
- **R-18** MUST NOT hard-code or request secrets, passwords, tokens or personal data. MUST NOT ask the owner to share any in chat.
- **R-19** MUST access `localStorage` **only** inside `storage.js` (and the theme id read/write in `theme.js`).
- **R-20** MUST keep the footer notice (FR-026) on every page.

## 5. Code quality (beginner-friendly)

- **R-21** Keep files small and focused as defined in Architecture §3. Logic modules MUST NOT touch the DOM; page scripts MUST NOT call `localStorage` directly.
- **R-22** Add short comments explaining *why* (not only what). Use clear names: functions `camelCase`, constants `UPPER_SNAKE_CASE`, CSS classes `kebab-case`, element ids `kebab-case`.
- **R-23** Colors in CSS MUST come from the theme tokens in `design.md` §2. No hard-coded hex colors outside `themes.css`.
- **R-24** Every visible link and button MUST do what its label says (NFR-012). No decorative controls.
- **R-25** Use the exact screen, element and key names from the docs (`index.html`, `planner.html`, `notes.html`, `studybloom:v1:tasks`, etc.).
- **R-26** Handle errors: failed save → visible message and no false "saved" feedback. Empty data → friendly empty state, never a blank area or crash.

## 6. Design and accessibility

- **R-27** MUST follow `design.md` for tokens, layout and components. No substantial visual-direction changes without the owner's approval.
- **R-28** Every form field MUST have a visible `<label>`; every interactive element MUST be keyboard operable with a visible focus outline.
- **R-29** Do not convey meaning by color alone (completed, overdue, priority, errors).
- **R-30** Must work at 320px width with no horizontal scrolling.

## 7. Testing and honesty

- **R-31** At the end of every phase run the **Phase Gate** in `phases.md` §2 and record results in the Phase Log using only: **Passed / Failed / Not tested / Blocked**.
- **R-32** MUST NOT claim code ran, a test passed, a file was saved, a commit or push happened, or a site is live unless it actually happened and you can show evidence (output, screenshot description, owner confirmation). If you cannot run something (no browser/terminal), say so and give the owner the exact manual steps instead.
- **R-33** Fix in-scope defects before moving on; rerun affected tests.
- **R-34** Never invent file paths, test output or project state. If unsure of the current file contents, ask to see the file.

## 8. Documentation upkeep

- **R-35** When behavior, structure or decisions change, update the affected document(s) and the task status in `phases.md` in the same step.
- **R-36** Keep a single source of truth: requirements in the PRD, data rules in `database.md`, test cases in TRD §10. Cross-reference instead of copying.
- **R-37** Report assumptions, deviations, incomplete work and known limitations at the end of each phase.

## 9. Git and GitHub (proposed, P-20)

- **R-38** Branch: `main`. One commit per finished task group, message format `PH-0X: short summary` (e.g., `PH-02: planner create/edit/delete`).
- **R-39** Before every commit: check for secrets, review the list of changed files, ensure `.gitignore` is in place.
- **R-40** Explain Git steps in simple language and let the owner run them. Never claim a commit or push succeeded without the owner's confirmation or visible output.

## 10. Working within free-plan limits

- **R-41** Prefer **complete files** for new files; for edits to existing files, show only the changed parts clearly marked with file name and location. Do not reprint unchanged files.
- **R-42** Keep explanations short and beginner-friendly; avoid long lectures. Tell the owner what to do next in one or two steps.
- **R-43** At the end of each phase, give a short status: done, not done, how to test, next phase.
- **R-44** If a conversation gets long, give a compact **handover note** (current phase, finished tasks, open issues) the owner can paste into a new chat.

## 11. Asking for help

- **R-45** Ask a question only when a decision genuinely blocks progress; otherwise document the assumption (as `P-xx` or `OQ-xx`) and continue within approved boundaries.
