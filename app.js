// Minimal offline-first workout logger using localStorage
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

// Simple ID
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Format date
const todayStr = () => new Date().toISOString().slice(0,10);

// Storage helpers
const KEY = "alec_workout_logger_v1";
const loadAll = () => JSON.parse(localStorage.getItem(KEY) || '{"sessions":[]}');
const saveAll = (data) => localStorage.setItem(KEY, JSON.stringify(data));

// Session state
let current = null;

function newSession() {
  const week = +$("#week").value || 1;
  const dayKey = $("#day").value;
  const plan = PLAN[dayKey];
  const now = new Date();
  current = {
    id: uid(),
    date: todayStr(),
    week,
    dayKey,
    title: plan.title,
    items: plan.items.map(ex => ({
      name: ex.name,
      target: `${ex.sets} x ${ex.reps}`,
      sets: Array.from({length: ex.sets}, (_,i)=>({n:i+1, weight:"", reps:"", rir:"", notes:""}))
    }))
  };
  renderSession();
}

function renderSession() {
  $("#date").textContent = current.date;
  $("#sessionId").textContent = current.id;
  const wrap = $("#exercises");
  wrap.innerHTML = "";
  const exTpl = $("#exerciseTemplate");
  const setTpl = $("#setRowTemplate");

  current.items.forEach((ex, exIndex) => {
    const exNode = exTpl.content.firstElementChild.cloneNode(true);
    $(".ex-name", exNode).textContent = ex.name;
    $(".ex-details", exNode).textContent = `Target: ${ex.target}`;
    const setsWrap = $(".sets", exNode);

    function addSetRow(setObj) {
      const row = setTpl.content.firstElementChild.cloneNode(true);
      $(".set-num", row).textContent = setObj.n;
      const weight = $(".weight", row);
      const reps = $(".reps", row);
      const rir = $(".rir", row);
      const notes = $(".notes", row);
      weight.value = setObj.weight || "";
      reps.value = setObj.reps || "";
      rir.value = setObj.rir || "";
      notes.value = setObj.notes || "";

      weight.addEventListener("input", e => setObj.weight = e.target.value);
      reps.addEventListener("input", e => setObj.reps = e.target.value);
      rir.addEventListener("input", e => setObj.rir = e.target.value);
      notes.addEventListener("input", e => setObj.notes = e.target.value);
      $(".deleteSet", row).addEventListener("click", () => {
        ex.sets = ex.sets.filter(s => s !== setObj).map((s,i)=>({...s, n:i+1}));
        renderSession();
      });
      setsWrap.appendChild(row);
    }

    ex.sets.forEach(addSetRow);

    $(".addSet", exNode).addEventListener("click", () => {
      ex.sets.push({n: ex.sets.length+1, weight:"", reps:"", rir:"", notes:""});
      renderSession();
    });
    $(".copyLast", exNode).addEventListener("click", () => {
      const last = ex.sets[ex.sets.length-1] || {weight:"", reps:"", rir:"", notes:""};
      ex.sets.push({n: ex.sets.length+1, weight:last.weight, reps:last.reps, rir:last.rir, notes:""});
      renderSession();
    });

    wrap.appendChild(exNode);
  });
}

// Save session
function saveSession() {
  if (!current) return alert("No active session.");
  const all = loadAll();
  const idx = all.sessions.findIndex(s => s.id === current.id);
  if (idx >= 0) all.sessions[idx] = current; else all.sessions.unshift(current);
  saveAll(all);
  renderHistory();
  alert("Saved ✔");
}

// History list
function renderHistory() {
  const list = $("#historyList");
  list.innerHTML = "";
  const all = loadAll();
  all.sessions.forEach(s => {
    const div = document.createElement("div");
    div.className = "history-item";
    const left = document.createElement("div");
    left.innerHTML = `<strong>${s.title}</strong><br><small>${s.date} — Week ${s.week} — ${s.id}</small>`;
    const right = document.createElement("div");
    const openBtn = document.createElement("button");
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => { current = JSON.parse(JSON.stringify(s)); renderSession(); });
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const data = loadAll();
      data.sessions = data.sessions.filter(x => x.id !== s.id);
      saveAll(data);
      renderHistory();
    });
    right.appendChild(openBtn);
    right.appendChild(delBtn);
    div.appendChild(left);
    div.appendChild(right);
    list.appendChild(div);
  });
}

// Export
function toCSV(sessions) {
  const lines = ["date,week,day,title,exercise,set,weight,reps,rir,notes"];
  sessions.forEach(s => {
    s.items.forEach(ex => {
      ex.sets.forEach(set => {
        lines.push([s.date,s.week,s.dayKey,JSON.stringify(s.title),JSON.stringify(ex.name),set.n,set.weight,set.reps,set.rir,JSON.stringify(set.notes||"")].join(","));
      });
    });
  });
  return lines.join("\n");
}
function download(filename, text) {
  const blob = new Blob([text], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCSV() {
  const all = loadAll();
  if (!all.sessions.length) return alert("No data to export.");
  download("workouts.csv", toCSV(all.sessions));
}
function exportJSON() {
  const all = loadAll();
  download("workouts.json", JSON.stringify(all, null, 2));
}
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const incoming = JSON.parse(reader.result);
      if (!incoming.sessions) throw new Error("Invalid file");
      // Merge by ID (replace duplicates)
      const existing = loadAll();
      const map = new Map(existing.sessions.map(s => [s.id, s]));
      incoming.sessions.forEach(s => map.set(s.id, s));
      const merged = {sessions: Array.from(map.values()).sort((a,b)=> (a.date < b.date ? 1 : -1))};
      saveAll(merged);
      renderHistory();
      alert("Import complete ✔");
    } catch(e) {
      alert("Import failed: " + e.message);
    }
  };
  reader.readAsText(file);
}

// Wire up
window.addEventListener("DOMContentLoaded", () => {
  // init date
  $("#date").textContent = todayStr();
  $("#sessionId").textContent = "—";
  renderHistory();

  $("#loadPlan").addEventListener("click", newSession);
  $("#newSession").addEventListener("click", newSession);
  $("#save").addEventListener("click", saveSession);
  $("#exportCSV").addEventListener("click", exportCSV);
  $("#exportJSON").addEventListener("click", exportJSON);
  $("#importJSON").addEventListener("click", ()=> $("#importFile").click());
  $("#importFile").addEventListener("change", (e)=> {
    const file = e.target.files[0];
    if (file) importJSON(file);
    e.target.value = "";
  });
});
