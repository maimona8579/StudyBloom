// js/tasks.js – Task management logic
// All functions work with plain objects and never touch the DOM directly.
// They rely on storage.js for persistence and utils.js for helpers.

(function () {
  // Validation constants
  const TITLE_MAX = 100;
  const SUBJECT_MAX = 30;
  const PRIORITY_VALUES = ["low", "medium", "high"];

  /** Validate a task input object.
   * @param {Object} input – fields from the form (title, subject, due, priority).
   * @returns {Object} { valid: boolean, errors: Array<string>, task: Object|null }
   */
  function validateTask(input) {
    const errors = [];
    const title = (input.title || "").trim();
    if (!title) errors.push("Title is required.");
    else if (title.length > TITLE_MAX) errors.push(`Title must be ≤ ${TITLE_MAX} characters.`);

    const subject = (input.subject || "").trim() || "General";
    if (subject.length > SUBJECT_MAX) errors.push(`Subject must be ≤ ${SUBJECT_MAX} characters.`);

    let due = null;
    if (input.due) {
      const date = new Date(input.due);
      if (isNaN(date)) errors.push("Due date is invalid.");
      else due = date.toISOString();
    }

    const priority = (input.priority || "medium").toLowerCase();
    if (!PRIORITY_VALUES.includes(priority)) errors.push("Priority must be low, medium, or high.");

    if (errors.length) {
      return { valid: false, errors, task: null };
    }

    const now = new Date().toISOString();
    const task = {
      id: StudyBloom.utils.generateId(),
      title,
      subject,
      due,
      priority,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    return { valid: true, errors: [], task };
  }

  function isValidTaskRecord(t) {
    if (!t || typeof t !== "object") return false;
    if (typeof t.id !== "string" || !t.id.trim()) return false;
    if (typeof t.title !== "string" || !t.title.trim()) return false;
    if (!PRIORITY_VALUES.includes(t.priority)) return false;
    if (typeof t.completed !== "boolean") return false;
    if (t.due !== null && typeof t.due !== "string") return false;
    return true;
  }

  /** Load tasks from storage, returning only valid records, treating missing/empty subject as General. */
  function loadTasks() {
    const raw = StudyBloom.storage.getItem("tasks");
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(isValidTaskRecord).map(function (t) {
        return Object.assign({}, t, {
          subject: (t.subject && typeof t.subject === "string" && t.subject.trim()) ? t.subject.trim() : "General"
        });
      });
    } catch (_) {
      return [];
    }
  }

  /** Save tasks array to storage. Returns { ok: boolean, error?: string } */
  function saveTasks(tasks) {
    return StudyBloom.storage.setItem("tasks", JSON.stringify(tasks));
  }

  /** Create a new task; returns result object. */
  function createTask(input) {
    const validation = validateTask(input);
    if (!validation.valid) return { ok: false, errors: validation.errors };
    const tasks = loadTasks();
    tasks.push(validation.task);
    const save = saveTasks(tasks);
    return save.ok ? { ok: true, task: validation.task } : { ok: false, error: save.error };
  }

  /** Update an existing task by id; saves normalized values from validateTask. */
  function updateTask(id, patches) {
    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return { ok: false, error: "Task not found" };
    const existing = tasks[idx];
    const merged = { ...existing, ...patches };
    const validation = validateTask(merged);
    if (!validation.valid) return { ok: false, errors: validation.errors };
    const normalized = {
      id: existing.id,
      title: validation.task.title,
      subject: validation.task.subject,
      due: validation.task.due,
      priority: validation.task.priority,
      completed: existing.completed,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    tasks[idx] = normalized;
    const save = saveTasks(tasks);
    return save.ok ? { ok: true, task: normalized } : { ok: false, error: save.error };
  }

  /** Delete a task by id. */
  function deleteTask(id) {
    let tasks = loadTasks();
    const before = tasks.length;
    tasks = tasks.filter(t => t.id !== id);
    if (tasks.length === before) return { ok: false, error: "Task not found" };
    const save = saveTasks(tasks);
    return save.ok ? { ok: true } : { ok: false, error: save.error };
  }

  /** Toggle completed flag. */
  function toggleTask(id) {
    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return { ok: false, error: "Task not found" };
    tasks[idx].completed = !tasks[idx].completed;
    tasks[idx].updatedAt = new Date().toISOString();
    const save = saveTasks(tasks);
    return save.ok ? { ok: true, task: tasks[idx] } : { ok: false, error: save.error };
  }

  /** Sort tasks: pending first, then completed. */
  function sortTasks(arr) {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    return arr.slice().sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.completed) {
        const aDue = a.due ? new Date(a.due) : null;
        const bDue = b.due ? new Date(b.due) : null;
        if (aDue && bDue) {
          if (aDue < bDue) return -1;
          if (aDue > bDue) return 1;
        } else if (aDue) return -1;
        else if (bDue) return 1;
        if (priorityScore[a.priority] !== priorityScore[b.priority]) {
          return priorityScore[b.priority] - priorityScore[a.priority];
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });
  }

  /** Filter tasks: "All", "Pending", "Completed" */
  function filterTasks(arr, mode) {
    switch (mode) {
      case "Pending":
        return arr.filter(t => !t.completed);
      case "Completed":
        return arr.filter(t => t.completed);
      default:
        return arr.slice();
    }
  }

  /** Check if task is overdue relative to todayKey (YYYY-MM-DD). */
  function isOverdue(task, todayKey) {
    if (!task || task.completed || !task.due) return false;
    const dateKey = typeof task.due === "string" ? task.due.slice(0, 10) : "";
    return Boolean(dateKey && dateKey < todayKey);
  }

  /** Compute dashboard stats. */
  function computeStats() {
    const tasks = loadTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    return { total, completed };
  }

  // Export under global namespace
  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.tasks = {
    validateTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    loadTasks,
    sortTasks,
    filterTasks,
    isOverdue,
    computeStats,
  };
})();
