import { CASE_1 } from "./data/case1.js";
import {
  buildCaseIndex,
  collectClue,
  createInitialRuntime,
  evaluateHypotheses,
  hydrateRuntime,
  openScene,
  resolveEnding,
  sceneProgress,
  takeChoice
} from "./engine.js";

const STORAGE_KEY = "black_knot_case_001_runtime_v2";
const index = buildCaseIndex(CASE_1);
let runtime = hydrateRuntime(CASE_1, loadState());

const el = {
  briefingText: document.getElementById("briefingText"),
  briefingMeta: document.getElementById("briefingMeta"),
  progressText: document.getElementById("progressText"),
  metricScenes: document.getElementById("metricScenes"),
  metricClues: document.getElementById("metricClues"),
  metricFlags: document.getElementById("metricFlags"),
  sceneSelect: document.getElementById("sceneSelect"),
  enterSceneBtn: document.getElementById("enterSceneBtn"),
  currentScene: document.getElementById("currentScene"),
  sceneChoices: document.getElementById("sceneChoices"),
  clues: document.getElementById("clues"),
  hypotheses: document.getElementById("hypotheses"),
  activeFlags: document.getElementById("activeFlags"),
  endingBtn: document.getElementById("endingBtn"),
  resetBtn: document.getElementById("resetBtn"),
  saveBtn: document.getElementById("saveBtn"),
  endingResult: document.getElementById("endingResult")
};

function findScene(sceneId) {
  return CASE_1.scenes.find((scene) => scene.id === sceneId) || null;
}

function findLocation(locationId) {
  return CASE_1.locations.find((loc) => loc.id === locationId) || null;
}

function findClue(clueId) {
  return CASE_1.clues.find((clue) => clue.id === clueId) || null;
}

function usedChoice(sceneId, choiceId) {
  return runtime.usedChoices.includes(`${sceneId}:${choiceId}`);
}

function hasFlag(flagId) {
  return runtime.activeFlags.includes(flagId);
}

function renderBriefing() {
  el.briefingText.innerHTML = `
    <p>${CASE_1.coreTruth.short}</p>
    <p><strong>Ton:</strong> ${CASE_1.tone.join(", ")}</p>
    <p><strong>Narrative:</strong> ${CASE_1.styleGuide.narrativeMood}</p>
  `;
  el.briefingMeta.innerHTML = "";
  [
    CASE_1.caseId,
    CASE_1.title,
    `Laufzeit ca. ${CASE_1.estimatedPlaytimeMin} Min`,
    `Schwierigkeit ${CASE_1.difficulty}`
  ].forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item;
    el.briefingMeta.appendChild(chip);
  });
}

function renderMetrics() {
  const progress = sceneProgress(CASE_1, runtime);
  el.metricScenes.textContent = `${progress.visited}/${progress.total}`;
  el.metricClues.textContent = `${runtime.discoveredClues.length}/${CASE_1.clues.length}`;
  el.metricFlags.textContent = `${runtime.activeFlags.length}`;
  el.progressText.textContent = `${progress.total - progress.visited} Szenen offen, ${CASE_1.clues.length - runtime.discoveredClues.length} Hinweise ungesichert.`;
}

function renderSceneSelect() {
  const previousValue = el.sceneSelect.value;
  el.sceneSelect.innerHTML = "";
  CASE_1.scenes.forEach((scene, idx) => {
    const option = document.createElement("option");
    const unlocked = !scene.requiredFlags || scene.requiredFlags.every((flag) => hasFlag(flag));
    const prevVisited = idx === 0 || runtime.visitedScenes.includes(CASE_1.scenes[idx - 1].id);
    if (!unlocked || !prevVisited) return;

    option.value = scene.id;
    option.textContent = `${scene.id} - ${scene.title}`;
    el.sceneSelect.appendChild(option);
  });

  if (runtime.currentSceneId) {
    el.sceneSelect.value = runtime.currentSceneId;
  }
  if (!el.sceneSelect.value && previousValue) {
    el.sceneSelect.value = previousValue;
  }
  if (!el.sceneSelect.value && el.sceneSelect.options.length > 0) {
    el.sceneSelect.selectedIndex = el.sceneSelect.options.length - 1;
  }
}

function renderCurrentScene() {
  const scene = findScene(runtime.currentSceneId);
  if (!scene) {
    el.currentScene.innerHTML = `<div class="entry">Keine Szene aktiv.</div>`;
    el.sceneChoices.innerHTML = "";
    return;
  }

  const location = findLocation(scene.locationId);
  const intro = (scene.cinematicIntro || []).map((line) => `<p>${line}</p>`).join("");
  const visitedTag = runtime.visitedScenes.includes(scene.id) ? "Wiedereinstieg" : "Neu";
  el.currentScene.innerHTML = `
    <div class="entry">
      <strong>${scene.title}</strong><br>
      <span class="muted">${visitedTag} | ${location ? location.name : "Unbekannter Ort"}</span>
      ${intro}
      <p><strong>Ziel:</strong> ${scene.objective || "Kein Zieltext hinterlegt."}</p>
    </div>
  `;

  el.sceneChoices.innerHTML = "";
  (scene.choices || []).forEach((choice) => {
    const card = document.createElement("div");
    card.className = "entry";
    const done = usedChoice(scene.id, choice.id);
    const response = (choice.response || []).join(" ");
    card.innerHTML = `
      <strong>${choice.prompt}</strong>
      <p class="muted">${response}</p>
    `;

    const button = document.createElement("button");
    button.className = done ? "secondary" : "";
    button.disabled = done;
    button.textContent = done ? "Bereits gewaehlt" : "Auswaehlen";
    button.addEventListener("click", () => {
      runtime = takeChoice(CASE_1, index, runtime, scene.id, choice.id);
      persistAndRender();
    });
    card.appendChild(button);
    el.sceneChoices.appendChild(card);
  });
}

function renderClues() {
  el.clues.innerHTML = "";
  const availableSorted = [...runtime.availableClues].sort();
  if (availableSorted.length === 0) {
    el.clues.innerHTML = `<div class="entry muted">Noch keine Hinweise verfuegbar.</div>`;
    return;
  }

  availableSorted.forEach((clueId) => {
    const clue = findClue(clueId);
    if (!clue) return;
    const discovered = runtime.discoveredClues.includes(clueId);
    const card = document.createElement("div");
    card.className = "entry";
    card.innerHTML = `
      <strong>${clue.id} - ${clue.title}</strong>
      <p>${clue.text}</p>
      <p class="muted">Pflicht: ${clue.mandatory ? "Ja" : "Nein"} | Flags: ${(clue.revealsFlags || []).join(", ")}</p>
    `;

    const button = document.createElement("button");
    button.className = discovered ? "secondary" : "";
    button.disabled = discovered;
    button.textContent = discovered ? "Gesichert" : "Hinweis sichern";
    button.addEventListener("click", () => {
      runtime = collectClue(CASE_1, index, runtime, clueId);
      persistAndRender();
    });

    card.appendChild(button);
    el.clues.appendChild(card);
  });
}

function renderHypotheses() {
  el.hypotheses.innerHTML = "";
  const list = evaluateHypotheses(CASE_1, runtime);
  list.forEach((hyp) => {
    const item = document.createElement("div");
    item.className = "entry";
    item.innerHTML = `
      <strong>${hyp.title}</strong>
      <p>${hyp.summary}</p>
      <p class="muted">Status: ${hyp.status} | Required ${hyp.requiredHits}/${hyp.requiredTotal} | Widersprueche ${hyp.contradictedHits}</p>
    `;
    el.hypotheses.appendChild(item);
  });
}

function renderFlags() {
  el.activeFlags.innerHTML = "";
  if (runtime.activeFlags.length === 0) {
    el.activeFlags.innerHTML = `<div class="entry muted">Noch keine aktiven Flags.</div>`;
    return;
  }
  runtime.activeFlags.forEach((flagId) => {
    const meta = CASE_1.flags.find((flag) => flag.id === flagId);
    const row = document.createElement("div");
    row.className = "entry";
    row.textContent = `${flagId} [${meta?.category || "state"}]`;
    el.activeFlags.appendChild(row);
  });
}

function enterSelectedScene() {
  const sceneId = el.sceneSelect.value;
  if (!sceneId) return;
  runtime = openScene(CASE_1, index, runtime, sceneId);
  persistAndRender();
}

function evaluateCaseEnding() {
  const ending = resolveEnding(CASE_1, runtime);
  if (!ending) {
    el.endingResult.hidden = false;
    el.endingResult.textContent = "Kein Ending konnte bestimmt werden.";
    return;
  }

  let next = runtime;
  if (Array.isArray(ending.rewardFlags) && ending.rewardFlags.length > 0) {
    next = ending.rewardFlags.reduce((acc, flagId) => {
      if (acc.activeFlags.includes(flagId)) return acc;
      return {
        ...acc,
        activeFlags: [...acc.activeFlags, flagId].sort()
      };
    }, runtime);
    runtime = next;
  }

  const hintUnlocked = ending.id === CASE_1.staffelHint.revealedByEnding && hasFlag("staffel_cutpoint_hint");
  const hintText = hintUnlocked ? `<br>${CASE_1.staffelHint.text}` : "";

  el.endingResult.hidden = false;
  el.endingResult.innerHTML = `
    <strong>${ending.id} - ${ending.title}</strong><br>
    ${ending.postText || "Kein Nachtext hinterlegt."}
    ${hintText}
  `;
  saveState(runtime);
  renderFlags();
}

function resetProgress() {
  runtime = createInitialRuntime(CASE_1);
  runtime = openScene(CASE_1, index, runtime, runtime.currentSceneId);
  saveState(runtime);
  el.endingResult.hidden = true;
  renderAll();
}

function saveManual() {
  saveState(runtime);
  const now = new Date();
  el.endingResult.hidden = false;
  el.endingResult.textContent = `Stand gespeichert: ${now.toLocaleString("de-DE")}`;
}

function bindEvents() {
  el.enterSceneBtn.addEventListener("click", enterSelectedScene);
  el.sceneSelect.addEventListener("change", () => {
    runtime.currentSceneId = el.sceneSelect.value;
    saveState(runtime);
    renderCurrentScene();
  });
  el.endingBtn.addEventListener("click", evaluateCaseEnding);
  el.resetBtn.addEventListener("click", resetProgress);
  el.saveBtn.addEventListener("click", saveManual);
}

function renderAll() {
  renderBriefing();
  renderMetrics();
  renderSceneSelect();
  renderCurrentScene();
  renderClues();
  renderHypotheses();
  renderFlags();
}

function saveState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function bootstrap() {
  if (!runtime.currentSceneId) {
    runtime = createInitialRuntime(CASE_1);
  }
  if (!runtime.visitedScenes.includes(runtime.currentSceneId)) {
    runtime = openScene(CASE_1, index, runtime, runtime.currentSceneId);
  }
  bindEvents();
  renderAll();
  registerServiceWorker();
}

bootstrap();
