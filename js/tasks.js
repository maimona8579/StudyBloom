// js/tasks.js – Task management logic
// All functions work with plain objects and never touch the DOM directly.
// They rely on storage.js for persistence and utils.js for helpers.

// Task schema (stored in localStorage under key "studybloom:v1:tasks")
// {
//   id: string,
//   title: string,
//   subject: string, // optional, default "General"
//   due: string|null, // ISO date string or null
//   priority: "low"|"medium"|"high",
//   completed: boolean,
//   createdAt: string,
//   updatedAt: string
// }

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

/** Load tasks from storage, returning an array (empty if none). */
function loadTasks() {
  const raw = StudyBloom.storage.getItem("tasks");
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    // Corrupted data – treat as empty and let caller handle warning.
    return [];
  }
}

/** Save tasks array to storage. Returns { ok: boolean, error?: string } */
function saveTasks(tasks) {
  try {
    StudyBloom.storage.setItem("tasks", JSON.stringify(tasks));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
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

/** Update an existing task by id; input may contain partial fields. */
function updateTask(id, patches) {
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return { ok: false, error: "Task not found" };
  const existing = tasks[idx];
  // Merge patches then re-validate whole object
  const merged = { ...existing, ...patches };
  const validation = validateTask(merged);
  if (!validation.valid) return { ok: false, errors: validation.errors };
  // Preserve immutable fields
  merged.id = existing.id;
  merged.createdAt = existing.createdAt;
  merged.updatedAt = new Date().toISOString();
  tasks[idx] = merged;
  const save = saveTasks(tasks);
  return save.ok ? { ok: true, task: merged } : { ok: false, error: save.error };
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

/** Sort tasks according to PH‑01 rules: pending first (by due asc, then priority high→low, then created), then completed (most recently updated first). */
function sortTasks(arr) {
  const priorityScore = { high: 3, medium: 2, low: 1 };
  return arr.slice().sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1; // pending before completed
    if (!a.completed) {
      // pending sorting
      const aDue = a.due ? new Date(a.due) : null;
      const bDue = b.due ? new Date(b.due) : null;
      if (aDue && bDue) {
        if (aDue < bDue) return -1;
        if (aDue > bDue) return 1;
      } else if (aDue) return -1; // a has due, b none => a first
      else if (bDue) return 1;
      // same due status -> priority
      if (priorityScore[a.priority] !== priorityScore[b.priority]) {
        return priorityScore[b.priority] - priorityScore[a.priority]; // high first
      }
      // finally creation time
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else {
      // both completed – most recently updated first
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

/** Compute dashboard stats (total tasks, completed, notes count – notes handled elsewhere). */
function computeStats() {
  const tasks = loadTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  return { total, completed };
}

// Export under global namespace
window.StudyBloom = window.StudyBloom || {};
StudyBloom.tasks = {
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  loadTasks,
  sortTasks,
  filterTasks,
  computeStats,
};
