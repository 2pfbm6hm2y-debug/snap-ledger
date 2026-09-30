(() => {
'use strict';
const APP_VERSION = '1.10.0';
/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const newId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, '0');
const isoOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayISO = () => isoOf(new Date());
const ymOf = iso => iso.slice(0, 7);
const addMonths = (ym, k) => { let [y, m] = ym.split('-').map(Number); m += k; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + '-' + pad(m); };
const monthLabel = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
const monthShort = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-SG', { month: 'short' });
const daysIn = ym => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
const dayLabel = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' });
const round2 = n => Math.round(n * 100) / 100;
const parseAmt = v => { const n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : NaN; };
const clone = o => JSON.parse(JSON.stringify(o));
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

const ICON = {
  ledger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".6" fill="currentColor"/><circle cx="4" cy="12" r=".6" fill="currentColor"/><circle cx="4" cy="18" r=".6" fill="currentColor"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>',
  budget: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/><path d="M4 19h16"/></svg>',
  cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.8"/><path d="M21 15l-5-5L5 21"/></svg>',
  ok: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.2l2.3 2.3 4.7-5"/></svg>',
  warn: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2.5v4.2"/><circle cx="6" cy="9.3" r=".5" fill="currentColor"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5V7a2 2 0 0 1 2-2h11v3.5"/><rect x="4" y="8.5" width="16" height="10.5" rx="2.5"/><path d="M15.5 13.75h2"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  over: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>'
};

/* ---------- defaults & demo ---------- */
const DEFAULT_CATS = [
  ['food', 'Food & Drinks', 'exp'], ['groceries', 'Groceries', 'exp'], ['transport', 'Transport', 'exp'], ['shopping', 'Shopping', 'exp'],
  ['bills', 'Bills & Utilities', 'exp'], ['home', 'Rent & Home', 'exp'], ['health', 'Health', 'exp'], ['fun', 'Entertainment', 'exp'],
  ['travel', 'Travel', 'exp'], ['subs', 'Subscriptions', 'exp'], ['edu', 'Education', 'exp'], ['gifts', 'Gifts & Giving', 'exp'],
  ['care', 'Personal Care', 'exp'], ['fees', 'Fees & Interest', 'exp'], ['other', 'Other', 'exp'], ['special', 'Special Spending', 'exp'],
  ['salary', 'Salary', 'inc'], ['cashback', 'Cashback & Rewards', 'inc'], ['otherinc', 'Other income', 'inc']
].map(([id, name, type]) => Object.assign({ id, name, type, budget: null }, id === 'special' ? { outside: true } : {}));

function defaultSettings() {
  return { v: 2, cur: 'S$', accounts: [], categories: clone(DEFAULT_CATS), rules: {} };
}
// Ledgers from before v2 get the Special Spending category once. Returns true if settings changed.
function migrate(s) {
  if (!s || (s.v || 1) >= 2) return false;
  const list = s.categories || (s.categories = []);
  if (!list.some(c => c.id === 'special')) {
    let at = -1; list.forEach((c, i) => { if (c.type === 'exp') at = i; });
    list.splice(at + 1, 0, { id: 'special', name: 'Special Spending', type: 'exp', budget: null, outside: true });
  }
  s.v = 2;
  return true;
}

function makeDemo() {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const s = defaultSettings();
  s.accounts = [
    { id: 'demo-a', name: 'Rewards Visa', last4: '4821', kind: 'credit' },
    { id: 'demo-b', name: 'Cashback Mastercard', last4: '0937', kind: 'credit' },
    { id: 'demo-c', name: 'Savings debit', last4: '5520', kind: 'debit' }
  ];
  const budgets = { food: 450, groceries: 300, transport: 160, shopping: 250, bills: 180, subs: 45, fun: 120, care: 60 };
  s.categories.forEach(c => { if (budgets[c.id]) c.budget = budgets[c.id]; });
  const M = {
    food: [['Ya Kun Kaya Toast', 4, 9], ['Toast Box', 5, 11], ['Hawker centre', 4, 9], ['Din Tai Fung', 38, 85], ['GrabFood', 14, 32], ['Starbucks', 6, 10]],
    groceries: [['FairPrice', 18, 95], ['Sheng Siong', 12, 60], ['Cold Storage', 25, 80]],
    transport: [['Bus/MRT', 1.2, 2.4], ['Grab ride', 11, 26], ['Gojek ride', 9, 20]],
    shopping: [['Shopee', 12, 70], ['Uniqlo', 30, 90], ['Muji', 15, 55]],
    fun: [['Golden Village', 14, 30], ['Klook', 25, 60]],
    care: [['Guardian', 8, 30], ['Watsons', 10, 28]]
  };
  const months = {};
  const nowYm = ymOf(todayISO());
  const today = new Date().getDate();
  for (let k = -5; k <= 0; k++) {
    const ym = addMonths(nowYm, k);
    const last = k === 0 ? today : daysIn(ym);
    const txns = [];
    const add = (day, cat, m, amt, acc, type) => { if (day > last) return; txns.push({ id: newId(), d: ym + '-' + pad(day), amt: round2(amt), type: type || 'exp', acc, cat, m, raw: '', src: 'demo', t: Date.now() }); };
    for (let day = 1; day <= last; day++) {
      const n = rnd() < .35 ? 1 : rnd() < .7 ? 2 : 3;
      for (let j = 0; j < n; j++) {
        const cat = pick(['food', 'food', 'food', 'transport', 'transport', 'groceries', 'shopping', 'fun', 'care']);
        if ((cat === 'shopping' || cat === 'fun' || cat === 'care') && rnd() < .6) continue;
        const [m, lo, hi] = pick(M[cat]);
        add(day, cat, m, lo + rnd() * (hi - lo), cat === 'transport' && m === 'Bus/MRT' ? 'demo-c' : pick(['demo-a', 'demo-a', 'demo-b']));
      }
    }
    add(3, 'subs', 'Spotify', 11.98, 'demo-b'); add(8, 'subs', 'Netflix', 22.98, 'demo-b'); add(12, 'subs', 'iCloud+', 4.48, 'demo-a');
    add(14, 'bills', 'Singtel mobile', 42.9, 'demo-a'); add(20, 'bills', 'SP Group', 96 + rnd() * 40, 'demo-c');
    add(26, 'cashback', 'Card cashback', 18 + rnd() * 10, 'demo-b', 'inc');
    add(25, 'salary', 'Salary', 5200, 'demo-c', 'inc');
    if (k === -4) add(18, 'special', 'Sofa', 890, 'demo-b');
    if (k === -2) add(9, 'special', 'Flights to Bali', 486.4, 'demo-a');
    months[ym] = { month: ym, txns };
  }
  // Starting balances, then each card's bill is paid from the savings account on the 12th.
  const first = addMonths(nowYm, -5);
  [['demo-c', 6400], ['demo-a', 0], ['demo-b', 0]].forEach(([acc, bal]) => months[first].txns.push({ id: newId(), d: first + '-01', amt: bal, type: 'adj', acc, cat: '', m: 'Starting balance', raw: '', src: 'demo', t: 0, bal, first: true }));
  for (let k = -4; k <= 0; k++) {
    const ym = addMonths(nowYm, k), prev = addMonths(ym, -1);
    if (k === 0 && today < 12) continue;
    ['demo-a', 'demo-b'].forEach(acc => {
      const owed = months[prev].txns.reduce((n, t) => n + (t.acc !== acc ? 0 : t.type === 'exp' ? t.amt : t.type === 'inc' ? -t.amt : 0), 0);
      if (owed > 0) months[ym].txns.push({ id: newId(), d: ym + '-12', amt: round2(owed), type: 'xfer', acc: 'demo-c', to: acc, cat: '', m: 'Card payment', raw: '', src: 'demo', t: Date.now() });
    });
  }
  s.payFrom = { 'demo-a': 'demo-c', 'demo-b': 'demo-c' };
  return { settings: s, months };
}

/* ---------- state ---------- */
const S = {
  tab: 'ledger',
  month: ymOf(todayISO()),
  mode: 'loading',        // loading | device | memory
  demo: false,
  persisted: null,
  real: { settings: null, months: {} },
  demoData: null,
  filterAcc: null, filterCat: null,
  statsBy: 'cat',
  budgetEdit: false,
  sheet: null,
  imp: { files: [], accountId: lsGet('snapledger:lastCard') || '', text: '', status: 'idle', rows: [], skipped: [], notes: '', error: '', phase: '', stopped: false, source: '', showSource: false }
};
const data = () => S.demo ? S.demoData : S.real;
const st = () => data().settings;
const mo = () => data().months;
const cats = () => (st() && st().categories) || [];
const accts = () => (st() && st().accounts) || [];
const cur = () => (st() && st().cur) || 'S$';
const catById = id => cats().find(c => c.id === id);
const accById = id => accts().find(a => a.id === id);
const catName = id => (catById(id) || { name: 'Uncategorised' }).name;
const accName = id => { const a = accById(id); return a ? a.name + (a.last4 ? ' ••' + a.last4 : '') : 'No card'; };
const monthTx = ym => (mo()[ym] && mo()[ym].txns) || [];
const kindOf = t => t.type === 'xfer' ? 'xfer' : t.type === 'adj' ? 'adj' : t.type === 'inc' ? 'inc' : (t.amt < 0 ? 'ref' : 'exp');
const accShort = id => (accById(id) || { name: 'No card' }).name;
const isOutside = id => { const c = catById(id); return !!(c && c.outside); };
const budgetCats = () => cats().filter(c => c.type === 'exp' && !c.outside && c.budget > 0);
const allTx = () => Object.values(mo()).reduce((a, m) => a.concat((m && m.txns) || []), []);
const isLiab = a => !!a && a.kind === 'credit';
const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: iso.slice(0, 4) === todayISO().slice(0, 4) ? undefined : 'numeric' });
const money = (n, dp = 2) => (n < 0 ? '−' : '') + cur() + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const txCount = () => Object.values(mo()).reduce((n, m) => n + ((m && m.txns) || []).length, 0);

/* ---------- storage: IndexedDB on this device ---------- */
const IDB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      let r;
      try { r = indexedDB.open('snapledger', 1); } catch (e) { rej(e); return; }
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('kv')) r.result.createObjectStore('kv'); };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
      r.onblocked = () => rej(new Error('blocked'));
    });
  },
  store(mode) { return this.db.transaction('kv', mode).objectStore('kv'); },
  req(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  set(k, v) { return this.req(this.store('readwrite').put(v, k)); },
  async entries() {
    const s = this.store('readonly');
    const [keys, vals] = await Promise.all([this.req(s.getAllKeys()), this.req(s.getAll())]);
    return keys.map((k, i) => [k, vals[i]]);
  },
  replaceAll(pairs) {
    return new Promise((res, rej) => {
      const t = this.db.transaction('kv', 'readwrite'), s = t.objectStore('kv');
      s.clear();
      pairs.forEach(([k, v]) => s.put(v, k));
      t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  }
};
const Store = {
  async init() {
    try {
      await IDB.open();
      S.mode = 'device';
      const all = await IDB.entries();
      let settings = null; const months = {};
      all.forEach(([k, v]) => { if (k === 'settings') settings = v; else if (String(k).startsWith('month:')) months[String(k).slice(6)] = v; });
      if (settings) { const changed = migrate(settings); S.real = { settings, months }; S.demo = false; if (changed) saveSettings(); render(); }
      else enterDemo();
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(p => { S.persisted = p; }).catch(() => {});
    } catch (e) {
      S.mode = 'memory';
      enterDemo();
      showFatal("This browser won't let the app save anything (Private Browsing may be on). Open it from your home screen or turn Private Browsing off.");
    }
  },
  setSettings(obj) { return S.mode === 'device' ? IDB.set('settings', obj) : Promise.resolve(); },
  setMonth(ym, obj) { return S.mode === 'device' ? IDB.set('month:' + ym, obj) : Promise.resolve(); },
  replaceAll(settings, months) {
    if (S.mode !== 'device') return Promise.resolve();
    return IDB.replaceAll([['settings', settings]].concat(Object.keys(months).map(ym => ['month:' + ym, months[ym]])));
  }
};
let queue = Promise.resolve();
function enqueue(fn) {
  queue = queue.then(fn).catch(() => { toast("Couldn't save that change on this phone. Try again."); });
  return queue;
}
function saveSettings() { if (S.demo) return; const snap = clone(S.real.settings); enqueue(() => Store.setSettings(snap)); }
function saveMonth(ym) { if (S.demo) return; const snap = { month: ym, txns: clone(monthTx(ym)) }; enqueue(() => Store.setMonth(ym, snap)); }

function enterDemo() {
  S.demoData = S.demoData || makeDemo();
  S.demo = true;
  render();
}
function startLedger() {
  S.real.settings = defaultSettings();
  S.real.months = {};
  S.demo = false;
  S.filterAcc = null; S.filterCat = null;
  saveSettings();
  S.tab = 'cards';
  render();
  openSheet({ kind: 'card', id: null, first: true });
}
function showFatal(msg) {
  S.fatal = msg || 'Something went wrong. Close the app and open it again.';
  renderBanner();
}

/* ---------- backup ---------- */
async function shareFile(name, text, type) {
  const file = new File([text], name, { type });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return true; }
  } catch (e) { if (e && e.name === 'AbortError') return false; }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
}
async function backupNow() {
  if (S.demo) { toast('Start your ledger first. The example data has nothing to back up.'); return; }
  const body = JSON.stringify({ app: 'snapledger', v: 1, exported: new Date().toISOString(), settings: S.real.settings, months: S.real.months });
  const ok = await shareFile('snap-ledger-backup-' + todayISO() + '.json', body, 'application/json');
  if (ok) { S.real.settings.lastBackup = todayISO(); saveSettings(); if (S.sheet && S.sheet.kind === 'settings') renderSheet(); toast('Backup ready. Save it to Files or iCloud Drive.'); }
}
async function readBackup(file) {
  try {
    const j = JSON.parse(await file.text());
    if (!j || j.app !== 'snapledger' || !j.settings || typeof j.months !== 'object') throw new Error('shape');
    if (!Array.isArray(j.settings.categories) || !Array.isArray(j.settings.accounts)) throw new Error('shape');
    const n = Object.values(j.months).reduce((c, m) => c + ((m && m.txns) || []).length, 0);
    openSheet({ kind: 'restore', backup: j, count: n });
  } catch (e) { toast("That file isn't a Snap Ledger backup."); }
}
async function restoreBackup(j) {
  const settings = clone(j.settings), months = {};
  migrate(settings);
  Object.keys(j.months).forEach(ym => { if (/^\d{4}-\d{2}$/.test(ym) && j.months[ym] && Array.isArray(j.months[ym].txns)) months[ym] = { month: ym, txns: clone(j.months[ym].txns) }; });
  try { await Store.replaceAll(settings, months); }
  catch (e) { toast("Couldn't restore on this phone. Try again."); return; }
  S.real = { settings, months }; S.demo = false; S.filterAcc = null; S.filterCat = null;
  closeSheet(); S.tab = 'ledger'; render(); toast('Backup restored.');
}

/* ---------- aggregation ---------- */
function spendByCat(ym, accFilter) {
  const m = {};
  monthTx(ym).forEach(t => { if (t.type !== 'exp') return; if (accFilter && t.acc !== accFilter) return; m[t.cat] = (m[t.cat] || 0) + t.amt; });
  return m;
}
function spendByAcc(ym) {
  const m = {};
  monthTx(ym).forEach(t => { if (t.type !== 'exp') return; m[t.acc] = (m[t.acc] || 0) + t.amt; });
  return m;
}
function totals(list) {
  let spent = 0, income = 0;
  list.forEach(t => { if (t.type === 'exp') spent += t.amt; else if (t.type === 'inc') income += t.amt; });
  return { spent: round2(spent), income: round2(income) };
}
function elapsedFrac(ym) {
  const now = ymOf(todayISO());
  if (ym < now) return 1;
  if (ym > now) return 0;
  return new Date().getDate() / daysIn(ym);
}
// Over: past the month's budget. At risk: within budget but above the run rate (budget spread
// evenly over the month, up to today). On track: at or under the run rate.
function budgetStatus(spent, budget, frac) {
  if (!(budget > 0)) return null;
  const runRate = budget * Math.min(1, Math.max(0, frac));
  if (spent > budget + 0.004) return { k: 'bad', rank: 0, icon: ICON.over, label: 'Over', over: spent - budget, runRate };
  if (frac < 1 && spent > runRate + 0.004) return { k: 'warn', rank: 1, icon: ICON.warn, label: 'At risk', ahead: spent - runRate, runRate };
  return { k: 'good', rank: 2, icon: ICON.ok, label: frac >= 1 ? 'Within budget' : 'On track', under: runRate - spent, runRate };
}
// Right-hand note under a budget bar, by status.
function statusNote(stt, left, isNow, daysLeft) {
  if (stt.k === 'bad') return `<span class="t-bad">Over by <span class="num">${money(stt.over, 0)}</span></span>`;
  if (stt.k === 'warn') return `<span class="t-warn"><span class="num">${money(stt.ahead, 0)}</span> above run rate</span>`;
  return `<span class="num">${money(left, 0)}</span> left${isNow && daysLeft > 0 ? ` · <span class="num">${money(left / daysLeft, 0)}</span>/day` : ''}`;
}

/* ---------- balances ----------
   An account's balance starts from the latest figure you entered from your bank app. That figure is
   kept on a balance entry (type 'adj', figure in .bal). Entries dated after that day, or dated the
   same day and added after it, move the balance. Anything dated earlier is taken as already in the
   bank's figure, and anything dated after today hasn't happened yet. Balances are kept as net worth:
   accounts positive, card debt negative. shown() turns that into what the bank app shows. */
const sameOrAfter = (t, cp) => t.d > cp.d || (t.d === cp.d && (t.t || 0) > (cp.t || 0));
const shown = (a, v) => isLiab(a) ? -v : v;
function flowOf(t, id) {
  if (t.type === 'exp') return t.acc === id ? -t.amt : 0;
  if (t.type === 'inc') return t.acc === id ? t.amt : 0;
  if (t.type === 'xfer') return (t.to === id ? t.amt : 0) - (t.acc === id ? t.amt : 0);
  return 0;
}
function balances() {
  const all = allTx(), out = {}, today = todayISO();
  all.forEach(t => { if (t.type === 'adj' && isFinite(t.bal) && accById(t.acc)) { const o = out[t.acc]; if (!o || sameOrAfter(t, o.cp)) out[t.acc] = { cp: t, v: 0 }; } });
  Object.keys(out).forEach(id => {
    const cp = out[id].cp; let v = cp.bal;
    all.forEach(t => { if (t.type !== 'adj' && t.d <= today && (t.acc === id || t.to === id) && sameOrAfter(t, cp)) v += flowOf(t, id); });
    out[id].v = round2(v);
  });
  return out;
}
// How a correction reads: the change in what the bank app shows.
function adjText(t) {
  if (t.first) return 'Start';
  const d = round2(shown(accById(t.acc), t.amt));
  return Math.abs(d) < 0.005 ? 'Matched' : (d > 0 ? '+' : '') + money(d);
}
function balDiffNote(id, x) {
  const a = accById(id), b = balances()[id];
  if (!b) return '';
  if (!isFinite(x)) return 'Enter the figure to see the difference.';
  const diff = round2(x - shown(a, b.v));
  if (Math.abs(diff) < 0.005) return '<span class="t-good">Matches. Saving records the check.</span>';
  return `${isLiab(a) ? 'You owe' : 'Your bank shows'} <b class="num">${money(Math.abs(diff))}</b> ${diff > 0 ? 'more' : 'less'} than expected. Saving adds a correction for the difference.`;
}
function saveBalance() {
  const a = S.sheet && accById(S.sheet.id); if (!a) return;
  const x = parseAmt($('#b-val').value);
  if (!isFinite(x)) return toast('Enter the figure from your bank app.');
  const b = balances()[a.id], bal = round2(isLiab(a) ? -x : x), amt = b ? round2(bal - b.v) : bal;
  const d = todayISO(), ym = ymOf(d);
  if (!mo()[ym]) mo()[ym] = { month: ym, txns: [] };
  const rec = { id: newId(), d, amt, type: 'adj', acc: a.id, cat: '', m: !b ? 'Starting balance' : Math.abs(amt) < 0.005 ? 'Balance check' : 'Balance correction', raw: '', src: 'balance', t: Date.now(), bal };
  if (!b) rec.first = true;
  mo()[ym].txns.push(rec); saveMonth(ym);
  closeSheet(); render();
  toast(!b ? 'Balance set.' : Math.abs(amt) < 0.005 ? 'Balance matches.' : 'Correction added.');
}
// Transfers: which account usually pays a card or tops up a wallet, and where an outgoing payment went.
function suggestFrom(to) {
  const pf = (st().payFrom || {})[to];
  if (pf && pf !== to && accById(pf)) return pf;
  const a = accts().find(x => x.id !== to && x.kind === 'debit') || accts().find(x => x.id !== to && !isLiab(x));
  return a ? a.id : '';
}
function suggestTo(from, raw, kind) {
  const others = accts().filter(a => a.id !== from);
  const up = String(raw || '').toUpperCase();
  if (up) {
    const words = n => String(n).toUpperCase().split(/[^A-Z0-9]+/).filter(w => w.length >= 3 && !/^(CARD|CREDIT|DEBIT|BANK|ACCOUNT|THE|VISA|MASTERCARD|PLATINUM|SAVINGS|WALLET|CASH|GOLD|REWARDS|CASHBACK)$/.test(w));
    const hits = others.map(a => ({ a, n: words(a.name).filter(w => up.includes(w)).length })).filter(h => h.n).sort((x, y) => y.n - x.n);
    if (hits.length && (hits.length === 1 || hits[0].n > hits[1].n)) return hits[0].a.id;
  }
  if (kind === 'topup') { const w = others.filter(a => a.kind === 'wallet'); if (w.length === 1) return w[0].id; }
  const paid = Object.keys(st().payFrom || {}).filter(to => st().payFrom[to] === from && to !== from && accById(to));
  if (paid.length === 1) return paid[0];
  if (raw !== undefined) return '';
  const c = others.find(isLiab) || others[0];
  return c ? c.id : '';
}
function rememberPayFrom(from, to) { if (!accById(from) || !accById(to)) return; (st().payFrom || (st().payFrom = {}))[to] = from; }

/* ---------- quick picks when adding by hand ----------
   Merchants you've used, ranked by how often and how recently. Each one remembers the category and
   card you usually pair with it (the most common pair in its last 8 uses, ties to the latest). */
function merchantIndex() {
  const now = Date.now(), map = new Map();
  allTx().forEach(t => {
    if ((t.type !== 'exp' && t.type !== 'inc') || !t.m) return;
    const k = t.m.trim().toLowerCase(); if (!k || k === 'unnamed') return;
    const age = (now - new Date(t.d + 'T00:00:00')) / 864e5;
    let e = map.get(k); if (!e) map.set(k, e = { k, score: 0, uses: [] });
    e.score += age <= 60 ? 1 : age <= 180 ? 0.5 : 0.2;
    e.uses.push(t);
  });
  return [...map.values()].map(e => {
    e.uses.sort((a, b) => b.d.localeCompare(a.d) || (b.t || 0) - (a.t || 0));
    const tally = {};
    e.uses.slice(0, 8).forEach((t, i) => { const key = [t.type, t.cat, t.acc].join('|'); tally[key] = (tally[key] || 0) + 1 - i * 0.01; });
    const [type, cat, acc] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0].split('|');
    return { name: e.uses[0].m.trim(), key: e.k, score: e.score, latest: e.uses[0].d, type, cat, acc };
  }).filter(x => catById(x.cat) && accById(x.acc)).sort((a, b) => b.score - a.score || b.latest.localeCompare(a.latest));
}
// Top picks for an empty box; otherwise names starting with what you typed, then words starting with it, then anything containing it.
function suggFor(q) {
  const s = S.sheet || {}, all = s.mIndex || (s.mIndex = merchantIndex());
  q = (q || '').trim().toLowerCase();
  if (!q) return all.slice(0, 8);
  const starts = [], words = [], has = [];
  all.forEach(x => { if (x.key.startsWith(q)) starts.push(x); else if (x.key.split(/[^a-z0-9]+/).some(w => w.startsWith(q))) words.push(x); else if (x.key.includes(q)) has.push(x); });
  return starts.concat(words, has).slice(0, 8);
}
function suggHtml(list) {
  if (S.sheet) S.sheet.sugg = list;
  if (!list.length) return '';
  return `<div class="chips sugg" role="group" aria-label="Merchants you use often">${list.map((x, i) => `<button type="button" class="chip" data-act="sugg" data-k="${i}" aria-label="${esc(x.name)}, ${esc(catName(x.cat))}, ${esc(accShort(x.acc))}">${esc(x.name)}</button>`).join('')}</div>`;
}
function applySugg(x) {
  $('#f-m').value = x.name;
  const kind = $('#f-kind'), type = x.type === 'inc' ? 'inc' : 'exp';
  if (type === 'inc') kind.value = 'inc'; else if (kind.value !== 'ref') kind.value = 'exp';
  $('#f-cat').innerHTML = catOptions(type, x.cat);
  $('#f-acc').value = x.acc;
  ['#f-cat', '#f-acc'].forEach(sel => { const e = $(sel); e.classList.remove('filled'); void e.offsetWidth; e.classList.add('filled'); });
  $('#f-sugg').innerHTML = '';
  const a = $('#f-amt'); if (a && !a.value) a.focus();
}

/* ---------- options ---------- */
const catOptions = (type, sel) => cats().filter(c => c.type === type).map(c => `<option value="${esc(c.id)}"${c.id === sel ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
const accOptions = sel => accts().map(a => `<option value="${esc(a.id)}"${a.id === sel ? ' selected' : ''}>${esc(a.name)}${a.last4 ? ' ••' + esc(a.last4) : ''}</option>`).join('');
const pickOptions = sel => `<option value=""${sel ? '' : ' selected'}>Pick…</option>` + accOptions(sel);
const kindOptions = (sel, withX) => [['exp', 'Expense'], ['ref', 'Refund'], ['inc', 'Income']].concat(withX ? [['xfer', 'Transfer']] : []).map(([v, l]) => `<option value="${v}"${v === sel ? ' selected' : ''}>${l}</option>`).join('');
const firstCat = type => (cats().find(c => c.type === type) || {}).id || '';

/* ---------- render: chrome ---------- */
function renderTop() {
  if (S.tab === 'import' || S.tab === 'budget' || S.tab === 'cards') {
    $('#top').innerHTML = `<span></span><div class="top-title">${S.tab === 'import' ? 'Scan a statement' : S.tab === 'budget' ? 'Budgets' : 'Cards'}</div><button class="icon-btn" data-act="settings" aria-label="Settings">${ICON.gear}</button>`;
    return;
  }
  $('#top').innerHTML = `<span class="brand" aria-hidden="true"></span>
    <div class="month">
      <button class="icon-btn" data-act="month" data-k="-1" aria-label="Previous month">${ICON.prev}</button>
      <button class="month-lab" data-act="this-month" title="Jump to this month">${esc(monthLabel(S.month))}</button>
      <button class="icon-btn" data-act="month" data-k="1" aria-label="Next month">${ICON.next}</button>
    </div>
    <button class="icon-btn" data-act="settings" aria-label="Settings">${ICON.gear}</button>`;
}
function renderBanner() {
  let h = '';
  if (S.fatal) h += `<div class="err">${esc(S.fatal)}</div>`;
  if (S.mode === 'device' && S.demo) {
    h += `<div class="banner wrap"><span><b>Example data.</b> Nothing here is yours or saved.</span>
      <span class="banner-acts"><label class="btn small" for="restore-file">Restore backup</label><button class="btn small primary" data-act="start">Start my ledger</button></span></div>`;
  }
  $('#banner').innerHTML = h;
}
function renderTabs() {
  const t = [['ledger', 'Ledger'], ['stats', 'Stats'], ['import', 'Scan'], ['budget', 'Budget'], ['cards', 'Cards']];
  $('#tabs').innerHTML = t.map(([id, l]) => id === 'import'
    ? `<button class="tab scan${S.tab === id ? ' on' : ''}" data-act="tab" data-tab="${id}" aria-current="${S.tab === id ? 'page' : 'false'}"><span class="disc">${ICON.scan}</span>${l}</button>`
    : `<button class="tab${S.tab === id ? ' on' : ''}" data-act="tab" data-tab="${id}" aria-current="${S.tab === id ? 'page' : 'false'}">${ICON[id]}${l}</button>`).join('');
  $('#fab').hidden = !(S.tab === 'ledger' && st());
}
function render() {
  renderTop(); renderBanner(); renderTabs();
  const v = $('#view');
  if (!st()) { v.innerHTML = '<div class="loading">Loading your ledger…</div>'; return; }
  v.innerHTML = S.tab === 'ledger' ? vLedger() : S.tab === 'stats' ? vStats() : S.tab === 'budget' ? vBudget() : S.tab === 'cards' ? vCards() : vImport();
}
function onData() {
  if (S.tab === 'import' && S.imp.status !== 'idle') { renderBanner(); return; }
  if (S.tab === 'budget') { renderBanner(); return; }
  render();
}

/* ---------- views ---------- */
function vLedger() {
  const all = monthTx(S.month);
  const list = all.filter(t => (!S.filterAcc || t.acc === S.filterAcc || t.to === S.filterAcc) && (!S.filterCat || t.cat === S.filterCat))
    .sort((a, b) => b.d.localeCompare(a.d) || (b.t || 0) - (a.t || 0));
  // Spent counts the monthly budget's categories, unless you're looking at one category.
  const tt = totals(list.filter(t => S.filterCat || !isOutside(t.cat)));
  const spec = S.filterCat ? 0 : round2(list.reduce((n, t) => n + (t.type === 'exp' && isOutside(t.cat) ? t.amt : 0), 0));
  const bCats = budgetCats();
  const budgetTotal = bCats.reduce((s, c) => s + c.budget, 0);
  const sp = spendByCat(S.month);
  const left = budgetTotal - bCats.reduce((s, c) => s + (sp[c.id] || 0), 0);
  let h = `<div class="summary">
    <div class="fig"><div class="k">Spent</div><div class="v">${money(tt.spent)}</div></div>
    <div class="fig"><div class="k">Income</div><div class="v good">${money(tt.income)}</div></div>
    <div class="fig"><div class="k">Budget left</div><div class="v ${budgetTotal ? (left < 0 ? 'bad' : '') : ''}">${budgetTotal ? money(left) : '—'}</div></div>
  </div>${spec > 0.004 ? `<p class="sum-note">Plus <span class="num">${money(spec)}</span> outside the monthly budget.</p>` : ''}`;
  // Two filter rows: cards, then categories. The chosen chip moves next to "All" so it's always in view.
  const selFirst = (items, sel) => sel ? items.filter(x => x.id === sel).concat(items.filter(x => x.id !== sel)) : items;
  const accChips = selFirst(accts().map(a => ({ id: a.id, label: a.name })), S.filterAcc);
  const catSpend = {};
  all.forEach(t => { if ((t.type === 'exp' || t.type === 'inc') && (!S.filterAcc || t.acc === S.filterAcc)) catSpend[t.cat] = (catSpend[t.cat] || 0) + Math.abs(t.amt); });
  if (S.filterCat && !catSpend[S.filterCat]) catSpend[S.filterCat] = 0;
  // Categories with entries this month, in your order from Settings.
  const known = cats().filter(c => c.id in catSpend).map(c => ({ id: c.id, label: c.name }));
  const orphan = Object.keys(catSpend).filter(id => !catById(id)).map(id => ({ id, label: catName(id) }));
  const catChips = selFirst(known.concat(orphan), S.filterCat);
  h += `<div class="chips" role="group" aria-label="Filter by card">
    <button class="chip${!S.filterAcc ? ' on' : ''}" data-act="filter-acc" data-id="">All cards</button>
    ${accChips.map(c => `<button class="chip${S.filterAcc === c.id ? ' on' : ''}" data-act="filter-acc" data-id="${esc(c.id)}">${esc(c.label)}</button>`).join('')}
  </div>`;
  if (catChips.length) h += `<div class="chips" role="group" aria-label="Filter by category">
    <button class="chip${!S.filterCat ? ' on' : ''}" data-act="filter-cat" data-id="">All categories</button>
    ${catChips.map(c => `<button class="chip${S.filterCat === c.id ? ' on' : ''}" data-act="filter-cat" data-id="${esc(c.id)}">${esc(c.label)}</button>`).join('')}
  </div>`;
  if (!list.length) {
    return h + `<div class="empty"><b>Nothing in ${esc(monthLabel(S.month))} yet</b>Scan a statement, or add one with the + button.</div>`;
  }
  const groups = [];
  list.forEach(t => { const g = groups[groups.length - 1]; if (g && g.d === t.d) g.items.push(t); else groups.push({ d: t.d, items: [t] }); });
  h += groups.map(g => {
    const dayNet = g.items.reduce((s, t) => s + (t.type === 'exp' ? t.amt : 0), 0);
    return `<section class="day" id="day-${esc(g.d)}"><div class="day-h"><span>${esc(dayLabel(g.d))}</span><span class="num">${money(dayNet)}</span></div>
      ${g.items.map(t => {
        const k = kindOf(t), open = `<button class="tx" data-act="edit-tx" data-id="${esc(t.id)}" data-ym="${esc(ymOf(t.d))}">`;
        if (k === 'xfer') return `${open}<span class="tx-cat">Transfer</span>
          <span class="tx-main"><span class="tx-m">${esc(t.m || 'Transfer')}</span><span class="tx-acc">${esc(accShort(t.acc))} → ${esc(accShort(t.to))}</span></span>
          <span class="tx-amt xfer">${money(t.amt)}</span></button>`;
        if (k === 'adj') { const a = accById(t.acc); return `${open}<span class="tx-cat">Balance</span>
          <span class="tx-main"><span class="tx-m">${esc(t.m || 'Balance correction')}</span><span class="tx-acc">${esc(accShort(t.acc))} · ${isLiab(a) ? 'owed' : 'balance'} ${money(shown(a, t.bal))}</span></span>
          <span class="tx-amt adj">${esc(adjText(t))}</span></button>`; }
        return `<button class="tx" data-act="edit-tx" data-id="${esc(t.id)}" data-ym="${esc(ymOf(t.d))}">
          <span class="tx-cat">${esc(catName(t.cat))}</span>
          <span class="tx-main"><span class="tx-m">${esc(t.m || catName(t.cat))}</span><span class="tx-acc">${esc(accName(t.acc))}${k === 'ref' ? ' · Refund' : ''}</span></span>
          <span class="tx-amt ${k}">${k === 'inc' ? '+' : ''}${money(k === 'ref' ? Math.abs(t.amt) : t.amt)}</span>
        </button>`;
      }).join('')}</section>`;
  }).join('');
  return h;
}

function vStats() {
  const ym = S.month;
  const seg = `<div class="seg" role="group" aria-label="Group by"><button class="${S.statsBy === 'cat' ? 'on' : ''}" data-act="stats-by" data-by="cat">Category</button><button class="${S.statsBy === 'acc' ? 'on' : ''}" data-act="stats-by" data-by="acc">Card</button></div>`;
  return S.statsBy === 'cat' ? statsByCategory(ym, seg) + specialYear(ym) : statsByCard(ym, seg) + trendSection(ym, null);
}
// Six months up to this one. sel: 'all' (every budgeted category), a category id, or null (all spending
// inside the monthly budget, when no budgets are set). The budget, when there is one, is a dashed line.
function trendSection(ym, sel) {
  const months = []; for (let k = -5; k <= 0; k++) months.push(addMonths(ym, k));
  const bIds = new Set(budgetCats().map(c => c.id));
  const inSel = sel === 'all' ? (id => bIds.has(id)) : sel ? (id => id === sel) : (id => !isOutside(id));
  const vals = months.map(m => { const sp = spendByCat(m); return Object.keys(sp).reduce((n, id) => n + (inSel(id) ? sp[id] : 0), 0); });
  const budget = sel === 'all' ? budgetCats().reduce((n, c) => n + c.budget, 0) : sel ? ((catById(sel) || {}).budget || 0) : 0;
  const max = Math.max(1, budget, ...vals);
  const avg = vals.slice(0, 5).filter(v => v > 0);
  const avgV = avg.length ? avg.reduce((n, v) => n + v, 0) / avg.length : 0;
  const label = sel === 'all' ? 'All budgeted categories' : sel ? catName(sel) : 'All spending';
  const notes = [];
  if (avgV) notes.push(`Average of the months before: <span class="num">${money(avgV, 0)}</span>.`);
  if (budget) notes.push(`Dashed line: budget of <span class="num">${money(budget, 0)}</span> a month${vals.some(v => v > budget + 0.004) ? '. Red bars are over it.' : '.'}`);
  return `<section class="sec" id="trend"><div class="sec-h"><h2>Six-month trend</h2><span class="muted" style="font-size:13px">${esc(label)}</span></div>
    <div class="trend">${months.map((m, i) => `<button class="tb${m === ym ? ' cur' : ''}${budget && vals[i] > budget + 0.004 ? ' over' : ''}" data-act="goto-month" data-ym="${m}" aria-label="${esc(monthLabel(m))}: ${money(vals[i], 0)}${budget ? ' of ' + money(budget, 0) : ''}">
      <span class="tb-val" style="bottom:${(vals[i] / max * 100).toFixed(1)}%">${money(vals[i], 0)}</span>
      <span class="tb-bar" style="height:${(vals[i] / max * 100).toFixed(1)}%"></span></button>`).join('')}
      ${budget ? `<div class="trend-ov" aria-hidden="true"><div class="trend-b" style="bottom:${(budget / max * 100).toFixed(1)}%"></div></div>` : ''}</div>
    <div class="trend-labs">${months.map(m => `<span class="${m === ym ? 'cur' : ''}">${esc(monthShort(m))}</span>`).join('')}</div>
    ${notes.length ? `<p class="muted" style="font-size:12px;margin:8px 0 0">${notes.join(' ')}</p>` : ''}
  </section>`;
}
const paceTick = frac => frac > 0 && frac < 1 ? `<div class="tick" style="left:${(frac * 100).toFixed(1)}%" title="Even pace for today"></div>` : '';
function statsByCategory(ym, seg) {
  const frac = elapsedFrac(ym);
  const spent = {}; let special = 0;
  const allSp = spendByCat(ym);
  Object.keys(allSp).forEach(id => { if (isOutside(id)) special += allSp[id]; else spent[id] = allSp[id]; });
  const withB = budgetCats();
  const total = Object.values(spent).reduce((s, v) => s + v, 0);
  const totalB = withB.reduce((s, c) => s + c.budget, 0);
  const spentB = withB.reduce((s, c) => s + (spent[c.id] || 0), 0);
  const unb = Object.keys(spent).filter(id => spent[id] > 0.004 && !withB.some(c => c.id === id)).map(id => ({ id, v: spent[id] })).sort((a, b) => b.v - a.v);
  const unbTotal = unb.reduce((s, r) => s + r.v, 0);
  const days = daysIn(ym), today = new Date().getDate(), isNow = ym === ymOf(todayISO()), daysLeft = days - today + 1;

  let h = `<section class="sec"><div class="sec-h"><h2>This month</h2>${seg}</div>
    <div class="big">${money(total)} <small>spent</small></div>
    ${special > 0.004 ? `<div class="pace-note" style="margin-top:4px">Plus <span class="num">${money(special)}</span> outside the monthly budget, shown in the yearly view below.</div>` : ''}`;
  if (totalB) {
    const st0 = budgetStatus(spentB, totalB, frac), left = totalB - spentB;
    h += `<div class="bar-top" style="margin-top:12px"><span class="num">${money(spentB, 0)} of ${money(totalB, 0)} budget</span><span class="pill ${st0.k}">${st0.icon}${esc(st0.label)}</span></div>
      <div class="track" style="height:12px"><div class="fill ${st0.k}" style="width:${Math.min(100, spentB / totalB * 100).toFixed(1)}%"></div>${paceTick(frac)}</div>
      <div class="bar-sub"><span>${Math.round(spentB / totalB * 100)}% used${isNow ? ` · ${Math.round(frac * 100)}% of the month gone` : ''}</span><span>${statusNote(st0, left, false, daysLeft)}</span></div>
      <div class="pace-note">${isNow ? `Day ${today} of ${days}. Run rate today is <span class="num">${money(st0.runRate, 0)}</span>, marked by the line on each bar.${st0.k === 'warn' ? ` You're <span class="num">${money(st0.ahead, 0)}</span> above it.` : st0.k === 'good' ? ` You're <span class="num">${money(st0.under, 0)}</span> under it.` : ''}${left > 0 ? ` You can spend about <span class="num">${money(left / daysLeft, 0)}</span> a day for the rest of the month.` : ''}` : frac >= 1 ? 'This month is over.' : "This month hasn't started."}${unbTotal > 0.004 ? ` Plus <span class="num">${money(unbTotal, 0)}</span> in categories without a budget.` : ''}</div>
      <div class="legend"><span class="pill good">${ICON.ok}On track</span><span>At or under the run rate</span><span class="pill warn">${ICON.warn}At risk</span><span>Above the run rate, still within budget</span><span class="pill bad">${ICON.over}Over</span><span>Past the month's budget</span></div>`;
  } else {
    h += `<p class="muted" style="font-size:14px">Set monthly budgets to see whether you're on track.</p><button class="btn small" data-act="tab" data-tab="budget">Set budgets</button>`;
  }
  h += `</section>`;
  if (!total && !totalB) return h + `<div class="empty"><b>No spending in ${esc(monthLabel(ym))}</b>Scan a statement or add a transaction.</div>` + trendSection(ym, null);

  if (withB.length) {
    // In your category order (Settings), so each one is always in the same place.
    const rows = withB.map(c => ({ c, v: spent[c.id] || 0 }));
    h += `<section class="sec"><div class="sec-h"><h2>By category</h2><span class="muted" style="font-size:13px">Bar fills to each budget</span></div>` + rows.map(({ c, v }) => {
      const stt = budgetStatus(v, c.budget, frac), left = c.budget - v, used = Math.round(v / c.budget * 100);
      return `<button class="bar-row" data-act="drill-cat" data-id="${esc(c.id)}" aria-label="${esc(c.name)}: ${money(v)} of ${money(c.budget, 0)}, ${stt.label}">
        <div class="bar-top"><span class="bar-name">${esc(c.name)}</span><span class="pill ${stt.k}">${stt.icon}${esc(stt.label)}</span></div>
        <div class="track"><div class="fill ${stt.k}" style="width:${Math.min(100, v / c.budget * 100).toFixed(1)}%"></div>${paceTick(frac)}</div>
        <div class="bar-sub"><span class="num">${money(v)} of ${money(c.budget, 0)} · ${used}%</span><span>${statusNote(stt, left, isNow, daysLeft)}</span></div>
      </button>`;
    }).join('') + `</section>`;
  }
  const sel = statsSel(withB);
  h += dailySection(ym, withB, sel);
  h += trendSection(ym, withB.length ? sel : null);
  if (unb.length) {
    h += `<section class="sec"><div class="sec-h"><h2>No budget set</h2><span class="muted" style="font-size:13px">Share of spending</span></div>` + unb.map(r => {
      const share = total ? Math.round(r.v / total * 100) : 0;
      return `<button class="bar-row" data-act="drill-cat" data-id="${esc(r.id)}">
        <div class="bar-top"><span class="bar-name">${esc(catName(r.id))}</span><span class="bar-val">${money(r.v)}<small>${share}%</small></span></div>
      </button>`;
    }).join('') + `</section>`;
  }
  return h;
}
// Running total for the year of categories kept outside the monthly budget.
function specialYear(ym) {
  const oc = cats().filter(c => c.type === 'exp' && c.outside);
  if (!oc.length) return '';
  const y = ym.slice(0, 4), nowYm = ymOf(todayISO()), nowY = nowYm.slice(0, 4);
  const upto = y < nowY ? 12 : y > nowY ? 0 : +nowYm.slice(5, 7);
  const months = [], byCat = {};
  let total = 0;
  for (let m = 1; m <= 12; m++) {
    const mym = y + '-' + pad(m); let v = 0;
    monthTx(mym).forEach(t => { if (t.type === 'exp' && isOutside(t.cat)) { v += t.amt; byCat[t.cat] = (byCat[t.cat] || 0) + t.amt; } });
    total += v;
    months.push({ ym: mym, v: round2(v), cum: round2(total) });
  }
  const names = oc.map(c => c.name).join(', ');
  let h = `<section class="sec" id="special"><div class="sec-h"><h2>Outside budget · ${esc(y)}</h2><span class="muted" style="font-size:13px">Running total</span></div>`;
  if (total < 0.005) return h + `<p class="muted" style="font-size:14px;margin:0">Nothing in ${esc(names)} in ${esc(y)}${y === nowY ? ' so far' : ''}. Choose which categories sit outside the monthly budget in the Budget tab.</p></section>`;
  h += `<div class="big">${money(total)} <small>in ${esc(y)}</small></div>`;
  const split = oc.filter(c => byCat[c.id] > 0.004);
  if (oc.length > 1 && split.length) h += `<div class="ct-cats">${split.map(c => `<span>${esc(c.name)} <b>${money(byCat[c.id], 0)}</b></span>`).join('')}</div>`;
  const shownM = months.filter((r, i) => i < upto || r.v > 0.004);
  h += `<div class="sp-head" style="margin-top:12px"><span></span><span></span><span>Month</span><span>Total</span></div>`;
  h += shownM.map(r => {
    const prev = r.cum - r.v;
    return `<button class="sp-row${r.ym === ym ? ' cur' : ''}" data-act="drill-special" data-ym="${r.ym}" aria-label="${esc(monthLabel(r.ym))}: ${money(r.v)}, ${money(r.cum)} for the year so far">
      <span class="sp-m">${esc(monthShort(r.ym))}</span>
      <span class="sp-track"><span class="sp-fill" style="width:${(prev / total * 100).toFixed(1)}%"></span><span class="sp-add" style="left:${(prev / total * 100).toFixed(1)}%;width:${(r.v / total * 100).toFixed(1)}%"></span></span>
      <span class="num sp-v">${r.v > 0.004 ? money(r.v, 0) : '–'}</span><span class="num sp-c">${money(r.cum, 0)}</span></button>`;
  }).join('');
  return h + `<p class="muted" style="font-size:12px;margin:8px 0 0">${esc(names)}. Counts toward your balances but not the monthly budget. Tap a month to see its entries.</p></section>`;
}
// Calendar of one budgeted category's daily spending, highlighting days above its daily allowance
// (monthly budget spread evenly over the days of the month).
// The category picked for the day-by-day calendar and the six-month trend: 'all' or one budgeted category.
function statsSel(withB) {
  const sel = S.dailyCat || lsGet('snapledger:dailyCat') || 'all';
  S.dailyCat = sel === 'all' || withB.some(c => c.id === sel) ? sel : 'all';
  return S.dailyCat;
}
function dailySection(ym, withB, sel) {
  if (!withB.length) return '';
  const all = sel === 'all', c = all ? null : catById(sel);
  const budget = all ? withB.reduce((n, x) => n + x.budget, 0) : c.budget, name = all ? 'All budgeted categories' : c.name;
  const ids = new Set(all ? withB.map(x => x.id) : [sel]);
  const days = daysIn(ym), allow = budget / days;
  const byDay = new Array(days + 1).fill(0);
  monthTx(ym).forEach(t => { if (t.type === 'exp' && ids.has(t.cat)) byDay[+t.d.slice(8, 10)] += t.amt; });
  const nowYm = ymOf(todayISO());
  const upto = ym < nowYm ? days : ym > nowYm ? 0 : new Date().getDate();
  let overDays = 0, overAmt = 0;
  for (let d = 1; d <= upto; d++) if (byDay[d] > allow + 0.004) { overDays++; overAmt += byDay[d] - allow; }
  const lead = (new Date(ym + '-01T00:00:00').getDay() + 6) % 7;
  const short = v => v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : v >= 100 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '');
  let cells = '';
  for (let k = 0; k < lead; k++) cells += '<span class="cal-d blank"></span>';
  for (let d = 1; d <= days; d++) {
    const v = round2(byDay[d]), iso = ym + '-' + pad(d), fut = d > upto, over = !fut && v > allow + 0.004;
    // Heat steps by how far above the allowance: up to +25%, +75%, +150%, beyond.
    const ratio = allow > 0 ? v / allow : 0;
    const heat = ratio <= 1.25 ? 'h1' : ratio <= 1.75 ? 'h2' : ratio <= 2.5 ? 'h3' : 'h4';
    const cls = fut ? 'fut' : over ? 'over ' + heat : v > 0.004 ? 'in' : 'zero';
    const label = `${dayLabel(iso)}: ${v > 0.004 ? money(v) : 'no spending'}${over ? ', ' + money(v - allow) + ' (' + Math.round((ratio - 1) * 100) + '%) above the daily allowance' : ''}`;
    cells += `<button class="cal-d ${cls}" data-act="drill-day" data-id="${esc(sel)}" data-d="${iso}" aria-label="${esc(label)}"${fut && !v ? ' disabled' : ''}>
      <span class="cal-n">${d}</span><span class="cal-v">${v > 0.004 ? short(v) : ''}</span></button>`;
  }
  const chips = `<div class="chips" role="group" aria-label="Category for the day-by-day view and the six-month trend"><button class="chip${all ? ' on' : ''}" data-act="daily-cat" data-id="all">All</button>${withB.map(x => `<button class="chip${x.id === sel ? ' on' : ''}" data-act="daily-cat" data-id="${esc(x.id)}">${esc(x.name)}</button>`).join('')}</div>`;
  return `<section class="sec" id="daily"><div class="sec-h"><h2>Day by day</h2><span class="muted" style="font-size:13px">${esc(name)}</span></div>
    ${chips}
    <p class="muted" style="font-size:12px;margin:-2px 0 8px">This choice also sets the six-month trend below.</p>
    <p class="daily-sum">Daily allowance <b class="num">${money(allow)}</b> <span class="muted">(${money(budget, 0)} ÷ ${days} days)</span><br>
    ${upto ? (overDays ? `Above it on <b class="t-warn">${overDays} of ${upto} day${upto === 1 ? '' : 's'}</b>${ym === nowYm ? ' so far' : ''}, by <span class="num">${money(overAmt, 0)}</span> in total.` : `Within it every day${ym === nowYm ? ' so far' : ''}.`) : 'This month hasn\'t started.'}</p>
    <div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(w => `<span class="cal-w">${w}</span>`).join('')}${cells}</div>
    <p class="heat-cap">How far above the daily allowance</p>
    <div class="heat-scale"><span><i class="sw h1"></i>up to 25%</span><span><i class="sw h2"></i>25–75%</span><span><i class="sw h3"></i>75–150%</span><span><i class="sw h4"></i>over 150%</span></div>
    <div class="cal-legend"><span><i class="sw in"></i>Within allowance</span><span><i class="sw zero"></i>No spending</span></div>
    <p class="muted" style="font-size:12px;margin:8px 0 0">Amounts in ${esc(cur())}. Tap a day to see its transactions.</p>
  </section>`;
}
function statsByCard(ym, seg) {
  const m = spendByAcc(ym);
  const rows = Object.entries(m).filter(([, v]) => v > 0.004).map(([id, v]) => ({ id, name: accName(id), v })).sort((a, b) => b.v - a.v);
  const total = rows.reduce((s, r) => s + r.v, 0);
  let h = `<section class="sec"><div class="sec-h"><h2>This month</h2>${seg}</div>
    <div class="big">${money(total)} <small>spent</small></div>
    <p class="muted" style="font-size:13px;margin:6px 0 0">Each bar is that card's share of this month's spending.</p>`;
  if (!rows.length) h += `<p class="muted">No spending recorded this month.</p>`;
  h += `<div style="margin-top:8px">` + rows.map(r => {
    const share = total ? Math.round(r.v / total * 100) : 0;
    return `<button class="bar-row" data-act="drill-acc" data-id="${esc(r.id)}" aria-label="${esc(r.name)}: ${money(r.v)}, ${share}% of spending">
      <div class="bar-top"><span class="bar-name">${esc(r.name)}</span><span class="bar-val">${money(r.v)}<small>${share}%</small></span></div>
      <div class="track"><div class="fill" style="width:${share}%"></div></div>
    </button>`;
  }).join('') + `</div></section>`;
  return h;
}

function vBudget() {
  const expCats = cats().filter(c => c.type === 'exp');
  const inB = expCats.filter(c => !c.outside);
  const total = inB.reduce((s, c) => s + (c.budget > 0 ? c.budget : 0), 0);
  return `<section class="sec"><div class="sec-h"><h2>Monthly budgets</h2><span class="muted" style="font-size:13px">Same every month</span></div>
    <p class="muted" style="font-size:13px;margin:0 0 12px">How much you plan to spend in each category. Leave a box empty for no budget. Changes save as you go, and your progress shows on the Stats tab.</p>
    <div class="bgt-edit">${inB.map(c => `<label for="b-${esc(c.id)}">${esc(c.name)}</label>
      <input class="in num" id="b-${esc(c.id)}" data-set="budget" data-id="${esc(c.id)}" inputmode="decimal" placeholder="No budget" value="${c.budget > 0 ? c.budget : ''}">`).join('')}
      <b class="bgt-total-l">Total per month</b><span class="num bgt-total" id="bgt-total">${money(total, 0)}</span>
    </div>
    <p class="muted" style="font-size:13px;margin:14px 0 0">Add, rename, reorder or remove categories in Settings.</p>
  </section>
  <section class="sec"><div class="sec-h"><h2>Outside the monthly budget</h2></div>
    <p class="muted" style="font-size:13px;margin:0 0 12px">For one-off or big spending like flights or furniture. It still counts toward your card and account balances, but not toward monthly budgets or the run rate. Stats shows a running total for the year. Tap a category to move it in or out.</p>
    <div class="chips wrap" role="group" aria-label="Categories outside the monthly budget">${expCats.map(c => `<button class="chip${c.outside ? ' on' : ''}" data-act="toggle-outside" data-id="${esc(c.id)}" aria-pressed="${c.outside ? 'true' : 'false'}">${esc(c.name)}</button>`).join('')}</div>
  </section>`;
}

function vCards() {
  const list = accts(), bals = balances();
  let h = '';
  if (!list.length) {
    h += `<div class="empty"><b>Add your cards</b>Each transaction is tagged to a card so you can see spending per card.</div>`;
  }
  const ids = Object.keys(bals);
  if (ids.length) {
    let assets = 0, owed = 0;
    ids.forEach(id => { const v = bals[id].v; if (isLiab(accById(id))) owed -= v; else assets += v; });
    h += `<section class="sec"><div class="sec-h"><h2>Balances</h2><span class="muted" style="font-size:13px">As of today</span></div>
      <div class="bal-sum">
        <div><span>In your accounts</span><span class="num">${money(assets)}</span></div>
        <div><span>Owed on cards</span><span class="num">${money(owed)}</span></div>
        <div class="net"><span>Net</span><span class="num${assets - owed < 0 ? ' t-bad' : ''}">${money(assets - owed)}</span></div>
      </div>
      <p class="muted" style="font-size:12px;margin:8px 0 0">From the figures you entered from your bank apps, plus everything since. Update a card or account below to check it still matches.</p></section>`;
  }
  h += list.map(a => {
    // Spending lives in Stats. Here each card shows what's in it, or what you owe on it.
    const b = bals[a.id], liab = isLiab(a);
    return `<div class="card-tile ${esc(a.kind || 'credit')}">
      <span class="stripe"></span>
      <div class="ct-top"><span class="ct-name">${esc(a.name)}</span><span class="ct-l4">${a.last4 ? '•••• ' + esc(a.last4) : ''}</span></div>
      ${b ? `<div class="ct-k">${liab ? 'Owed' : 'Balance'}</div><div class="ct-amt${!liab && b.v < 0 ? ' t-bad' : ''}">${money(shown(a, b.v))}</div>
      <div class="ct-meta">Last checked with your bank ${esc(fmtDate(b.cp.d))}</div>`
      : `<p class="ct-meta ct-none">No balance yet. Add one to track what you ${liab ? 'owe on this card' : 'have in this account'}.</p>`}
      <div class="ct-acts"><button class="btn small" data-act="drill-acc" data-id="${esc(a.id)}">Transactions</button><button class="btn small" data-act="bal" data-id="${esc(a.id)}"${b ? ' aria-label="Update balance"' : ''}>${b ? 'Update' : 'Add balance'}</button><button class="btn small ct-edit" data-act="edit-card" data-id="${esc(a.id)}">Edit</button></div>
    </div>`;
  }).join('');
  h += `<button class="btn wide primary" data-act="new-card">Add a card</button>`;
  return h;
}

function vImport() {
  const I = S.imp;
  if (!accts().length) {
    return `<div class="empty"><b>Add a card first</b>Scanned transactions are filed under the card the statement belongs to.<div style="margin-top:14px"><button class="btn primary" data-act="new-card">Add a card</button></div></div>`;
  }
  if (I.status === 'password') {
    return `<div class="reading" style="text-align:left">
      <b>${esc(I.pw.name)} is password-protected</b>
      <p class="muted">Enter the statement password. It's only used to open the file on this phone and is never saved.</p>
      <input class="in" id="pdf-pw" type="password" autocomplete="off" aria-label="PDF password">
      ${I.pw.wrong ? '<div class="err">That password didn\'t work. Try again.</div>' : ''}
      <div class="sheet-actions" style="margin-top:12px"><button class="btn" data-act="pw-skip">Skip this file</button><button class="btn primary" data-act="pw-ok">Open</button></div></div>`;
  }
  if (I.status === 'reading') {
    return `<div class="reading"><div class="spin" aria-hidden="true"></div>
      <b id="imp-phase">${esc(I.phase || 'Reading…')}</b>
      <p class="muted">Everything is read on this phone.</p>
      <button class="btn" data-act="imp-stop">Stop</button></div>`;
  }
  if (I.status === 'review') return vReview();
  if (!accById(I.accountId)) I.accountId = accts()[0].id;
  let h = '';
  h += `<div class="field"><span>If the app can't tell the card, use</span><select class="in" id="imp-acc">${accOptions(I.accountId)}</select></div>`;
  h += `<label class="drop" id="drop" for="imp-file">${ICON.upload}<b>Add screenshots or a PDF statement</b><span class="muted">Add everything at once, from any of your cards. The app works out which card each one is.</span>
      <input type="file" id="imp-file" accept="image/*,application/pdf,.pdf" multiple></label>`;
  if (I.files.length) {
    h += `<div class="thumbs">${I.files.map((f, i) => f.kind === 'pdf'
      ? `<div class="thumb pdf"><span class="pdf-badge">PDF</span><span class="pdf-name">${esc(f.name)}</span><button data-act="imp-remove" data-i="${i}" aria-label="Remove ${esc(f.name)}">×</button></div>`
      : `<div class="thumb"><img src="${esc(f.url)}" alt="Screenshot ${i + 1}"><button data-act="imp-remove" data-i="${i}" aria-label="Remove screenshot ${i + 1}">×</button></div>`).join('')}</div>`;
  }
  h += `<div class="field" style="margin-top:14px"><span>Or paste transaction text</span><textarea class="in ta" id="imp-text" rows="4" placeholder="Paste text copied from your bank app or statement">${esc(I.text || '')}</textarea></div>`;
  if (I.error) h += `<div class="err">${esc(I.error)}</div>`;
  h += `<button class="btn primary wide" id="imp-read-btn" data-act="imp-read" ${readCount() ? '' : 'disabled'}>${readLabel()}</button>`;
  h += `<ul class="how"><li><span>1</span>Screenshot the transaction list in your bank app, or download the PDF e-statement.</li><li><span>2</span>The app reads the text on this phone and picks out each date, amount and merchant. Nothing is uploaded.</li><li><span>3</span>Check each line, fix anything off, and add them in one go. Your category fixes are remembered for next time.</li></ul>`;
  return h;
}
function readCount() { return S.imp.files.length + ((S.imp.text || '').trim() ? 1 : 0); }
function readLabel() {
  const n = readCount(), hasText = !!(S.imp.text || '').trim();
  return !n ? 'Add a file or paste text to start' : hasText && !S.imp.files.length ? 'Read pasted text' : `Read ${n} item${n === 1 ? '' : 's'}`;
}

function vReview() {
  const I = S.imp;
  let h = '';
  if (!I.rows.length) {
    const n = I.skipped.length, tops = I.skipped.filter(x => x.kind === 'topup').length;
    const moved = n ? `Left out ${n} ${tops === n ? 'wallet top-up' : tops ? 'top-up or card payment' : 'card payment'}${n === 1 ? '' : 's'}. ${n === 1 ? 'It moves' : 'They move'} money between your own accounts, so ${n === 1 ? "it isn't" : "they aren't"} spending. ` : '';
    h += `<div class="empty"><b>${n ? 'Nothing to add' : 'No transactions found'}</b>${moved}${I.notes ? esc(I.notes) + ' ' : ''}${n ? 'If something is missing, check' : 'Check'} the recognised text below, or add lines by hand.
      <div class="sheet-actions" style="margin-top:14px;justify-content:center"><button class="btn" data-act="imp-back">Back</button><button class="btn primary" data-act="rv-add">Add a line</button></div></div>`;
    h += vSource();
    return h;
  }
  const dupN = I.rows.filter(r => r.dup).length, lowN = I.rows.filter(r => r.conf === 'low' && !r.learned).length;
  const notes = [];
  if (I.notes) notes.push(esc(I.notes));
  const pays = I.skipped.filter(x => x.kind !== 'topup'), tops = I.skipped.filter(x => x.kind === 'topup');
  const xN = I.rows.filter(r => r.kind === 'xfer').length;
  if (xN) notes.push(`${xN} card payment${xN === 1 ? ' or top-up is a transfer' : 's or top-ups are transfers'}: they move money between your accounts and don't count as spending.`);
  if (pays.length) notes.push(`Left out ${pays.length} card payment${pays.length === 1 ? '' : 's'} (<span class="num">${money(pays.reduce((s, p) => s + p.amount, 0))}</span>), since paying the bill isn't spending.`);
  if (tops.length) notes.push(`Left out ${tops.length} wallet top-up${tops.length === 1 ? '' : 's'}.`);
  if ((pays.length || tops.length) && !Object.keys(balances()).length) notes.push('Add a balance in the Cards tab to record these as transfers.');
  if (dupN) notes.push(`${dupN} line${dupN === 1 ? ' looks' : 's look'} already recorded and ${dupN === 1 ? 'is' : 'are'} unticked.`);
  if (lowN) notes.push(`Categories shaded amber are ones the app didn't recognise.`);
  notes.push('Compare amounts with your screenshot before adding.');
  h += `<div class="note">${notes.join(' ')}</div>`;
  h += `<div class="rv-tools">
    <button class="btn small" data-act="rv-all">${I.rows.every(r => r.sel) ? 'Untick all' : 'Tick all'}</button>
    <select class="in" id="bulk-cat" aria-label="Set category for ticked"><option value="">Set category for ticked…</option>${catOptions('exp', '')}</select>
  </div>`;
  h += `<div id="rv-list">${vGroups()}</div>`;
  h += `<button class="btn wide" data-act="rv-add" style="margin-top:4px">Add a missed line</button>`;
  h += `<div class="rv-foot" id="rv-foot">${vFoot()}</div>`;
  h += vSource();
  h += `<div class="sheet-actions" style="margin-top:12px"><button class="btn" data-act="imp-back">Back</button><button class="btn" data-act="imp-reset">Discard all</button></div>`;
  return h;
}
function vGroups() {
  const I = S.imp, groups = I.groups || [];
  if (!groups.length) return I.rows.map(vRow).join('');
  return groups.map((g, gi) => {
    const idx = I.rows.map((r, i) => r.g === gi ? i : -1).filter(i => i >= 0);
    const skippedN = (g.skipped || []).length;
    const head = `<div class="grp-h">
        ${g.thumb ? `<img class="grp-thumb" src="${esc(g.thumb)}" alt="">` : ''}
        <div class="grp-info"><b>${esc(g.label)}</b><span class="muted">${g.auto ? 'Card matched by ' + esc(g.why) : g.inherited ? 'No card shown, so using the card from ' + esc(g.why) + '. Check it.' : accts().length > 1 ? "Couldn't tell the card. Pick it here." : ''}</span></div>
        <select class="in grp-acc${g.auto ? '' : ' unsure'}" data-g="${gi}" aria-label="Card for ${esc(g.label)}">${accOptions(g.acc)}</select>
      </div>`;
    const body = idx.length ? idx.map(i => vRow(I.rows[i], i)).join('')
      : `<p class="muted grp-empty">No transactions on this one${skippedN ? ` (left out ${skippedN} payment${skippedN === 1 ? '' : 's'} or top-up${skippedN === 1 ? '' : 's'})` : ', so nothing to add'}.</p>`;
    return `<section class="grp">${head}${body}</section>`;
  }).join('');
}
function vSource() {
  const I = S.imp;
  if (!I.source) return '';
  return `<div class="src"><button class="btn ghost small" data-act="rv-src">${I.showSource ? 'Hide' : 'Show'} recognised text</button>${I.showSource ? `<pre class="num">${esc(I.source)}</pre>` : ''}</div>`;
}
function vRow(r, i) {
  const type = r.kind === 'inc' ? 'inc' : 'exp', isX = r.kind === 'xfer';
  const tags = [];
  if (isX) tags.push('<span class="tag acc">Transfer, not spending</span>');
  if (r.dup === 'ledger') tags.push('<span class="tag warn">Already in ledger?</span>');
  if (r.dup === 'batch') tags.push('<span class="tag warn">Appears twice</span>');
  if (r.learned) tags.push('<span class="tag acc">Remembered</span>');
  if (r.kind === 'ref') tags.push('<span class="tag good">Refund</span>');
  if (r.kind === 'inc') tags.push('<span class="tag good">Income</span>');
  if (r.dateGuess) tags.push('<span class="tag warn">Check date</span>');
  else if (r.dateCarried) tags.push('<span class="tag">Date from previous screenshot</span>');
  if (r.fx) tags.push(`<span class="tag warn">${esc(r.fx)} amount, check SGD</span>`);
  return `<div class="rv${r.sel ? '' : ' off'}${r.invalid ? ' invalid' : ''}" data-i="${i}">
    <div class="rv-check"><input type="checkbox" data-f="sel" ${r.sel ? 'checked' : ''} aria-label="Include ${esc(r.m)}"></div>
    <div class="rv-body">
      <div class="rv-l1">
        <input class="in" data-f="m" value="${esc(r.m)}" placeholder="Merchant" aria-label="Merchant">
        <div class="rv-amt"><span class="cur">${esc(cur())}</span><input class="in" data-f="amt" inputmode="decimal" value="${isFinite(r.amt) ? r.amt.toFixed(2) : ''}" placeholder="0.00" aria-label="Amount"></div>
      </div>
      <div class="rv-l2">
        <input class="in" type="date" data-f="d" value="${esc(r.d)}" aria-label="Date">
        <select class="in" data-f="kind" aria-label="Type">${kindOptions(r.kind, true)}</select>
        ${isX ? '' : `<select class="in${r.conf === 'low' && !r.learned ? ' unsure' : ''}" data-f="cat" aria-label="Category">${catOptions(type, r.cat)}</select>`}
      </div>
      ${isX ? `<div class="rv-l3"><label><span>From</span><select class="in${r.from ? '' : ' unsure'}" data-f="from">${pickOptions(r.from)}</select></label><label><span>To</span><select class="in${r.to ? '' : ' unsure'}" data-f="to">${pickOptions(r.to)}</select></label></div>` : ''}
      <div class="rv-meta">${tags.join('')}${r.raw ? `<span class="raw num">${esc(r.raw)}</span>` : ''}</div>
    </div></div>`;
}
function vFoot() {
  const sel = S.imp.rows.filter(r => r.sel);
  const net = sel.reduce((s, r) => s + (r.kind === 'exp' ? (r.amt || 0) : r.kind === 'ref' ? -(r.amt || 0) : 0), 0);
  return `<div class="t"><span>${sel.length} of ${S.imp.rows.length} ticked</span><span class="num">${money(net)} spend</span></div>
    <button class="btn primary" data-act="imp-approve" ${sel.length ? '' : 'disabled'}>Add ${sel.length} to ledger</button>`;
}

/* ---------- import logic ---------- */
function addFiles(fileList) {
  let rejected = 0;
  Array.from(fileList || []).forEach(f => {
    if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name || '')) { S.imp.files.push({ file: f, kind: 'pdf', name: f.name || 'Statement.pdf' }); return; }
    if (!(f.type || '').startsWith('image/') && !/\.(png|jpe?g|heic|heif|webp)$/i.test(f.name || '')) { rejected++; return; }
    S.imp.files.push({ file: f, kind: 'img', url: URL.createObjectURL(f) });
  });
  S.imp.error = rejected ? `${rejected} file${rejected === 1 ? " wasn't" : "s weren't"} added. Use screenshots or a PDF statement.` : '';
  render();
}
function setPhase(t) { S.imp.phase = t; const el = $('#imp-phase'); if (el) el.textContent = t; }

/* PDF statements (pdf.js, bundled) */
let pdfjsP = null;
function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { s.remove(); rej(new Error('load ' + src)); }; document.head.appendChild(s); });
}
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfjsP) pdfjsP = loadScript('lib/pdf.min.js').then(() => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
    return window.pdfjsLib;
  }).catch(e => { pdfjsP = null; throw e; });
  return pdfjsP;
}
async function pdfPages(pdfjs, file, password) {
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data, password, isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise;
  try {
    const pages = [];
    for (let p = 1; p <= Math.min(doc.numPages, 40); p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      const rows = [];
      tc.items.forEach(it => {
        const s = it.str; if (!s || !s.trim()) return;
        const x = it.transform[4], y = it.transform[5];
        let r = rows.find(r => Math.abs(r.y - y) < 3);
        if (!r) { r = { y, items: [] }; rows.push(r); }
        r.items.push({ x, s: s.trim() });
      });
      rows.sort((a, b) => b.y - a.y);
      pages.push(rows.map(r => r.items.sort((a, b) => a.x - b.x).map(i => i.s).join('   ')).join('\n'));
      page.cleanup();
    }
    return pages;
  } finally { doc.destroy(); }
}
function askPassword(name, wrong) {
  return new Promise(res => {
    S.imp.pw = { name, wrong }; S.imp.pwResolve = res; S.imp.status = 'password';
    render();
    setTimeout(() => { const i = $('#pdf-pw'); if (i) i.focus(); }, 60);
  });
}
function answerPassword(v) {
  const r = S.imp.pwResolve; S.imp.pwResolve = null; S.imp.status = 'reading'; render();
  if (r) r(v);
}
async function openPdf(f) {
  let pdfjs;
  try { pdfjs = await loadPdfJs(); } catch (e) { throw { code: 'pdf_lib' }; }
  let password;
  for (;;) {
    try { return await pdfPages(pdfjs, f.file, password); }
    catch (e) {
      if (e && e.name === 'PasswordException') {
        const pw = await askPassword(f.name, password !== undefined);
        if (pw === null || S.imp.stopped) return null;
        password = pw; continue;
      }
      throw { code: 'pdf_bad', name: f.name };
    }
  }
}

/* On-device text recognition (Tesseract, bundled) */
let ocrP = null, ocrW = null, ocrSeq = 0;
const ocrPending = {};
function ocrCall(msg, transfer) {
  return new Promise((res, rej) => { const id = ++ocrSeq; ocrPending[id] = { res, rej }; ocrW.postMessage(Object.assign({ id }, msg), transfer || []); });
}
function simdSupported() {
  try { return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])); } catch (e) { return false; }
}
function initOcr() {
  if (ocrP) return ocrP;
  ocrP = (async () => {
    const base = new URL('lib/', document.baseURI).href;
    const coreUrl = base + (simdSupported() ? 'tesseract-core-simd-lstm.wasm.js' : 'tesseract-core-lstm.wasm.js');
    const r = await fetch(base + 'eng.traineddata');
    if (!r.ok) throw new Error('language data ' + r.status);
    const buf = await r.arrayBuffer();
    ocrW = new Worker('ocr-worker.js');
    ocrW.onmessage = e => { const p = ocrPending[e.data.id]; if (!p) return; delete ocrPending[e.data.id]; if (e.data.ok) p.res(e.data); else p.rej(new Error(e.data.error)); };
    ocrW.onerror = e => { Object.keys(ocrPending).forEach(k => { ocrPending[k].rej(new Error((e && e.message) || 'worker error')); delete ocrPending[k]; }); };
    await ocrCall({ type: 'init', coreUrl, lang: buf }, [buf]);
  })().catch(e => { ocrP = null; if (ocrW) { ocrW.terminate(); ocrW = null; } console.warn('[snapledger] text reader failed to start', e); throw e; });
  return ocrP;
}
async function prepImage(file, opt) {
  opt = opt || {};
  const bmp = await createImageBitmap(file);
  let scale = opt.scale || (bmp.width < 900 ? 2 : 1);
  const maxPx = 16e6;
  if (bmp.width * bmp.height * scale * scale > maxPx) scale = Math.sqrt(maxPx / (bmp.width * bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(bmp, 0, 0, c.width, c.height);
  if (bmp.close) bmp.close();
  const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  // Grey, flip dark mode to dark-on-light, then stretch contrast so coloured and grey text stays dark.
  let sum = 0;
  const n = d.length / 4;
  for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = l; sum += l; }
  const dark = sum / n < 110;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) { if (dark) d[i] = 255 - d[i]; hist[d[i] | 0]++; }
  let acc = 0, lo = 0, hi = 255;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= n * 0.02) { lo = v; break; } }
  acc = 0;
  for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= n * 0.35) { hi = v; break; } }
  if (hi - lo < 20 || opt.raw) { lo = 0; hi = 255; }
  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) { const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo))); lut[v] = 255 * Math.pow(t, opt.gamma || 2.2); }
  for (let i = 0; i < d.length; i += 4) { const v = lut[d[i] | 0]; d[i] = d[i + 1] = d[i + 2] = v; }
  g.putImageData(im, 0, 0);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  c.width = c.height = 0;
  return new Uint8Array(await blob.arrayBuffer());
}
function tsvToText(tsv) {
  const words = [];
  String(tsv || '').split('\n').forEach(line => {
    const p = line.split('\t');
    if (p.length < 12 || p[0] !== '5') return;
    const t = p.slice(11).join(' ').trim(); if (!t) return;
    words.push({ x: +p[6], y: +p[7], w: +p[8], h: +p[9], t });
  });
  words.sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2));
  const rows = [];
  words.forEach(wd => {
    const cy = wd.y + wd.h / 2, r = rows[rows.length - 1];
    if (r && Math.abs(cy - r.cy) < Math.max(r.h, wd.h) * 0.6) { r.items.push(wd); r.cy = (r.cy * (r.items.length - 1) + cy) / r.items.length; r.h = Math.max(r.h, wd.h); }
    else rows.push({ cy, h: wd.h, items: [wd] });
  });
  return rows.map(r => {
    r.items.sort((a, b) => a.x - b.x);
    let s = '', prev = null;
    r.items.forEach(wd => { if (prev) s += (wd.x - (prev.x + prev.w)) > r.h * 1.5 ? '     ' : ' '; s += wd.t; prev = wd; });
    return s;
  }).join('\n');
}

async function readStatements() {
  const I = S.imp;
  const pasted = (I.text || '').trim();
  if (!(I.files.length || pasted)) return;
  lsSet('snapledger:lastCard', I.accountId);
  const pdfs = I.files.filter(f => f.kind === 'pdf'), imgs = I.files.filter(f => f.kind === 'img');
  I.status = 'reading'; I.error = ''; I.stopped = false; I.phase = 'Getting ready…'; I.source = ''; I.showSource = false;
  render();
  const blocks = [], notes = [];
  const stopCheck = () => { if (I.stopped) throw { code: 'cancelled' }; };
  try {
    if (pasted) blocks.push({ label: 'Pasted text', text: pasted });
    for (const f of pdfs) {
      stopCheck();
      setPhase(`Opening ${f.name}`);
      const pages = await openPdf(f);
      stopCheck();
      if (!pages) { notes.push(`Skipped ${f.name}.`); continue; }
      if (!pages.join('').replace(/\s/g, '').length) { notes.push(`${f.name} has no text layer (it may be a scanned image), so use screenshots for it.`); continue; }
      blocks.push({ label: f.name, text: pages.map((p, i) => `--- page ${i + 1} ---\n${p}`).join('\n') });
    }
    if (imgs.length) {
      setPhase('Loading the text reader…');
      try { await initOcr(); } catch (e) { throw { code: 'ocr_init' }; }
      for (let i = 0; i < imgs.length; i++) {
        stopCheck();
        setPhase(`Reading screenshot ${i + 1} of ${imgs.length}`);
        let r;
        try { const bytes = await prepImage(imgs[i].file); r = await ocrCall({ type: 'rec', image: bytes.buffer, psm: 11 }, [bytes.buffer]); }
        catch (e) { console.warn('[snapledger] text recognition failed', e); throw { code: 'ocr_fail', n: i + 1 }; }
        blocks.push({ label: `Screenshot ${i + 1}`, text: tsvToText(r.tsv), thumb: imgs[i].url });
      }
    }
    stopCheck();
    setPhase('Picking out transactions…');
    const hasCat = id => !!catById(id);
    const hints = st().acctHints || {};
    // Screenshots are read in the order you picked them. When one continues the list from the
    // screenshot before it (same card), it starts under that screenshot's last date heading.
    let prev = null;
    const results = blocks.map(b => {
      const det = SnapParse.detectAccount(b.text, accts(), hints);
      // No card visible at all (scrolled past the header): assume it continues the previous screenshot.
      if (!det.found && prev && prev.acc && b.thumb && prev.thumb && !det.signals.last4.length) det.found = { id: prev.acc, why: prev.label, inherited: true };
      const acc = det.found ? det.found.id : null;
      const sameScreen = prev && b.thumb && prev.thumb && (acc ? acc === prev.acc : (!prev.acc && det.signals.headKey && det.signals.headKey === prev.headKey));
      const res = SnapParse.parse(b.text, { hasCat, rules: st().rules || {}, today: todayISO(), startDate: sameScreen ? prev.lastDate : null });
      prev = { acc, label: b.label, headKey: det.signals.headKey, lastDate: res.lastDate || (sameScreen ? prev.lastDate : null), thumb: !!b.thumb };
      return Object.assign(res, { label: b.label, thumb: b.thumb || '', found: det.found, signals: det.signals });
    });
    I.source = blocks.map(b => `=== ${b.label} ===\n${b.text}`).join('\n\n');
    buildRows(results, notes);
  } catch (e) {
    I.status = 'idle';
    const code = e && e.code;
    if (code === 'cancelled') I.error = '';
    else if (code === 'pdf_lib') I.error = "Couldn't load the PDF reader. Open the app once while online so it can finish downloading, then try again.";
    else if (code === 'pdf_bad') I.error = `Couldn't open ${e.name}. Check it's a statement PDF, or use screenshots instead.`;
    else if (code === 'ocr_init') I.error = "Couldn't start the text reader. Open the app once while online so it can finish downloading, then try again.";
    else if (code === 'ocr_fail') I.error = `Couldn't read screenshot ${e.n}. Try a sharper screenshot, or remove it and try the rest.`;
    else { console.warn('[snapledger] read failed', e); I.error = 'Something went wrong reading that. Try again.'; }
  }
  I.phase = '';
  render();
}
function fallbackCat(type) { return type === 'inc' ? (catById('cashback') ? 'cashback' : firstCat('inc')) : (catById('other') ? 'other' : firstCat('exp')); }
const dayDiff = (a, b) => Math.abs((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 864e5);
function buildRows(results, notes) {
  const I = S.imp;
  const rows = [], skipped = [], groups = [];
  const today = todayISO(), bals = balances();
  results.forEach((res, gi) => {
    const acc = res.found && accById(res.found.id) ? res.found.id : I.accountId;
    const left = [];
    // Card payments and top-ups come in as transfers once either side has a balance you track.
    res.skipped.forEach(p => {
      const a = accById(acc), wallet = id => !!(accById(id) && accById(id).kind === 'wallet'), isW = wallet(acc);
      // Top-ups go into the wallet, and send-backs come out of it. Card payments go into the card.
      const dirIn = p.kind === 'topup' ? (isW ? !p.back : !!p.back) : (p.kind === 'payment' && isLiab(a)) || !!p.credit;
      const other = p.kind === 'topup' && !isW ? suggestTo(acc, p.raw, 'topup') : dirIn ? suggestFrom(acc) : suggestTo(acc, p.raw, p.kind);
      // A top-up only moves money if a wallet is on one side. Otherwise it's inside one account.
      if (p.kind === 'topup' && !isW && !wallet(other)) { left.push(p); return; }
      if (!(p.amount > 0) || !(bals[acc] || bals[other])) { left.push(p); return; }
      rows.push({ g: gi, sel: true, d: p.date || today, dateGuess: !p.date || p.dateGuessed, dateCarried: !!p.dateCarried, m: p.kind === 'topup' ? 'Top-up' : 'Card payment', raw: p.raw, amt: p.amount, kind: 'xfer', dir: dirIn ? 'in' : 'out', from: dirIn ? other : acc, to: dirIn ? acc : other, cat: fallbackCat('exp'), acc, conf: 'high', learned: false, fx: '', dup: false });
    });
    groups.push({ label: res.label, thumb: res.thumb, acc, why: res.found ? res.found.why : '', auto: !!res.found && !res.found.inherited, inherited: !!(res.found && res.found.inherited), signals: res.signals, skipped: left });
    skipped.push(...left);
    res.transactions.forEach(t => {
      if (!(t.amount > 0)) return;
      const type = t.kind === 'inc' ? 'inc' : 'exp';
      let cat = t.cat, conf = t.how === 'none' ? 'low' : 'high';
      if (!cat || !catById(cat) || catById(cat).type !== type) { cat = fallbackCat(type); conf = 'low'; }
      rows.push({ g: gi, sel: true, d: t.date || today, dateGuess: !t.date || t.dateGuessed, dateCarried: !!t.dateCarried, m: t.merchant || 'Unnamed', raw: t.raw, amt: t.amount, kind: t.kind, cat, acc, conf, learned: t.how === 'learned', fx: t.fx || '', dup: false });
    });
  });
  I.rows = rows; I.groups = groups; I.skipped = skipped; I.notes = notes.join(' '); I.status = 'review';
  markDuplicates();
}
// Unticks lines seen twice across overlapping screenshots, or already in the ledger
// (same card and amount, same day, or within 3 days for pending charges that post later).
function markDuplicates() {
  const I = S.imp, seen = new Set(), xs = [];
  I.rows.forEach(r => {
    const wasDup = r.dup;
    r.dup = false;
    if (!(r.amt > 0) || !r.raw) { if (wasDup && !r.dup) r.sel = true; return; }
    if (r.kind === 'xfer') {
      // The same payment often shows on both the card and the bank screen, a few days apart.
      const near = t => Math.abs(t.amt - r.amt) < 0.005 && dayDiff(t.d, r.d) <= 5;
      if (xs.some(x => near(x) && x.from === r.from && x.to === r.to)) r.dup = 'batch';
      else {
        xs.push(r);
        const months = [ymOf(r.d), addMonths(ymOf(r.d), -1), addMonths(ymOf(r.d), 1)];
        if (months.some(ym => monthTx(ym).some(t => t.type === 'xfer' && near(t) && (r.dir === 'in' ? t.to === r.to : t.acc === r.from)))) r.dup = 'ledger';
      }
      if (r.dup && !wasDup) r.sel = false;
      if (!r.dup && wasDup) r.sel = true;
      return;
    }
    const key5 = SnapParse.normKey(r.raw).slice(0, 5);
    const k = [r.acc, r.d, r.amt, r.kind, key5].join('|');
    if (seen.has(k)) r.dup = 'batch';
    else {
      seen.add(k);
      const signed = r.kind === 'ref' ? -r.amt : r.amt, type = r.kind === 'inc' ? 'inc' : 'exp';
      const months = [ymOf(r.d), addMonths(ymOf(r.d), -1), addMonths(ymOf(r.d), 1)];
      const hit = months.some(ym => monthTx(ym).some(t => t.acc === r.acc && t.type === type && Math.abs(t.amt - signed) < 0.005 &&
        (t.d === r.d || (dayDiff(t.d, r.d) <= 3 && SnapParse.normKey(t.raw || t.m).slice(0, 5) === key5))));
      if (hit) r.dup = 'ledger';
    }
    if (r.dup && !wasDup) r.sel = false;
    if (!r.dup && wasDup) r.sel = true;
  });
}
function addBlankRow() {
  const I = S.imp, last = I.rows[I.rows.length - 1];
  if (!I.groups || !I.groups.length) I.groups = [{ label: 'Added by hand', thumb: '', acc: I.accountId, why: '', auto: false, signals: null, skipped: [] }];
  const g = last ? last.g : I.groups.length - 1;
  I.rows.push({ g, sel: true, d: last ? last.d : todayISO(), dateGuess: false, m: '', raw: '', amt: NaN, kind: 'exp', cat: fallbackCat('exp'), acc: I.groups[g].acc, conf: 'high', learned: false, fx: '', dup: false });
  render();
  const inputs = document.querySelectorAll('.rv [data-f="m"]');
  if (inputs.length) inputs[inputs.length - 1].focus();
}
function approveRows() {
  const I = S.imp;
  let bad = 0;
  I.rows.forEach(r => {
    const where = r.kind === 'xfer' ? accById(r.from) && accById(r.to) && r.from !== r.to : accById(r.acc) && catById(r.cat);
    r.invalid = r.sel && (!(r.amt > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(r.d) || !where); if (r.invalid) bad++;
  });
  if (bad) { render(); toast(`Fix ${bad} highlighted line${bad === 1 ? '' : 's'} first: each needs a date, an amount above zero, and a card and category (or both accounts for a transfer).`); return; }
  const sel = I.rows.filter(r => r.sel);
  const touched = {}, count = {};
  const rules = st().rules || (st().rules = {});
  sel.forEach(r => {
    const ym = ymOf(r.d);
    if (!mo()[ym]) mo()[ym] = { month: ym, txns: [] };
    touched[ym] = 1; count[ym] = (count[ym] || 0) + 1;
    if (r.kind === 'xfer') {
      mo()[ym].txns.push({ id: newId(), d: r.d, amt: round2(r.amt), type: 'xfer', acc: r.from, to: r.to, cat: '', m: (r.m || '').trim().slice(0, 60) || 'Transfer', raw: r.raw, src: 'scan', t: Date.now() });
      rememberPayFrom(r.from, r.to);
      return;
    }
    const m = (r.m || '').trim().slice(0, 60) || catName(r.cat);
    mo()[ym].txns.push({ id: newId(), d: r.d, amt: round2(r.kind === 'ref' ? -r.amt : r.amt), type: r.kind === 'inc' ? 'inc' : 'exp', acc: r.acc, cat: r.cat, m, raw: r.raw, src: 'scan', t: Date.now() });
    const k = SnapParse.normKey(r.raw);
    if (k) { delete rules[k]; rules[k] = { c: r.cat, m }; }
  });
  const keys = Object.keys(rules);
  if (keys.length > 800) keys.slice(0, keys.length - 800).forEach(k => delete rules[k]);
  // Remember which card each screen belonged to, so the next scan picks it automatically.
  const hints = st().acctHints || (st().acctHints = {});
  (I.groups || []).forEach((g, gi) => {
    const used = sel.filter(r => r.g === gi);
    if (!used.length || !g.signals) return;
    const acc = used[0].acc;
    (g.signals.last4 || []).forEach(n => { hints['n:' + n] = acc; });
    if (g.signals.headKey) hints['h:' + g.signals.headKey] = acc;
  });
  const hk = Object.keys(hints);
  if (hk.length > 200) hk.slice(0, hk.length - 200).forEach(k => delete hints[k]);
  Object.keys(touched).forEach(saveMonth);
  saveSettings();
  const topYm = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  resetImport();
  S.tab = 'ledger'; S.month = topYm; S.filterAcc = null; S.filterCat = null;
  render();
  window.scrollTo(0, 0);
  const spend = round2(sel.reduce((n, r) => n + (r.kind === 'exp' ? r.amt : r.kind === 'ref' ? -r.amt : 0), 0)), xN = sel.filter(r => r.kind === 'xfer').length;
  celebrate({
    badge: `+${sel.length} added${S.demo ? ' (example)' : ''}`,
    title: S.demo ? 'Added to the example ledger' : 'Added to your ledger',
    sub: [`${sel.length} ${sel.length === 1 ? 'entry' : 'entries'}`, Math.abs(spend) > 0.004 ? `${money(spend)} spent` : '', xN ? `${xN} transfer${xN === 1 ? '' : 's'}` : '', S.demo ? 'not saved' : ''].filter(Boolean).join(' · ')
  }, `Added ${sel.length} transaction${sel.length === 1 ? '' : 's'}${S.demo ? ' to the example ledger (not saved)' : ''}.`);
}
function resetImport() {
  S.imp.files.forEach(f => { if (f.url) try { URL.revokeObjectURL(f.url); } catch (e) {} });
  Object.assign(S.imp, { files: [], text: '', status: 'idle', rows: [], skipped: [], notes: '', error: '', phase: '', source: '', showSource: false });
}

/* ---------- sheets ---------- */
function openSheet(s) { S.sheet = s; renderSheet(); $('#sheet-wrap').hidden = false; $('#sheet').scrollTop = 0; }
function closeSheet() { if (S.sheet && S.sheet.kind === 'welcome') lsSet('snapledger:welcomed', '1'); S.sheet = null; $('#sheet-wrap').hidden = true; $('#sheet').innerHTML = ''; }

/* ---------- first-run guide ---------- */
function isStandalone() { try { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; } catch (e) { return false; } }
function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
const SHARE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
function welcomeSteps() {
  const steps = [{
    icon: '<img src="icons/cards-180.png" alt="">',
    title: 'Welcome to Snap Ledger',
    body: `<p>Turn screenshots from your banking apps into a tidy expense ledger, see at a glance whether you're keeping to your budget, and keep your balances matching your bank.</p><p class="muted">Everything is read and stored on this phone. Nothing is uploaded.</p>`
  }];
  if (isIOS() && !isStandalone()) steps.push({
    icon: SHARE_SVG,
    title: 'Add it to your Home Screen first',
    body: `<ol><li>Tap the <b>Share</b> button in Safari.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Open Snap Ledger from the new icon and carry on there.</li></ol><p class="muted">The Home Screen app keeps its own data, separate from Safari, so start your ledger there.</p>`
  });
  steps.push({
    icon: ICON.cards,
    title: 'Add your cards',
    body: `<p>In <b>Cards</b>, add each card with its last 4 digits. This is how the app tells which card a screenshot is from.</p><ul><li>If a card's app shows more than 4 digits, enter the last 4.</li><li>For e-wallets, choose <b>E-wallet</b> and leave the digits empty.</li></ul>`
  });
  steps.push({
    icon: ICON.scan,
    title: 'Scan your transactions',
    body: `<ul><li>Screenshot the transaction list in your bank app. Scroll and take more if it's long.</li><li>In <b>Scan</b>, add them all at once, top of the list first. Mixing cards is fine.</li><li>Check each line, fix anything off, then tap <b>Add</b>. Balance lines are left out for you. Bill payments and top-ups come in as transfers once you track balances.</li></ul><p class="muted">Category fixes are remembered for next time.</p>`
  });
  steps.push({
    icon: ICON.budget,
    title: 'Set budgets and track',
    body: `<p>Set a monthly amount per category in <b>Budget</b>. <b>Stats</b> then shows each one as <b class="t-good">On track</b>, <b class="t-warn">At risk</b> (above today's pace) or <b class="t-bad">Over</b>.</p><ul><li>The day-by-day calendar shows which days went over the daily allowance, and the six-month trend compares each month with its budget.</li><li>Big one-offs like flights go in <b>Special Spending</b>, which sits outside the monthly budget and gets a running total for the year.</li><li>Rename, reorder or add categories in Settings.</li></ul>`
  });
  steps.push({
    icon: ICON.wallet,
    title: 'Keep balances matched',
    body: `<p>Optional. In <b>Cards</b>, tap <b>Add balance</b> and copy the figure from your bank app. Spending, income and transfers then move it.</p><ul><li>Card bills and wallet top-ups are transfers between your own accounts, so they don't count as spending.</li><li>Now and then, tap <b>Update</b> on a card and enter the bank's figure. If it's off, a correction entry makes it match.</li></ul><p class="muted">Your data lives only on this phone, so use Settings → Back up now from time to time.</p>`
  });
  return steps;
}
function renderWelcome(el, s) {
  const steps = welcomeSteps();
  const i = Math.max(0, Math.min(steps.length - 1, s.step || 0)), stp = steps[i], last = i === steps.length - 1;
  const startLabel = S.demo ? 'Start my ledger' : 'Done';
  el.innerHTML = `<div class="grab"></div>
    <div class="wl">
      <div class="wl-icon${i === 0 ? ' app' : ''}">${stp.icon}</div>
      <p class="wl-step">${i + 1} of ${steps.length}</p>
      <h2>${stp.title}</h2>
      <div class="wl-body">${stp.body}</div>
      <div class="wl-dots" aria-hidden="true">${steps.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div>
    </div>
    <div class="sheet-actions">${i ? '<button class="btn" data-act="wl-back">Back</button>' : '<button class="btn" data-act="wl-skip">Skip</button>'}${last ? `<button class="btn primary" data-act="wl-start">${startLabel}</button>` : '<button class="btn primary" data-act="wl-next">Next</button>'}</div>
    ${last && S.demo ? '<button class="btn ghost wide" data-act="wl-skip" style="margin-top:6px">Look around the example first</button>' : ''}`;
}
function renderSheet() {
  const s = S.sheet; if (!s) return;
  const el = $('#sheet');
  if (s.kind === 'txn') {
    const t = s.id ? monthTx(s.ym).find(x => x.id === s.id) : null;
    if (t && t.type === 'adj') {
      const a = accById(t.acc), liab = isLiab(a);
      el.innerHTML = `<div class="grab"></div><h2>${esc(t.m || 'Balance correction')}</h2>
        <div class="kv"><span>${liab ? 'Card' : 'Account'}</span><span>${esc(accName(t.acc))}</span></div>
        <div class="kv"><span>Date</span><span>${esc(dayLabel(t.d))}</span></div>
        <div class="kv"><span>${liab ? 'Owed' : 'Balance'} you entered</span><span class="num">${money(shown(a, t.bal))}</span></div>
        ${t.first ? '' : `<div class="kv"><span>Correction</span><span class="num">${esc(adjText(t))}</span></div>`}
        <p class="muted" style="font-size:13px">Entered from your bank app. It isn't spending or income. Delete it and the balance goes back to the figure you entered before.</p>
        <div class="sheet-actions"><button class="btn danger" data-act="del-tx">Delete</button><button class="btn" data-act="close-sheet">Close</button></div>`;
      return;
    }
    const k = t ? kindOf(t) : 'exp';
    const type = k === 'inc' ? 'inc' : 'exp', isX = k === 'xfer';
    const defAcc = t ? t.acc : (S.filterAcc || (accts()[0] || {}).id);
    const defTo = t && t.to ? t.to : suggestTo(defAcc);
    const defDate = t ? t.d : (S.month === ymOf(todayISO()) ? todayISO() : S.month + '-01');
    el.innerHTML = `<div class="grab"></div><h2>${t ? (isX ? 'Edit transfer' : 'Edit transaction') : 'New transaction'}</h2>
      ${accts().length ? '' : '<div class="err">Add a card first in the Cards tab.</div>'}
      <label class="field"><span>Merchant or note</span><input class="in" id="f-m" value="${esc(t ? t.m : '')}" maxlength="60" autocomplete="off" autocorrect="off" enterkeyhint="next"></label>
      ${t && t.raw ? `<p class="raw num" style="margin:-4px 0 12px">Statement: ${esc(t.raw)}</p>` : ''}
      ${t ? '' : `<div id="f-sugg"${isX ? ' hidden' : ''}>${suggHtml(suggFor(''))}</div>`}
      <div class="row2"><label class="field"><span>Type</span><select class="in" id="f-kind">${kindOptions(k, accts().length > 1)}</select></label>
      <label class="field"><span>Amount</span><input class="in num" id="f-amt" inputmode="decimal" value="${t ? Math.abs(t.amt).toFixed(2) : ''}" placeholder="0.00"></label></div>
      <div class="row2"><label class="field"><span>Date</span><input class="in" id="f-date" type="date" value="${esc(defDate)}"></label>
      <label class="field"><span id="f-acc-l">${isX ? 'From' : 'Card'}</span><select class="in" id="f-acc">${accOptions(defAcc)}</select></label></div>
      <label class="field" id="f-to-w"${isX ? '' : ' hidden'}><span>To</span><select class="in" id="f-to">${accOptions(defTo)}</select></label>
      <p class="muted" id="f-x-note" style="font-size:13px;margin-top:-4px"${isX ? '' : ' hidden'}>A transfer moves money between your own accounts, like paying a card bill or topping up a wallet. It isn't spending.</p>
      <label class="field" id="f-cat-w"${isX ? ' hidden' : ''}><span>Category</span><select class="in" id="f-cat">${catOptions(type, t && t.cat ? t.cat : (S.filterCat || firstCat(type)))}</select></label>
      <div class="sheet-actions">${t ? '<button class="btn danger" data-act="del-tx">Delete</button>' : '<button class="btn" data-act="close-sheet">Cancel</button>'}<button class="btn primary" data-act="save-tx">Save</button></div>`;
  } else if (s.kind === 'card') {
    const a = s.id ? accById(s.id) : null;
    el.innerHTML = `<div class="grab"></div><h2>${a ? 'Edit card' : s.first ? 'Add your first card' : 'Add a card'}</h2>
      ${s.first ? '<p class="muted" style="margin-top:-8px">Add each card or account you track. You can add more later.</p>' : ''}
      <label class="field"><span>Name</span><input class="in" id="c-name" value="${esc(a ? a.name : '')}" placeholder="e.g. Rewards Visa" maxlength="40"></label>
      <div class="row2"><label class="field"><span>Last 4 digits</span><input class="in num" id="c-l4" inputmode="numeric" maxlength="4" value="${esc(a ? a.last4 : '')}" placeholder="1234"></label>
      <label class="field"><span>Type</span><select class="in" id="c-kind">${[['credit', 'Credit card'], ['debit', 'Debit card'], ['wallet', 'E-wallet'], ['cash', 'Cash'], ['other', 'Other']].map(([v, l]) => `<option value="${v}"${a && a.kind === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <label class="field"><span>Words on its screen (optional)</span><input class="in" id="c-match" value="${esc(a ? a.match || '' : '')}" placeholder="e.g. a word from the app's header" maxlength="80"></label>
      <p class="muted" style="font-size:13px;margin-top:0">Screenshots are matched to a card by its last 4 digits, its name, or these words. If a card's app shows more than 4 digits, enter the last 4. E-wallets can go without digits.</p>
      <div class="sheet-actions">${a ? '<button class="btn danger" data-act="del-card">Delete</button>' : '<button class="btn" data-act="close-sheet">Cancel</button>'}<button class="btn primary" data-act="save-card">Save</button></div>`;
  } else if (s.kind === 'bal') {
    const a = accById(s.id); if (!a) { closeSheet(); return; }
    const b = balances()[a.id], liab = isLiab(a);
    el.innerHTML = `<div class="grab"></div><h2>${b ? 'Update balance' : 'Add a balance'}</h2>
      <p class="muted" style="margin-top:-8px">${esc(accName(a.id))}</p>
      ${b ? `<div class="kv"><span>Snap Ledger expects</span><span class="num">${money(shown(a, b.v))}</span></div>
      <div class="kv"><span>Last checked</span><span>${esc(fmtDate(b.cp.d))}</span></div>` : ''}
      <label class="field" style="margin-top:12px"><span>${liab ? 'Amount owed' : 'Balance'} in your bank app now</span><input class="in num" id="b-val" inputmode="decimal" placeholder="0.00" autocomplete="off"></label>
      <p class="bal-diff" id="b-diff">${balDiffNote(a.id, NaN)}</p>
      <p class="muted" style="font-size:13px">${b ? "If it doesn't match, a correction entry makes up the difference. " : `From now on, everything on this ${liab ? 'card' : 'account'} moves its balance. `}Entries dated before today that you add later are treated as already in this figure.${liab ? ' If the card is in credit, enter a minus amount.' : ''}</p>
      <div class="sheet-actions">${b ? '<button class="btn danger" data-act="bal-stop">Stop tracking</button>' : '<button class="btn" data-act="close-sheet">Cancel</button>'}<button class="btn primary" data-act="bal-save">Save</button></div>`;
  } else if (s.kind === 'welcome') {
    renderWelcome(el, s);
  } else if (s.kind === 'settings') {
    const ruleN = Object.keys(st().rules || {}).length;
    const all = txCount();
    const lb = !S.demo && st().lastBackup;
    const catRow = (c, i, arr) => `<div class="cat-item"><input class="in" data-set="catname" data-id="${esc(c.id)}" value="${esc(c.name)}" aria-label="Category name" maxlength="32">
      <button class="mv" data-act="move-cat" data-id="${esc(c.id)}" data-k="-1" aria-label="Move ${esc(c.name)} up"${i === 0 ? ' disabled' : ''}>${ICON.up}</button><button class="mv" data-act="move-cat" data-id="${esc(c.id)}" data-k="1" aria-label="Move ${esc(c.name)} down"${i === arr.length - 1 ? ' disabled' : ''}>${ICON.down}</button>
      <button class="btn small" data-act="del-cat" data-id="${esc(c.id)}">Remove</button></div>`;
    el.innerHTML = `<div class="grab"></div><h2>Settings</h2>
      <div class="sub-h">Your data</div>
      <div class="kv"><span>Stored</span><span>${S.demo ? 'Example data, not saved' : S.mode === 'device' ? 'On this iPhone only' : 'Not being saved'}</span></div>
      <div class="kv"><span>Transactions</span><span class="num">${all}</span></div>
      <div class="kv"><span>Last backup</span><span>${lb ? esc(new Date(lb + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })) : 'Never'}</span></div>
      <p class="muted" style="font-size:13px">Your ledger lives only on this phone. Back it up now and then to Files or iCloud Drive so you can restore it on a new phone.</p>
      <div class="sheet-actions"><button class="btn" data-act="backup">Back up now</button><label class="btn" for="restore-file">Restore backup</label></div>
      <button class="btn wide" data-act="export" style="margin-top:10px">Export all as CSV</button>
      <div class="sub-h">Display</div>
      <label class="field"><span>When you add entries</span><select class="in" data-set="celebrate">${[['screen', 'Success screen with the bunny'], ['sweep', 'Bunny sweeps up the screen'], ['hop', 'Bunny hop'], ['off', 'Just a message']].map(([v, l]) => `<option value="${v}"${celebrateMode() === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field"><span>Currency symbol</span><input class="in" data-set="cur" value="${esc(cur())}" maxlength="4" style="max-width:120px"></label>
      <div class="sub-h">Expense categories</div><p class="muted" style="font-size:13px;margin:-4px 0 8px">Use the arrows to set the order they appear in across the app.</p><div class="cat-list">${cats().filter(c => c.type === 'exp').map(catRow).join('')}</div>
      <div class="sub-h">Income categories</div><div class="cat-list">${cats().filter(c => c.type === 'inc').map(catRow).join('')}</div>
      <div class="row2" style="grid-template-columns:1fr 110px auto"><input class="in" id="new-cat" placeholder="New category" maxlength="32"><select class="in" id="new-cat-type"><option value="exp">Expense</option><option value="inc">Income</option></select><button class="btn small" data-act="add-cat" style="height:44px">Add</button></div>
      <div class="sub-h">Scanning</div>
      <div class="kv"><span>Remembered merchants</span><span>${ruleN} ${ruleN ? '<button class="btn ghost small" data-act="clear-rules">Forget all</button>' : ''}</span></div>
      <button class="btn wide" data-act="wl-open" style="margin-top:4px">How Snap Ledger works</button>
      <p class="muted" style="font-size:13px">Snap Ledger ${APP_VERSION}. Works offline. Screenshots and statements are read on this phone and never uploaded.</p>
      <div class="sheet-actions" style="margin-top:12px"><button class="btn wide" data-act="close-sheet">Done</button></div>`;
  } else if (s.kind === 'restore') {
    const when = s.backup.exported ? new Date(s.backup.exported).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'an unknown date';
    el.innerHTML = `<div class="grab"></div><h2>Restore this backup?</h2>
      <p>Backup from <b>${esc(when)}</b> with <b>${s.count}</b> transaction${s.count === 1 ? '' : 's'} and ${s.backup.settings.accounts.length} card${s.backup.settings.accounts.length === 1 ? '' : 's'}.</p>
      ${!S.demo && txCount() ? `<div class="err">This replaces everything currently in the app (${txCount()} transactions).</div>` : ''}
      <div class="sheet-actions"><button class="btn" data-act="close-sheet">Cancel</button><button class="btn primary" data-act="restore-ok">Restore</button></div>`;
  }
}

function saveTx() {
  const s = S.sheet;
  const kind = $('#f-kind').value, amt = parseAmt($('#f-amt').value), d = $('#f-date').value, acc = $('#f-acc').value, cat = $('#f-cat').value, m = $('#f-m').value.trim();
  if (!(amt > 0)) return toast('Enter an amount above zero.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return toast('Pick a date.');
  if (!accById(acc)) return toast('Add a card first in the Cards tab.');
  let rec;
  if (kind === 'xfer') {
    const to = $('#f-to').value;
    if (!accById(to) || to === acc) return toast('Pick two different accounts for a transfer.');
    rec = { d, amt: round2(amt), type: 'xfer', acc, to, cat: '', m: m.slice(0, 60) || 'Transfer' };
    rememberPayFrom(acc, to); saveSettings();
  } else rec = { d, amt: round2(kind === 'ref' ? -amt : amt), type: kind === 'inc' ? 'inc' : 'exp', acc, cat, m: m.slice(0, 60) };
  const apply = o => { Object.assign(o, rec); if (rec.type !== 'xfer') delete o.to; return o; };
  const ym = ymOf(d);
  if (s.id) {
    const old = monthTx(s.ym).find(x => x.id === s.id);
    if (!old) { closeSheet(); return; }
    if (s.ym === ym) { apply(old); saveMonth(ym); }
    else {
      mo()[s.ym].txns = monthTx(s.ym).filter(x => x.id !== s.id); saveMonth(s.ym);
      if (!mo()[ym]) mo()[ym] = { month: ym, txns: [] };
      mo()[ym].txns.push(apply(old)); saveMonth(ym);
    }
    if (old.raw && rec.type !== 'xfer') { const k = SnapParse.normKey(old.raw); if (k) { const r = st().rules || (st().rules = {}); delete r[k]; r[k] = { c: cat, m: rec.m }; saveSettings(); } }
  } else {
    if (!mo()[ym]) mo()[ym] = { month: ym, txns: [] };
    mo()[ym].txns.push(Object.assign({ id: newId(), raw: '', src: 'manual', t: Date.now() }, rec)); saveMonth(ym);
  }
  closeSheet(); render();
  if (s.id) toast('Saved.');
  else celebrate({ badge: '+1 added', title: rec.type === 'xfer' ? 'Transfer added' : 'Added to your ledger',
    sub: rec.type === 'xfer' ? `${accShort(rec.acc)} → ${accShort(rec.to)} · ${money(rec.amt)}` : [rec.m || catName(rec.cat), money(Math.abs(rec.amt)) + (rec.amt < 0 ? ' refund' : ''), accShort(rec.acc)].join(' · ') }, 'Saved.');
}
function saveCard() {
  const name = $('#c-name').value.trim(), l4 = $('#c-l4').value.replace(/\D/g, '').slice(-4), kind = $('#c-kind').value, match = $('#c-match').value.trim().slice(0, 80);
  if (!name) return toast('Give the card a name.');
  const s = S.sheet;
  if (s.id) Object.assign(accById(s.id), { name, last4: l4, kind, match });
  else st().accounts.push({ id: newId(), name, last4: l4, kind, match });
  saveSettings(); closeSheet(); render(); toast(s.id ? 'Card updated.' : 'Card added.');
}

/* ---------- export ---------- */
async function exportCsv() {
  if (S.demo) { toast('Start your ledger first. The example data has nothing to export.'); return; }
  const q = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = [['Date', 'Card', 'Category', 'Merchant', 'Amount', 'Type', 'Statement text', 'To card', 'Balance entered']];
  const typeL = { inc: 'Income', ref: 'Refund', exp: 'Expense', xfer: 'Transfer', adj: 'Balance correction' };
  Object.keys(mo()).sort().forEach(ym => monthTx(ym).slice().sort((a, b) => a.d.localeCompare(b.d)).forEach(t => {
    const k = kindOf(t);
    rows.push([t.d, accName(t.acc), t.cat ? catName(t.cat) : '', t.m, t.amt.toFixed(2), typeL[k], t.raw || '', t.to ? accName(t.to) : '', k === 'adj' ? shown(accById(t.acc), t.bal).toFixed(2) : '']);
  }));
  await shareFile('snap-ledger-' + todayISO() + '.csv', rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv');
}

/* ---------- toast ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200); }

/* ---------- celebration ----------
   A bunny hops up, jumps for joy with a burst of confetti, shows how many entries went in, and hops
   away. Pure CSS and SVG, never blocks a tap. Off in Settings, and replaced by a plain message when
   the phone asks for reduced motion. */
const BUNNY_SVG = `<svg class="bunny" viewBox="0 0 120 140" width="104" height="121">
  <g class="bn-ear l"><ellipse class="fur" cx="45" cy="30" rx="10" ry="27"/><ellipse class="in" cx="45" cy="33" rx="4.6" ry="17"/></g>
  <g class="bn-ear r"><ellipse class="fur" cx="75" cy="30" rx="10" ry="27"/><ellipse class="in" cx="75" cy="33" rx="4.6" ry="17"/></g>
  <ellipse class="fur" cx="60" cy="106" rx="33" ry="28"/>
  <ellipse class="belly" cx="60" cy="111" rx="18" ry="15"/>
  <ellipse class="fur" cx="44" cy="131" rx="11" ry="6"/><ellipse class="fur" cx="76" cy="131" rx="11" ry="6"/>
  <circle class="fur" cx="60" cy="68" r="29"/>
  <ellipse class="ck" cx="41" cy="76" rx="6" ry="4"/><ellipse class="ck" cx="79" cy="76" rx="6" ry="4"/>
  <g class="bn-eyes open"><circle cx="50" cy="66" r="4"/><circle cx="70" cy="66" r="4"/><circle class="hl" cx="51.4" cy="64.6" r="1.3"/><circle class="hl" cx="71.4" cy="64.6" r="1.3"/></g>
  <g class="bn-eyes happy"><path d="M45.5 67.5q4.5-5.5 9 0"/><path d="M65.5 67.5q4.5-5.5 9 0"/></g>
  <path class="ns" d="M56.8 73.2h6.4a.8.8 0 0 1 .6 1.3l-3.2 3.1a.9.9 0 0 1-1.2 0l-3.2-3.1a.8.8 0 0 1 .6-1.3z"/>
  <path class="mo" d="M60 77.6v1.6M60 79.2q-2.6 2.6-5 .6M60 79.2q2.6 2.6 5 .6"/>
  <ellipse class="fur pw" cx="49" cy="99" rx="6.5" ry="5"/><ellipse class="fur pw" cx="71" cy="99" rx="6.5" ry="5"/>
</svg>`;
// Confetti pieces for a burst, flying mostly up and outwards, starting after `at` ms.
function confettiBits(at, n) {
  const colors = ['var(--accent)', '#FF8FAB', '#F2C14E', '#52C48E', '#9B8CFF', '#FF9F5A'], shapes = ['dot', 'bar', 'star'];
  let bits = '';
  for (let i = 0; i < n; i++) {
    const a = (-172 + i * (164 / (n - 1)) + (Math.random() * 10 - 5)) * Math.PI / 180, d = 58 + Math.random() * 44;
    bits += `<i class="bn-bit ${shapes[i % 3]}" style="--x:${(Math.cos(a) * d).toFixed(1)}px;--y:${(Math.sin(a) * d).toFixed(1)}px;--r:${Math.round(Math.random() * 360 - 180)}deg;--c:${colors[i % colors.length]};animation-delay:${at + Math.round(Math.random() * 70)}ms"></i>`;
  }
  return bits;
}
// How adding entries is celebrated: 'screen' (full success screen), 'sweep' (quick leap up the
// screen), 'hop' (small bunny hop) or 'off'.
const celebrateMode = () => { const s = st() || {}; return s.celebrate || (s.bunny === false ? 'off' : 'screen'); };
// info: { badge: short hop label, title, sub }. fallback: the plain message used when motion is off.
function celebrate(info, fallback) {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, mode = celebrateMode();
  if (reduce || mode === 'off') { if (fallback) toast(fallback); return; }
  document.querySelectorAll('.bn-fx,.ok-fx,.sw-fx').forEach(e => e.remove());
  clearTimeout(celebT); $('#toast').hidden = true;
  if (mode === 'hop') bunnyHop(info.badge, fallback);
  else if (mode === 'screen') successScreen(info);
  else bunnySweep(info.badge, fallback);
}
// The bunny leaps from the bottom of the screen and out the top in under a second, leaving a few
// sparkles where it passed. The pill says what was added.
function bunnySweep(label, fallback) {
  const colors = ['#F2C14E', '#FF8FAB', 'var(--accent)', '#52C48E', '#9B8CFF', '#FF9F5A', '#F2C14E'];
  // [height on screen, sideways offset, when the bunny passes (ms)]
  const stars = [[86, -34, 260], [76, 38, 320], [64, -26, 370], [52, 32, 420], [40, -36, 470], [28, 26, 520], [16, -22, 575]]
    .map(([y, x, t], i) => `<i class="sw-star" style="top:${y}%;margin-left:${x}px;animation-delay:${t}ms;--c:${colors[i]}"></i>`).join('');
  const el = document.createElement('div');
  el.className = 'sw-fx'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `${stars}<div class="sw-fly"><span class="sw-trail"></span><div class="sw-lean">${BUNNY_SVG}</div></div><div class="sw-pill">${esc(label)}</div>`;
  document.body.appendChild(el);
  $('#toast').textContent = fallback || label; // screen readers still hear it
  celebT = setTimeout(() => el.remove(), 1600);
}
let celebT, okClose = null;
function bunnyHop(label, fallback) {
  const sparks = [[-62, -18, 980], [58, -34, 1080], [-40, -70, 1180]].map(([x, y, t]) => `<i class="bn-spark" style="--x:${x}px;--y:${y}px;animation-delay:${t}ms"></i>`).join('');
  const el = document.createElement('div');
  el.className = 'bn-fx'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="bn-halo"></div><div class="bn-badge">${esc(label)}</div><div class="bn-burst">${confettiBits(620, 16)}${sparks}</div><div class="bn-shadow"></div><div class="bn-move"><div class="bn-squash">${BUNNY_SVG}</div></div>`;
  document.body.appendChild(el);
  $('#toast').textContent = fallback || label; // screen readers still hear it
  celebT = setTimeout(() => el.remove(), 2100);
}
// A full-screen moment: a ring draws itself, the bunny peeks up through it, a check pops in with
// confetti, and the summary fades up. Closes by itself, or on any tap.
function successScreen(info) {
  const el = document.createElement('div');
  el.className = 'ok-fx'; el.setAttribute('role', 'status');
  el.innerHTML = `<div class="ok-bg"></div>
    <div class="ok-stage" aria-hidden="true">
      <span class="ok-ring"></span><span class="ok-ring r2"></span>
      <svg class="ok-circle" viewBox="0 0 200 200"><circle class="ok-disc" cx="100" cy="100" r="78"/><circle class="ok-stroke" cx="100" cy="100" r="78"/></svg>
      <div class="ok-peek"><div class="ok-bunny">${BUNNY_SVG}</div></div>
      <svg class="ok-check" viewBox="0 0 54 54"><circle cx="27" cy="27" r="24"/><path d="M16 28l7.5 7.5L39 20"/></svg>
      <div class="ok-burst">${confettiBits(1000, 18)}</div>
    </div>
    <h2 class="ok-title">${esc(info.title || 'Added')}</h2>
    ${info.sub ? `<p class="ok-sub">${esc(info.sub)}</p>` : ''}
    <p class="ok-hint">Tap anywhere to continue</p>`;
  const close = () => { if (!el.isConnected || el.classList.contains('out')) return; el.classList.add('out'); okClose = null; setTimeout(() => el.remove(), 240); };
  el.addEventListener('click', e => { e.stopPropagation(); close(); });
  document.body.appendChild(el);
  okClose = close;
  celebT = setTimeout(close, 2800);
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  switch (act) {
    case 'tab': S.tab = b.dataset.tab; S.budgetEdit = false; render(); window.scrollTo(0, 0); break;
    case 'month': S.month = addMonths(S.month, +b.dataset.k); render(); break;
    case 'this-month': S.month = ymOf(todayISO()); render(); break;
    case 'goto-month': S.month = b.dataset.ym; render(); break;
    case 'settings': openSheet({ kind: 'settings' }); break;
    case 'close-sheet': closeSheet(); break;
    case 'wl-next': S.sheet.step = (S.sheet.step || 0) + 1; renderSheet(); $('#sheet').scrollTop = 0; break;
    case 'wl-back': S.sheet.step = Math.max(0, (S.sheet.step || 0) - 1); renderSheet(); $('#sheet').scrollTop = 0; break;
    case 'wl-skip': closeSheet(); break;
    case 'wl-start': { const demo = S.demo; closeSheet(); if (demo) startLedger(); break; }
    case 'wl-open': openSheet({ kind: 'welcome', step: 0 }); break;
    case 'start': startLedger(); break;
    case 'filter-acc': S.filterAcc = id && id !== S.filterAcc ? id : null; render(); break;
    case 'filter-cat': S.filterCat = id && id !== S.filterCat ? id : null; render(); break;
    case 'drill-cat': S.filterCat = id; S.filterAcc = null; S.tab = 'ledger'; render(); window.scrollTo(0, 0); break;
    case 'daily-cat': { S.dailyCat = id; lsSet('snapledger:dailyCat', id); const y = window.scrollY; render(); window.scrollTo(0, y); break; }
    case 'drill-day': {
      S.filterCat = id === 'all' ? null : id; S.filterAcc = null; S.tab = 'ledger'; render(); window.scrollTo(0, 0);
      const el = document.getElementById('day-' + b.dataset.d);
      if (el) { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600); }
      break;
    }
    case 'drill-acc': S.filterAcc = id; S.filterCat = null; S.tab = 'ledger'; render(); window.scrollTo(0, 0); break;
    case 'stats-by': S.statsBy = b.dataset.by; render(); break;
    case 'new-tx': openSheet({ kind: 'txn', id: null }); break;
    case 'edit-tx': openSheet({ kind: 'txn', id, ym: b.dataset.ym }); break;
    case 'save-tx': saveTx(); break;
    case 'sugg': { const x = S.sheet && S.sheet.sugg && S.sheet.sugg[+b.dataset.k]; if (x) applySugg(x); break; }
    case 'del-tx':
      if (b.dataset.armed) { const s = S.sheet; mo()[s.ym].txns = monthTx(s.ym).filter(x => x.id !== s.id); saveMonth(s.ym); closeSheet(); render(); toast('Deleted.'); }
      else { b.dataset.armed = '1'; b.textContent = 'Tap again to delete'; }
      break;
    case 'new-card': openSheet({ kind: 'card', id: null }); break;
    case 'edit-card': openSheet({ kind: 'card', id }); break;
    case 'save-card': saveCard(); break;
    case 'del-card': {
      const s = S.sheet; const n = Object.values(mo()).reduce((c, m) => c + ((m && m.txns) || []).filter(t => t.acc === s.id || t.to === s.id).length, 0);
      if (n) { toast(`This card has ${n} transaction${n === 1 ? '' : 's'}. Move or delete them first.`); break; }
      if (b.dataset.armed) { st().accounts = accts().filter(a => a.id !== s.id); saveSettings(); closeSheet(); render(); toast('Card deleted.'); }
      else { b.dataset.armed = '1'; b.textContent = 'Tap again to delete'; }
      break;
    }
    case 'bal': openSheet({ kind: 'bal', id }); setTimeout(() => { const i = $('#b-val'); if (i) i.focus(); }, 50); break;
    case 'bal-save': saveBalance(); break;
    case 'bal-stop':
      if (b.dataset.armed) {
        const acc = S.sheet.id;
        Object.keys(mo()).forEach(ym => { const n = monthTx(ym).length; mo()[ym].txns = monthTx(ym).filter(t => !(t.type === 'adj' && t.acc === acc)); if (mo()[ym].txns.length !== n) saveMonth(ym); });
        closeSheet(); render(); toast('Stopped tracking this balance.');
      } else { b.dataset.armed = '1'; b.textContent = 'Tap again to stop'; }
      break;
    case 'toggle-outside': {
      const c = catById(id); if (!c) break;
      c.outside = !c.outside; saveSettings(); render();
      toast(c.outside ? `${c.name} is now outside the monthly budget.` : `${c.name} is back in the monthly budget.`);
      break;
    }
    case 'drill-special': {
      const oc = cats().filter(c => c.type === 'exp' && c.outside);
      S.month = b.dataset.ym; S.filterCat = oc.length === 1 ? oc[0].id : null; S.filterAcc = null; S.tab = 'ledger'; render(); window.scrollTo(0, 0);
      break;
    }
    case 'budget-edit': S.budgetEdit = true; render(); break;
    case 'budget-cancel': S.budgetEdit = false; render(); break;
    case 'budget-save':
      cats().filter(c => c.type === 'exp').forEach(c => { const el = document.getElementById('b-' + c.id); if (!el) return; const v = parseAmt(el.value); c.budget = v > 0 ? round2(v) : null; });
      saveSettings(); S.budgetEdit = false; render(); toast('Budgets saved.');
      break;
    case 'add-cat': {
      const name = $('#new-cat').value.trim(), type = $('#new-cat-type').value;
      if (!name) break;
      st().categories.push({ id: 'c' + newId(), name: name.slice(0, 32), type, budget: null }); saveSettings(); renderSheet();
      break;
    }
    case 'move-cat': {
      const list = st().categories, c = catById(id); if (!c) break;
      const same = list.filter(x => x.type === c.type), i = same.indexOf(c), j = i + (+b.dataset.k);
      if (j < 0 || j >= same.length) break;
      const a = list.indexOf(c), o = list.indexOf(same[j]);
      list[a] = same[j]; list[o] = c;
      saveSettings();
      const sh = $('#sheet'), y = sh.scrollTop; renderSheet(); sh.scrollTop = y; render();
      const nb = sh.querySelector(`[data-act="move-cat"][data-id="${CSS.escape(id)}"][data-k="${b.dataset.k}"]`);
      if (nb && !nb.disabled) nb.focus();
      break;
    }
    case 'del-cat': {
      const n = Object.values(mo()).reduce((c, m) => c + ((m && m.txns) || []).filter(t => t.cat === id).length, 0);
      if (n) { toast(`${catName(id)} is used by ${n} transaction${n === 1 ? '' : 's'}. Recategorise them first.`); break; }
      const c = catById(id);
      if (cats().filter(x => x.type === c.type).length <= 1) { toast('Keep at least one category of each type.'); break; }
      st().categories = cats().filter(x => x.id !== id); saveSettings(); renderSheet(); render();
      break;
    }
    case 'clear-rules':
      if (b.dataset.armed) { st().rules = {}; saveSettings(); renderSheet(); toast('Forgot remembered merchants.'); }
      else { b.dataset.armed = '1'; b.textContent = 'Tap again'; }
      break;
    case 'export': exportCsv(); break;
    case 'imp-remove': { const f = S.imp.files.splice(+b.dataset.i, 1)[0]; if (f) try { URL.revokeObjectURL(f.url); } catch (x) {} render(); break; }
    case 'imp-read': readStatements(); break;
    case 'imp-stop': S.imp.stopped = true; if (S.imp.status === 'password') answerPassword(null); break;
    case 'rv-add': addBlankRow(); break;
    case 'rv-src': S.imp.showSource = !S.imp.showSource; { const y = window.scrollY; render(); window.scrollTo(0, y); } break;
    case 'backup': backupNow(); break;
    case 'restore-ok': if (S.sheet && S.sheet.backup) restoreBackup(S.sheet.backup); break;
    case 'pw-ok': answerPassword(($('#pdf-pw') || {}).value || ''); break;
    case 'pw-skip': answerPassword(null); break;
    case 'imp-back': S.imp.status = 'idle'; S.imp.rows = []; render(); break;
    case 'imp-reset': resetImport(); render(); break;
    case 'imp-approve': approveRows(); break;
    case 'rv-all': { const all = S.imp.rows.every(r => r.sel); S.imp.rows.forEach(r => r.sel = !all); $('#rv-list').innerHTML = vGroups(); $('#rv-foot').innerHTML = vFoot(); b.textContent = all ? 'Tick all' : 'Untick all'; break; }
  }
});

function onField(e, isChange) {
  const el = e.target;
  if (el.id === 'imp-acc') { S.imp.accountId = el.value; return; }
  if (el.id === 'restore-file') { if (isChange && el.files && el.files[0]) readBackup(el.files[0]); if (isChange) el.value = ''; return; }
  if (el.id === 'imp-text') {
    S.imp.text = el.value;
    const b = $('#imp-read-btn');
    if (b) { b.disabled = !readCount(); b.textContent = readLabel(); }
    return;
  }
  if (el.id === 'imp-file' && isChange) { addFiles(el.files); el.value = ''; return; }
  if (el.id === 'f-m' && !isChange && S.sheet && S.sheet.kind === 'txn' && !S.sheet.id) { const w = $('#f-sugg'); if (w) w.innerHTML = suggHtml(suggFor(el.value)); return; }
  if (el.id === 'b-val') { const d = $('#b-diff'); if (d && S.sheet) d.innerHTML = balDiffNote(S.sheet.id, parseAmt(el.value)); return; }
  if (el.id === 'f-acc' && isChange && $('#f-kind') && $('#f-kind').value === 'xfer') {
    const to = $('#f-to'); if (to && to.value === el.value) { const g = suggestTo(el.value); if (g) to.value = g; }
    return;
  }
  if (el.id === 'f-kind' && isChange) {
    const x = el.value === 'xfer';
    $('#f-to-w').hidden = !x; $('#f-x-note').hidden = !x; $('#f-cat-w').hidden = x; $('#f-acc-l').textContent = x ? 'From' : 'Card';
    const sg = $('#f-sugg'); if (sg) sg.hidden = x;
    if (x) { const to = $('#f-to'), from = $('#f-acc'); if (to.value === from.value) { const g = suggestTo(from.value); if (g) to.value = g; } return; }
    const type = el.value === 'inc' ? 'inc' : 'exp', cs = $('#f-cat');
    const keep = catById(cs.value) && catById(cs.value).type === type ? cs.value : firstCat(type);
    cs.innerHTML = catOptions(type, keep); return;
  }
  if (el.dataset.set && isChange) {
    if (el.dataset.set === 'budget') {
      const c = catById(el.dataset.id); if (!c) return;
      const v = parseAmt(el.value); c.budget = v > 0 ? round2(v) : null;
      el.value = c.budget ? c.budget : '';
      saveSettings();
      const t = $('#bgt-total'); if (t) t.textContent = money(cats().filter(x => x.type === 'exp' && !x.outside).reduce((s, x) => s + (x.budget > 0 ? x.budget : 0), 0), 0);
      return;
    }
    if (el.dataset.set === 'celebrate') { st().celebrate = el.value; delete st().bunny; saveSettings(); if (el.value !== 'off') celebrate({ badge: 'Hello!', title: 'Hello!', sub: 'This is how adding entries will look.' }); return; }
    if (el.dataset.set === 'cur') { st().cur = el.value.trim().slice(0, 4) || 'S$'; saveSettings(); render(); }
    if (el.dataset.set === 'catname') { const c = catById(el.dataset.id); const v = el.value.trim(); if (c && v) { c.name = v.slice(0, 32); saveSettings(); render(); } }
    return;
  }
  if (el.classList && el.classList.contains('grp-acc') && isChange) {
    const gi = +el.dataset.g, g = S.imp.groups[gi]; if (!g) return;
    g.acc = el.value; g.auto = true; g.inherited = false; g.why = 'your choice';
    S.imp.rows.forEach(r => { if (r.g !== gi) return; r.acc = el.value; if (r.kind === 'xfer') { if (r.dir === 'in') r.to = el.value; else r.from = el.value; } });
    markDuplicates();
    $('#rv-list').innerHTML = vGroups(); const foot = $('#rv-foot'); if (foot) foot.innerHTML = vFoot();
    return;
  }
  if ((el.id === 'bulk-cat' || el.id === 'bulk-acc') && isChange) {
    const v = el.value; if (!v) return;
    let n = 0;
    S.imp.rows.forEach(r => {
      if (!r.sel) return;
      if (el.id === 'bulk-acc') { r.acc = v; n++; }
      else if (r.kind !== 'inc' && r.kind !== 'xfer') { r.cat = v; r.conf = 'high'; r.learned = false; n++; }
    });
    $('#rv-list').innerHTML = vGroups(); el.value = '';
    toast(`Updated ${n} ticked line${n === 1 ? '' : 's'}.`);
    return;
  }
  const row = el.closest('.rv'); if (!row || !el.dataset.f) return;
  const r = S.imp.rows[+row.dataset.i], f = el.dataset.f; if (!r) return;
  if (f === 'sel') { r.sel = el.checked; row.classList.toggle('off', !r.sel); }
  else if (f === 'amt') { r.amt = Math.abs(parseAmt(el.value)); }
  else if (f === 'kind') {
    if (!isChange) return;
    const prev = r.kind; r.kind = el.value;
    if (r.kind === 'xfer' && prev !== 'xfer') {
      // Money out of this card or account (an expense line) goes to another. Money in came from one.
      r.dir = prev === 'exp' ? 'out' : 'in';
      const other = r.dir === 'in' ? suggestFrom(r.acc) : suggestTo(r.acc, r.raw || '', 'payment');
      r.from = r.dir === 'in' ? other : r.acc; r.to = r.dir === 'in' ? r.acc : other;
    }
    const type = r.kind === 'inc' ? 'inc' : 'exp';
    if (!catById(r.cat) || catById(r.cat).type !== type) r.cat = type === 'inc' ? (catById('cashback') ? 'cashback' : firstCat('inc')) : (catById('other') ? 'other' : firstCat('exp'));
    row.outerHTML = vRow(r, +row.dataset.i);
  }
  else if (f === 'cat') { r.cat = el.value; r.conf = 'high'; el.classList.remove('unsure'); }
  else if (f === 'from' || f === 'to') { r[f] = el.value; el.classList.toggle('unsure', !el.value); }
  else r[f] = el.value;
  if (r.invalid) { r.invalid = false; const rr = document.querySelector(`.rv[data-i="${row.dataset.i}"]`); if (rr) rr.classList.remove('invalid'); }
  const foot = $('#rv-foot'); if (foot) foot.innerHTML = vFoot();
}
document.addEventListener('input', e => onField(e, false));
document.addEventListener('change', e => onField(e, true));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && okClose) { okClose(); return; }
  if (e.key === 'Escape' && S.sheet) closeSheet();
  if (e.key === 'Enter' && e.target && e.target.id === 'pdf-pw') { e.preventDefault(); answerPassword(e.target.value || ''); }
});

['dragover', 'dragenter'].forEach(ev => document.addEventListener(ev, e => { const d = e.target.closest && e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } }));
['dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => { const d = e.target.closest && e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.remove('over'); if (ev === 'drop') addFiles(e.dataTransfer.files); } }));
document.addEventListener('paste', e => {
  if (S.tab !== 'import' || S.imp.status !== 'idle') return;
  const files = Array.from((e.clipboardData && e.clipboardData.files) || []).filter(f => f.type.startsWith('image/'));
  if (files.length) { e.preventDefault(); addFiles(files); }
});

/* ---------- boot ---------- */
async function boot() {
  render();
  await Store.init();
  if (S.demo && S.mode === 'device' && !lsGet('snapledger:welcomed')) openSheet({ kind: 'welcome', step: 0 });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    // A new version took over: reload into it, unless you're in the middle of something.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      if (S.imp.status !== 'idle' || S.sheet || S.imp.files.length || (S.imp.text || '').trim()) { toast('An update is ready. It loads the next time you open the app.'); return; }
      reloading = true; location.reload();
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      // Home Screen apps often resume without reloading, so look for updates whenever the app comes back.
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {});
  }
}
boot();
if (/[?&]debug\b/.test(location.search)) window.__snap = { prepImage, tsvToText, initOcr, ocrCall: (m, t) => ocrCall(m, t), S, celebrate };
})();
