// js/dashboard-page.js – Sticky-note study board dashboard
// Depends on: utils.js, storage.js, quotes.js, timer.js, days.js, dashboard-day.js

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
    const Q = StudyBloom.quotes;

    // Storage warning if unavailable
    if (!st.available()) {
      const warn = u.createElement("div", { class: "storage-warning", text: "⚠ Storage is unavailable. Your study notes won't be saved." });
      main.appendChild(warn);
    }

    // ── 1. Today Note (Pink) ────────────────────────────────────────
    const todayNote = u.createElement("article", { class: "note note-pink board-area-today" });
    const lblWeekday = u.createElement("h1", { class: "today-weekday", text: getWeekday(new Date()) });
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

    // ── 8. Study Corner Note (Yellow) ───────────────────────────────
    const cornerNote = u.createElement("article", { class: "note note-yellow board-area-corner" });
    const cornerH2 = u.createElement("h2", { text: "🪴 Study Corner" });
    const imgCorner = u.createElement("img", {
      class: "corner-img",
      attrs: { src: "assets/illustrations/study-corner.svg", alt: "Cozy study corner illustration with books, pens, and a plant" },
    });
    const caption = u.createElement("div", {
      class: "corner-caption",
      text: "One page at a time. One day at a time.",
    });
    cornerNote.appendChild(cornerH2);
    cornerNote.appendChild(imgCorner);
    cornerNote.appendChild(caption);
    main.appendChild(cornerNote);

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
