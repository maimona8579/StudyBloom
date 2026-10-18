# StudyBloom

A static‑site study‑assistant that provides a planner, notes, daily quotes, and a Pomodoro timer. All functionality is built with vanilla JavaScript, no build step, and runs safely under a strict Content‑Security‑Policy.

## Quick start (local)
```powershell
# From the project root
cd "C:/Users/HP/Downloads/studyBloom (1)/studyBloom"
python -m http.server 8080   # or any static server
```
Open <http://localhost:8080> in a browser.

## Project structure
```
studyBloom/
├─ index.html          # Home / dashboard
├─ planner.html        # Task planner
├─ notes.html          # Notes page
├─ css/
│   ├─ base.css       # Layout, responsive breakpoints
│   └─ themes.css     # Four theme token sets
├─ js/
│   ├─ utils.js       # Safe DOM helpers
│   ├─ storage.js     # localStorage wrapper
│   ├─ theme.js       # Theme selection & persistence
│   ├─ tasks.js       # Task CRUD & stats
│   ├─ notes.js       # Note CRUD & search
│   ├─ quotes.js      # Daily quote widget
│   ├─ timer.js       # Pomodoro logic (focus/break)
│   ├─ dashboard-page.js   # Home UI wiring
│   ├─ planner-page.js      # Planner UI
│   └─ notes-page.js        # Notes UI
├─ tests/
│   └─ tests.html     # Simple test harness
└─ docs/
    ├─ PRD.md
    ├─ Architecture.md
    └─ phases.md       # Road‑map & phase log
```

## Development notes
- All DOM manipulation uses `StudyBloom.utils` – **no** `innerHTML` anywhere (security rule R‑14).
- CSP is declared in every HTML file: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:`.
- Themes are stored in `localStorage` under `studybloom:v1:theme`.
- No external network requests; the app works offline.

## Publishing
1. Initialise a Git repo in this directory:
```powershell
cd "C:/Users/HP/Downloads/studyBloom (1)/studyBloom"
git init
git add .
git commit -m "Initial commit – StudyBloom static site"
```
2. Create a new GitHub repository (owner must provide the name). Add the remote and push:
```powershell
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```
3. Enable **GitHub Pages** on the `main` (or `gh-pages`) branch in the repository settings. The site will be available at `https://<USERNAME>.github.io/<REPO>/`.
4. Verify the live site works on desktop and mobile browsers (run the regression suite).

## Tests
Open `tests/tests.html` in a browser – it reports pass/fail for each unit test. All tests currently pass.

## License
MIT – see `LICENSE` file (to be added by the owner).
