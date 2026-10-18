// js/timer.js – Pomodoro-style study timer (FR-023)
// Pure logic + UI injection. No innerHTML. Uses StudyBloom.utils for DOM helpers.

(function () {
  const FOCUS_SECS  = 25 * 60;
  const BREAK_SECS  = 5  * 60;

  /** Build and inject the timer widget into #timer-widget, wiring all controls. */
  function initTimerWidget() {
    const container = document.getElementById("timer-widget");
    if (!container) return;

    const u = StudyBloom.utils;

    // ── DOM structure ──────────────────────────────────────────────
    const display  = u.createElement("div",    { class: "timer-display", attrs: { "aria-live": "off", "aria-atomic": "true" } });
    const badge    = u.createElement("span",   { class: "timer-mode" });
    const status   = u.createElement("p",      { class: "status-msg", attrs: { role: "status", "aria-live": "polite" } });
    const controls = u.createElement("div",    { class: "timer-controls" });
    const btnStart = u.createElement("button", { text: "Start",  attrs: { id: "timer-start" } });
    const btnPause = u.createElement("button", { text: "Pause",  attrs: { id: "timer-pause", disabled: "" } });
    const btnReset = u.createElement("button", { text: "Reset",  attrs: { id: "timer-reset", disabled: "" } });
    const hint     = u.createElement("p",      { text: "Leaving or refreshing the page resets the timer.", attrs: { style: "font-size:.75rem;color:var(--color-text-muted);margin-top:.5rem;" } });

    controls.appendChild(btnStart);
    controls.appendChild(btnPause);
    controls.appendChild(btnReset);
    container.appendChild(display);
    container.appendChild(badge);
    container.appendChild(status);
    container.appendChild(controls);
    container.appendChild(hint);

    // ── State ──────────────────────────────────────────────────────
    let mode      = "focus";   // "focus" | "break"
    let remaining = FOCUS_SECS;
    let startTs   = null;      // timestamp when last started (null = paused/stopped)
    let intervalId = null;

    // ── Helpers ────────────────────────────────────────────────────
    function fmt(secs) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }

    function setTitle(secs) {
      const modeLabel = mode === "focus" ? "Focus" : "Break";
      document.title = fmt(secs) + " – " + modeLabel + " | StudyBloom";
    }

    function render(secs) {
      u.setText(display, fmt(secs));
      u.setText(badge,   mode === "focus" ? "Focus" : "Break");
      setTitle(secs);
    }

    function setStatus(msg, isError) {
      u.setText(status, msg);
      status.className = "status-msg" + (isError ? " error" : "");
    }

    function disableBtn(btn, yes) {
      if (yes) btn.setAttribute("disabled", "");
      else     btn.removeAttribute("disabled");
    }

    // ── Tick ───────────────────────────────────────────────────────
    function tick() {
      if (startTs === null) return;
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      const total   = mode === "focus" ? FOCUS_SECS : BREAK_SECS;
      remaining = Math.max(0, total - elapsed);
      render(remaining);

      if (remaining === 0) {
        clearInterval(intervalId);
        intervalId = null;
        startTs    = null;
        const next = mode === "focus" ? "Break" : "Focus";
        setStatus(mode === "focus"
          ? "Focus session complete! Take a 5-minute break."
          : "Break over! Ready for another focus session.", false);
        mode      = mode === "focus" ? "break" : "focus";
        remaining = mode === "focus" ? FOCUS_SECS : BREAK_SECS;
        render(remaining);
        disableBtn(btnStart, false);
        disableBtn(btnPause, true);
        disableBtn(btnReset, false);
        document.title = "StudyBloom – Home";
      }
    }

    // ── Button handlers ────────────────────────────────────────────
    btnStart.addEventListener("click", function () {
      const total = mode === "focus" ? FOCUS_SECS : BREAK_SECS;
      startTs = Date.now() - (total - remaining) * 1000;
      intervalId = setInterval(tick, 500); // 500 ms for smoother display
      disableBtn(btnStart, true);
      disableBtn(btnPause, false);
      disableBtn(btnReset, false);
      setStatus("Timer running.", false);
    });

    btnPause.addEventListener("click", function () {
      clearInterval(intervalId);
      intervalId = null;
      startTs    = null;
      disableBtn(btnStart, false);
      disableBtn(btnPause, true);
      setStatus("Paused.", false);
    });

    btnReset.addEventListener("click", function () {
      clearInterval(intervalId);
      intervalId = null;
      startTs    = null;
      mode       = "focus";
      remaining  = FOCUS_SECS;
      render(remaining);
      disableBtn(btnStart, false);
      disableBtn(btnPause, true);
      disableBtn(btnReset, true);
      setStatus("", false);
      document.title = "StudyBloom – Home";
    });

    // ── Initial render ─────────────────────────────────────────────
    render(remaining);
    setStatus("", false);
  }

  window.StudyBloom = window.StudyBloom || {};
  // Expose init(); dashboard-page.js calls it after creating #timer-widget.
  StudyBloom.timer = { init: initTimerWidget };
})();
