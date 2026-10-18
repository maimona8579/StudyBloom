// js/planner-page.js – Main Planner page wiring
// Depends on: utils.js, storage.js, tasks.js, calendar.js, planner-overview.js, planner-calendar.js

(function () {
  function init() {
    const main = document.getElementById("main-content");
    if (!main) return;
    while (main.firstChild) main.removeChild(main.firstChild);

    const u = StudyBloom.utils;
    const T = StudyBloom.tasks;
    const todayKey = u.today();

    // Storage warning
    if (!StudyBloom.storage.available()) {
      const warn = u.createElement("div", { class: "storage-warning", text: "⚠ Storage is unavailable. Your tasks won't be saved." });
      main.appendChild(warn);
    }

    // ── Board container with 5 named areas ─────────────────────────
    const board = u.createElement("div", { class: "planner-board" });

    // 1. Title Card (Pink, Area: title)
    const titleCard = u.createElement("article", { class: "note note-pink planner-title-card area-title" });
    const h1 = u.createElement("h1", { text: "📅 Planner" });
    const tagline = u.createElement("p", { class: "planner-tagline", text: "Plan it. Tick it. Done." });
    titleCard.appendChild(h1);
    titleCard.appendChild(tagline);
    board.appendChild(titleCard);

    // 2. Tasks Overview (Lavender, Area: overview)
    const overviewCard = u.createElement("aside", { class: "note note-lavender area-overview", attrs: { "aria-label": "Tasks Overview" } });
    board.appendChild(overviewCard);

    // 3. Calendar (Mint, Area: calendar)
    const calendarCard = u.createElement("section", { class: "note note-mint area-calendar", attrs: { "aria-label": "Deadline Calendar" } });
    board.appendChild(calendarCard);

    // 4. Compact Add/Edit Task Form (Yellow, Area: form)
    const formCard = u.createElement("section", { class: "note note-yellow area-form", attrs: { id: "new-task", "aria-label": "Task Form" } });
    const formTitle = u.createElement("h2", { text: "Add Task" });
    const statusMsg = u.createElement("p", { class: "status-msg", attrs: { role: "status", "aria-live": "polite" } });

    const inTitle = u.createElement("input", { attrs: { type: "text", id: "task-title", placeholder: "Task title *", maxlength: "100" } });
    const inSubject = u.createElement("input", { attrs: { type: "text", id: "task-subject", placeholder: "Subject (optional)", maxlength: "30" } });
    const inDue = u.createElement("input", { attrs: { type: "date", id: "task-due" } });
    const inPriority = u.createElement("select", { attrs: { id: "task-priority", "aria-label": "Task priority" } });
    ["low", "medium", "high"].forEach(function (p) {
      const o = u.createElement("option", { text: p[0].toUpperCase() + p.slice(1), attrs: { value: p } });
      inPriority.appendChild(o);
    });
    inPriority.value = "medium";

    const titleGroup = u.createElement("div", { class: "form-group" });
    const lblTitle = u.createElement("label", { text: "Title *" });
    lblTitle.setAttribute("for", "task-title");
    titleGroup.appendChild(lblTitle);
    titleGroup.appendChild(inTitle);

    const compactRow = u.createElement("div", { class: "form-row-compact" });
    const subGroup = u.createElement("div", { class: "form-group" });
    const lblSub = u.createElement("label", { text: "Subject" });
    lblSub.setAttribute("for", "task-subject");
    subGroup.appendChild(lblSub);
    subGroup.appendChild(inSubject);

    const dueGroup = u.createElement("div", { class: "form-group" });
    const lblDue = u.createElement("label", { text: "Due date" });
    lblDue.setAttribute("for", "task-due");
    dueGroup.appendChild(lblDue);
    dueGroup.appendChild(inDue);

    const priGroup = u.createElement("div", { class: "form-group" });
    const lblPri = u.createElement("label", { text: "Priority" });
    lblPri.setAttribute("for", "task-priority");
    priGroup.appendChild(lblPri);
    priGroup.appendChild(inPriority);

    compactRow.appendChild(subGroup);
    compactRow.appendChild(dueGroup);
    compactRow.appendChild(priGroup);

    const formActions = u.createElement("div", { class: "form-actions" });
    const btnSave = u.createElement("button", { text: "Save Task" });
    const btnCancel = u.createElement("button", { class: "btn-ghost", text: "Cancel", attrs: { type: "button" } });
    formActions.appendChild(btnSave);
    formActions.appendChild(btnCancel);

    formCard.appendChild(formTitle);
    formCard.appendChild(statusMsg);
    formCard.appendChild(titleGroup);
    formCard.appendChild(compactRow);
    formCard.appendChild(formActions);
    board.appendChild(formCard);

    // 5. Tasks List (Lavender, Area: list)
    const listCard = u.createElement("section", { class: "note note-lavender area-list", attrs: { "aria-label": "Task List" } });
    const listH2 = u.createElement("h2", { text: "📋 All Tasks" });
    const filterTabsBox = u.createElement("div", { class: "filter-tabs" });
    const taskListUl = u.createElement("ul", { class: "task-list" });

    listCard.appendChild(listH2);
    listCard.appendChild(filterTabsBox);
    listCard.appendChild(taskListUl);
    board.appendChild(listCard);

    main.appendChild(board);

    // ── State & RefreshAll ─────────────────────────────────────────
    let currentFilter = "All";
    let editingId = null;

    function setStatus(msg, isErr) {
      u.setText(statusMsg, msg);
      statusMsg.className = "status-msg" + (isErr ? " error" : "");
    }

    function clearForm() {
      inTitle.value = "";
      inSubject.value = "";
      inDue.value = "";
      inPriority.value = "medium";
      editingId = null;
      u.setText(formTitle, "Add Task");
      setStatus("", false);
    }

    function startEdit(task) {
      editingId = task.id;
      inTitle.value = task.title;
      inSubject.value = task.subject === "General" ? "" : task.subject;
      inDue.value = task.due ? task.due.slice(0, 10) : "";
      inPriority.value = task.priority;
      u.setText(formTitle, "Edit Task");
      formCard.scrollIntoView({ behavior: "smooth" });
      inTitle.focus();
    }

    function renderFilterTabs() {
      while (filterTabsBox.firstChild) filterTabsBox.removeChild(filterTabsBox.firstChild);
      const all = T.loadTasks();
      const counts = {
        All: all.length,
        Pending: all.filter(function (t) { return !t.completed; }).length,
        Completed: all.filter(function (t) { return t.completed; }).length,
      };

      ["All", "Pending", "Completed"].forEach(function (f) {
        const btn = u.createElement("button", {
          class: "filter-tab" + (f === currentFilter ? " active" : ""),
          text: `${f} (${counts[f]})`,
        });
        btn.addEventListener("click", function () {
          currentFilter = f;
          renderList();
          renderFilterTabs();
        });
        filterTabsBox.appendChild(btn);
      });
    }

    function renderList() {
      while (taskListUl.firstChild) taskListUl.removeChild(taskListUl.firstChild);
      const tasks = T.sortTasks(T.filterTasks(T.loadTasks(), currentFilter));

      if (!tasks.length) {
        taskListUl.appendChild(u.createElement("li", { class: "empty-state", text: "No tasks here." }));
        return;
      }

      tasks.forEach(function (task) {
        const li = u.createElement("li", { class: "task-item" + (task.completed ? " completed" : "") });
        const cb = u.createElement("input", {
          attrs: { type: "checkbox", "aria-label": "Mark " + task.title + " as complete", id: "cb-" + task.id }
        });
        if (task.completed) cb.setAttribute("checked", "");

        const chip = u.createElement("span", { class: "chip chip-" + task.priority, text: task.priority });
        const body = u.createElement("div", { class: "task-body" });
        const titleSpan = u.createElement("span", { class: "task-title", text: task.title });
        body.appendChild(titleSpan);

        // Text status badges (not color alone)
        if (!task.completed && task.due) {
          const dueDay = task.due.slice(0, 10);
          if (T.isOverdue(task, todayKey)) {
            body.appendChild(u.createElement("span", { class: "task-status-badge badge-overdue", text: "⚠ Overdue" }));
          } else if (dueDay === todayKey) {
            body.appendChild(u.createElement("span", { class: "task-status-badge badge-today", text: "📌 Due today" }));
          }
        }

        const metaText = (task.subject || "General") + (task.due ? " · Due " + task.due.slice(0, 10) : "");
        body.appendChild(u.createElement("div", { class: "task-meta", text: metaText }));

        const actions = u.createElement("div", { class: "task-actions" });
        const btnEdit = u.createElement("button", { class: "btn-ghost", text: "Edit", attrs: { "aria-label": "Edit " + task.title } });
        const btnDel = u.createElement("button", { class: "btn-danger", text: "Delete", attrs: { "aria-label": "Delete " + task.title } });
        actions.appendChild(btnEdit);
        actions.appendChild(btnDel);

        cb.addEventListener("change", function () {
          T.toggleTask(task.id);
          refreshAll();
        });

        btnEdit.addEventListener("click", function () { startEdit(task); });

        btnDel.addEventListener("click", function () {
          if (window.confirm("Delete \"" + task.title + "\"?")) {
            T.deleteTask(task.id);
            refreshAll();
            setStatus("Task deleted.", false);
          }
        });

        li.appendChild(cb);
        li.appendChild(chip);
        li.appendChild(body);
        li.appendChild(actions);
        taskListUl.appendChild(li);
      });
    }

    function refreshAll() {
      renderFilterTabs();
      renderList();
      StudyBloom.plannerOverview.render(overviewCard);
      StudyBloom.plannerCalendar.render();
    }

    btnSave.addEventListener("click", function () {
      const isEdit = Boolean(editingId);
      const input = {
        title: inTitle.value,
        subject: inSubject.value,
        due: inDue.value,
        priority: inPriority.value,
      };

      const result = isEdit ? T.updateTask(editingId, input) : T.createTask(input);
      if (!result.ok) {
        setStatus((result.errors || [result.error]).join(" "), true);
        return;
      }
      clearForm();
      refreshAll();
      setStatus(isEdit ? "Task updated!" : "Task added!", false);
    });

    btnCancel.addEventListener("click", clearForm);

    // Mount calendar with callback to set due date from calendar
    StudyBloom.plannerCalendar.mount(
      calendarCard,
      function (dayKey) {
        inDue.value = dayKey;
        formCard.scrollIntoView({ behavior: "smooth" });
        inTitle.focus();
      },
      refreshAll
    );

    // Initial overview render and list render
    refreshAll();

    if (window.location.hash === "#new-task") {
      inTitle.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
