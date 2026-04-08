import { CASE_1 } from "./data/case1.js";

const STORAGE_KEY = "black_knot_case_01_state_v1";

function initialState() {
  return {
    links: [],
    analysis: [],
    operationsDone: [],
    reliability: 28,
    pressure: 44,
    risk: 21
  };
}

let state = loadState() || initialState();

const el = {
  briefingText: document.getElementById("briefingText"),
  briefingMeta: document.getElementById("briefingMeta"),
  openQuestions: document.getElementById("openQuestions"),
  metricReliability: document.getElementById("metricReliability"),
  metricPressure: document.getElementById("metricPressure"),
  metricRisk: document.getElementById("metricRisk"),
  nodes: document.getElementById("nodes"),
  fromNode: document.getElementById("fromNode"),
  toNode: document.getElementById("toNode"),
  linkType: document.getElementById("linkType"),
  addLinkBtn: document.getElementById("addLinkBtn"),
  links: document.getElementById("links"),
  operations: document.getElementById("operations"),
  timeline: document.getElementById("timeline"),
  suspect: document.getElementById("suspect"),
  confidence: document.getElementById("confidence"),
  theory: document.getElementById("theory"),
  solveBtn: document.getElementById("solveBtn"),
  result: document.getElementById("result"),
  analysis: document.getElementById("analysis"),
  saveBtn: document.getElementById("saveBtn")
};

function renderBriefing() {
  const b = CASE_1.briefing;
  el.briefingText.innerHTML = [
    `<p>${b.summary}</p>`,
    `<p><strong>Ziel:</strong> ${b.objective}</p>`
  ].join("");

  el.briefingMeta.innerHTML = "";
  [CASE_1.title, `Falllaufzeit ${CASE_1.runtime}`, ...b.constraints].forEach((txt) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = txt;
    el.briefingMeta.appendChild(chip);
  });
}

function renderNodes() {
  el.nodes.innerHTML = "";
  CASE_1.nodes.forEach((node) => {
    const card = document.createElement("article");
    card.className = "node";
    card.innerHTML = `
      <div class="k">${node.type} | Vertrauen ${node.trust}</div>
      <h3>${node.label}</h3>
      <p>${node.detail}</p>
      <p class="muted" style="margin-top:6px">${node.time} - ${node.source}</p>
    `;
    el.nodes.appendChild(card);
  });
}

function setupLinkControls() {
  CASE_1.nodes.forEach((node) => {
    const a = document.createElement("option");
    a.value = node.id;
    a.textContent = node.label;
    el.fromNode.appendChild(a);
    const b = document.createElement("option");
    b.value = node.id;
    b.textContent = node.label;
    el.toNode.appendChild(b);
  });

  CASE_1.linkTypes.forEach((type) => {
    const o = document.createElement("option");
    o.value = type;
    o.textContent = type;
    el.linkType.appendChild(o);
  });

  el.addLinkBtn.addEventListener("click", () => {
    const from = el.fromNode.value;
    const to = el.toNode.value;
    const type = el.linkType.value;
    if (!from || !to || !type || from === to) return;

    const key = edgeKey(from, to, type);
    if (state.links.some((link) => edgeKey(link.from, link.to, link.type) === key)) return;

    state.links.push({ from, to, type });
    state.reliability = clamp(state.reliability + 2, 0, 100);
    state.pressure = clamp(state.pressure + 1, 0, 100);
    persistAndRender();
  });
}

function renderLinks() {
  el.links.innerHTML = "";
  if (state.links.length === 0) {
    el.links.innerHTML = `<div class="entry muted">Noch keine Verbindungen gesetzt.</div>`;
    return;
  }
  state.links.forEach((link, idx) => {
    const from = nodeLabel(link.from);
    const to = nodeLabel(link.to);
    const entry = document.createElement("div");
    entry.className = "entry";
    entry.innerHTML = `<strong>${from}</strong> -[${link.type}]-> <strong>${to}</strong>`;
    const del = document.createElement("button");
    del.className = "secondary";
    del.style.marginTop = "8px";
    del.textContent = "Entfernen";
    del.addEventListener("click", () => {
      state.links.splice(idx, 1);
      state.reliability = clamp(state.reliability - 1, 0, 100);
      persistAndRender();
    });
    entry.appendChild(del);
    el.links.appendChild(entry);
  });
}

function renderOperations() {
  el.operations.innerHTML = "";
  CASE_1.operations.forEach((op) => {
    const done = state.operationsDone.includes(op.id);
    const btn = document.createElement("button");
    btn.className = "op";
    btn.disabled = done;
    btn.textContent = done ? `${op.label} (ausgefuehrt)` : op.label;
    btn.addEventListener("click", () => {
      if (done) return;
      state.operationsDone.push(op.id);
      state.reliability = clamp(state.reliability + op.effect.reliability, 0, 100);
      state.pressure = clamp(state.pressure + op.effect.pressure, 0, 100);
      state.risk = clamp(state.risk + op.effect.risk, 0, 100);
      state.analysis.unshift(op.unlockAnalysis);
      persistAndRender();
    });
    el.operations.appendChild(btn);
  });
}

function renderTimeline() {
  el.timeline.innerHTML = "";
  CASE_1.timeline.forEach((item) => {
    const event = document.createElement("div");
    event.className = "event";
    event.innerHTML = `<strong>${item.time}</strong> ${item.text}`;
    el.timeline.appendChild(event);
  });
}

function setupVerdict() {
  CASE_1.suspects.forEach((sus) => {
    const o = document.createElement("option");
    o.value = sus.id;
    o.textContent = sus.name;
    el.suspect.appendChild(o);
  });

  el.solveBtn.addEventListener("click", () => {
    const confidence = Number(el.confidence.value || 0);
    const chosen = el.suspect.value;
    const theoryText = (el.theory.value || "").trim();
    const score = evaluateCase(confidence, chosen, theoryText);

    const grade =
      score >= 85 ? "Belastbare Fallthese" :
      score >= 60 ? "Teilaufloesung" :
      "Cold Case";

    el.result.hidden = false;
    el.result.innerHTML = `
      <strong>${grade}</strong><br>
      Ergebniswert: ${score}/100<br>
      Wahrheit: ${CASE_1.debriefTruth.summary}
    `;
  });

  el.saveBtn.addEventListener("click", () => {
    saveState(state);
    state.analysis.unshift("Manuelles Save angelegt.");
    renderAnalysis();
  });
}

function evaluateCase(confidence, chosenSuspect, theoryText) {
  const matched = CASE_1.requiredLinks.filter((need) => hasMatchingLink(need)).length;
  const linkScore = Math.round((matched / CASE_1.requiredLinks.length) * 50);

  const suspectScore = chosenSuspect === CASE_1.debriefTruth.culprit ? 25 : 4;
  const confidenceScore = confidence >= 60 && confidence <= 90 ? 10 : 4;
  const theoryScore = theoryText.length >= 120 ? 15 : theoryText.length >= 45 ? 8 : 2;

  return clamp(linkScore + suspectScore + confidenceScore + theoryScore, 0, 100);
}

function hasMatchingLink(need) {
  return state.links.some((link) => {
    const sameType = link.type === need.type;
    const sameA = link.from === need.a && link.to === need.b;
    const sameB = link.from === need.b && link.to === need.a;
    return sameType && (sameA || sameB);
  });
}

function renderAnalysis() {
  el.analysis.innerHTML = "";

  CASE_1.requiredLinks
    .filter((need) => !hasMatchingLink(need))
    .forEach((need) => {
      const miss = document.createElement("div");
      miss.className = "entry";
      miss.textContent = `Fehlende Kernverbindung: ${need.hint}`;
      el.analysis.appendChild(miss);
    });

  state.analysis.forEach((line) => {
    const info = document.createElement("div");
    info.className = "entry";
    info.textContent = line;
    el.analysis.appendChild(info);
  });

  if (el.analysis.children.length === 0) {
    el.analysis.innerHTML = `<div class="entry muted">Noch keine Hinweise gesammelt.</div>`;
  }
}

function renderMetrics() {
  el.metricReliability.textContent = `${state.reliability}%`;
  el.metricPressure.textContent = `${state.pressure}%`;
  el.metricRisk.textContent = `${state.risk}%`;
}

function renderQuestions() {
  const missing = CASE_1.requiredLinks.filter((need) => !hasMatchingLink(need)).length;
  el.openQuestions.textContent =
    missing === 0
      ? "Alle Kernwidersprueche sind verbunden. Fallthese kann belastbar eingereicht werden."
      : `${missing} Kernverbindungen fehlen noch. Achte auf Zeitversatz, Tunnelzugriff und Funksignal.`;
}

function persistAndRender() {
  saveState(state);
  renderAll();
}

function renderAll() {
  renderMetrics();
  renderQuestions();
  renderLinks();
  renderOperations();
  renderAnalysis();
}

function nodeLabel(id) {
  const n = CASE_1.nodes.find((x) => x.id === id);
  return n ? n.label : id;
}

function edgeKey(a, b, type) {
  const sorted = [a, b].sort();
  return `${sorted[0]}::${type}::${sorted[1]}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
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

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function bootstrap() {
  renderBriefing();
  renderNodes();
  setupLinkControls();
  renderTimeline();
  setupVerdict();
  renderAll();
  registerSW();
}

bootstrap();
