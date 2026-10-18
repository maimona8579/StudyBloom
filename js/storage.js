// js/storage.js – localStorage wrapper with namespaced keys
// Returns { ok, data? } or { ok, error } objects.

(function () {
  const NS = "studybloom:v1:";

  /** Test whether localStorage is available. */
  function available() {
    try {
      const k = "__sb_test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (_) {
      return false;
    }
  }

  /** Get a raw string from localStorage (or null). */
  function getItem(key) {
    try {
      return localStorage.getItem(NS + key);
    } catch (_) {
      return null;
    }
  }

  /** Set a raw string in localStorage. Returns { ok: true } or { ok: false, error }. */
  function setItem(key, value) {
    try {
      localStorage.setItem(NS + key, value);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  /** Remove a key. */
  function removeItem(key) {
    try {
      localStorage.removeItem(NS + key);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.storage = { available, getItem, setItem, removeItem };
})();
