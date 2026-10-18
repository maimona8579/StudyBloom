// js/calendar.js – Calendar calculation and grouping logic
// Pure functions only; no DOM access.

(function () {
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function fmtDate(y, m0, d) {
    return `${y}-${pad2(m0 + 1)}-${pad2(d)}`;
  }

  /**
   * Generates a 42-cell grid for a given month, with Monday as the first day of the week.
   * @param {number} year - Full year (e.g. 2026)
   * @param {number} month0 - 0-indexed month (0 = Jan, 9 = Oct)
   * @returns {Array<{date: string, inMonth: boolean}>} Exactly 42 cells.
   */
  function monthGrid(year, month0) {
    const firstDay = new Date(year, month0, 1);
    // Sunday is 0; shift so Monday is 0, Sunday is 6
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const dayOffset = i - firstDayOfWeek + 1;
      const dt = new Date(year, month0, dayOffset);
      const cellYear = dt.getFullYear();
      const cellMonth = dt.getMonth();
      const cellDate = dt.getDate();

      const dateStr = fmtDate(cellYear, cellMonth, cellDate);
      const inMonth = cellYear === year && cellMonth === month0;
      cells.push({ date: dateStr, inMonth: inMonth });
    }
    return cells;
  }

  /**
   * Shifts month by delta and handles year changes.
   * @param {number} year
   * @param {number} month0 (0-11)
   * @param {number} delta
   * @returns {{year: number, month0: number}}
   */
  function shiftMonth(year, month0, delta) {
    let m = month0 + delta;
    let y = year;
    while (m < 0) {
      m += 12;
      y--;
    }
    while (m > 11) {
      m -= 12;
      y++;
    }
    return { year: y, month0: m };
  }

  /**
   * Groups tasks by their ISO date prefix (YYYY-MM-DD). Skips tasks without due.
   * @param {Array<Object>} tasks
   * @returns {Object.<string, Array<Object>>}
   */
  function tasksByDate(tasks) {
    const map = {};
    if (!Array.isArray(tasks)) return map;
    tasks.forEach(function (t) {
      if (!t || !t.due || typeof t.due !== "string") return;
      const dateKey = t.due.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }

  /**
   * Computes count of pending, completed, and overdue tasks for a day's list.
   * @param {Array<Object>} list
   * @param {string} todayKey - "YYYY-MM-DD"
   * @returns {{pending: number, done: number, overdue: number}}
   */
  function dayStatus(list, todayKey) {
    let pending = 0;
    let done = 0;
    let overdue = 0;

    if (Array.isArray(list)) {
      list.forEach(function (t) {
        if (!t) return;
        if (t.completed) {
          done++;
        } else {
          pending++;
          if (StudyBloom.tasks && StudyBloom.tasks.isOverdue) {
            if (StudyBloom.tasks.isOverdue(t, todayKey)) overdue++;
          } else if (t.due && typeof t.due === "string" && t.due.slice(0, 10) < todayKey) {
            overdue++;
          }
        }
      });
    }
    return { pending: pending, done: done, overdue: overdue };
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.calendar = {
    monthGrid: monthGrid,
    shiftMonth: shiftMonth,
    tasksByDate: tasksByDate,
    dayStatus: dayStatus,
  };
})();
