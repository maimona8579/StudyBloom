// js/notes-page.js – Notes page UI
// Depends on: utils.js, storage.js, notes.js

(function () {
  function init() {
    const main = document.getElementById("main-content");
    if (!main) return;
    const u = StudyBloom.utils;
    const N = StudyBloom.notes;

    // Storage warning
    if (!StudyBloom.storage.available()) {
      const warn = u.createElement("div", { class: "storage-warning", text: "⚠ Storage is unavailable. Your data won't be saved." });
      main.insertBefore(warn, main.firstChild);
    }

    // ── Form widget ────────────────────────────────────────────────
    const formWidget = u.createElement("div", { class: "widget", attrs: { id: "new-note" } });
    const formTitle  = u.createElement("h1", { text: "Add Note" });
    const status     = u.createElement("p",  { class: "status-msg", attrs: { role: "status", "aria-live": "polite" } });

    function group(labelTxt, el) {
      const g   = u.createElement("div",   { class: "form-group" });
      const lbl = u.createElement("label", { text: labelTxt });
      lbl.setAttribute("for", el.id || el.getAttribute("id") || "");
      g.appendChild(lbl); g.appendChild(el);
      return g;
    }

    const inTitle   = u.createElement("input",    { attrs: { type: "text", id: "note-title",   placeholder: "Note title", maxlength: "100" } });
    const inSubject = u.createElement("input",    { attrs: { type: "text", id: "note-subject", placeholder: "Subject (optional)", maxlength: "30" } });
    const inBody    = u.createElement("textarea", { attrs: { id: "note-body", placeholder: "Write your note here…" } });
    inBody.setAttribute("maxlength", "2000");

    const btnRow    = u.createElement("div",    { class: "form-actions" });
    const btnSave   = u.createElement("button", { text: "Save Note" });
    const btnCancel = u.createElement("button", { class: "btn btn-ghost", text: "Cancel" });
    btnRow.appendChild(btnSave); btnRow.appendChild(btnCancel);

    formWidget.appendChild(formTitle);
    formWidget.appendChild(status);
    formWidget.appendChild(group("Title *", inTitle));
    formWidget.appendChild(group("Subject", inSubject));
    formWidget.appendChild(group("Body *",  inBody));
    formWidget.appendChild(btnRow);
    main.appendChild(formWidget);

    // ── Search bar ─────────────────────────────────────────────────
    const searchRow = u.createElement("div",    { class: "search-row" });
    const inSearch  = u.createElement("input",  { attrs: { type: "text", id: "note-search", placeholder: "Search notes…", "aria-label": "Search notes" } });
    const btnClear  = u.createElement("button", { class: "btn btn-ghost", text: "Clear" });
    searchRow.appendChild(inSearch);
    searchRow.appendChild(btnClear);
    main.appendChild(searchRow);

    // ── Notes grid ─────────────────────────────────────────────────
    const gridWrap = u.createElement("div", { class: "widget" });
    const grid     = u.createElement("div", { class: "notes-grid" });
    gridWrap.appendChild(grid);
    main.appendChild(gridWrap);

    let editingId = null;

    // ── Render ─────────────────────────────────────────────────────
    function renderGrid() {
      while (grid.firstChild) grid.removeChild(grid.firstChild);
      const query = inSearch.value;
      let notes   = N.sortNotes(N.searchNotes(N.loadNotes(), query));

      if (!notes.length) {
        grid.appendChild(u.createElement("p", { class: "empty-state", text: query ? "No notes match your search." : "No notes yet. Add one above!" }));
        return;
      }

      notes.forEach(function (note) {
        const card  = u.createElement("div", { class: "note-card" });
        const title = u.createElement("div", { class: "note-title",   text: note.title });
        const subj  = u.createElement("div", { class: "note-subject", text: note.subject + " · " + note.updatedAt.slice(0, 10) });

        // Body preview (first 150 chars)
        const PREVIEW = 150;
        const preview = u.createElement("div", { class: "note-body" });
        const isLong  = note.body.length > PREVIEW;
        let expanded  = false;
        u.setText(preview, isLong ? note.body.slice(0, PREVIEW) + "…" : note.body);

        const actions = u.createElement("div", { class: "note-actions" });
        if (isLong) {
          const btnToggle = u.createElement("button", { class: "btn btn-ghost", text: "Show more" });
          btnToggle.addEventListener("click", function () {
            expanded = !expanded;
            u.setText(preview, expanded ? note.body : note.body.slice(0, PREVIEW) + "…");
            u.setText(btnToggle, expanded ? "Show less" : "Show more");
          });
          actions.appendChild(btnToggle);
        }
        const btnEdit = u.createElement("button", { class: "btn btn-ghost", text: "Edit" });
        const btnDel  = u.createElement("button", { class: "btn btn-danger", text: "Delete" });
        actions.appendChild(btnEdit); actions.appendChild(btnDel);

        btnEdit.addEventListener("click", function () { startEdit(note); });
        btnDel.addEventListener("click",  function () {
          if (window.confirm("Delete \"" + note.title + "\"?")) {
            N.deleteNote(note.id);
            renderGrid();
            setStatus("Note deleted.", false);
          }
        });

        card.appendChild(title);
        card.appendChild(subj);
        card.appendChild(preview);
        card.appendChild(actions);
        grid.appendChild(card);
      });
    }

    // ── Helpers ────────────────────────────────────────────────────
    function setStatus(msg, isErr) {
      u.setText(status, msg);
      status.className = "status-msg" + (isErr ? " error" : "");
    }

    function clearForm() {
      inTitle.value   = "";
      inSubject.value = "";
      inBody.value    = "";
      editingId       = null;
      u.setText(formTitle, "Add Note");
      setStatus("", false);
    }

    function startEdit(note) {
      inTitle.value   = note.title;
      inSubject.value = note.subject === "General" ? "" : note.subject;
      inBody.value    = note.body;
      editingId       = note.id;
      u.setText(formTitle, "Edit Note");
      inTitle.focus();
    }

    // ── Event handlers ─────────────────────────────────────────────
    btnSave.addEventListener("click", function () {
      const input = { title: inTitle.value, subject: inSubject.value, body: inBody.value };
      const result = editingId ? N.updateNote(editingId, input) : N.createNote(input);
      if (!result.ok) {
        setStatus((result.errors || [result.error]).join(" "), true);
        return;
      }
      const msg = editingId ? "Note updated!" : "Note added!";
      clearForm();
      renderGrid();
      setStatus(msg, false);
    });

    btnCancel.addEventListener("click", clearForm);

    inSearch.addEventListener("input", function () { renderGrid(); });
    btnClear.addEventListener("click",  function () { inSearch.value = ""; renderGrid(); });

    // Deep-link focus
    if (window.location.hash === "#new-note") { inTitle.focus(); }

    renderGrid();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
