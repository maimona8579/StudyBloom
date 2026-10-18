// js/planner-calendar.js – Interactive deadline calendar for StudyBloom planner
// Depends on: utils.js, tasks.js, calendar.js. Pure DOM construction via StudyBloom.utils.

(function () {
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let curYear = new Date().getFullYear();
  let curMonth0 = new Date().getMonth();
  let selectedDayKey = null;
  let mountContainer = null;
  let callbacks = {};

  function render() {
    if (!mountContainer) return;
    const u = StudyBloom.utils;
    const C = StudyBloom.calendar;
    const T = StudyBloom.tasks;
    const todayKey = u.today();

    while (mountContainer.firstChild) mountContainer.removeChild(mountContainer.firstChild);

    const h2 = u.createElement("h2", { text: "🗓 Deadline Calendar" });
    mountContainer.appendChild(h2);

    // ── Month navigation header ──────────────────────────────────
    const header = u.createElement("div", { class: "calendar-header" });
    const btnPrev = u.createElement("button", { class: "btn-ghost", text: "◀", attrs: { "aria-label": "Previous month" } });
    const title = u.createElement("span", {
      class: "calendar-month-title",
      text: MONTH_NAMES[curMonth0] + " " + curYear,
      attrs: { "aria-live": "polite" }
    });
    const btnNext = u.createElement("button", { class: "btn-ghost", text: "▶", attrs: { "aria-label": "Next month" } });
    const btnToday = u.createElement("button", { class: "btn-ghost", text: "Today" });

    btnPrev.addEventListener("click", function () {
      const shifted = C.shiftMonth(curYear, curMonth0, -1);
      curYear = shifted.year;
      curMonth0 = shifted.month0;
      render();
    });

    btnNext.addEventListener("click", function () {
      const shifted = C.shiftMonth(curYear, curMonth0, 1);
      curYear = shifted.year;
      curMonth0 = shifted.month0;
      render();
    });

    btnToday.addEventListener("click", function () {
      const now = new Date();
      curYear = now.getFullYear();
      curMonth0 = now.getMonth();
      selectedDayKey = todayKey;
      render();
    });

    header.appendChild(btnPrev);
    header.appendChild(title);
    header.appendChild(btnToday);
    header.appendChild(btnNext);
    mountContainer.appendChild(header);

    // ── Weekday labels ───────────────────────────────────────────
    const wkRow = u.createElement("div", { class: "calendar-weekdays" });
    WEEKDAYS.forEach(function (w) {
      wkRow.appendChild(u.createElement("div", { text: w }));
    });
    mountContainer.appendChild(wkRow);

    // ── 42-day Grid ──────────────────────────────────────────────
    const allTasks = T.loadTasks();
    const tasksMap = C.tasksByDate(allTasks);
    const cells = C.monthGrid(curYear, curMonth0);

    const grid = u.createElement("div", { class: "calendar-grid" });

    cells.forEach(function (cell) {
      const list = tasksMap[cell.date] || [];
      const st = C.dayStatus(list, todayKey);

      const [y, m, d] = cell.date.split("-").map(Number);
      const ariaLabel = `${d} ${MONTH_NAMES[m - 1]} ${y}, ${st.pending} pending, ${st.done} completed`;

      let cls = "calendar-day-btn";
      if (!cell.inMonth) cls += " is-other-month";
      if (cell.date === todayKey) cls += " is-today";
      if (cell.date === selectedDayKey) cls += " is-selected";

      const btn = u.createElement("button", {
        class: cls,
        attrs: { type: "button", "aria-label": ariaLabel }
      });

      const dayNum = u.createElement("span", { class: "day-num", text: String(d) });
      btn.appendChild(dayNum);

      const badges = u.createElement("div", { class: "day-badges" });
      if (st.pending > 0) {
        const badge = u.createElement("span", { class: "day-pending-count", text: String(st.pending) });
        badges.appendChild(badge);

        if (st.overdue > 0) {
          const overdue = u.createElement("span", { class: "day-overdue-mark", text: "!" });
          badges.appendChild(overdue);
        }

        const dots = u.createElement("div", { class: "day-dots" });
        list.filter(function (t) { return !t.completed; }).slice(0, 3).forEach(function (t) {
          dots.appendChild(u.createElement("span", { class: "dot dot-" + t.priority }));
        });
        badges.appendChild(dots);
      } else if (st.done > 0) {
        const check = u.createElement("span", { class: "day-done-check", text: "✓" });
        badges.appendChild(check);
      }

      btn.appendChild(badges);

      btn.addEventListener("click", function () {
        selectedDayKey = (selectedDayKey === cell.date) ? null : cell.date;
        render();
      });

      grid.appendChild(btn);
    });

    mountContainer.appendChild(grid);

    // ── Legend ───────────────────────────────────────────────────
    const legend = u.createElement("div", { class: "calendar-legend" });
    const legDots = u.createElement("span", { text: "● High / Medium / Low priority" });
    const legOverdue = u.createElement("span", { text: "! Overdue pending" });
    const legDone = u.createElement("span", { text: "✓ Completed only" });
    legend.appendChild(legDots);
    legend.appendChild(legOverdue);
    legend.appendChild(legDone);
    mountContainer.appendChild(legend);

    // ── Selected Day Panel ───────────────────────────────────────
    if (selectedDayKey) {
      renderDayPanel(selectedDayKey, tasksMap[selectedDayKey] || []);
    }
  }

  function renderDayPanel(dayKey, dayTasks) {
    const u = StudyBloom.utils;
    const T = StudyBloom.tasks;

    const panel = u.createElement("div", { class: "day-panel" });
    const header = u.createElement("div", { class: "day-panel-header" });

    const [y, m, d] = dayKey.split("-").map(Number);
    const dateFormatted = `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
    const title = u.createElement("span", { text: "📌 Tasks for " + dateFormatted });
    const btnClose = u.createElement("button", { class: "btn-ghost", text: "✕", attrs: { "aria-label": "Close day panel" } });

    btnClose.addEventListener("click", function () {
      selectedDayKey = null;
      render();
    });

    header.appendChild(title);
    header.appendChild(btnClose);
    panel.appendChild(header);

    if (!dayTasks.length) {
      panel.appendChild(u.createElement("p", { class: "empty-state", text: "No tasks due on this date." }));
    } else {
      const ul = u.createElement("ul", { class: "task-list" });
      dayTasks.forEach(function (t) {
        const li = u.createElement("li", { class: "task-item" + (t.completed ? " completed" : "") });
        const cb = u.createElement("input", {
          attrs: { type: "checkbox", "aria-label": "Mark " + t.title + " as complete" }
        });
        if (t.completed) cb.setAttribute("checked", "");

        const chip = u.createElement("span", { class: "chip chip-" + t.priority, text: t.priority });
        const body = u.createElement("div", { class: "task-body" });
        body.appendChild(u.createElement("div", { class: "task-title", text: t.title }));
        body.appendChild(u.createElement("div", { class: "task-meta", text: t.subject || "General" }));

        cb.addEventListener("change", function () {
          T.toggleTask(t.id);
          if (callbacks.onTaskToggled) callbacks.onTaskToggled();
        });

        li.appendChild(cb);
        li.appendChild(chip);
        li.appendChild(body);
        ul.appendChild(li);
      });
      panel.appendChild(ul);
    }

    const actions = u.createElement("div", { class: "form-actions" });
    const btnAdd = u.createElement("button", { text: "＋ Add task on this day" });
    btnAdd.addEventListener("click", function () {
      if (callbacks.onAddTaskOnDay) {
        callbacks.onAddTaskOnDay(dayKey);
      }
    });
    actions.appendChild(btnAdd);
    panel.appendChild(actions);

    mountContainer.appendChild(panel);
  }

  function mount(container, onAddTaskOnDay, onTaskToggled) {
    mountContainer = container;
    callbacks = { onAddTaskOnDay: onAddTaskOnDay, onTaskToggled: onTaskToggled };
    render();
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.plannerCalendar = {
    mount: mount,
    render: render,
    setSelectedDay: function (d) { selectedDayKey = d; render(); },
  };
})();
