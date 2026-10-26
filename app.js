const FAMILY_KEY = "films-corpet-seen-v1";
const CACHE_KEY = "films-corpet-catalogue-v1";
const CACHE_TTL = 3 * 60 * 1000;
const state = { data: null, selectedMembers: new Set(), films: [], genres: [], seen: new Set() };
const el = (id) => document.getElementById(id);

function readSeen() {
  try { return new Set(JSON.parse(localStorage.getItem(FAMILY_KEY) || "[]")); }
  catch { return new Set(); }
}

function loadJsonp(url) {
  return new Promise((resolve, reject) => {
    const callback = `__filmData_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => finish(new Error("Le catalogue ne répond pas.")), 15000);
    function finish(error, value) {
      clearTimeout(timer);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve(value);
    }
    window[callback] = (value) => finish(null, value);
    script.onerror = () => finish(new Error("Impossible de charger les films depuis Google Sheets."));
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${callback}`;
    document.head.appendChild(script);
  });
}

async function loadCatalogue() {
  const apiUrl = String(window.FILM_API_URL || "").trim();
  if (!apiUrl) {
    const response = await fetch("data/films.json");
    if (!response.ok) throw new Error("Aucun jeu de données local. Configurez la connexion Google Sheets ou placez data/films.json pour travailler hors ligne.");
    el("source-label").textContent = "Aperçu local";
    return response.json();
  }

  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    if (cached && Date.now() - cached.savedAt < CACHE_TTL) {
      el("source-label").textContent = "Feuille familiale";
      return cached.data;
    }
  } catch { /* Le navigateur a peut-être bloqué le stockage local. */ }

  const data = await loadJsonp(apiUrl);
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch { /* Le cache est facultatif. */ }
  el("source-label").textContent = "Feuille familiale";
  return data;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function parseDuration(value) {
  const text = String(value || "").toLowerCase();
  const hours = text.match(/(\d+)\s*h/);
  const minutes = text.match(/(\d+)\s*(?:min|m\b)/);
  if (hours || minutes) return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
  const number = Number.parseInt(text, 10);
  return Number.isFinite(number) ? number : null;
}

function selectedVotes(film) {
  return [...state.selectedMembers].map((name) => ({ name, vote: film.votes?.[name] ?? null }));
}

function consensus(film) {
  const votes = selectedVotes(film);
  const veto = votes.some(({ vote }) => vote === -1);
  const absentWanted = (state.data?.members || []).some((name) => !state.selectedMembers.has(name) && film.votes?.[name] === 1);
  const yes = votes.filter(({ vote }) => vote === 1).length;
  const answered = votes.filter(({ vote }) => vote === 1 || vote === 0 || vote === -1).length;
  const absentNoMembers = (state.data?.members || []).filter((name) => !state.selectedMembers.has(name) && film.votes?.[name] === -1);
  const score = yes + absentNoMembers.length * 5;
  return { votes, veto, absentWanted, yes, answered, score, absentNoMembers, ratio: state.selectedMembers.size ? yes / state.selectedMembers.size : 0 };
}

function youngestSelectedMember() {
  return [...state.selectedMembers]
    .filter((name) => Number.isFinite(Number(state.data?.memberInfo?.[name]?.age)))
    .map((name) => ({ name, age: Number(state.data.memberInfo[name].age) }))
    .sort((a, b) => a.age - b.age)[0] || null;
}

function refreshAgeLimitLabel() {
  const automaticOption = el("age-filter").querySelector('option[value="auto"]');
  const youngest = youngestSelectedMember();
  if (!youngest && state.selectedMembers.size) automaticOption.textContent = "Auto · sans limite";
  else if (youngest) automaticOption.textContent = `Auto · max ${youngest.age} ans (${youngest.name})`;
  else automaticOption.textContent = "Auto · choisis quelqu’un";
}

function activeAgeLimit() {
  if (el("age-filter").value !== "auto") return Number(el("age-filter").value);
  return youngestSelectedMember()?.age ?? 99;
}

function renderPeople() {
  const list = el("people-list");
  list.innerHTML = state.data.members.map((name) => {
    const shortcut = name.trim().slice(0, 1).toLocaleUpperCase("fr");
    return `
      <button class="person-chip" type="button" aria-pressed="${state.selectedMembers.has(name)}" aria-keyshortcuts="${escapeHtml(shortcut)}" data-person="${escapeHtml(name)}">
        <span>${escapeHtml(name)}</span><kbd class="shortcut-key">${escapeHtml(shortcut)}</kbd>
      </button>`;
  }).join("");
  list.querySelectorAll("[data-person]").forEach((button) => button.addEventListener("click", () => toggleMember(button.dataset.person)));
}

function toggleMember(name) {
  if (state.selectedMembers.has(name)) state.selectedMembers.delete(name);
  else state.selectedMembers.add(name);
  const button = [...el("people-list").querySelectorAll("[data-person]")].find((item) => item.dataset.person === name);
  if (button) button.setAttribute("aria-pressed", String(state.selectedMembers.has(name)));
  refreshAgeLimitLabel();
  renderFilms();
}

function handleMemberShortcut(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || event.key.length !== 1) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"))) return;
  const key = event.key.toLocaleUpperCase("fr");
  const member = state.data.members.find((name) => name.trim().slice(0, 1).toLocaleUpperCase("fr") === key);
  if (!member) return;
  event.preventDefault();
  toggleMember(member);
}

function renderGenres() {
  const genres = [...new Set(state.films.map((film) => film.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
  el("genre-filter").innerHTML = '<option value="">Tous les genres</option>' + genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`).join("");
}

function matchesFilters(film) {
  const selected = consensus(film);
  if (selected.veto || selected.absentWanted || state.selectedMembers.size === 0) return false;
  const query = el("search").value.trim().toLocaleLowerCase("fr");
  if (query && !film.title.toLocaleLowerCase("fr").includes(query)) return false;
  if (film.age && film.age > activeAgeLimit()) return false;
  const maxDuration = Number(el("duration-filter").value);
  const duration = parseDuration(film.duration);
  if (duration !== null && duration > maxDuration) return false;
  if (el("genre-filter").value && film.genre !== el("genre-filter").value) return false;
  const isSeen = state.seen.has(film.title);
  if (el("watched-filter").value === "unseen" && isSeen) return false;
  if (el("watched-filter").value === "seen" && !isSeen) return false;
  return true;
}

function renderFilmCard(film, index) {
  const { score, answered, absentNoMembers } = consensus(film);
  const isSeen = state.seen.has(film.title);
  const voteDots = (state.data?.members || []).map((name) => {
    const vote = film.votes?.[name] ?? null;
    const present = state.selectedMembers.has(name);
    const type = vote === 1 ? "yes" : vote === -1 ? "no" : vote === 0 ? "neutral" : "";
    const feminine = state.data?.memberInfo?.[name]?.gender === "f";
    const attendance = present ? (feminine ? "présente" : "présent") : (feminine ? "absente" : "absent");
    const mark = vote === 1 ? "✓" : vote === -1 ? "×" : vote === 0 ? "·" : "?";
    const label = vote === 1 ? "oui" : vote === -1 ? "non" : vote === 0 ? "neutre" : "sans vote";
    let effect = "aucun effet sur le score";
    if (present && vote === -1) effect = "veto : le film est écarté";
    else if (present && vote === 1) effect = "+1 point";
    else if (!present && vote === -1) effect = "+5 points";
    else if (!present && vote === 1) effect = "le film attend une séance où cette personne sera présente";
    const explanation = `${name} · ${attendance} · ${label} · ${effect}`;
    return `<span class="vote-dot ${type} ${present ? "present" : "absent"}" title="${escapeHtml(explanation)}" aria-label="${escapeHtml(explanation)}" tabindex="0">${mark}</span>`;
  }).join("");
  const age = film.age ? `<span class="meta-pill age">PEGI ${escapeHtml(film.age)}</span>` : "";
  const runtime = film.duration ? `<span class="meta-pill">${escapeHtml(film.duration)}</span>` : "";
  const availability = film.availability ? `<span class="meta-pill availability">${escapeHtml(film.availability)}</span>` : "";
  const absenceBonus = absentNoMembers.length ? `<p class="absence-bonus">+${absentNoMembers.length * 5} pts · Absents (non) : ${absentNoMembers.map(escapeHtml).join(", ")}</p>` : "";
  return `<article class="film-card ${index === 0 ? "top-pick" : ""}">
    <div class="film-card-top"><span class="rank">${index === 0 ? "NOTRE FAVORI" : `CHOIX N° ${index + 1}`}</span><span class="score-pill">Score ${score}${answered < state.selectedMembers.size ? " · vote partiel" : ""}</span></div>
    <h3>${escapeHtml(film.title)}</h3><p class="genre-label">${escapeHtml(film.genre || "Genre à préciser")}</p>
    <div class="film-meta">${age}${runtime}${availability}</div>${absenceBonus}
    <div class="card-bottom"><div class="votes" aria-label="Votes de la famille; survolez un rond pour voir la personne, sa présence et l’effet de son vote">${voteDots}</div>
      <button type="button" class="seen-toggle ${isSeen ? "is-seen" : ""}" data-seen="${escapeHtml(film.title)}">${isSeen ? "✓ Déjà vu" : "Marquer vu"}</button>
    </div></article>`;
}

function renderFilms() {
  const candidates = state.films.filter(matchesFilters).sort((a, b) => {
    const first = consensus(a), second = consensus(b);
    return second.score - first.score || second.ratio - first.ratio || a.title.localeCompare(b.title, "fr");
  });
  const grid = el("film-grid");
  grid.innerHTML = candidates.slice(0, 48).map(renderFilmCard).join("");
  el("empty-state").hidden = candidates.length > 0;
  el("result-count").textContent = `${candidates.length} film${candidates.length > 1 ? "s" : ""} correspondent`;
  el("results-title").textContent = candidates.length ? "Les favoris de la famille" : "Un autre filtre ?";
  el("catalogue-meta").textContent = `${state.films.length} films au catalogue`;
  grid.querySelectorAll("[data-seen]").forEach((button) => button.addEventListener("click", () => {
    const title = button.dataset.seen;
    state.seen.has(title) ? state.seen.delete(title) : state.seen.add(title);
    try { localStorage.setItem(FAMILY_KEY, JSON.stringify([...state.seen])); } catch { /* L'état reste valable pour cette session. */ }
    renderFilms();
  }));
}

function showError(error) {
  el("film-grid").innerHTML = `<div class="error-card">${escapeHtml(error.message || "Le catalogue n'a pas pu être chargé.")}</div>`;
  el("result-count").textContent = "";
  el("empty-state").hidden = true;
}

async function start() {
  state.seen = readSeen();
  try {
    state.data = await loadCatalogue();
    state.films = state.data.films || [];
    state.selectedMembers = new Set(state.data.members || []);
    renderPeople();
    renderGenres();
    refreshAgeLimitLabel();
    renderFilms();
    document.addEventListener("keydown", handleMemberShortcut);
    ["search", "age-filter", "duration-filter", "genre-filter", "watched-filter"].forEach((id) => el(id).addEventListener(id === "search" ? "input" : "change", renderFilms));
    el("select-all").addEventListener("click", () => { state.selectedMembers = new Set(state.data.members); renderPeople(); refreshAgeLimitLabel(); renderFilms(); });
  } catch (error) { showError(error); }
}

start();
