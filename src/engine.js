function toSet(value) {
  if (!value) return new Set();
  return new Set(Array.isArray(value) ? value : []);
}

function fromSet(set) {
  return Array.from(set.values()).sort();
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

export function createInitialRuntime(caseData) {
  const firstScene = caseData.scenes[0]?.id || null;
  return {
    activeFlags: [],
    visitedScenes: [],
    usedChoices: [],
    discoveredClues: [],
    availableClues: [],
    log: [],
    currentSceneId: firstScene,
    stepCounter: 0
  };
}

export function hydrateRuntime(caseData, raw) {
  const base = createInitialRuntime(caseData);
  if (!raw || typeof raw !== "object") return base;
  return {
    ...base,
    ...raw,
    activeFlags: normalizeList(raw.activeFlags),
    visitedScenes: normalizeList(raw.visitedScenes),
    usedChoices: normalizeList(raw.usedChoices),
    discoveredClues: normalizeList(raw.discoveredClues),
    availableClues: normalizeList(raw.availableClues),
    log: normalizeList(raw.log),
    currentSceneId: raw.currentSceneId || base.currentSceneId,
    stepCounter: Number.isFinite(raw.stepCounter) ? raw.stepCounter : 0
  };
}

export function buildCaseIndex(caseData) {
  const flagMeta = new Map();
  normalizeList(caseData.flags).forEach((f) => {
    flagMeta.set(f.id, f);
  });

  const sceneById = new Map();
  normalizeList(caseData.scenes).forEach((s, index) => {
    sceneById.set(s.id, { ...s, index });
  });

  const clueById = new Map();
  normalizeList(caseData.clues).forEach((c) => {
    clueById.set(c.id, c);
  });

  return { flagMeta, sceneById, clueById };
}

function flagCategory(caseData, index, flagId) {
  const item = index.flagMeta.get(flagId);
  if (item?.category) return item.category;
  return "state";
}

function categoryScore(caseData, category) {
  const map = caseData.determinism?.categoryPriority || {};
  return map[category] ?? 1;
}

function applyConflictRules(caseData, index, nextFlags, incomingFlag) {
  const conflicts = normalizeList(caseData.determinism?.conflicts);
  const incomingCategory = flagCategory(caseData, index, incomingFlag);
  const incomingScore = categoryScore(caseData, incomingCategory);

  conflicts.forEach((pair) => {
    if (!Array.isArray(pair) || pair.length !== 2) return;
    const [a, b] = pair;
    if (incomingFlag !== a && incomingFlag !== b) return;
    const other = incomingFlag === a ? b : a;
    if (!nextFlags.has(other)) return;

    const otherCategory = flagCategory(caseData, index, other);
    const otherScore = categoryScore(caseData, otherCategory);
    if (incomingScore >= otherScore) {
      nextFlags.delete(other);
    }
  });
}

export function addFlags(caseData, index, runtime, flagIds, source) {
  const next = { ...runtime };
  const nextFlags = toSet(runtime.activeFlags);
  const additions = normalizeList(flagIds);
  if (additions.length === 0) return runtime;

  additions.forEach((flagId) => {
    applyConflictRules(caseData, index, nextFlags, flagId);
    nextFlags.add(flagId);
  });

  const log = [...runtime.log];
  log.push({
    atStep: runtime.stepCounter + 1,
    source: source || "system",
    added: additions
  });

  next.stepCounter = runtime.stepCounter + 1;
  next.activeFlags = fromSet(nextFlags);
  next.log = log.slice(-80);
  return next;
}

function hasAll(flagsSet, list) {
  return normalizeList(list).every((id) => flagsSet.has(id));
}

function hasAny(flagsSet, list) {
  return normalizeList(list).some((id) => flagsSet.has(id));
}

export function isSceneUnlocked(runtime, scene) {
  const flagsSet = toSet(runtime.activeFlags);
  return hasAll(flagsSet, scene.requiredFlags);
}

export function openScene(caseData, index, runtime, sceneId) {
  const scene = index.sceneById.get(sceneId);
  if (!scene) return runtime;
  if (!isSceneUnlocked(runtime, scene)) return runtime;

  const visited = toSet(runtime.visitedScenes);
  const wasVisited = visited.has(sceneId);
  visited.add(sceneId);

  const clues = toSet(runtime.availableClues);
  normalizeList(scene.unlocksClues).forEach((clueId) => clues.add(clueId));

  let next = {
    ...runtime,
    currentSceneId: sceneId,
    visitedScenes: fromSet(visited),
    availableClues: fromSet(clues)
  };

  if (!wasVisited) {
    next = addFlags(caseData, index, next, scene.setsFlags, `scene:${sceneId}`);
  }
  return next;
}

export function takeChoice(caseData, index, runtime, sceneId, choiceId) {
  const scene = index.sceneById.get(sceneId);
  if (!scene) return runtime;
  if (!isSceneUnlocked(runtime, scene)) return runtime;
  const choice = normalizeList(scene.choices).find((c) => c.id === choiceId);
  if (!choice) return runtime;

  const used = toSet(runtime.usedChoices);
  const key = `${sceneId}:${choiceId}`;
  if (used.has(key)) return runtime;
  used.add(key);

  const nextBase = {
    ...runtime,
    usedChoices: fromSet(used)
  };

  return addFlags(caseData, index, nextBase, choice.setsFlags, `choice:${sceneId}:${choiceId}`);
}

export function collectClue(caseData, index, runtime, clueId) {
  const clue = index.clueById.get(clueId);
  if (!clue) return runtime;

  const available = toSet(runtime.availableClues);
  if (!available.has(clueId)) return runtime;

  const discovered = toSet(runtime.discoveredClues);
  if (discovered.has(clueId)) return runtime;
  discovered.add(clueId);

  let next = {
    ...runtime,
    discoveredClues: fromSet(discovered)
  };

  next = addFlags(caseData, index, next, clue.revealsFlags, `clue:${clueId}`);
  return next;
}

export function evaluateHypotheses(caseData, runtime) {
  const flagsSet = toSet(runtime.activeFlags);
  return normalizeList(caseData.hypotheses).map((hyp) => {
    const required = normalizeList(hyp.requiredFlags);
    const strengthenedBy = normalizeList(hyp.strengthenedBy);
    const contradictedBy = normalizeList(hyp.contradictedBy);

    const requiredHits = required.filter((f) => flagsSet.has(f)).length;
    const strengthenedHits = strengthenedBy.filter((f) => flagsSet.has(f)).length;
    const contradictedHits = contradictedBy.filter((f) => flagsSet.has(f)).length;
    const allRequired = requiredHits === required.length && required.length > 0;

    let status = "offen";
    if (allRequired && contradictedHits === 0) status = "stark";
    if (allRequired && contradictedHits > 0) status = "umkaempft";
    if (!allRequired && (requiredHits > 0 || strengthenedHits > 0)) status = "forming";

    return {
      id: hyp.id,
      title: hyp.title,
      summary: hyp.summary,
      status,
      requiredHits,
      requiredTotal: required.length,
      strengthenedHits,
      contradictedHits
    };
  });
}

function matchesConditions(flagsSet, conditions) {
  if (!conditions) return false;
  const allOk = hasAll(flagsSet, conditions.allOf);
  const noneOk = !hasAny(flagsSet, conditions.noneOf);
  const anyList = normalizeList(conditions.anyOf);
  const anyOk = anyList.length === 0 ? true : hasAny(flagsSet, anyList);
  return allOk && noneOk && anyOk;
}

export function resolveEnding(caseData, runtime) {
  const endings = normalizeList(caseData.endings);
  const byId = new Map(endings.map((e) => [e.id, e]));
  const flagsSet = toSet(runtime.activeFlags);
  const priority = normalizeList(caseData.determinism?.endingPriority);

  for (const endingId of priority) {
    const ending = byId.get(endingId);
    if (!ending) continue;
    if (matchesConditions(flagsSet, ending.conditions)) {
      return ending;
    }
  }

  return byId.get(caseData.determinism?.fallbackEndingId) || endings[0] || null;
}

export function sceneProgress(caseData, runtime) {
  const visited = toSet(runtime.visitedScenes);
  const total = normalizeList(caseData.scenes).length;
  return { visited: visited.size, total };
}
