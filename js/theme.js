// js/theme.js – Apply and persist theme before first paint
// Must be loaded early (defer is fine – it runs after HTML parse but before DOMContentLoaded).

(function () {
  const THEMES = ["soft-pastel", "dark-scholar", "forest-focus", "lavender-white"];
  const LABELS = {
    "soft-pastel":    "Soft Pastel",
    "dark-scholar":   "Dark Scholar",
    "forest-focus":   "Forest Focus",
    "lavender-white": "Lavender & White",
  };
  const STORAGE_KEY = "studybloom:v1:theme";

  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function applyTheme(name) {
    const safe = THEMES.includes(name) ? name : THEMES[0];
    document.documentElement.setAttribute("data-theme", safe);
    try { localStorage.setItem(STORAGE_KEY, safe); } catch (_) {}
  }

  // Apply immediately so there is no flash of unstyled content.
  applyTheme(getSaved() || THEMES[0]);

  // Populate the <select> once DOM is ready.
  document.addEventListener("DOMContentLoaded", function () {
    const sel = document.getElementById("theme-select");
    if (!sel) return;
    THEMES.forEach(function (t) {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = LABELS[t];
      sel.appendChild(opt);
    });
    sel.value = document.documentElement.getAttribute("data-theme") || THEMES[0];
    sel.addEventListener("change", function () { applyTheme(sel.value); });
  });
})();
