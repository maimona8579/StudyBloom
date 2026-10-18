// js/planner-page.js – Task planner UI
// Depends on: utils.js, storage.js, tasks.js

(function () {
  function init() {
    const main = document.getElementById("main-content");
    if (!main) return;
    const u  = StudyBloom.utils;
    const T  = StudyBloom.tasks;

    // Storage warning
    if (!StudyBloom.storage.available()) {
      const warn = u.createElement("div", { class: "storage-warning", text: "⚠ Storage is unavailable. Your data won't be saved." });
      main.insertBefore(warn, main.firstChild);
    }

    // ── Form widget ────────────────────────────────────────────────
    const formWidget = u.createElement("div", { class: "widget", attrs: { id: "new-task" } });
    const formTitle  = u.createElement("h2", { text: "Add Task" });
    const status     = u.createElement("p",  { class: "status-msg", attrs: { role: "status", "aria-live": "polite" } });

    // Inputs
    function group(labelTxt, el) {
      const g = u.createElement("div", { class: "form-group" });
      const lbl = u.createElement("label", { text: labelTxt });
      lbl.setAttribute("for", el.id);
      g.appendChild(lbl); g.appendChild(el);
      return g;
    }

    const inTitle    = u.createElement("input",  { attrs: { type: "text",  id: "task-title",    placeholder: "Task title", maxlength: "100" } });
    const inSubject  = u.createElement("input",  { attrs: { type: "text",  id: "task-subject",  placeholder: "Subject (optional)", maxlength: "30" } });
    const inDue      = u.createElement("input",  { attrs: { type: "date",  id: "task-due" } });
    const inPriority = u.createElement("select", { attrs: { id: "task-priority" } });
    ["low", "medium", "high"].forEach(function (p) {
      const o = u.createElement("option", { text: p[0].toUpperCase() + p.slice(1), attrs: { value: p } });
      inPriority.appendChild(o);
    });
    inPriority.value = "medium";

    const btnRow   = u.createElement("div", { class: "timer-controls", attrs: { style: "justify-content:flex-start;gap:.5rem;" } });
    const btnSave  = u.createElement("button", { text: "Save Task" });
    const btnCancel= u.createElement("button", { class: "btn btn-ghost", text: "Cancel", attrs: { type: "button" } });
    btnRow.appendChild(btnSave);
    btnRow.appendChild(btnCancel);

    formWidget.appendChild(formTitle);
    formWidget.appendChild(status);
    formWidget.appendChild(group("Title *", inTitle));
    formWidget.appendChild(group("Subject", inSubject));
    formWidget.appendChild(group("Due date", inDue));
    formWidget.appendChild(group("Priority", inPriority));
    formWidget.appendChild(btnRow);
    main.appendChild(formWidget);

    // ── Filter tabs ─────────────────────────────────────────────
    const filters   = u.createElement("div", { class: "filter-tabs" });
    const listWrap  = u.createElement("div", { class: "widget" });
    const listTitle = u.createElement("h2",  { text: "Tasks" });
    listWrap.appendChild(listTitle);

    let currentFilter = "All";
    let editingId = null;

    ["All", "Pending", "Completed"].forEach(function (f) {
      const btn = u.createElement("button", { class: "filter-tab" + (f === "All" ? " active" : ""), text: f });
      btn.addEventListener("click", function () {
        currentFilter = f;
        document.querySelectorAll(".filter-tab").forEach(function (b) { b.className = "filter-tab"; });
        btn.className = "filter-tab active";
        renderList();
      });
      filters.appendChild(btn);
    });
    main.appendChild(filters);

    const listEl = u.createElement("ul", { class: "task-list" });
    listWrap.appendChild(listEl);
    main.appendChild(listWrap);

    // ── Render task list ─────────────────────────────────────────
    function renderList() {
      // Clear
      while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
      let tasks = T.sortTasks(T.filterTasks(T.loadTasks(), currentFilter));
      if (!tasks.length) {
        const empty = u.createElement("li", { class: "empty-state", text: "No tasks yet. Add one above!" });
        listEl.appendChild(empty);
        return;
      }
      tasks.forEach(function (task) {
        const li      = u.createElement("li", { class: "task-item" + (task.completed ? " completed" : "") });
        const cb      = u.createElement("input", { attrs: { type: "checkbox", "aria-label": "Mark complete", id: "cb-" + task.id } });
        if (task.completed) cb.setAttribute("checked", "");

        const body    = u.createElement("div", { class: "task-body" });
        const title   = u.createElement("div", { class: "task-title", text: task.title });
        const meta    = u.createElement("div", {
          class: "task-meta",
          text: task.subject + (task.due ? " · Due " + task.due.slice(0,10) : ""),
        });
        const chip    = u.createElement("span", { class: "chip chip-" + task.priority, text: task.priority });
        body.appendChild(title); body.appendChild(meta);

        const actions  = u.createElement("div", { class: "task-actions" });
        const btnEdit  = u.createElement("button", { class: "btn btn-ghost", text: "Edit" });
        const btnDel   = u.createElement("button", { class: "btn btn-danger", text: "Delete" });
        actions.appendChild(btnEdit); actions.appendChild(btnDel);

        cb.addEventListener("change", function () {
          T.toggleTask(task.id);
          renderList();
        });
        btnEdit.addEventListener("click", function () { startEdit(task); });
        btnDel.addEventListener("click",  function () {
          if (window.confirm("Delete \"" + task.title + "\"?")) {
            T.deleteTask(task.id);
            renderList();
            setStatus("Task deleted.", false);
          }
        });

        li.appendChild(cb); li.appendChild(chip); li.appendChild(body); li.appendChild(actions);
        listEl.appendChild(li);
      });
    }

    // ── Form helpers ─────────────────────────────────────────────
    function setStatus(msg, isErr) {
      u.setText(status, msg);
      status.className = "status-msg" + (isErr ? " error" : "");
    }

    function clearForm() {
      inTitle.value    = "";
      inSubject.value  = "";
      inDue.value      = "";
      inPriority.value = "medium";
      editingId        = null;
      u.setText(formTitle, "Add Task");
      setStatus("", false);
    }

    function startEdit(task) {
      inTitle.value    = task.title;
      inSubject.value  = task.subject === "General" ? "" : task.subject;
      inDue.value      = task.due ? task.due.slice(0, 10) : "";
      inPriority.value = task.priority;
      editingId        = task.id;
      u.setText(formTitle, "Edit Task");
      inTitle.focus();
    }

    btnSave.addEventListener("click", function () {
      const input = {
        title:    inTitle.value,
        subject:  inSubject.value,
        due:      inDue.value,
        priority: inPriority.value,
      };
      let result;
      if (editingId) {
        result = T.updateTask(editingId, input);
      } else {
        result = T.createTask(input);
      }
      if (!result.ok) {
        setStatus((result.errors || [result.error]).join(" "), true);
        return;
      }
      clearForm();
      renderList();
      setStatus(editingId ? "Task updated!" : "Task added!", false);
      editingId = null;
    });

    btnCancel.addEventListener("click", clearForm);

    // ── Deep link: auto-focus the form if URL has #new-task ──────
    if (window.location.hash === "#new-task") { inTitle.focus(); }

    renderList();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
