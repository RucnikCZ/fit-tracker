import { auth, googleProvider } from "./config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { localDB } from "./db.js";
import { saveWorkout, deleteWorkout, updatePR, fetchFromFirebase, syncToFirebase } from "./sync.js";
import { WORKOUT_PLANS, WEEK_LABELS, MAIN_EXERCISES } from "./data.js";

// ─── State ────────────────────────────────────────────────────────────────────
let state = {
  user: null,
  view: "home",           // home | workout | history | detail | progress
  workoutType: null,
  weekNumber: 1,
  currentWorkout: null,   // workout being recorded
  workouts: [],
  prs: [],
  detailId: null,
  progressExercise: null,
  offlineMode: false
};

// ─── Router ───────────────────────────────────────────────────────────────────
function navigate(view, params = {}) {
  Object.assign(state, params, { view });
  render();
  window.scrollTo(0, 0);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function login() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e) {
    showToast("Přihlášení selhalo: " + e.message, "error");
  }
}

async function logout() {
  await signOut(auth);
}

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  if (user) {
    await fetchFromFirebase(user.uid);
    await loadLocalData();
    if (state.view === "home") navigate("home");
    else render();
  } else {
    state.workouts = [];
    state.prs = [];
    navigate("home");
  }
});

window.addEventListener("online", async () => {
  state.offlineMode = false;
  if (state.user) await syncToFirebase(state.user.uid);
  render();
});

window.addEventListener("offline", () => {
  state.offlineMode = true;
  render();
});

// ─── Data helpers ─────────────────────────────────────────────────────────────
async function loadLocalData() {
  if (!state.user) return;
  state.workouts = await localDB.getWorkouts(state.user.uid);
  state.workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  state.prs = await localDB.getPRs(state.user.uid);
}

function calcVolume(exercises) {
  return exercises.reduce((total, ex) => {
    return total + ex.sets.filter(s => s.completed).reduce((t, s) => t + s.weight * s.reps, 0);
  }, 0);
}

function getLastWorkout(type) {
  return state.workouts.find(w => w.type === type);
}

function getPR(exerciseName) {
  return state.prs.find(p => p.exerciseName === exerciseName);
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
}

function formatDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getDeloadFactor(week) {
  return week === 4 ? 0.6 : 1;
}

// ─── Workout builder ──────────────────────────────────────────────────────────
function buildNewWorkout(type, week) {
  const plan = WORKOUT_PLANS[type];
  const lastWorkout = getLastWorkout(type);
  const deload = getDeloadFactor(week);

  const exercises = plan.exercises.map(ex => {
    const lastEx = lastWorkout?.exercises?.find(e => e.name === ex.name);
    const defaultRepsNum = parseInt(ex.defaultReps.split("-")[0]);
    let setsCount = ex.defaultSets;
    if (week === 4) setsCount = Math.max(1, Math.round(setsCount * 0.6));

    const sets = Array.from({ length: setsCount }, (_, i) => {
      const lastSet = lastEx?.sets?.[i];
      let weight = lastSet?.weight ?? 0;
      if (week === 4 && lastSet?.weight) weight = Math.round(lastSet.weight * deload / 2.5) * 2.5;
      return {
        weight,
        reps: lastSet?.reps ?? defaultRepsNum,
        completed: false
      };
    });

    return { name: ex.name, sets };
  });

  return {
    id: generateId(),
    type,
    week,
    date: new Date().toISOString(),
    note: "",
    exercises,
    totalVolume: 0
  };
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  const root = document.getElementById("app");
  root.innerHTML = "";

  if (!state.user) {
    root.appendChild(renderLogin());
    return;
  }

  root.appendChild(renderHeader());
  const main = document.createElement("main");

  switch (state.view) {
    case "home":       main.appendChild(renderHome()); break;
    case "workout":    main.appendChild(renderWorkout()); break;
    case "history":    main.appendChild(renderHistory()); break;
    case "detail":     main.appendChild(renderDetail()); break;
    case "progress":   main.appendChild(renderProgress()); break;
  }

  root.appendChild(main);
  root.appendChild(renderNavBar());

  if (state.offlineMode) {
    const banner = document.createElement("div");
    banner.className = "offline-banner";
    banner.textContent = "Offline — data se synchronizují po připojení";
    root.prepend(banner);
  }
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function renderLogin() {
  const el = document.createElement("div");
  el.className = "login-screen";
  el.innerHTML = `
    <div class="login-inner">
      <div class="app-logo">FIT<span>TRACKER</span></div>
      <p class="login-sub">PPL Split · Silový trénink</p>
      <button class="btn btn-primary btn-login" id="loginBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Přihlásit přes Google
      </button>
      <p class="login-note">Data jsou vázána na tvůj Google účet a přežijí reinstalaci.</p>
    </div>
  `;
  el.querySelector("#loginBtn").addEventListener("click", login);
  return el;
}

// ─── Header ───────────────────────────────────────────────────────────────────
function renderHeader() {
  const el = document.createElement("header");
  el.className = "app-header";

  const viewTitles = {
    home: "FITTRACKER",
    workout: state.workoutType ? `${WORKOUT_PLANS[state.workoutType].label.toUpperCase()} · TÝDEN ${state.weekNumber}` : "TRÉNINK",
    history: "HISTORIE",
    detail: "DETAIL",
    progress: "PROGRESE"
  };

  el.innerHTML = `
    <div class="header-inner">
      <span class="header-title">${viewTitles[state.view] ?? "FITTRACKER"}</span>
      <div class="header-actions">
        ${state.offlineMode ? `<span class="offline-dot" title="Offline"></span>` : ""}
        <button class="btn-icon" id="logoutBtn" title="Odhlásit">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  `;
  el.querySelector("#logoutBtn").addEventListener("click", logout);
  return el;
}

// ─── Nav bar ──────────────────────────────────────────────────────────────────
function renderNavBar() {
  const el = document.createElement("nav");
  el.className = "bottom-nav";
  const items = [
    { view: "home",     icon: "home",    label: "Domů" },
    { view: "history",  icon: "list",    label: "Historie" },
    { view: "progress", icon: "chart",   label: "Progrese" }
  ];

  el.innerHTML = items.map(item => `
    <button class="nav-item ${state.view === item.view || (item.view === "home" && state.view === "workout") ? "active" : ""}" data-view="${item.view}">
      ${navIcon(item.icon)}
      <span>${item.label}</span>
    </button>
  `).join("");

  el.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "workout" && !state.currentWorkout) return;
      navigate(btn.dataset.view);
    });
  });
  return el;
}

function navIcon(name) {
  const icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    list: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    chart: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
  };
  return icons[name] ?? "";
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function renderHome() {
  const el = document.createElement("div");
  el.className = "view-home";

  const lastWorkouts = {};
  for (const type of ["pull", "legs", "push"]) {
    lastWorkouts[type] = state.workouts.find(w => w.type === type);
  }

  el.innerHTML = `
    <section class="week-selector">
      <label class="section-label">TÝDEN CYKLU</label>
      <div class="week-pills">
        ${[1,2,3,4].map(w => `
          <button class="week-pill ${state.weekNumber === w ? "active" : ""}" data-week="${w}">
            ${w === 4 ? "4 · DELOAD" : `T${w}`}
          </button>
        `).join("")}
      </div>
      <p class="week-desc">${WEEK_LABELS[state.weekNumber]}</p>
    </section>

    <section class="workout-cards">
      <label class="section-label">SPUSTIT TRÉNINK</label>
      ${["pull", "legs", "push"].map(type => {
        const last = lastWorkouts[type];
        const plan = WORKOUT_PLANS[type];
        return `
          <button class="workout-card" data-type="${type}">
            <div class="wc-label">${plan.label}</div>
            <div class="wc-exercises">${plan.exercises.length} cviků</div>
            <div class="wc-last">${last ? `Naposledy: ${formatDateShort(last.date)} · ${Math.round(last.totalVolume ?? 0)} kg` : "Zatím žádný záznam"}</div>
            <svg class="wc-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        `;
      }).join("")}
    </section>

    ${state.currentWorkout ? `
      <section class="resume-banner">
        <div>
          <strong>Rozpracovaný trénink</strong><br>
          <span>${WORKOUT_PLANS[state.currentWorkout.type].label} · Týden ${state.currentWorkout.week}</span>
        </div>
        <button class="btn btn-accent btn-sm" id="resumeBtn">Pokračovat</button>
      </section>
    ` : ""}

    <section class="export-section">
      <label class="section-label">DATA</label>
      <div class="row-btns">
        <button class="btn btn-ghost btn-sm" id="exportBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export JSON
        </button>
        <label class="btn btn-ghost btn-sm" id="importLabel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import JSON
          <input type="file" id="importFile" accept=".json" style="display:none">
        </label>
      </div>
    </section>
  `;

  el.querySelectorAll(".week-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.weekNumber = parseInt(btn.dataset.week);
      render();
    });
  });

  el.querySelectorAll(".workout-card").forEach(btn => {
    btn.addEventListener("click", () => startWorkout(btn.dataset.type));
  });

  el.querySelector("#resumeBtn")?.addEventListener("click", () => navigate("workout"));
  el.querySelector("#exportBtn").addEventListener("click", exportData);
  el.querySelector("#importFile").addEventListener("change", importData);

  return el;
}

// ─── Workout recording ────────────────────────────────────────────────────────
function startWorkout(type) {
  if (state.currentWorkout?.type !== type) {
    state.currentWorkout = buildNewWorkout(type, state.weekNumber);
  }
  state.workoutType = type;
  navigate("workout");
}

function renderWorkout() {
  const w = state.currentWorkout;
  if (!w) { navigate("home"); return document.createElement("div"); }

  const plan = WORKOUT_PLANS[w.type];
  const lastWorkout = getLastWorkout(w.type);

  const el = document.createElement("div");
  el.className = "view-workout";

  el.innerHTML = `
    <div class="workout-exercises" id="exerciseList">
      ${w.exercises.map((ex, exIdx) => {
        const planEx = plan.exercises[exIdx];
        const lastEx = lastWorkout?.exercises?.find(e => e.name === ex.name);
        const pr = getPR(ex.name);
        return `
          <div class="exercise-card" data-ex="${exIdx}">
            <div class="ex-header">
              <span class="ex-name">${ex.name}</span>
              ${planEx?.isMain ? `<span class="ex-badge main">HLAVNÍ</span>` : ""}
            </div>
            ${planEx?.note ? `<div class="ex-note">${planEx.note}</div>` : ""}
            ${pr ? `<div class="ex-pr">PR: ${pr.weight} kg</div>` : ""}

            <div class="sets-header">
              <span>SET</span><span>KG</span><span>REPS</span><span></span>
            </div>

            ${ex.sets.map((set, sIdx) => {
              const ghostW = lastEx?.sets?.[sIdx]?.weight;
              const ghostR = lastEx?.sets?.[sIdx]?.reps;
              return `
                <div class="set-row ${set.completed ? "completed" : ""}" data-ex="${exIdx}" data-set="${sIdx}">
                  <span class="set-num">${sIdx + 1}</span>
                  <div class="set-input-wrap">
                    <input type="number" class="set-input weight-input" inputmode="decimal"
                      value="${set.weight || ""}"
                      placeholder="${ghostW ?? "0"}"
                      data-ex="${exIdx}" data-set="${sIdx}" data-field="weight"
                      min="0" step="0.5">
                  </div>
                  <div class="set-input-wrap">
                    <input type="number" class="set-input reps-input" inputmode="numeric"
                      value="${set.reps || ""}"
                      placeholder="${ghostR ?? "0"}"
                      data-ex="${exIdx}" data-set="${sIdx}" data-field="reps"
                      min="0" step="1">
                  </div>
                  <button class="set-done-btn ${set.completed ? "done" : ""}" data-ex="${exIdx}" data-set="${sIdx}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
              `;
            }).join("")}

            <div class="set-actions">
              <button class="btn btn-ghost btn-xs add-set-btn" data-ex="${exIdx}">+ Set</button>
              ${ex.sets.length > 1 ? `<button class="btn btn-ghost btn-xs remove-set-btn" data-ex="${exIdx}">− Set</button>` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>

    <div class="workout-note-wrap">
      <label class="section-label">POZNÁMKA</label>
      <textarea class="workout-note" placeholder="Jak šel trénink?" id="workoutNote">${w.note ?? ""}</textarea>
    </div>

    <div class="workout-actions">
      <button class="btn btn-primary btn-lg" id="finishBtn">Dokončit trénink</button>
      <button class="btn btn-ghost" id="discardBtn">Zahodit</button>
    </div>
  `;

  // Input changes
  el.querySelectorAll(".set-input").forEach(input => {
    input.addEventListener("change", (e) => {
      const exIdx = parseInt(e.target.dataset.ex);
      const sIdx = parseInt(e.target.dataset.set);
      const field = e.target.dataset.field;
      const val = parseFloat(e.target.value) || 0;
      state.currentWorkout.exercises[exIdx].sets[sIdx][field] = val;
    });
  });

  // Done toggle
  el.querySelectorAll(".set-done-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const exIdx = parseInt(btn.dataset.ex);
      const sIdx = parseInt(btn.dataset.set);
      const set = state.currentWorkout.exercises[exIdx].sets[sIdx];
      // Use current input values if not yet applied
      const row = el.querySelector(`.set-row[data-ex="${exIdx}"][data-set="${sIdx}"]`);
      const wInput = row.querySelector(".weight-input");
      const rInput = row.querySelector(".reps-input");
      set.weight = parseFloat(wInput.value) || parseFloat(wInput.placeholder) || 0;
      set.reps = parseInt(rInput.value) || parseInt(rInput.placeholder) || 0;
      set.completed = !set.completed;
      render();
    });
  });

  // Add/remove sets
  el.querySelectorAll(".add-set-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const exIdx = parseInt(btn.dataset.ex);
      const sets = state.currentWorkout.exercises[exIdx].sets;
      const last = sets[sets.length - 1];
      sets.push({ weight: last?.weight ?? 0, reps: last?.reps ?? 0, completed: false });
      render();
    });
  });

  el.querySelectorAll(".remove-set-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const exIdx = parseInt(btn.dataset.ex);
      const sets = state.currentWorkout.exercises[exIdx].sets;
      if (sets.length > 1) sets.pop();
      render();
    });
  });

  el.querySelector("#workoutNote").addEventListener("input", (e) => {
    state.currentWorkout.note = e.target.value;
  });

  el.querySelector("#finishBtn").addEventListener("click", finishWorkout);
  el.querySelector("#discardBtn").addEventListener("click", () => {
    if (confirm("Opravdu zahodit trénink?")) {
      state.currentWorkout = null;
      navigate("home");
    }
  });

  return el;
}

async function finishWorkout() {
  const w = state.currentWorkout;
  w.totalVolume = calcVolume(w.exercises);
  w.date = new Date().toISOString();

  // Check PRs
  for (const ex of w.exercises) {
    if (!MAIN_EXERCISES.includes(ex.name)) continue;
    const maxWeight = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight), 0);
    if (maxWeight === 0) continue;
    const pr = getPR(ex.name);
    if (!pr || maxWeight > pr.weight) {
      await updatePR(state.user.uid, ex.name, maxWeight, w.date);
    }
  }

  await saveWorkout(state.user.uid, w);
  await loadLocalData();

  state.currentWorkout = null;
  showToast(`Trénink uložen · ${Math.round(w.totalVolume)} kg celkem`);
  navigate("history");
}

// ─── History ──────────────────────────────────────────────────────────────────
function renderHistory() {
  const el = document.createElement("div");
  el.className = "view-history";

  if (!state.workouts.length) {
    el.innerHTML = `<div class="empty-state">Zatím žádné tréninky. Jdi na domovskou stránku a začni!</div>`;
    return el;
  }

  el.innerHTML = `
    <div class="history-list">
      ${state.workouts.map(w => `
        <div class="history-item" data-id="${w.id}">
          <div class="hi-left">
            <span class="hi-type ${w.type}">${WORKOUT_PLANS[w.type]?.label ?? w.type}</span>
            <span class="hi-date">${formatDate(w.date)}</span>
            <span class="hi-week">Týden ${w.week}</span>
          </div>
          <div class="hi-right">
            <span class="hi-volume">${Math.round(w.totalVolume ?? 0)} <small>kg</small></span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  el.querySelectorAll(".history-item").forEach(item => {
    item.addEventListener("click", () => navigate("detail", { detailId: item.dataset.id }));
  });

  return el;
}

// ─── Detail ───────────────────────────────────────────────────────────────────
function renderDetail() {
  const w = state.workouts.find(x => x.id === state.detailId);
  if (!w) { navigate("history"); return document.createElement("div"); }

  const el = document.createElement("div");
  el.className = "view-detail";

  el.innerHTML = `
    <div class="detail-meta">
      <span class="hi-type ${w.type}">${WORKOUT_PLANS[w.type]?.label ?? w.type}</span>
      <span>${formatDate(w.date)}</span>
      <span>Týden ${w.week}</span>
      <span class="detail-volume">${Math.round(w.totalVolume ?? 0)} kg celkem</span>
    </div>

    ${w.note ? `<div class="detail-note">"${w.note}"</div>` : ""}

    <div class="detail-exercises">
      ${w.exercises.map(ex => `
        <div class="detail-ex">
          <div class="detail-ex-name">${ex.name}</div>
          <div class="detail-sets">
            ${ex.sets.map((s, i) => `
              <div class="detail-set ${s.completed ? "completed" : "skipped"}">
                <span>${i + 1}</span>
                <span>${s.weight} kg</span>
                <span>× ${s.reps}</span>
                <span>${s.completed ? "✓" : "—"}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>

    <div class="detail-actions">
      <button class="btn btn-ghost" id="backBtn">← Zpět</button>
      <button class="btn btn-danger btn-sm" id="deleteBtn">Smazat</button>
    </div>
  `;

  el.querySelector("#backBtn").addEventListener("click", () => navigate("history"));
  el.querySelector("#deleteBtn").addEventListener("click", async () => {
    if (confirm("Smazat tento trénink?")) {
      await deleteWorkout(state.user.uid, w.id);
      await loadLocalData();
      navigate("history");
    }
  });

  return el;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
function renderProgress() {
  const el = document.createElement("div");
  el.className = "view-progress";

  const allExNames = [...new Set(state.workouts.flatMap(w => w.exercises.map(e => e.name)))];
  const currentEx = state.progressExercise ?? MAIN_EXERCISES[0];

  // Filter workouts that have this exercise and completed sets
  const exWorkouts = state.workouts
    .filter(w => w.exercises.some(e => e.name === currentEx && e.sets.some(s => s.completed)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const dataPoints = exWorkouts.map(w => {
    const ex = w.exercises.find(e => e.name === currentEx);
    const maxW = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight));
    return { date: w.date, weight: maxW };
  });

  const firstWeight = dataPoints[0]?.weight;
  const lastWeight = dataPoints[dataPoints.length - 1]?.weight;
  const pct = firstWeight && lastWeight ? (((lastWeight - firstWeight) / firstWeight) * 100).toFixed(1) : null;
  const pr = getPR(currentEx);

  el.innerHTML = `
    <div class="progress-selector">
      <label class="section-label">CVIK</label>
      <select class="ex-select" id="exSelect">
        ${allExNames.map(n => `<option value="${n}" ${n === currentEx ? "selected" : ""}>${n}</option>`).join("")}
      </select>
    </div>

    <div class="progress-stats">
      ${pr ? `<div class="stat-card"><div class="stat-val">${pr.weight}<small>kg</small></div><div class="stat-label">PR</div></div>` : ""}
      ${pct !== null ? `<div class="stat-card"><div class="stat-val ${pct >= 0 ? "pos" : "neg"}">${pct >= 0 ? "+" : ""}${pct}<small>%</small></div><div class="stat-label">Nárůst od začátku</div></div>` : ""}
      <div class="stat-card"><div class="stat-val">${exWorkouts.length}</div><div class="stat-label">Celkem tréninků</div></div>
    </div>

    <div class="chart-wrap">
      ${dataPoints.length >= 2
        ? renderLineChart(dataPoints)
        : `<div class="empty-state">Málo dat pro graf. Zaznamenej alespoň 2 tréninky s tímto cvikem.</div>`}
    </div>

    <div class="prs-section">
      <label class="section-label">OSOBNÍ REKORDY (HLAVNÍ CVIKY)</label>
      ${MAIN_EXERCISES.map(name => {
        const p = getPR(name);
        return `
          <div class="pr-row">
            <span class="pr-name">${name}</span>
            <span class="pr-val">${p ? `${p.weight} kg` : "—"}</span>
            <span class="pr-date">${p ? formatDate(p.date) : ""}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;

  el.querySelector("#exSelect").addEventListener("change", (e) => {
    state.progressExercise = e.target.value;
    render();
  });

  return el;
}

function renderLineChart(points) {
  const W = 340, H = 160, PAD = 32;
  const weights = points.map(p => p.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys = points.map(p => H - PAD - ((p.weight - minW) / range) * (H - PAD * 2));

  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");

  return `
    <svg class="line-chart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <path d="${pathD}" fill="none" stroke="#FFD700" stroke-width="2.5" stroke-linejoin="round"/>
      ${points.map((p, i) => `
        <circle cx="${xs[i].toFixed(1)}" cy="${ys[i].toFixed(1)}" r="4" fill="#FFD700"/>
        <text x="${xs[i].toFixed(1)}" y="${(ys[i] - 8).toFixed(1)}" text-anchor="middle" class="chart-label">${p.weight}</text>
      `).join("")}
      <text x="${PAD}" y="${H - 8}" class="chart-axis-label">${formatDateShort(points[0].date)}</text>
      <text x="${(W - PAD).toFixed(1)}" y="${H - 8}" text-anchor="end" class="chart-axis-label">${formatDateShort(points[points.length - 1].date)}</text>
    </svg>
  `;
}

// ─── Export / Import ──────────────────────────────────────────────────────────
function exportData() {
  const data = { workouts: state.workouts, prs: state.prs, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fittracker-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.workouts) throw new Error("Neplatný formát zálohy");
    for (const w of data.workouts) {
      await saveWorkout(state.user.uid, { ...w, userId: state.user.uid });
    }
    for (const pr of (data.prs ?? [])) {
      await updatePR(state.user.uid, pr.exerciseName, pr.weight, pr.date);
    }
    await loadLocalData();
    showToast(`Import hotov: ${data.workouts.length} tréninků`);
    render();
  } catch (err) {
    showToast("Chyba importu: " + err.message, "error");
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const existing = document.querySelector(".toast");
  existing?.remove();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
render();

// Register Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(console.warn);
}
