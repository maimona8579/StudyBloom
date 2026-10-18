// js/planner-overview.js – Tasks Overview side panel
// Depends on: utils.js, tasks.js. Pure DOM construction via StudyBloom.utils.

(function () {
  function render(container) {
    if (!container) return;
    const u = StudyBloom.utils;
    const T = StudyBloom.tasks;

    while (container.firstChild) container.removeChild(container.firstChild);

    const h2 = u.createElement("h2", { text: "📊 Tasks Overview" });
    container.appendChild(h2);

    const stats = T.computeStats();
    const pendingCount = stats.total - stats.completed;

    const grid = u.createElement("div", { class: "dashboard-grid" });
    function statCard(val, lbl) {
      const c = u.createElement("div", { class: "stat-card" });
      c.appendChild(u.createElement("div", { class: "stat-value", text: String(val) }));
      c.appendChild(u.createElement("div", { class: "stat-label", text: lbl }));
      return c;
    }
    grid.appendChild(statCard(stats.total, "Total"));
    grid.appendChild(statCard(pendingCount, "Pending"));
    grid.appendChild(statCard(stats.completed, "Done"));
    container.appendChild(grid);

    const todayStr = u.today();
    const cutoff = u.addDays(todayStr, 7);
    const allTasks = T.loadTasks();
    const pendingTasks = allTasks.filter(function (t) { return !t.completed; });

    // Today's priorities: pending tasks due today or overdue
    const todayList = T.sortTasks(
      pendingTasks.filter(function (t) {
        if (!t.due) return false;
        return t.due.slice(0, 10) <= todayStr;
      })
    ).slice(0, 5);

    // Upcoming deadlines: pending tasks due in the next 7 days
    const upcomingList = pendingTasks.filter(function (t) {
      if (!t.due) return false;
      const d = t.due.slice(0, 10);
      return d > todayStr && d <= cutoff;
    }).slice(0, 5);

    function renderSection(headingText, list) {
      const h3 = u.createElement("h3", { class: "reminders-title", text: headingText });
      container.appendChild(h3);

      if (!list.length) {
        container.appendChild(u.createElement("p", { class: "empty-state", text: "No pending tasks here." }));
      } else {
        const ul = u.createElement("ul", { class: "task-list" });
        list.forEach(function (t) {
          const li = u.createElement("li", { class: "task-item" });
          const chip = u.createElement("span", { class: "chip chip-" + t.priority, text: t.priority });
          const body = u.createElement("div", { class: "task-body" });
          body.appendChild(u.createElement("div", { class: "task-title", text: t.title }));

          const metaText = (t.due ? t.due.slice(0, 10) : "No due date") + (t.subject ? " · " + t.subject : "");
          body.appendChild(u.createElement("div", { class: "task-meta", text: metaText }));

          li.appendChild(chip);
          li.appendChild(body);
          ul.appendChild(li);
        });
        container.appendChild(ul);
      }
    }

    renderSection("⚡ Today's Priorities", todayList);
    renderSection("📅 Upcoming Deadlines", upcomingList);
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.plannerOverview = { render: render };
})();
