// js/utils.js – Shared safe DOM helpers and utilities
// This file provides generic helpers used across the app. All DOM manipulation is done via these
// helpers to satisfy security rules (no innerHTML, no eval, etc.).

/** Set plain text content of an element safely. */
function setText(el, text) {
  if (el) el.textContent = text;
}

/** Create an element with optional attributes.
 *  options: { class?: string, id?: string, text?: string, attrs?: object }
 */
function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.class) el.className = options.class;
  if (options.id) el.id = options.id;
  if (options.text) el.textContent = options.text;
  if (options.attrs) {
    for (const [k, v] of Object.entries(options.attrs)) {
      el.setAttribute(k, v);
    }
  }
  return el;
}

/** Generate a reasonably unique identifier (no external libs). */
function generateId() {
  // Use crypto.getRandomValues when available, fallback to Math.random.
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(4);
    crypto.getRandomValues(arr);
    return Array.from(arr).join("-");
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
}

/** Simple date formatter (YYYY‑MM‑DD). */
function formatDate(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Today’s date in ISO format (YYYY‑MM‑DD). */
function today() {
  return formatDate(new Date());
}

/** Add days to a date string (YYYY‑MM‑DD). */
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// Export under the global StudyBloom namespace.
window.StudyBloom = window.StudyBloom || {};
StudyBloom.utils = {
  setText,
  createElement,
  generateId,
  formatDate,
  today,
  addDays,
};
