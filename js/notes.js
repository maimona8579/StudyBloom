// js/notes.js – Note management logic
// Pure functions only; no DOM access.

(function () {
  const TITLE_MAX   = 100;
  const SUBJECT_MAX = 30;
  const BODY_MAX    = 2000;

  /** Validate a note input object.
   *  @returns {Object} { valid, errors, note }
   */
  function validateNote(input) {
    const errors  = [];
    const title   = (input.title   || "").trim();
    const subject = (input.subject || "").trim() || "General";
    const body    = (input.body    || "").trim();

    if (!title) errors.push("Title is required.");
    else if (title.length > TITLE_MAX)   errors.push("Title must be \u2264 " + TITLE_MAX + " characters.");

    if (subject.length > SUBJECT_MAX)    errors.push("Subject must be \u2264 " + SUBJECT_MAX + " characters.");
    if (!body)  errors.push("Note body is required.");
    else if (body.length > BODY_MAX)     errors.push("Note body must be \u2264 " + BODY_MAX + " characters.");

    if (errors.length) return { valid: false, errors, note: null };

    const now = new Date().toISOString();
    const note = {
      id:        StudyBloom.utils.generateId(),
      title,
      subject,
      body,
      createdAt: now,
      updatedAt: now,
    };
    return { valid: true, errors: [], note };
  }

  function isValidNoteRecord(n) {
    if (!n || typeof n !== "object") return false;
    if (typeof n.id !== "string" || !n.id.trim()) return false;
    if (typeof n.title !== "string" || !n.title.trim()) return false;
    if (typeof n.body !== "string") return false;
    return true;
  }

  function loadNotes() {
    const raw = StudyBloom.storage.getItem("notes");
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(isValidNoteRecord);
    } catch (_) { return []; }
  }

  function saveNotes(notes) {
    return StudyBloom.storage.setItem("notes", JSON.stringify(notes));
  }

  function createNote(input) {
    const v = validateNote(input);
    if (!v.valid) return { ok: false, errors: v.errors };
    const notes = loadNotes();
    notes.unshift(v.note);          // newest first
    const s = saveNotes(notes);
    return s.ok ? { ok: true, note: v.note } : { ok: false, error: s.error };
  }

  function updateNote(id, patches) {
    const notes = loadNotes();
    const idx   = notes.findIndex(function (n) { return n.id === id; });
    if (idx === -1) return { ok: false, error: "Note not found" };
    const merged = Object.assign({}, notes[idx], patches);
    const v = validateNote(merged);
    if (!v.valid) return { ok: false, errors: v.errors };
    merged.id        = notes[idx].id;
    merged.createdAt = notes[idx].createdAt;
    merged.updatedAt = new Date().toISOString();
    notes[idx] = merged;
    const s = saveNotes(notes);
    return s.ok ? { ok: true, note: merged } : { ok: false, error: s.error };
  }

  function deleteNote(id) {
    let notes  = loadNotes();
    const before = notes.length;
    notes = notes.filter(function (n) { return n.id !== id; });
    if (notes.length === before) return { ok: false, error: "Note not found" };
    const s = saveNotes(notes);
    return s.ok ? { ok: true } : { ok: false, error: s.error };
  }

  /** Case-insensitive search across title, subject, and body. */
  function searchNotes(notes, query) {
    if (!query || !query.trim()) return notes;
    const q = query.trim().toLowerCase();
    return notes.filter(function (n) {
      return (n.title   || "").toLowerCase().includes(q) ||
             (n.subject || "").toLowerCase().includes(q) ||
             (n.body    || "").toLowerCase().includes(q);
    });
  }

  /** Sort notes: newest first by updatedAt. */
  function sortNotes(arr) {
    return arr.slice().sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }

  function computeStats() {
    const notes = loadNotes();
    return { total: notes.length };
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.notes = { validateNote, loadNotes, createNote, updateNote, deleteNote, searchNotes, sortNotes, computeStats };
})();
