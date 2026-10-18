// js/dashboard-page.js – Home (dashboard) UI
// Depends on: utils.js, storage.js, tasks.js, quotes.js, timer.js

(function () {
  function greet() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  function fmtDate(d) {
    return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  function buildDashboard() {
    const main = document.getElementById("main-content");
    if (!main) return;

    const u  = StudyBloom.utils;
    const st = StudyBloom.storage;

    // Storage warning
    if (!st.available()) {
      const warn = u.createElement("div", { class: "storage-warning", text: "⚠ Storage is unavailable. Your data won't be saved." });
      main.insertBefore(warn, main.firstChild);
    }

    // ── Greeting ──────────────────────────────────────────────────
    const greetBlock = u.createElement("div", { class: "greeting-block" });
    const greetH2    = u.createElement("h2", { text: greet() + "!" });
    const greetDate  = u.createElement("p",  { text: fmtDate(new Date()) });
    greetBlock.appendChild(greetH2);
    greetBlock.appendChild(greetDate);
    main.appendChild(greetBlock);

    // ── Stats ─────────────────────────────────────────────────────
    const stats       = StudyBloom.tasks.computeStats();
    const notesRaw    = st.getItem("notes");
    let noteCount = 0;
    try { noteCount = notesRaw ? JSON.parse(notesRaw).length : 0; } catch (_) {}

    const grid = u.createElement("div", { class: "dashboard-grid" });

    function statCard(value, label) {
      const card  = u.createElement("div", { class: "stat-card" });
      const val   = u.createElement("div", { class: "stat-value", text: String(value) });
      const lbl   = u.createElement("div", { class: "stat-label", text: label });
      card.appendChild(val); card.appendChild(lbl);
      return card;
    }
    grid.appendChild(statCard(stats.total,                  "Total Tasks"));
    grid.appendChild(statCard(stats.completed,              "Completed"));
    grid.appendChild(statCard(stats.total - stats.completed,"Pending"));
    grid.appendChild(statCard(noteCount,                    "Notes"));
    main.appendChild(grid);

    // ── Quick actions ─────────────────────────────────────────────
    const qa    = u.createElement("div", { class: "quick-actions" });
    const qaAdd = u.createElement("a",   { class: "btn", text: "＋ Add Task",  attrs: { href: "planner.html#new-task" } });
    const qaNot = u.createElement("a",   { class: "btn btn-ghost", text: "＋ Add Note", attrs: { href: "notes.html#new-note" } });
    qa.appendChild(qaAdd); qa.appendChild(qaNot);
    main.appendChild(qa);

    // ── Two-column: Today's priorities + Upcoming ─────────────────
    const cols     = u.createElement("div", { class: "dashboard-columns" });
    const colPri   = u.createElement("div", { class: "widget" });
    const colUpcom = u.createElement("div", { class: "widget" });

    const priTitle  = u.createElement("h2", { text: "Today's Priorities" });
    const upcomTitle= u.createElement("h2", { text: "Upcoming (7 days)" });
    colPri.appendChild(priTitle);
    colUpcom.appendChild(upcomTitle);

    const todayStr = u.today();
    const cutoff   = u.addDays(todayStr, 7);
    const allTasks = StudyBloom.tasks.loadTasks();
    const pending  = allTasks.filter(function (t) { return !t.completed; });

    // Today's priorities: due today or overdue and high priority
    const todayTasks = pending.filter(function (t) {
      if (!t.due) return false;
      return t.due.slice(0, 10) <= todayStr;
    }).slice(0, 5);

    // Upcoming: due in next 7 days
    const upcomTasks = pending.filter(function (t) {
      if (!t.due) return false;
      const d = t.due.slice(0, 10);
      return d > todayStr && d <= cutoff;
    }).slice(0, 5);

    function taskLine(t) {
      const li    = u.createElement("li",  { class: "task-item" + (t.completed ? " completed" : "") });
      const body  = u.createElement("div", { class: "task-body" });
      const title = u.createElement("div", { class: "task-title", text: t.title });
      const meta  = u.createElement("div", { class: "task-meta",  text: (t.due ? t.due.slice(0, 10) : "No due date") + " · " + t.priority });
      const chip  = u.createElement("span", { class: "chip chip-" + t.priority, text: t.priority });
      body.appendChild(title); body.appendChild(meta);
      li.appendChild(chip); li.appendChild(body);
      return li;
    }

    function fillList(tasks, container) {
      if (!tasks.length) {
        container.appendChild(u.createElement("p", { class: "empty-state", text: "Nothing here yet." }));
        return;
      }
      const ul = u.createElement("ul", { class: "task-list" });
      tasks.forEach(function (t) { ul.appendChild(taskLine(t)); });
      container.appendChild(ul);
    }

    fillList(todayTasks,  colPri);
    fillList(upcomTasks,  colUpcom);
    cols.appendChild(colPri);
    cols.appendChild(colUpcom);
    main.appendChild(cols);

    // ── Quote widget ──────────────────────────────────────────────
    const quoteWidget = u.createElement("div", { class: "widget" });
    const quoteH2     = u.createElement("h2",  { text: "Quote of the Day" });
    const quoteText   = u.createElement("p",   { class: "quote-text" });
    const quoteBtn    = u.createElement("button", { class: "btn btn-ghost quote-refresh", text: "Another quote" });

    let currentQuote = StudyBloom.quotes.quoteForDay();
    u.setText(quoteText, "\u201c" + currentQuote + "\u201d");

    quoteBtn.addEventListener("click", function () {
      currentQuote = StudyBloom.quotes.randomQuote(currentQuote);
      u.setText(quoteText, "\u201c" + currentQuote + "\u201d");
    });

    quoteWidget.appendChild(quoteH2);
    quoteWidget.appendChild(quoteText);
    quoteWidget.appendChild(quoteBtn);
    main.appendChild(quoteWidget);

    // ── Timer widget ──────────────────────────────────────────────
    const timerSection = u.createElement("section", { class: "widget timer-widget", attrs: { id: "timer-widget", "aria-label": "Study timer" } });
    const timerH2      = u.createElement("h2", { text: "Study Timer (Pomodoro)" });
    timerSection.appendChild(timerH2);
    main.appendChild(timerSection);

    // timer.js self-initializes when #timer-widget is present; it already ran initTimerWidget
    // at DOMContentLoaded, but the element didn't exist yet. Call it now.
    if (StudyBloom.timer && StudyBloom.timer.init) {
      StudyBloom.timer.init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildDashboard);
  } else {
    buildDashboard();
  }
})();
