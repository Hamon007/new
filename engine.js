/**
 * SHADOWCASE ENGINE v1.0
 * Determinism Layer: Flag-Prioritäten, Konfliktregeln, Ending-Priority
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. FLAG-SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const FLAG_PRIORITY = {
  // Stufe 5 – Kritische Beweise: unveränderlich, sperren zugehörige Nodes
  CRITICAL:   5,
  // Stufe 4 – Bestätigte Fakten: durch zwei unabhängige Quellen verifiziert
  CONFIRMED:  4,
  // Stufe 3 – Wahrscheinliche Hypothesen: logisch, aber noch anfechtbar
  PROBABLE:   3,
  // Stufe 2 – Schwache Indizien: einzelne Quelle, interpretierbar
  WEAK:       2,
  // Stufe 1 – Rote Heringe / Desinformation: absichtlich irreführend
  NOISE:      1,
};

// Jedes Flag-Objekt im State:
// { id, type, value, priority, source, timestamp, locked, conflicts }

class FlagSystem {
  constructor() {
    this.flags = new Map();
    this.history = [];
    this.conflictLog = [];
  }

  set(id, value, priority = FLAG_PRIORITY.WEAK, source = 'unknown', options = {}) {
    const existing = this.flags.get(id);

    // Conflict Resolution Rule 1: Locked flags können nicht überschrieben werden
    if (existing?.locked) {
      this.conflictLog.push({
        type: 'BLOCKED_LOCKED',
        id, value, priority, source,
        existing: existing.value,
        ts: Date.now()
      });
      return false;
    }

    // Conflict Resolution Rule 2: Niedrigere Priorität kann höhere nicht überschreiben
    if (existing && existing.priority > priority) {
      this.conflictLog.push({
        type: 'PRIORITY_REJECTED',
        id, value, priority, source,
        existingPriority: existing.priority,
        ts: Date.now()
      });
      return false;
    }

    // Conflict Resolution Rule 3: Gleiche Priorität → neuere gewinnt (außer CRITICAL)
    if (existing && existing.priority === priority && priority === FLAG_PRIORITY.CRITICAL) {
      this.conflictLog.push({
        type: 'CRITICAL_CONFLICT',
        id, value, priority, source,
        existing: existing.value,
        ts: Date.now()
      });
      // CRITICAL-Konflikt → beide Werte in conflictLog, Spieler muss auflösen
      existing.conflicted = true;
      existing.conflictValue = value;
      existing.conflictSource = source;
      return 'CONFLICT';
    }

    const flag = {
      id,
      value,
      priority,
      source,
      locked: options.locked || priority === FLAG_PRIORITY.CRITICAL,
      timestamp: Date.now(),
      conflicted: false,
      tags: options.tags || [],
    };

    this.history.push({ action: 'SET', id, prev: existing?.value ?? null, next: value, ts: flag.timestamp });
    this.flags.set(id, flag);
    return true;
  }

  get(id) {
    return this.flags.get(id)?.value ?? null;
  }

  getFlag(id) {
    return this.flags.get(id) ?? null;
  }

  getPriority(id) {
    return this.flags.get(id)?.priority ?? 0;
  }

  isConfirmed(id) {
    const f = this.flags.get(id);
    return f && f.priority >= FLAG_PRIORITY.CONFIRMED && !f.conflicted;
  }

  isCritical(id) {
    const f = this.flags.get(id);
    return f && f.priority === FLAG_PRIORITY.CRITICAL;
  }

  has(id) {
    return this.flags.has(id);
  }

  // Prüft mehrere Flags gleichzeitig (AND-Logik)
  allSet(ids) {
    return ids.every(id => this.has(id));
  }

  // Prüft ob mindestens eines gesetzt ist (OR-Logik)
  anySet(ids) {
    return ids.some(id => this.has(id));
  }

  // Exportiert nur bestätigte Fakten für das Urteilssystem
  getConfirmedFacts() {
    const result = {};
    for (const [id, flag] of this.flags) {
      if (flag.priority >= FLAG_PRIORITY.CONFIRMED && !flag.conflicted) {
        result[id] = flag.value;
      }
    }
    return result;
  }

  resolveConflict(id, chosenValue) {
    const flag = this.flags.get(id);
    if (!flag || !flag.conflicted) return false;
    flag.value = chosenValue;
    flag.conflicted = false;
    flag.conflictValue = undefined;
    this.history.push({ action: 'RESOLVE_CONFLICT', id, chosen: chosenValue, ts: Date.now() });
    return true;
  }

  serialize() {
    return {
      flags: Object.fromEntries(this.flags),
      history: this.history,
      conflictLog: this.conflictLog,
    };
  }

  load(data) {
    this.flags = new Map(Object.entries(data.flags || {}));
    this.history = data.history || [];
    this.conflictLog = data.conflictLog || [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ENDING-PRIORITY-SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ending-Priorität:
 * Jedes Ending hat eine Liste von REQUIRED flags (alle müssen erfüllt sein),
 * FORBIDDEN flags (keines darf gesetzt sein),
 * und eine PRIORITY (höchste gewinnt bei Ambiguität).
 *
 * Endings werden von oben nach unten geprüft.
 * Das erste mit erfüllten Required-Flags und keinen Forbidden-Flags gewinnt.
 * Bei Gleichstand: höchste Priority gewinnt.
 */

class EndingSystem {
  constructor(flagSystem) {
    this.flags = flagSystem;
    this.endings = [];
  }

  register(ending) {
    // ending: { id, label, priority, required, forbidden, partialOk, narrative }
    this.endings.push(ending);
    // Absteigend nach Priority sortieren
    this.endings.sort((a, b) => b.priority - a.priority);
  }

  evaluate() {
    const candidates = [];

    for (const ending of this.endings) {
      const requiredMet = ending.required.every(req => {
        if (typeof req === 'string') return this.flags.has(req);
        if (req.type === 'VALUE') return this.flags.get(req.id) === req.value;
        if (req.type === 'MIN_PRIORITY') return this.flags.getPriority(req.id) >= req.min;
        if (req.type === 'OR') return req.ids.some(id => this.flags.has(id));
        return false;
      });

      const forbiddenClear = !ending.forbidden?.some(f => this.flags.has(f));

      if (requiredMet && forbiddenClear) {
        candidates.push(ending);
      }
    }

    if (candidates.length === 0) return { id: 'UNDECIDED', label: 'Keine Lösung', partial: false };

    // Höchste Priority gewinnt (schon sortiert)
    const winner = candidates[0];

    // Partial-Check: Wenn required erfüllt aber Konflikte existieren
    const hasConflicts = winner.required.some(req => {
      const id = typeof req === 'string' ? req : req.id;
      return this.flags.getFlag(id)?.conflicted;
    });

    return {
      ...winner,
      partial: hasConflicts || !!winner.partialOk,
    };
  }

  // Bewertet Qualität des Urteils (0–100 Score)
  scoreVerdict(playerVerdict) {
    let score = 0;
    const breakdown = [];

    for (const check of playerVerdict.checks || []) {
      const flag = this.flags.getFlag(check.flagId);
      if (!flag) {
        breakdown.push({ id: check.flagId, result: 'MISSING', points: 0 });
        continue;
      }

      const correct = flag.value === check.expectedValue;
      const priorityBonus = correct ? Math.floor(flag.priority * 5) : 0;
      const pts = correct ? (check.basePoints + priorityBonus) : 0;

      score += pts;
      breakdown.push({
        id: check.flagId,
        result: correct ? 'CORRECT' : 'WRONG',
        points: pts,
        flagPriority: flag.priority,
      });
    }

    return { score: Math.min(100, score), breakdown };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. NODE / CLUE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const NODE_TYPES = {
  PERSON:    'person',
  LOCATION:  'location',
  TIME:      'time',
  OBJECT:    'object',
  STATEMENT: 'statement',
  EVENT:     'event',
  PATTERN:   'pattern',
  DOCUMENT:  'document',
};

const LINK_TYPES = {
  CONFIRMED:   { id: 'confirmed',   color: '#4ade80', label: 'Bestätigt' },
  CONTRADICTS: { id: 'contradicts', color: '#f87171', label: 'Widerspricht' },
  SUGGESTS:    { id: 'suggests',    color: '#facc15', label: 'Deutet auf' },
  ENABLES:     { id: 'enables',     color: '#60a5fa', label: 'Ermöglichte' },
  CONCEALS:    { id: 'conceals',    color: '#c084fc', label: 'Verdeckt' },
  MOTIVATED:   { id: 'motivated',   color: '#fb923c', label: 'Motiviert' },
  SAW:         { id: 'saw',         color: '#a3e635', label: 'Sah' },
  FAKED:       { id: 'faked',       color: '#e879f9', label: 'Fälschte' },
};

const SOURCE_TRUST = {
  A: { label: 'Physisch gesichert', color: '#4ade80', numericMin: 0.9 },
  B: { label: 'Glaubwürdig',       color: '#a3e635', numericMin: 0.7 },
  C: { label: 'Interpretierbar',   color: '#facc15', numericMin: 0.5 },
  D: { label: 'Zeuge',             color: '#fb923c', numericMin: 0.3 },
  E: { label: 'Fraglich',          color: '#f87171', numericMin: 0.1 },
  F: { label: 'Desinformation',    color: '#9f1239', numericMin: 0.0 },
};

class Node {
  constructor({ id, type, label, description, trustLevel = 'C', flagsOnReveal = [], locked = false }) {
    this.id = id;
    this.type = type;
    this.label = label;
    this.description = description;
    this.trustLevel = trustLevel;
    this.flagsOnReveal = flagsOnReveal; // [ { id, value, priority, source } ]
    this.locked = locked;
    this.revealed = false;
    this.connections = []; // [ { targetId, linkType, note, flagRequired } ]
    this.x = Math.random() * 600 + 100;
    this.y = Math.random() * 400 + 100;
  }

  reveal(flagSystem) {
    if (this.revealed) return;
    this.revealed = true;
    for (const f of this.flagsOnReveal) {
      flagSystem.set(f.id, f.value, f.priority, f.source, { locked: f.locked });
    }
  }

  connect(targetId, linkType, note = '', flagRequired = null) {
    this.connections.push({ targetId, linkType, note, flagRequired });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CASE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

class CaseEngine {
  constructor(caseData) {
    this.data = caseData;
    this.flags = new FlagSystem();
    this.endings = new EndingSystem(this.flags);
    this.nodes = new Map();
    this.phase = 0; // 0=Briefing, 1=Erkunden, 2=Beweise, 3=Druck, 4=Urteil, 5=Auflösung
    this.operationChoices = [];
    this.startTime = Date.now();
    this.timeLimit = caseData.timeLimitMs || null;

    this._init();
  }

  _init() {
    // Nodes registrieren
    for (const nodeData of this.data.nodes) {
      const node = new Node(nodeData);
      // Verbindungen aufbauen
      for (const conn of nodeData.connections || []) {
        node.connect(conn.targetId, conn.linkType, conn.note, conn.flagRequired);
      }
      this.nodes.set(node.id, node);
    }

    // Endings registrieren
    for (const ending of this.data.endings) {
      this.endings.register(ending);
    }

    // Start-Flags setzen
    for (const f of this.data.startFlags || []) {
      this.flags.set(f.id, f.value, f.priority, 'BRIEFING', { locked: f.locked });
    }

    // Initiale Nodes enthüllen
    for (const id of this.data.startNodes || []) {
      this.revealNode(id);
    }
  }

  revealNode(id) {
    const node = this.nodes.get(id);
    if (!node || node.locked) return false;
    node.reveal(this.flags);

    // Phasen-Transition prüfen
    this._checkPhaseTransition();
    return true;
  }

  // Spieler macht eine Verbindung zwischen zwei Nodes
  makeLink(fromId, toId, linkType) {
    const from = this.nodes.get(fromId);
    const to = this.nodes.get(toId);
    if (!from || !to) return { ok: false, reason: 'NODE_NOT_FOUND' };
    if (!from.revealed || !to.revealed) return { ok: false, reason: 'NODE_NOT_REVEALED' };

    // Prüfe ob diese Verbindung in den Daten vorgesehen ist
    const validConn = from.connections.find(
      c => c.targetId === toId && c.linkType === linkType
    );

    if (!validConn) {
      // Falsche Verbindung — Flag-Penalty
      const existing = this.flags.get('wrong_links') || 0;
      this.flags.set('wrong_links', existing + 1, FLAG_PRIORITY.WEAK, 'PLAYER');
      return { ok: true, correct: false, penalty: true };
    }

    // Korrekte Verbindung → Flags auslösen
    if (validConn.flagOnConnect) {
      const f = validConn.flagOnConnect;
      this.flags.set(f.id, f.value, f.priority, 'PLAYER_DEDUCTION');
    }

    return { ok: true, correct: true };
  }

  // Operative Entscheidung
  chooseOperation(choiceId, optionId) {
    const choice = this.data.operationChoices?.find(c => c.id === choiceId);
    if (!choice) return false;
    const option = choice.options.find(o => o.id === optionId);
    if (!option) return false;

    this.operationChoices.push({ choiceId, optionId, ts: Date.now() });

    for (const f of option.flags || []) {
      this.flags.set(f.id, f.value, f.priority, `OP_CHOICE_${choiceId}`);
    }

    // Nodes freischalten oder sperren
    for (const unlock of option.unlockNodes || []) {
      const node = this.nodes.get(unlock);
      if (node) node.locked = false;
    }
    for (const lock of option.lockNodes || []) {
      const node = this.nodes.get(lock);
      if (node) { node.locked = true; node.revealed = false; }
    }

    return true;
  }

  // Spieler gibt Urteil ab
  submitVerdict(verdict) {
    // verdict: { suspect, motive, method, accomplice, confidence }
    const ending = this.endings.evaluate();
    const score = this.endings.scoreVerdict({
      checks: this.data.verdictChecks || [],
    });

    // Spieler-Urteil gegen Flags prüfen
    const verdictFlags = this._evaluatePlayerVerdict(verdict);

    return {
      ending,
      score,
      verdictFlags,
      conflictLog: this.flags.conflictLog,
      timeElapsed: Date.now() - this.startTime,
    };
  }

  _evaluatePlayerVerdict(verdict) {
    const results = {};
    for (const [key, value] of Object.entries(verdict)) {
      const checkDef = this.data.verdictFields?.[key];
      if (!checkDef) continue;
      const correct = checkDef.correctValues.includes(value);
      results[key] = {
        correct,
        playerValue: value,
        correctValues: correct ? undefined : checkDef.correctValues,
        hint: correct ? null : checkDef.hint,
      };
    }
    return results;
  }

  _checkPhaseTransition() {
    const transitions = this.data.phaseTransitions || [];
    for (const t of transitions) {
      if (t.fromPhase === this.phase && this._conditionMet(t.condition)) {
        this.phase = t.toPhase;
        // Neue Nodes freischalten
        for (const id of t.unlockNodes || []) {
          const node = this.nodes.get(id);
          if (node) node.locked = false;
        }
        return;
      }
    }
  }

  _conditionMet(condition) {
    if (!condition) return true;
    if (condition.type === 'FLAGS_ALL') return this.flags.allSet(condition.ids);
    if (condition.type === 'FLAGS_ANY') return this.flags.anySet(condition.ids);
    if (condition.type === 'REVEALED_COUNT') {
      const count = [...this.nodes.values()].filter(n => n.revealed).length;
      return count >= condition.min;
    }
    return false;
  }

  getState() {
    return {
      phase: this.phase,
      flags: this.flags.serialize(),
      nodes: Object.fromEntries(
        [...this.nodes.entries()].map(([id, n]) => [id, {
          id: n.id, type: n.type, label: n.label, revealed: n.revealed,
          trustLevel: n.trustLevel, x: n.x, y: n.y, connections: n.connections,
        }])
      ),
      operationChoices: this.operationChoices,
    };
  }

  save() {
    return JSON.stringify(this.getState());
  }

  static load(caseData, savedState) {
    const engine = new CaseEngine(caseData);
    const state = JSON.parse(savedState);
    engine.phase = state.phase;
    engine.flags.load(state.flags);
    engine.operationChoices = state.operationChoices;
    for (const [id, saved] of Object.entries(state.nodes)) {
      const node = engine.nodes.get(id);
      if (node) {
        node.revealed = saved.revealed;
        node.x = saved.x;
        node.y = saved.y;
      }
    }
    return engine;
  }
}

// Export für Modul-System
if (typeof module !== 'undefined') {
  module.exports = {
    FlagSystem, EndingSystem, CaseEngine,
    FLAG_PRIORITY, NODE_TYPES, LINK_TYPES, SOURCE_TRUST
  };
}
