// js/theme.js – Apply and persist theme, legacy migration, and theme picker
(function () {
  const THEMES = ["soft-pastel", "lavender-white", "dark-academia", "sage-green"];
  const LABELS = {
    "soft-pastel":    "Soft Pastel",
    "lavender-white": "Lavender & White",
    "dark-academia":  "Beige Academia",
    "sage-green":     "Sage Green",
  };
  const LEGACY_MAP = {
    "dark-scholar": "dark-academia",
    "forest-focus": "sage-green",
  };
  const STORAGE_KEY = "studybloom:v1:theme";

  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function resolveTheme(raw) {
    if (!raw) return THEMES[0];
    if (LEGACY_MAP[raw]) return LEGACY_MAP[raw];
    return THEMES.includes(raw) ? raw : THEMES[0];
  }

  function applyTheme(name) {
    const safe = resolveTheme(name);
    document.documentElement.setAttribute("data-theme", safe);
    try { localStorage.setItem(STORAGE_KEY, safe); } catch (_) {}
  }

  // Apply immediately before first paint
  applyTheme(resolveTheme(getSaved()));

  document.addEventListener("DOMContentLoaded", function () {
    const picker = document.getElementById("theme-picker");
    if (picker) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-picker-btn";
      btn.setAttribute("aria-label", "Choose theme");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "theme-popover");
      btn.textContent = "🎨";

      const popover = document.createElement("div");
      popover.id = "theme-popover";
      popover.className = "theme-popover";
      popover.setAttribute("role", "region");
      popover.setAttribute("aria-label", "Theme options");
      popover.hidden = true;

      const themeButtons = [];

      function updatePickerUI() {
        const cur = document.documentElement.getAttribute("data-theme") || THEMES[0];
        themeButtons.forEach(function (item) {
          const isSelected = item.themeId === cur;
          item.btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
          item.check.textContent = isSelected ? " ✓" : "";
        });
      }

      THEMES.forEach(function (t) {
        const tBtn = document.createElement("button");
        tBtn.type = "button";
        tBtn.className = "theme-opt-btn";
        tBtn.setAttribute("data-theme-choice", t);

        const swatch = document.createElement("span");
        swatch.className = "swatch";
        swatch.setAttribute("data-swatch", t);
        swatch.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.className = "theme-label";
        label.textContent = LABELS[t];

        const check = document.createElement("span");
        check.className = "theme-check";
        check.setAttribute("aria-hidden", "true");

        tBtn.appendChild(swatch);
        tBtn.appendChild(label);
        tBtn.appendChild(check);

        tBtn.addEventListener("click", function () {
          applyTheme(t);
          updatePickerUI();
          closePopover();
          btn.focus();
        });

        popover.appendChild(tBtn);
        themeButtons.push({ themeId: t, btn: tBtn, check: check });
      });

      function openPopover() {
        popover.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        updatePickerUI();
      }

      function closePopover() {
        if (!popover.hidden) {
          popover.hidden = true;
          btn.setAttribute("aria-expanded", "false");
        }
      }

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (popover.hidden) {
          openPopover();
        } else {
          closePopover();
        }
      });

      document.addEventListener("click", function (e) {
        if (!picker.contains(e.target)) {
          closePopover();
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !popover.hidden) {
          closePopover();
          btn.focus();
        }
      });

      picker.appendChild(btn);
      picker.appendChild(popover);
      updatePickerUI();
    }

    // Support legacy select element if still present
    const sel = document.getElementById("theme-select");
    if (sel) {
      THEMES.forEach(function (t) {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = LABELS[t];
        sel.appendChild(opt);
      });
      sel.value = document.documentElement.getAttribute("data-theme") || THEMES[0];
      sel.addEventListener("change", function () { applyTheme(sel.value); });
    }
  });

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.theme = { THEMES: THEMES, LABELS: LABELS, applyTheme: applyTheme, resolveTheme: resolveTheme };
})();
