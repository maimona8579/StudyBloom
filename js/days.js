// js/days.js – Daily schedule, goals, and wellness tracking logic
// Pure logic only, no DOM manipulation.

(function () {
  const MAX_SLOTS = 30;
  const MAX_GOALS = 6;
  const SLOT_TEXT_MAX = 60;
  const GOAL_TEXT_MAX = 80;
  const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

  function defaultDay() {
    return {
      schedule: [],
      goals: [],
      water: 0,
    };
  }

  function isValidSlot(slot) {
    if (!slot || typeof slot !== "object") return false;
    if (typeof slot.id !== "string" || !slot.id) return false;
    if (typeof slot.start !== "string" || !TIME_REGEX.test(slot.start)) return false;
    const end = (slot.end || "").trim();
    if (end !== "" && (!TIME_REGEX.test(end) || end <= slot.start)) return false;
    if (typeof slot.text !== "string" || !slot.text.trim() || slot.text.length > SLOT_TEXT_MAX) return false;
    if (typeof slot.done !== "boolean") return false;
    return true;
  }

  function isValidGoal(goal) {
    if (!goal || typeof goal !== "object") return false;
    if (typeof goal.id !== "string" || !goal.id) return false;
    if (typeof goal.text !== "string" || !goal.text.trim() || goal.text.length > GOAL_TEXT_MAX) return false;
    if (typeof goal.done !== "boolean") return false;
    return true;
  }

  function isValidDay(day) {
    if (!day || typeof day !== "object") return false;
    const schedule = Array.isArray(day.schedule) ? day.schedule.filter(isValidSlot) : [];
    const goals = Array.isArray(day.goals) ? day.goals.filter(isValidGoal) : [];
    let water = typeof day.water === "number" ? Math.floor(day.water) : 0;
    if (water < 0) water = 0;
    if (water > 8) water = 8;
    return {
      schedule: schedule.slice(0, MAX_SLOTS),
      goals: goals.slice(0, MAX_GOALS),
      water: water,
    };
  }

  function loadDays() {
    const raw = StudyBloom.storage.getItem("days");
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      const clean = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k)) {
          clean[k] = isValidDay(v);
        }
      }
      return clean;
    } catch (_) {
      return {};
    }
  }

  function saveAllDays(days) {
    return StudyBloom.storage.setItem("days", JSON.stringify(days));
  }

  function getDay(key) {
    const all = loadDays();
    if (all[key]) return all[key];
    return defaultDay();
  }

  function saveDay(key, day) {
    const all = loadDays();
    all[key] = isValidDay(day);
    return saveAllDays(all);
  }

  function validateSlot(input) {
    const errors = [];
    if (!input || typeof input !== "object") {
      return { valid: false, errors: ["Invalid slot input."], slot: null };
    }
    const start = (input.start || "").trim();
    const end = (input.end || "").trim();
    const text = (input.text || "").trim();

    if (!start) errors.push("Start time is required.");
    else if (!TIME_REGEX.test(start)) errors.push("Start time must be HH:MM.");

    if (end) {
      if (!TIME_REGEX.test(end)) errors.push("End time must be HH:MM.");
      else if (start && end <= start) errors.push("End time must be after start time.");
    }

    if (!text) errors.push("Activity text is required.");
    else if (text.length > SLOT_TEXT_MAX) errors.push(`Activity text must be ≤ ${SLOT_TEXT_MAX} characters.`);

    if (errors.length) {
      return { valid: false, errors: errors, slot: null };
    }

    const slot = {
      id: input.id || StudyBloom.utils.generateId(),
      start: start,
      end: end,
      text: text,
      done: Boolean(input.done),
    };
    return { valid: true, errors: [], slot: slot };
  }

  function validateGoal(text) {
    const errors = [];
    const t = (text || "").trim();
    if (!t) errors.push("Goal text is required.");
    else if (t.length > GOAL_TEXT_MAX) errors.push(`Goal must be ≤ ${GOAL_TEXT_MAX} characters.`);

    if (errors.length) {
      return { valid: false, errors: errors, goal: null };
    }
    return {
      valid: true,
      errors: [],
      goal: {
        id: StudyBloom.utils.generateId(),
        text: t,
        done: false,
      },
    };
  }

  function sortSlots(slots) {
    if (!Array.isArray(slots)) return [];
    return slots.slice().sort(function (a, b) {
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
      return (a.end || "") < (b.end || "") ? -1 : 1;
    });
  }

  function copyDay(fromKey, toKey) {
    const all = loadDays();
    const source = all[fromKey];
    if (!source || (!source.schedule.length && !source.goals.length)) {
      return { ok: false, error: "Nothing to copy from the previous day." };
    }
    const target = all[toKey] ? all[toKey] : defaultDay();

    const newSchedule = source.schedule.map(function (s) {
      return {
        id: StudyBloom.utils.generateId(),
        start: s.start,
        end: s.end,
        text: s.text,
        done: false,
      };
    });

    const newGoals = source.goals.map(function (g) {
      return {
        id: StudyBloom.utils.generateId(),
        text: g.text,
        done: false,
      };
    });

    target.schedule = newSchedule.slice(0, MAX_SLOTS);
    target.goals = newGoals.slice(0, MAX_GOALS);
    all[toKey] = target;
    return saveAllDays(all);
  }

  function setWater(day, n) {
    if (!day) return 0;
    let count = typeof n === "number" ? Math.floor(n) : 0;
    if (count < 0) count = 0;
    if (count > 8) count = 8;
    day.water = count;
    return count;
  }

  function clearDay(key) {
    const all = loadDays();
    all[key] = defaultDay();
    return saveAllDays(all);
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.days = {
    loadDays: loadDays,
    getDay: getDay,
    saveDay: saveDay,
    validateSlot: validateSlot,
    validateGoal: validateGoal,
    sortSlots: sortSlots,
    copyDay: copyDay,
    setWater: setWater,
    clearDay: clearDay,
    MAX_SLOTS: MAX_SLOTS,
    MAX_GOALS: MAX_GOALS,
  };
})();
