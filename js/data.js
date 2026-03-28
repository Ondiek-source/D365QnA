/* ═══════════════════════════════════════════════════════════════
   data.js — D365 Practice Platform
   IndexedDB persistence, utility helpers, question bank loader,
   and session builder. No DOM manipulation in this file —
   pure data and logic only.
   Depends on: config.js (must load first)
   ═══════════════════════════════════════════════════════════════ */

/* ── IndexedDB ───────────────────────────────────────────────── */
const DB_NAME = 'PPMasteryV3';
const DB_VER = 2;
const STORE = 'sessions';
const DRAFT_STORE = 'draft';

let _db = null;

function openDB() {
  return new Promise((res, rej) => {
    if (_db) return res(_db);
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE))
        d.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains(DRAFT_STORE))
        d.createObjectStore(DRAFT_STORE, { keyPath: 'id' });
    };
    r.onsuccess = e => { _db = e.target.result; res(_db); };
    r.onerror = e => rej(e);
  });
}

/* ── Session store ───────────────────────────────────────────── */
async function dbSave(rec) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(rec).onsuccess = e => res(e.target.result);
    tx.onerror = e => rej(e);
  });
}

async function dbGetAll() {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).getAll();
    r.onsuccess = e => res(e.target.result || []);
    r.onerror = e => rej(e);
  });
}

async function dbGetById(id) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).get(id);
    r.onsuccess = e => res(e.target.result || null);
    r.onerror = e => rej(e);
  });
}

async function dbClearAll() {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear().onsuccess = () => res();
    tx.onerror = e => rej(e);
  });
}

async function dbDeleteTopic(topicId) {
  const all = await dbGetAll();
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, 'readwrite');
    const st = tx.objectStore(STORE);
    const targets = all.filter(s => s.topicId === topicId);
    if (!targets.length) return res();
    let n = targets.length;
    targets.forEach(s => {
      const r = st.delete(s.id);
      r.onsuccess = () => { if (--n === 0) res(); };
      r.onerror = e => rej(e);
    });
    tx.onerror = e => rej(e);
  });
}

/* ── Draft store (in-progress sessions) ─────────────────────── */
function draftKey(topicId) { return `draft:${topicId}`; }

async function dbSaveDraft(draft) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(DRAFT_STORE, 'readwrite');
    tx.objectStore(DRAFT_STORE)
      .put({ ...draft, id: draftKey(draft.topicId) })
      .onsuccess = () => res();
    tx.onerror = e => rej(e);
  });
}

async function dbGetDraft(topicId) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(DRAFT_STORE, 'readonly');
    const r = tx.objectStore(DRAFT_STORE).get(draftKey(topicId));
    r.onsuccess = e => res(e.target.result || null);
    r.onerror = e => rej(e);
  });
}

async function dbGetAllDrafts() {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(DRAFT_STORE, 'readonly');
    const r = tx.objectStore(DRAFT_STORE).getAll();
    r.onsuccess = e => res(e.target.result || []);
    r.onerror = e => rej(e);
  });
}

async function dbClearDraft(topicId) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(DRAFT_STORE, 'readwrite');
    tx.objectStore(DRAFT_STORE).delete(draftKey(topicId)).onsuccess = () => res();
    tx.onerror = e => rej(e);
  });
}

/* ── Pure utility helpers ────────────────────────────────────── */

/** Format a ratio as a percentage string e.g. 0.75 → "75%" */
function pct(v) { return Math.round(v * 100) + '%'; }

/** Fisher-Yates shuffle — returns a new array, does not mutate. */
function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Wilson score confidence interval for a binomial proportion. */
function wilsonCI(c, t, z = 1.96) {
  if (!t) return { low: 0, mid: 0, high: 0 };
  const p = c / t;
  const d = 1 + z * z / t;
  const ct = p + z * z / (2 * t);
  const s = z * Math.sqrt(p * (1 - p) / t + z * z / (4 * t * t));
  return {
    low: Math.max(0, (ct - s) / d),
    mid: p,
    high: Math.min(1, (ct + s) / d)
  };
}

/** Format seconds as M:SS */
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return `${m}:${sc.toString().padStart(2, '0')}`;
}

/** Escape HTML special characters to prevent XSS in innerHTML. */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Topic profile helpers (depend on CONFIG) ────────────────── */

function getTopicProfile(topicId) {
  return CONFIG.TOPIC_PROFILES?.[topicId] || {};
}

function getSessionMinutes(topicId) {
  return getTopicProfile(topicId).minutes || CONFIG.SESSION_MINUTES;
}

function getSessionCounts(topicId) {
  return { ...CONFIG.COUNTS, ...(getTopicProfile(topicId).counts || {}) };
}

function getTypeWeights(topicId) {
  return { ...CONFIG.TYPE_WEIGHTS, ...(getTopicProfile(topicId).weights || {}) };
}

/* ── Domain inference (used for balanced picking) ────────────── */
function inferDomain(item) {
  const txt = [
    item?.category,
    ...(item?.tags || []),
    item?.title,
    item?.scenarioTitle,
    item?.q,
    item?.instruction
  ].filter(Boolean).join(' ').toLowerCase();
  return txt.includes('entitlement') ? 'entitlements' : 'sla';
}

/* ── Balanced question picker ────────────────────────────────── */
function pickBalanced(pool, count, balance) {
  const items = shuffle(pool || []);
  if (!count || !items.length) return [];
  if (!balance) return items.slice(0, count);

  const domains = Object.keys(balance);
  const chosen = [];
  const used = new Set();
  const byDomain = Object.fromEntries(
    domains.map(d => [d, items.filter(x => inferDomain(x) === d)])
  );
  let remaining = count;

  domains.forEach((d, idx) => {
    const target = idx === domains.length - 1
      ? remaining
      : Math.min(byDomain[d].length, Math.floor(count * balance[d]));
    shuffle(byDomain[d]).slice(0, target).forEach(item => {
      if (used.has(item)) return;
      used.add(item);
      chosen.push(item);
      remaining--;
    });
  });

  if (remaining > 0) {
    items.forEach(item => {
      if (remaining <= 0 || used.has(item)) return;
      used.add(item);
      chosen.push(item);
      remaining--;
    });
  }

  return chosen.slice(0, count);
}

/* ── Balanced case study picker ──────────────────────────────── */
function pickBalancedCaseStudies(pool, targetSubquestions, balance) {
  const scenarios = shuffle(pool || []);
  if (!targetSubquestions || !scenarios.length) return [];

  if (!balance) {
    const picked = []; let total = 0;
    for (const cs of scenarios) {
      if (total >= targetSubquestions) break;
      picked.push(cs);
      total += (cs.questions || []).length;
    }
    return picked;
  }

  const domains = Object.keys(balance);
  const byDomain = Object.fromEntries(
    domains.map(d => [d, scenarios.filter(x => inferDomain(x) === d)])
  );
  const picked = []; const used = new Set();
  let total = 0;

  domains.forEach((d, idx) => {
    let target = idx === domains.length - 1
      ? (targetSubquestions - total)
      : Math.floor(targetSubquestions * balance[d]);
    for (const cs of shuffle(byDomain[d])) {
      if (total >= targetSubquestions || target <= 0) break;
      if (used.has(cs)) continue;
      used.add(cs); picked.push(cs);
      const qn = (cs.questions || []).length;
      total += qn; target -= qn;
    }
  });

  if (total < targetSubquestions) {
    for (const cs of scenarios) {
      if (total >= targetSubquestions) break;
      if (used.has(cs)) continue;
      used.add(cs); picked.push(cs);
      total += (cs.questions || []).length;
    }
  }

  return picked;
}

/* ── Question bank cache ─────────────────────────────────────── */
const _cache = {};

/* ── Setup error modal (shown when fetch fails) ──────────────── */
function showSetupError(file, type = 'questions') {
  document.getElementById('setupModal')?.remove();
  const isFileProtocol = location.protocol === 'file:';
  const isInterview = type === 'interview';
  const label = isInterview ? '⚠ Cannot Load Interview Pack' : '⚠ Cannot Load Questions';
  const structureHint = isInterview
    ? `your-repo/<br>  index.html<br>  Interviewsim/<br>    CE_Technical_Consultant_Interview.json  ✓ must be here`
    : `your-repo/<br>  index.html<br>  Questions/<br>    delegation.json  ✓ must be here`;

  const modal = document.createElement('div');
  modal.id = 'setupModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);max-width:540px;width:100%;padding:32px;position:relative">
      <div style="font-family:Syne,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--wrong);margin-bottom:16px">${label}</div>
      <div style="font-family:Syne,sans-serif;font-size:1.2rem;font-weight:800;margin-bottom:12px">
        ${isFileProtocol
      ? 'Running as a local file — a web server is required'
      : `File not found: <code style="color:var(--accent);font-size:.9em">${file}</code>`}
      </div>
      <div style="font-size:12px;color:var(--muted2);line-height:1.8;margin-bottom:20px">
        ${isFileProtocol ? `
          Browsers block <code style="color:var(--accent)">fetch()</code> requests when opening HTML files directly
          from disk (<code style="color:var(--muted2)">file://</code>). Serve the folder from a local web server.<br><br>
          <strong style="color:var(--text)">Option 1 — VS Code:</strong> Install <em>Live Server</em>, right-click
          <code style="color:var(--accent)">index.html</code> → <em>Open with Live Server</em>.<br><br>
          <strong style="color:var(--text)">Option 2 — Python:</strong><br>
          <code style="display:block;background:var(--surface2);border:1px solid var(--border);padding:10px 14px;margin-top:6px;color:var(--accent3)">cd /path/to/your-repo<br>python -m http.server 8080</code>
          Then open <code style="color:var(--accent)">http://localhost:8080</code>.<br><br>
          <strong style="color:var(--text)">Option 3 — Deploy:</strong> Push to GitHub Pages — it works immediately.
        ` : `
          Make sure <code style="color:var(--accent)">${file}</code> exists at the correct path relative to
          <code style="color:var(--accent)">index.html</code>. File names are case-sensitive on Azure and GitHub Pages.<br><br>
          Expected structure:<br>
          <code style="display:block;background:var(--surface2);border:1px solid var(--border);padding:10px 14px;margin-top:6px;color:var(--accent3)">${structureHint}</code>
        `}
      </div>
      <button onclick="document.getElementById('setupModal').remove()"
        style="font-family:Syne,sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;background:var(--accent);color:#000;border:none;padding:12px 28px;cursor:pointer">
        Got it
      </button>
    </div>`;
  document.body.appendChild(modal);
}

/* ── Question bank loader ────────────────────────────────────── */
async function loadQuestions(topicId) {
  if (_cache[topicId]) return _cache[topicId];
  const topic = CONFIG.TOPICS.find(t => t.id === topicId);
  if (location.protocol === 'file:') {
    showSetupError(topic.file);
    throw new Error('file:// protocol — serve via a web server');
  }
  let res;
  try {
    res = await fetch(topic.file);
  } catch (e) {
    showSetupError(topic.file);
    throw new Error(`Network error loading ${topic.file}: ${e.message}`);
  }
  if (!res.ok) {
    showSetupError(topic.file);
    throw new Error(`HTTP ${res.status} loading ${topic.file}`);
  }
  const data = await res.json();
  _cache[topicId] = data;
  return data;
}

/* ── Interview pack loader ───────────────────────────────────── */
async function fetchInterviewPack(packCfg) {
  if (location.protocol === 'file:') {
    showSetupError(packCfg.file, 'interview');
    throw new Error('file:// protocol — serve via a web server');
  }
  let res;
  try {
    res = await fetch(packCfg.file);
  } catch (e) {
    showSetupError(packCfg.file, 'interview');
    throw new Error(`Network error loading ${packCfg.file}: ${e.message}`);
  }
  if (!res.ok) {
    showSetupError(packCfg.file, 'interview');
    throw new Error(`HTTP ${res.status} loading ${packCfg.file}`);
  }
  return await res.json();
}

/* ── Session builder ─────────────────────────────────────────────
   MCQ and drag-drop are shuffled individually.
   Case study sub-questions stay contiguous as a block —
   the block is inserted at a random position in the final
   queue so the exam still feels varied but never mid-scenario.
────────────────────────────────────────────────────────────────── */
function buildSession(bank, topicId) {
  const counts = getSessionCounts(topicId);
  const weights = getTypeWeights(topicId);
  const balance = getTopicProfile(topicId).balance || null;

  const mcq = pickBalanced(bank.mcq || [], counts.mcq || 0, balance);

  const tfRaw = pickBalanced(bank.tf || [], counts.tf || 0, balance).map(q => ({
    ...q,
    options: ['True', 'False'],
    answer: q.answer === true ? 0 : 1
  }));

  const dd = pickBalanced(bank.dragdrop || [], counts.dragdrop || 0, balance);

  // Case studies — pick whole scenarios then flatten sub-questions
  const csScenarios = pickBalancedCaseStudies(
    bank.casestudy || [],
    counts.casestudy || 0,
    balance
  );
  const csFlat = csScenarios.flatMap(scenario =>
    (scenario.questions || []).map(q => ({
      ...q,
      _type: 'casestudy',
      _scenarioTitle: scenario.scenarioTitle || scenario.title || '',
      _scenarioBody: scenario.scenarioBody || scenario.body || '',
    }))
  );

  // Merge MCQ + TF + DD, shuffle, then splice case study block in at random position
  const base = shuffle([...mcq, ...tfRaw, ...dd]);
  const insertAt = Math.floor(Math.random() * (base.length + 1));
  const queue = [...base.slice(0, insertAt), ...csFlat, ...base.slice(insertAt)];

  const built = queue.map((q, i) => {
    const resolvedType = q._type || (
      (q.pairs || (q.items && q.zones)) ? 'dragdrop' :
        q._scenarioTitle !== undefined ? 'casestudy' :
          (q.options?.length === 2 && q.answer !== undefined &&
            typeof q.answer === 'number' && !q.category) ? 'tf' :
            'mcq'
    );
    const pts = q.pts ?? (
      resolvedType === 'dragdrop'  ? (window.CONFIG?.POINTS?.dragdrop  ?? 25) :
      resolvedType === 'casestudy' ? (window.CONFIG?.POINTS?.casestudy ?? 12.5) :
      resolvedType === 'tf'        ? (window.CONFIG?.POINTS?.tf        ?? 12) :
                                     (window.CONFIG?.POINTS?.mcq       ?? 15)
    );
    return { ...q, _idx: i, _type: resolvedType, pts };
  });

  // Attach scoreMeta so results screen can scale to /1000 correctly
  // regardless of session length or question mix.
  const mcqMax = built.filter(q => q._type === 'mcq' || q._type === 'tf')
                      .reduce((s, q) => s + (q.pts || 0), 0);
  const ddMax  = built.filter(q => q._type === 'dragdrop')
                      .reduce((s, q) => s + (q.pts || 0), 0);
  const csMax  = built.filter(q => q._type === 'casestudy')
                      .reduce((s, q) => s + (q.pts || 0), 0);
  built._meta = { mcqMax, ddMax, csMax };

  return built;
}