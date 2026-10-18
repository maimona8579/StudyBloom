// js/dashboard-day.js – Interactive schedule, goals, and wellness sticky notes
// Safe DOM manipulation via StudyBloom.utils (no innerHTML, no inline styles).

(function () {
  let selectedDate = null;
  let mountContainers = null;

  function fmtNavDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function renderAll() {
    if (!mountContainers) return;
    renderSchedule(mountContainers.schedule);
    renderGoals(mountContainers.goals);
    renderWater(mountContainers.water);
  }

  // ── 1. Schedule Note ──────────────────────────────────────────
  function renderSchedule(container) {
    const u = StudyBloom.utils;
    const D = StudyBloom.days;
    while (container.firstChild) container.removeChild(container.firstChild);

    const h2 = u.createElement("h2", { text: "🗓 Daily Schedule" });
    container.appendChild(h2);

    // Nav bar
    const nav = u.createElement("div", { class: "schedule-nav" });
    const btnPrev = u.createElement("button", { class: "btn-ghost", text: "◀", attrs: { "aria-label": "Previous day" } });
    const lblDate = u.createElement("span", { class: "schedule-nav-date", text: fmtNavDate(selectedDate) });
    const btnNext = u.createElement("button", { class: "btn-ghost", text: "▶", attrs: { "aria-label": "Next day" } });

    btnPrev.addEventListener("click", function () {
      selectedDate = u.addDays(selectedDate, -1);
      renderAll();
    });
    btnNext.addEventListener("click", function () {
      selectedDate = u.addDays(selectedDate, 1);
      renderAll();
    });

    nav.appendChild(btnPrev);
    nav.appendChild(lblDate);
    if (selectedDate !== u.today()) {
      const btnToday = u.createElement("button", { class: "btn-ghost", text: "Today", attrs: { "aria-label": "Go to today" } });
      btnToday.addEventListener("click", function () {
        selectedDate = u.today();
        renderAll();
      });
      nav.appendChild(btnToday);
    }
    nav.appendChild(btnNext);
    container.appendChild(nav);

    // Status message
    const status = u.createElement("p", { class: "status-msg", attrs: { role: "status", "aria-live": "polite" } });
    container.appendChild(status);

    function setStatus(msg, isErr) {
      u.setText(status, msg);
      status.className = "status-msg" + (isErr ? " error" : "");
    }

    const dayData = D.getDay(selectedDate);
    const sortedSlots = D.sortSlots(dayData.schedule);

    // Inline form container
    const formBox = u.createElement("div", { class: "form-group", attrs: { hidden: "true" } });
    const inStart = u.createElement("input", { attrs: { type: "time", "aria-label": "Start time" } });
    const inEnd = u.createElement("input", { attrs: { type: "time", "aria-label": "End time (optional)" } });
    const inText = u.createElement("input", { attrs: { type: "text", maxlength: "60", placeholder: "Activity description..." } });
    const formErr = u.createElement("span", { class: "status-msg error" });
    const formActions = u.createElement("div", { class: "form-actions" });
    const btnSaveSlot = u.createElement("button", { text: "Save Slot" });
    const btnCancelSlot = u.createElement("button", { class: "btn-ghost", text: "Cancel", attrs: { type: "button" } });
    formActions.appendChild(btnSaveSlot);
    formActions.appendChild(btnCancelSlot);

    formBox.appendChild(u.createElement("label", { text: "Start time *" }));
    formBox.appendChild(inStart);
    formBox.appendChild(u.createElement("label", { text: "End time (optional)" }));
    formBox.appendChild(inEnd);
    formBox.appendChild(u.createElement("label", { text: "Activity (max 60 chars) *" }));
    formBox.appendChild(inText);
    formBox.appendChild(formErr);
    formBox.appendChild(formActions);
    container.appendChild(formBox);

    let editingSlotId = null;

    function openForm(slot) {
      formBox.removeAttribute("hidden");
      u.setText(formErr, "");
      if (slot) {
        editingSlotId = slot.id;
        inStart.value = slot.start;
        inEnd.value = slot.end || "";
        inText.value = slot.text;
      } else {
        editingSlotId = null;
        inStart.value = "";
        inEnd.value = "";
        inText.value = "";
      }
      inStart.focus();
    }

    function closeForm() {
      formBox.setAttribute("hidden", "true");
      editingSlotId = null;
      u.setText(formErr, "");
    }

    btnCancelSlot.addEventListener("click", closeForm);

    btnSaveSlot.addEventListener("click", function () {
      const v = D.validateSlot({
        id: editingSlotId,
        start: inStart.value,
        end: inEnd.value,
        text: inText.value,
        done: false,
      });
      if (!v.valid) {
        u.setText(formErr, v.errors.join(" "));
        return;
      }
      const cur = D.getDay(selectedDate);
      if (editingSlotId) {
        const idx = cur.schedule.findIndex(function (s) { return s.id === editingSlotId; });
        if (idx !== -1) {
          v.slot.done = cur.schedule[idx].done;
          cur.schedule[idx] = v.slot;
        }
      } else {
        if (cur.schedule.length >= D.MAX_SLOTS) {
          u.setText(formErr, "Maximum of 30 slots reached for this day.");
          return;
        }
        cur.schedule.push(v.slot);
      }
      const res = D.saveDay(selectedDate, cur);
      if (!res.ok) {
        u.setText(formErr, "Failed to save: " + (res.error || "storage full"));
        return;
      }
      closeForm();
      renderAll();
    });

    // Slots List
    if (!sortedSlots.length) {
      container.appendChild(u.createElement("p", { class: "empty-state", text: "No plan for this day yet." }));
    } else {
      const ul = u.createElement("ul", { class: "schedule-list" });
      sortedSlots.forEach(function (slot) {
        const li = u.createElement("li", { class: "schedule-row" + (slot.done ? " done" : "") });
        const cb = u.createElement("input", { attrs: { type: "checkbox", "aria-label": "Mark slot as done" } });
        if (slot.done) cb.setAttribute("checked", "");

        const pillText = slot.end ? slot.start + " – " + slot.end : slot.start;
        const pill = u.createElement("span", { class: "schedule-pill", text: pillText });
        const txt = u.createElement("span", { class: "schedule-text", text: slot.text });

        const actions = u.createElement("div", { class: "schedule-actions" });
        const btnEdit = u.createElement("button", { class: "btn-ghost", text: "Edit", attrs: { "aria-label": "Edit " + slot.text } });
        const btnDel = u.createElement("button", { class: "btn-danger", text: "Delete", attrs: { "aria-label": "Delete " + slot.text } });

        cb.addEventListener("change", function () {
          slot.done = cb.checked;
          D.saveDay(selectedDate, dayData);
          li.className = "schedule-row" + (slot.done ? " done" : "");
        });

        btnEdit.addEventListener("click", function () { openForm(slot); });
        btnDel.addEventListener("click", function () {
          if (window.confirm("Delete time slot \"" + slot.text + "\"?")) {
            dayData.schedule = dayData.schedule.filter(function (s) { return s.id !== slot.id; });
            D.saveDay(selectedDate, dayData);
            renderAll();
          }
        });

        actions.appendChild(btnEdit);
        actions.appendChild(btnDel);

        li.appendChild(cb);
        li.appendChild(pill);
        li.appendChild(txt);
        li.appendChild(actions);
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }

    // Schedule footer buttons
    const rowBtns = u.createElement("div", { class: "form-actions" });
    const btnAddSlot = u.createElement("button", { text: "＋ Add time slot" });
    const btnCopy = u.createElement("button", { class: "btn-ghost", text: "📋 Copy previous day" });
    const btnClear = u.createElement("button", { class: "btn-ghost", text: "🗑 Clear day" });

    btnAddSlot.addEventListener("click", function () { openForm(null); });
    btnCopy.addEventListener("click", function () {
      const prevDate = u.addDays(selectedDate, -1);
      const res = D.copyDay(prevDate, selectedDate);
      if (!res.ok) {
        setStatus(res.error || "Nothing to copy from previous day.", true);
      } else {
        renderAll();
        setStatus("Copied from " + prevDate + "!", false);
      }
    });

    btnClear.addEventListener("click", function () {
      if (window.confirm("Clear all items for this day?")) {
        D.clearDay(selectedDate);
        renderAll();
        setStatus("Day cleared.", false);
      }
    });

    rowBtns.appendChild(btnAddSlot);
    rowBtns.appendChild(btnCopy);
    rowBtns.appendChild(btnClear);
    container.appendChild(rowBtns);
  }

  // ── 2. Goals Note ─────────────────────────────────────────────
  function renderGoals(container) {
    const u = StudyBloom.utils;
    const D = StudyBloom.days;
    while (container.firstChild) container.removeChild(container.firstChild);

    const h2 = u.createElement("h2", { text: "🎯 My Goals" });
    container.appendChild(h2);

    const dayData = D.getDay(selectedDate);
    const goals = dayData.goals || [];
    const doneCount = goals.filter(function (g) { return g.done; }).length;

    const prog = u.createElement("div", {
      class: "goals-progress",
      text: goals.length ? doneCount + " of " + goals.length + " done" : "No goals set yet for today",
    });
    container.appendChild(prog);

    if (goals.length > 0 && doneCount === goals.length) {
      const cel = u.createElement("div", { class: "goals-celebration", text: "🌸 Amazing work! All daily goals completed!" });
      container.appendChild(cel);
    }

    const status = u.createElement("p", { class: "status-msg", attrs: { role: "status", "aria-live": "polite" } });
    container.appendChild(status);

    function setStatus(msg, isErr) {
      u.setText(status, msg);
      status.className = "status-msg" + (isErr ? " error" : "");
    }

    // Goals list
    const ul = u.createElement("ul", { class: "goals-list" });
    goals.forEach(function (goal) {
      const li = u.createElement("li", { class: "goal-item" + (goal.done ? " done" : "") });
      const cb = u.createElement("input", { attrs: { type: "checkbox", "aria-label": "Mark goal as done" } });
      if (goal.done) cb.setAttribute("checked", "");

      const txt = u.createElement("span", { class: "goal-text", text: goal.text });
      const actions = u.createElement("div", { class: "schedule-actions" });
      const btnEdit = u.createElement("button", { class: "btn-ghost", text: "Edit", attrs: { "aria-label": "Edit " + goal.text } });
      const btnDel = u.createElement("button", { class: "btn-danger", text: "Delete", attrs: { "aria-label": "Delete " + goal.text } });

      cb.addEventListener("change", function () {
        goal.done = cb.checked;
        D.saveDay(selectedDate, dayData);
        renderGoals(container);
      });

      btnEdit.addEventListener("click", function () {
        const updated = window.prompt("Edit goal:", goal.text);
        if (updated !== null && updated.trim()) {
          const v = D.validateGoal(updated);
          if (v.valid) {
            goal.text = v.goal.text;
            D.saveDay(selectedDate, dayData);
            renderGoals(container);
          } else {
            setStatus(v.errors.join(" "), true);
          }
        }
      });

      btnDel.addEventListener("click", function () {
        if (window.confirm("Delete goal \"" + goal.text + "\"?")) {
          dayData.goals = dayData.goals.filter(function (g) { return g.id !== goal.id; });
          D.saveDay(selectedDate, dayData);
          renderGoals(container);
        }
      });

      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);

      li.appendChild(cb);
      li.appendChild(txt);
      li.appendChild(actions);
      ul.appendChild(li);
    });
    container.appendChild(ul);

    // Goal input row
    if (goals.length < D.MAX_GOALS) {
      const addRow = u.createElement("div", { class: "goal-add-row" });
      const inGoal = u.createElement("input", { attrs: { type: "text", maxlength: "80", placeholder: "Add a goal (Enter to add)..." } });
      const btnAdd = u.createElement("button", { text: "Add" });

      function handleAdd() {
        const val = inGoal.value;
        const v = D.validateGoal(val);
        if (!v.valid) {
          setStatus(v.errors.join(" "), true);
          return;
        }
        dayData.goals.push(v.goal);
        const res = D.saveDay(selectedDate, dayData);
        if (!res.ok) {
          setStatus("Failed to save goal.", true);
          return;
        }
        renderGoals(container);
      }

      btnAdd.addEventListener("click", handleAdd);
      inGoal.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAdd();
        }
      });

      addRow.appendChild(inGoal);
      addRow.appendChild(btnAdd);
      container.appendChild(addRow);
    } else {
      container.appendChild(u.createElement("p", { class: "status-msg", text: "Goal limit reached (max 6 per day)." }));
    }
  }

  // ── 3. Wellness & Hydrate Note ────────────────────────────────
  function renderWater(container) {
    const u = StudyBloom.utils;
    const D = StudyBloom.days;
    while (container.firstChild) container.removeChild(container.firstChild);

    const h2 = u.createElement("h2", { text: "💧 Be Kind & Hydrate" });
    container.appendChild(h2);

    const dayData = D.getDay(selectedDate);
    let count = dayData.water || 0;

    const trackerBox = u.createElement("div", { class: "water-tracker" });
    const lbl = u.createElement("div", { class: "water-label", text: "Daily Water: " + count + " of 8 cups" });
    const cupsRow = u.createElement("div", { class: "water-cups" });

    for (let i = 1; i <= 8; i++) {
      const btn = u.createElement("button", {
        class: "cup-btn",
        text: "💧",
        attrs: {
          type: "button",
          "aria-label": "Cup " + i,
          "aria-pressed": i <= count ? "true" : "false",
        },
      });

      btn.addEventListener("click", function () {
        if (count === i) {
          count = i - 1;
        } else {
          count = i;
        }
        D.setWater(dayData, count);
        D.saveDay(selectedDate, dayData);
        renderWater(container);
      });

      cupsRow.appendChild(btn);
    }

    trackerBox.appendChild(lbl);
    trackerBox.appendChild(cupsRow);
    container.appendChild(trackerBox);

    // Kind reminders
    const remTitle = u.createElement("h3", { class: "reminders-title", text: "🌸 Kind Reminders" });
    container.appendChild(remTitle);

    const ul = u.createElement("ul", { class: "reminders-list" });
    const reminders = [
      "💧 Sip some water regularly.",
      "⏱ Take a 10-minute break every hour.",
      "🧘 Stretch or take a short walk.",
      "🌿 Don't stress, small steps count.",
      "🤝 Do one kind thing for someone today.",
      "💖 Do one kind thing for yourself.",
    ];
    reminders.forEach(function (r) {
      ul.appendChild(u.createElement("li", { class: "reminder-item", text: r }));
    });
    container.appendChild(ul);
  }

  function mount(elements) {
    mountContainers = elements;
    selectedDate = StudyBloom.utils.today();
    renderAll();
  }

  window.StudyBloom = window.StudyBloom || {};
  StudyBloom.homeDay = {
    mount: mount,
    renderAll: renderAll,
    getSelectedDate: function () { return selectedDate; },
    setSelectedDate: function (d) { selectedDate = d; renderAll(); },
  };
})();
