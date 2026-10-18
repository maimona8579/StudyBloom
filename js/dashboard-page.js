// js/dashboard-page.js – Sticky-note study board dashboard
// Depends on: utils.js, storage.js, tasks.js, notes.js, quotes.js, timer.js, days.js, dashboard-day.js

(function () {
  function greet() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  function getWeekday(d) {
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }

  function getFullDate(d) {
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }

  function buildBoard() {
    const main = document.getElementById("main-content");
    if (!main) return;
    while (main.firstChild) main.removeChild(main.firstChild);

    const u = StudyBloom.utils;
    const st = StudyBloom.storage;
    const T = StudyBloom.tasks;
    const N = StudyBloom.notes;
    const Q = StudyBloom.quotes;

    // Storage warning if unavailable
    if (!st.available()) {
      const warn = u.createElement("div", { class: "storage-warning", text: "⚠ Storage is unavailable. Your study notes won't be saved." });
      main.appendChild(warn);
    }

    // ── 1. Today Note (Pink) ────────────────────────────────────────
    const todayNote = u.createElement("article", { class: "note note-pink board-area-today" });
    const lblWeekday = u.createElement("div", { class: "today-weekday", text: getWeekday(new Date()) });
    const lblDate = u.createElement("div", { class: "today-date", text: getFullDate(new Date()) });
    const lblGreet = u.createElement("div", { class: "today-greeting", text: greet() + "!" });
    const lblTag = u.createElement("div", { class: "today-tagline", text: "Small steps. Steady growth." });

    const todayActions = u.createElement("div", { class: "today-actions" });
    const btnAddTask = u.createElement("a", { class: "btn", text: "＋ Add task", attrs: { href: "planner.html#new-task" } });
    const btnAddNote = u.createElement("a", { class: "btn btn-ghost", text: "＋ Add note", attrs: { href: "notes.html#new-note" } });
    const btnOpenPlanner = u.createElement("a", { class: "btn btn-ghost", text: "📋 Open planner", attrs: { href: "planner.html" } });
    todayActions.appendChild(btnAddTask);
    todayActions.appendChild(btnAddNote);
    todayActions.appendChild(btnOpenPlanner);

    todayNote.appendChild(lblWeekday);
    todayNote.appendChild(lblDate);
    todayNote.appendChild(lblGreet);
    todayNote.appendChild(lblTag);
    todayNote.appendChild(todayActions);
    main.appendChild(todayNote);

    // ── 2. Daily Schedule Note (Lavender) ───────────────────────────
    const scheduleNote = u.createElement("article", { class: "note note-lavender board-area-schedule" });
    main.appendChild(scheduleNote);

    // ── 3. Goals Note (Yellow) ──────────────────────────────────────
    const goalsNote = u.createElement("article", { class: "note note-yellow board-area-goals" });
    main.appendChild(goalsNote);

    // ── 4. Wellness & Hydrate Note (Mint) ───────────────────────────
    const wellnessNote = u.createElement("article", { class: "note note-mint board-area-wellness" });
    main.appendChild(wellnessNote);

    // Mount interactive day components (schedule, goals, water)
    if (StudyBloom.homeDay && StudyBloom.homeDay.mount) {
      StudyBloom.homeDay.mount({
        schedule: scheduleNote,
        goals: goalsNote,
        water: wellnessNote,
      });
    }

    // ── 5. Quote Note (Peach) ───────────────────────────────────────
    const quoteNote = u.createElement("article", { class: "note note-peach board-area-quote" });
    const quoteH2 = u.createElement("h2", { text: "✨ Daily Inspiration" });
    const quoteP = u.createElement("p", { class: "quote-text" });
    const quoteBtn = u.createElement("button", { class: "btn-ghost quote-refresh", text: "Another quote" });

    let curQuote = Q.quoteForDay();
    u.setText(quoteP, "\u201c" + curQuote + "\u201d");
    quoteBtn.addEventListener("click", function () {
      curQuote = Q.randomQuote(curQuote);
      u.setText(quoteP, "\u201c" + curQuote + "\u201d");
    });
    quoteNote.appendChild(quoteH2);
    quoteNote.appendChild(quoteP);
    quoteNote.appendChild(quoteBtn);
    main.appendChild(quoteNote);

    // ── 6. Study Techniques Note (Peach) ────────────────────────────
    const techNote = u.createElement("article", { class: "note note-peach board-area-technique" });
    const techH2 = u.createElement("h2", { text: "💡 Study Techniques" });
    const techUl = u.createElement("ul", { class: "tech-list" });

    const techniques = [
      { name: "⏱ Pomodoro", desc: "25 min focus, 5 min break." },
      { name: "🧠 Active Recall", desc: "Test yourself before reviewing." },
      { name: "📈 Spaced Repetition", desc: "Review after 1, 3, and 7 days." },
      { name: "🗣 Feynman Technique", desc: "Explain concepts in simple words." },
      { name: "🗺 Mind Maps", desc: "Connect topics visually." },
      { name: "📝 Practice Papers", desc: "Solve questions with timed tests." },
    ];
    techniques.forEach(function (item) {
      const li = u.createElement("li", { class: "tech-item" });
      const b = u.createElement("span", { class: "tech-title", text: item.name + ": " });
      const span = u.createElement("span", { text: item.desc });
      li.appendChild(b);
      li.appendChild(span);
      techUl.appendChild(li);
    });
    techNote.appendChild(techH2);
    techNote.appendChild(techUl);
    main.appendChild(techNote);

    // ── 7. Timer Note (Blue) ────────────────────────────────────────
    const timerNote = u.createElement("section", {
      class: "note note-blue timer-widget board-area-timer",
      attrs: { id: "timer-widget", "aria-label": "Study timer" },
    });
    const timerH2 = u.createElement("h2", { text: "⏳ Focus Timer" });
    timerNote.appendChild(timerH2);
    main.appendChild(timerNote);

    if (StudyBloom.timer && StudyBloom.timer.init) {
      StudyBloom.timer.init();
    }

    // ── 8. Task Cards (Lavender) ────────────────────────────────────
    const tasksNote = u.createElement("article", { class: "note note-lavender board-area-tasks" });
    const tasksH2 = u.createElement("h2", { text: "📌 Tasks Overview" });
    tasksNote.appendChild(tasksH2);

    const stats = T.computeStats();
    const noteStats = N ? N.computeStats() : { total: 0 };

    const grid = u.createElement("div", { class: "dashboard-grid" });
    function statCard(val, lbl) {
      const c = u.createElement("div", { class: "stat-card" });
      c.appendChild(u.createElement("div", { class: "stat-value", text: String(val) }));
      c.appendChild(u.createElement("div", { class: "stat-label", text: lbl }));
      return c;
    }
    grid.appendChild(statCard(stats.total, "Total Tasks"));
    grid.appendChild(statCard(stats.completed, "Done"));
    grid.appendChild(statCard(noteStats.total, "Notes"));
    tasksNote.appendChild(grid);

    const todayStr = u.today();
    const cutoff = u.addDays(todayStr, 7);
    const allTasks = T.loadTasks();
    const pending = allTasks.filter(function (t) { return !t.completed; });

    // Today's priorities
    const todayTasks = T.sortTasks(
      pending.filter(function (t) {
        if (!t.due) return false;
        return t.due.slice(0, 10) <= todayStr;
      })
    ).slice(0, 5);

    // Upcoming (next 7 days)
    const upcomingTasks = pending.filter(function (t) {
      if (!t.due) return false;
      const d = t.due.slice(0, 10);
      return d > todayStr && d <= cutoff;
    }).slice(0, 5);

    function renderTaskList(titleText, list) {
      const h3 = u.createElement("h3", {
        class: "reminders-title",
        text: titleText,
      });
      tasksNote.appendChild(h3);

      if (!list.length) {
        tasksNote.appendChild(u.createElement("p", { class: "empty-state", text: "No pending tasks here." }));
      } else {
        const ul = u.createElement("ul", { class: "task-list" });
        list.forEach(function (t) {
          const li = u.createElement("li", { class: "task-item" });
          const chip = u.createElement("span", { class: "chip chip-" + t.priority, text: t.priority });
          const body = u.createElement("div", { class: "task-body" });
          body.appendChild(u.createElement("div", { class: "task-title", text: t.title }));
          body.appendChild(u.createElement("div", {
            class: "task-meta",
            text: (t.due ? t.due.slice(0, 10) : "No due date") + (t.subject ? " · " + t.subject : ""),
          }));
          li.appendChild(chip);
          li.appendChild(body);
          ul.appendChild(li);
        });
        tasksNote.appendChild(ul);
      }
    }

    renderTaskList("⚡ Today's Priorities", todayTasks);
    renderTaskList("📅 Upcoming Deadlines", upcomingTasks);

    const lnkPlanner = u.createElement("div", { class: "form-actions" });
    const aPlanner = u.createElement("a", { class: "btn btn-ghost", text: "View all in Planner →", attrs: { href: "planner.html" } });
    lnkPlanner.appendChild(aPlanner);
    tasksNote.appendChild(lnkPlanner);

    main.appendChild(tasksNote);

    // Midnight rollover check
    let lastCheckedDate = u.today();
    setInterval(function () {
      const cur = u.today();
      if (cur !== lastCheckedDate) {
        lastCheckedDate = cur;
        u.setText(lblWeekday, getWeekday(new Date()));
        u.setText(lblDate, getFullDate(new Date()));
        u.setText(lblGreet, greet() + "!");
        if (StudyBloom.homeDay && StudyBloom.homeDay.renderAll) {
          StudyBloom.homeDay.renderAll();
        }
      }
    }, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildBoard);
  } else {
    buildBoard();
  }
})();
