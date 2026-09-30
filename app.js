(() => {
'use strict';
const APP_VERSION = '1.15.1';
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
  s.expIncome = 5200; s.saveTarget = 3500;
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
const kindOf = t => t.type === 'xfer' ? 'xfer' : t.type === 'adj' ? 'adj' : t.type === 'back' ? 'back' : t.type === 'inc' ? 'inc' : (t.amt < 0 ? 'ref' : 'exp');
/* Paid for someone else: an expense can carry t.owed = { by: 'work' | 'friends', amt }, the part
   that will be paid back. Balances still take the full charge, but only your share counts as
   spending. Money coming back is a payback (type 'back'): it raises the account it lands in and
   isn't income. Paybacks settle a group's oldest claims first. */
const OWERS = [['work', 'Work'], ['friends', 'Friends']];
const owerName = by => (OWERS.find(o => o[0] === by) || [by, 'Someone'])[1];
const owedOf = t => t.type === 'exp' && t.owed && t.owed.amt > 0 && t.amt > 0 ? Math.min(t.owed.amt, t.amt) : 0;
const spendAmt = t => t.type === 'exp' ? round2(t.amt - owedOf(t)) : 0;
const accShort = id => (accById(id) || { name: 'No card' }).name;
const isOutside = id => { const c = catById(id); return !!(c && c.outside); };
const budgetCats = () => cats().filter(c => c.type === 'exp' && !c.outside && c.budget > 0);
// Monthly categories (c.freq === 'monthly') are bills that land once a month, like rent or utilities.
// They're judged against their own budget only, not the daily pace.
const isMonthly = c => !!c && c.freq === 'monthly';
const allTx = () => Object.values(mo()).reduce((a, m) => a.concat((m && m.txns) || []), []);
const isLiab = a => !!a && a.kind === 'credit';
const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: iso.slice(0, 4) === todayISO().slice(0, 4) ? undefined : 'numeric' });
// Stats shows every amount in whole dollars (set while it renders); elsewhere, cents.
let moneyDp = null;
const money = (n, dp = 2) => { const d = moneyDp === null ? dp : moneyDp; return (n < 0 ? '−' : '') + cur() + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d }); };
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
  monthTx(ym).forEach(t => { if (t.type !== 'exp') return; if (accFilter && t.acc !== accFilter) return; m[t.cat] = (m[t.cat] || 0) + spendAmt(t); });
  return m;
}
function spendByAcc(ym) {
  const m = {};
  monthTx(ym).forEach(t => { if (t.type !== 'exp') return; m[t.acc] = (m[t.acc] || 0) + spendAmt(t); });
  return m;
}
function totals(list) {
  let spent = 0, income = 0;
  list.forEach(t => { if (t.type === 'exp') spent += spendAmt(t); else if (t.type === 'inc') income += t.amt; });
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
function budgetStatus(spent, budget, frac, rr) {
  if (!(budget > 0)) return null;
  const runRate = rr !== undefined ? rr : budget * Math.min(1, Math.max(0, frac));
  if (spent > budget + 0.004) return { k: 'bad', rank: 0, icon: ICON.over, label: 'Over', over: spent - budget, runRate };
  if (frac < 1 && spent > runRate + 0.004) return { k: 'warn', rank: 1, icon: ICON.warn, label: 'At risk', ahead: spent - runRate, runRate };
  return { k: 'good', rank: 2, icon: ICON.ok, label: frac >= 1 ? 'Within budget' : 'On track', under: runRate - spent, runRate };
}

/* ---------- balances ----------
   An account's balance starts from the latest figure you entered from your bank app. That figure is
   kept on a balance entry (type 'adj', figure in .bal). Entries dated after that day, or dated the
   same day and added after it, move the balance. Anything dated earlier is taken as already in the
   bank's figure, and anything dated after today hasn't happened yet. Balances are kept as net worth:
   accounts positive, card debt negative. shown() turns that into what the bank app shows. */
const sameOrAfter = (t, cp) => t.d > cp.d || (t.d === cp.d && (t.t || 0) > (cp.t || 0));
// The day money actually moved. A future-dated entry marked as already paid (t.paid) moves the
// balance from that day, while budgets and Stats still count it on its own date.
const moneyDay = t => t.paid && t.paid < t.d ? t.paid : t.d;
const shown = (a, v) => isLiab(a) ? -v : v;
function flowOf(t, id) {
  if (t.type === 'exp') return t.acc === id ? -t.amt : 0;
  if (t.type === 'inc' || t.type === 'back') return t.acc === id ? t.amt : 0;
  if (t.type === 'xfer') return (t.to === id ? t.amt : 0) - (t.acc === id ? t.amt : 0);
  return 0;
}
function balances() {
  const all = allTx(), out = {}, today = todayISO();
  all.forEach(t => { if (t.type === 'adj' && isFinite(t.bal) && accById(t.acc)) { const o = out[t.acc]; if (!o || sameOrAfter(t, o.cp)) out[t.acc] = { cp: t, v: 0 }; } });
  Object.keys(out).forEach(id => {
    const cp = out[id].cp; let v = cp.bal;
    all.forEach(t => {
      if (t.type === 'adj' || (t.acc !== id && t.to !== id)) return;
      const md = moneyDay(t);
      if (md <= today && sameOrAfter({ d: md, t: t.t }, cp)) v += flowOf(t, id);
    });
    out[id].v = round2(v);
  });
  return out;
}
// What each group still owes you. Paybacks settle claims oldest first, so one lump sum can clear several.
// A payback can say which claims it pays for (t.alloc = [{ id, amt }]). Those are applied first,
// then anything left over clears the oldest claims. skipId leaves one payback out (for editing it).
function owedState(skipId) {
  const all = allTx(), out = {};
  OWERS.forEach(([by]) => {
    const claims = all.filter(t => owedOf(t) && t.owed.by === by).sort((a, b) => a.d.localeCompare(b.d) || (a.t || 0) - (b.t || 0));
    const backs = all.filter(t => t.type === 'back' && t.by === by && t.id !== skipId);
    const left = {}; claims.forEach(t => { left[t.id] = owedOf(t); });
    const got = {}; // what each claim has received, and from which paybacks
    let pool = 0;
    backs.forEach(b => {
      let rem = b.amt;
      (b.alloc || []).forEach(a => {
        if (!(a.id in left) || rem <= 0) return;
        const use = round2(Math.min(a.amt, left[a.id], rem));
        left[a.id] = round2(left[a.id] - use); rem = round2(rem - use);
        (got[a.id] || (got[a.id] = [])).push(b.id);
      });
      pool = round2(pool + rem);
    });
    const list = claims.map(t => {
      const use = Math.min(pool, left[t.id]); pool = round2(pool - use);
      return { t, owed: owedOf(t), left: round2(left[t.id] - use) };
    });
    const claimed = round2(claims.reduce((n, t) => n + owedOf(t), 0)), paid = round2(backs.reduce((n, t) => n + t.amt, 0));
    out[by] = { list, open: list.filter(c => c.left > 0.004), outstanding: round2(claimed - paid) };
  });
  return out;
}
// The tick list of claims on a payback: open ones for that group, plus any this payback already covers.
function settleList(by, t, preset) {
  const st0 = owedState(t ? t.id : null)[by], mine = new Set(((t && t.alloc) || []).map(a => a.id).concat(preset ? [preset] : []));
  const rows = st0.list.filter(c => c.left > 0.004 || mine.has(c.t.id));
  if (!rows.length) return `<p class="muted" style="font-size:13px;margin:0 0 12px">Nothing open for ${esc(owerName(by))} right now.</p>`;
  return rows.map(c => `<label class="set-row"><input type="checkbox" data-claim="${esc(c.t.id)}" data-left="${c.left.toFixed(2)}"${mine.has(c.t.id) ? ' checked' : ''}>
    <span class="set-m">${esc(c.t.m || catName(c.t.cat))} <span class="muted">${esc(fmtDate(c.t.d))}</span></span><span class="num">${money(c.left)}${c.left < c.owed - 0.004 ? ` <span class="muted">of ${money(c.owed)}</span>` : ''}</span></label>`).join('');
}
function tickedClaims() { return [...document.querySelectorAll('#f-set [data-claim]:checked')].map(e => ({ id: e.dataset.claim, left: +e.dataset.left })); }
function fillFromTicks() {
  const a = $('#f-amt'); if (!a || !S.sheet) return;
  if (a.value && !S.sheet.amtAuto) return;
  const sum = round2(tickedClaims().reduce((n, c) => n + c.left, 0));
  a.value = sum > 0 ? sum.toFixed(2) : ''; S.sheet.amtAuto = true;
}
function paidFor(t) {
  const a = t.alloc || []; if (!a.length) return '';
  if (a.length > 1) return ` · for ${a.length} claims`;
  const c = allTx().find(x => x.id === a[0].id);
  return c ? ` · for ${esc(c.m || catName(c.cat))}` : '';
}
// Cards tab: what Work and Friends still owe you, with their open claims (oldest first).
function owedSection(ow) {
  const any = OWERS.some(([by]) => ow[by].list.length || Math.abs(ow[by].outstanding) > 0.004);
  if (!any) return '';
  let h = `<section class="sec" id="owed"><div class="sec-h"><h2>Owed to you</h2><span class="muted" style="font-size:13px">Paid for work or friends</span></div>`;
  h += OWERS.map(([by, name]) => {
    const o = ow[by];
    if (!o.list.length && Math.abs(o.outstanding) < 0.005) return '';
    const open = o.open.slice(0, 6);
    return `<div class="ow-grp">
      <div class="ow-top"><span class="ow-name">${esc(name)}</span><span class="num ow-amt${o.outstanding < -0.004 ? ' t-good' : ''}">${o.outstanding < -0.004 ? `${money(-o.outstanding)} extra paid` : money(o.outstanding)}</span></div>
      ${open.length ? `<div class="ow-list">${open.map(c => `<button class="ow-row" data-act="edit-tx" data-id="${esc(c.t.id)}" data-ym="${esc(ymOf(c.t.d))}"><span>${esc(c.t.m || catName(c.t.cat))} <span class="muted">${esc(fmtDate(c.t.d))}</span></span><span class="num">${money(c.left)}${c.left < c.owed - 0.004 ? ` <span class="muted">of ${money(c.owed)}</span>` : ''}</span></button>`).join('')}${o.open.length > open.length ? `<p class="muted" style="font-size:12px;margin:4px 0 0">and ${o.open.length - open.length} more</p>` : ''}</div>`
        : `<p class="muted" style="font-size:13px;margin:4px 0 0">All settled.</p>`}
      <button class="btn small wide" data-act="new-payback" data-by="${by}" style="margin-top:8px">Record a payback from ${esc(name)}</button>
    </div>`;
  }).join('');
  return h + `<p class="muted" style="font-size:12px;margin:10px 0 0">Mark an expense as paid back by Work or Friends when you add or edit it. Tap a claim to record a payback for it, or tick several at once for a lump sum.</p></section>`;
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
const owerOptions = sel => OWERS.map(([v, l]) => `<option value="${v}"${v === sel ? ' selected' : ''}>${l}</option>`).join('');
const pickOptions = sel => `<option value=""${sel ? '' : ' selected'}>Pick…</option>` + accOptions(sel);
const kindOptions = (sel, withX) => [['exp', 'Expense'], ['ref', 'Refund'], ['inc', 'Income']].concat(withX ? [['xfer', 'Transfer']] : [], [['back', 'Payback']]).map(([v, l]) => `<option value="${v}"${v === sel ? ' selected' : ''}>${l}</option>`).join('');
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
  const spec = S.filterCat ? 0 : round2(list.reduce((n, t) => n + (t.type === 'exp' && isOutside(t.cat) ? spendAmt(t) : 0), 0));
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
    const dayNet = g.items.reduce((s, t) => s + spendAmt(t), 0);
    return `<section class="day" id="day-${esc(g.d)}"><div class="day-h"><span>${esc(dayLabel(g.d))}</span><span class="num">${money(dayNet)}</span></div>
      ${g.items.map(t => {
        const k = kindOf(t), open = `<button class="tx" data-act="edit-tx" data-id="${esc(t.id)}" data-ym="${esc(ymOf(t.d))}">`;
        if (k === 'xfer') return `${open}<span class="tx-cat">Transfer</span>
          <span class="tx-main"><span class="tx-m">${esc(t.m || 'Transfer')}</span><span class="tx-acc">${esc(accShort(t.acc))} → ${esc(accShort(t.to))}${whenTag(t)}</span></span>
          <span class="tx-amt xfer">${money(t.amt)}</span></button>`;
        if (k === 'back') return `${open}<span class="tx-cat">Payback</span>
          <span class="tx-main"><span class="tx-m">${esc(t.m || owerName(t.by) + ' paid back')}</span><span class="tx-acc">${esc(owerName(t.by))} → ${esc(accShort(t.acc))}${paidFor(t)}${whenTag(t)}</span></span>
          <span class="tx-amt back">+${money(t.amt)}</span></button>`;
        if (k === 'adj') { const a = accById(t.acc); return `${open}<span class="tx-cat">Balance</span>
          <span class="tx-main"><span class="tx-m">${esc(t.m || 'Balance correction')}</span><span class="tx-acc">${esc(accShort(t.acc))} · ${isLiab(a) ? 'owed' : 'balance'} ${money(shown(a, t.bal))}</span></span>
          <span class="tx-amt adj">${esc(adjText(t))}</span></button>`; }
        return `<button class="tx" data-act="edit-tx" data-id="${esc(t.id)}" data-ym="${esc(ymOf(t.d))}">
          <span class="tx-cat">${esc(catName(t.cat))}</span>
          <span class="tx-main"><span class="tx-m">${esc(t.m || catName(t.cat))}</span><span class="tx-acc">${owedOf(t) ? `<span class="tx-ow">${esc(owerName(t.owed.by))} owe${t.owed.by === 'work' ? 's' : ''} ${money(owedOf(t))}</span> · ` : ''}${esc(accName(t.acc))}${k === 'ref' ? ' · Refund' : ''}${whenTag(t)}</span></span>
          <span class="tx-amt ${k}">${k === 'inc' ? '+' : ''}${money(k === 'ref' ? Math.abs(t.amt) : t.amt)}</span>
        </button>`;
      }).join('')}</section>`;
  }).join('');
  return h;
}

/* ---------- stats ----------
   Stats answers, in this order: how much can I still spend a day this month, will I hit my
   savings target, which categories are off, and (on tap) when the spending happened and how the
   month compares with the ones before. Every amount here is in whole dollars. */
const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const monthName = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-SG', { month: 'long' });
function vStats() {
  moneyDp = 0;
  try { const P = monthPlan(S.month); return heroSection(P) + spendingSection(P) + savingsSection(S.month) + specialYear(S.month); }
  finally { moneyDp = null; }
}
// Where a month stands against its budget. Daily categories are paced evenly through the month.
// Monthly bills count once they land, up to their budget, and anything over comes out of what's
// left for daily spending.
function monthPlan(ym) {
  const today = todayISO(), nowYm = ymOf(today), sp = spendByCat(ym);
  const isNow = ym === nowYm, past = ym < nowYm, future = ym > nowYm, days = daysIn(ym);
  const day = isNow ? +today.slice(8, 10) : past ? days : 0, frac = elapsedFrac(ym);
  const withB = budgetCats(), daily = withB.filter(c => !isMonthly(c)), monthly = withB.filter(isMonthly);
  const v = c => sp[c.id] || 0, sum = (list, f) => list.reduce((n, c) => n + f(c), 0);
  const dB = sum(daily, c => c.budget), dSp = sum(daily, v);
  const totalB = sum(withB, c => c.budget), spentB = sum(withB, v);
  const mOver = sum(monthly, c => Math.max(0, v(c) - c.budget));
  const plan = dB * Math.min(1, Math.max(0, frac)) + sum(monthly, c => Math.min(v(c), c.budget));
  const daysLeft = isNow ? days - day + 1 : 0;
  const todaySp = isNow ? spentOn(ym, today, new Set(daily.map(c => c.id))) : 0;
  const unb = Object.keys(sp).filter(id => Math.abs(sp[id]) > 0.004 && !isOutside(id) && !withB.some(c => c.id === id)).sort((a, b) => sp[b] - sp[a]);
  return {
    ym, isNow, past, future, days, day, frac, daysLeft, sp, withB, daily, monthly,
    dB, totalB, spentB, plan, mOver, todaySp,
    // A day's share counts today in full, so it's worked out from spending before today: it holds
    // steady through the day and equals the plan when you're on pace.
    perDay: daysLeft && dB > 0 ? Math.max(0, dB - (dSp - todaySp) - mOver) / daysLeft : null,
    planned: dB / days,
    status: totalB && !future ? budgetStatus(spentB, totalB, frac, plan) : null,
    due: past ? [] : monthly.filter(c => v(c) <= 0.004),
    overBills: monthly.filter(c => v(c) > c.budget + 0.004),
    unb
  };
}
function spentOn(ym, iso, ids) {
  return round2(monthTx(ym).reduce((n, t) => n + (t.type === 'exp' && t.d === iso && ids.has(t.cat) ? spendAmt(t) : 0), 0));
}
// "For the next 19 days, today included." and the plan it compares with.
const daysPhrase = P => P.daysLeft === 1 ? `for today, the last day of ${esc(monthName(P.ym))}` : `for the next ${P.daysLeft} days, today included`;
const listNames = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const pillOf = x => x ? `<span class="pill ${x.k}">${x.icon || ''}${esc(x.label)}</span>` : '';
// A category against its own budget: one status, in words.
function catState(c, P) {
  const v = P.sp[c.id] || 0, left = c.budget - v;
  if (v > c.budget + 0.004) return { k: 'bad', icon: ICON.over, label: 'Over', text: `${money(v - c.budget)} over` };
  if (isMonthly(c)) {
    if (v <= 0.004) return P.past ? { k: 'idle', label: 'Nothing this month', text: 'Nothing this month' } : { k: 'idle', label: 'Not yet', text: `${money(c.budget)} due` };
    if (left < 0.5) return { k: 'good', icon: ICON.ok, label: 'Paid', text: 'Paid' };
    return { k: 'good', icon: ICON.ok, label: 'Within budget', text: `${money(left)} ${P.past ? 'under' : 'left'}` };
  }
  if (P.isNow && v > c.budget * P.frac + 0.004) return { k: 'warn', icon: ICON.warn, label: 'At risk', text: `${money(v - c.budget * P.frac)} over plan`, long: `${money(v - c.budget * P.frac)} over today's plan` };
  return { k: 'good', icon: ICON.ok, label: P.past ? 'Within budget' : 'On track', text: `${money(left)} ${P.past ? 'under' : 'left'}` };
}
// The gap between spending and the plan, for the whole budget.
function gapText(P) {
  const x = P.status;
  if (!x) return P.spentB > P.totalB + 0.004 ? `<span class="t-bad">${money(P.spentB - P.totalB)} over budget</span>` : `${money(P.totalB - P.spentB)} left`;
  if (x.k === 'bad') return `<span class="t-bad">${money(x.over)} over budget</span>`;
  if (x.k === 'warn') return `<span class="t-warn">${money(x.ahead)} over today's plan</span>`;
  return P.isNow ? `${money(x.under)} under today's plan` : `${money(P.totalB - P.spentB)} under budget`;
}
function heroSection(P) {
  const ym = P.ym, mName = monthName(ym);
  const k = P.isNow ? `Day ${P.day} of ${P.days}` : esc(mName);
  let h = `<section class="sec hero"><div class="hero-top"><span class="hero-k">${k}</span>${P.future && P.totalB ? '<span class="pill idle">Not started</span>' : pillOf(P.status)}</div>`;
  if (!P.totalB) {
    const total = Object.keys(P.sp).reduce((n, id) => n + (isOutside(id) ? 0 : P.sp[id]), 0);
    h += `<div class="hero-big"><span class="num">${money(total)}</span><small>spent</small></div>
      <p class="hero-sub">Set monthly budgets to see whether you're on track and how much you can spend a day.</p>
      <button class="btn small" data-act="tab" data-tab="budget" style="margin-top:12px">Set budgets</button>`;
    return h + heroLinks(ym) + `</section>`;
  }
  if (P.isNow && P.perDay !== null) {
    const none = P.perDay < 0.5;
    h += `<div class="hero-big"><span class="num">${money(P.perDay)}</span><small>a day</small></div>
      <p class="hero-sub">${none ? `Nothing left for daily spending in ${esc(mName)}.` : daysPhrase(P).replace(/^f/, 'F') + '.'} You planned <span class="num">${money(P.planned)}</span> a day.${P.todaySp > 0.004 ? ` Today so far: <span class="num">${money(P.todaySp)}</span>.` : ''}</p>`;
  } else if (P.isNow) {
    h += `<div class="hero-big"><span class="num">${money(Math.max(0, P.totalB - P.spentB))}</span><small>left</small></div>
      <p class="hero-sub">Of your <span class="num">${money(P.totalB)}</span> budget for ${esc(mName)}.</p>`;
  } else if (P.past) {
    const d = P.spentB - P.totalB;
    h += `<div class="hero-big${d > 0.004 ? ' t-bad' : ''}"><span class="num">${money(Math.abs(d))}</span><small>${d > 0.004 ? 'over budget' : 'under budget'}</small></div>`;
  } else {
    h += `<div class="hero-big"><span class="num">${money(Math.max(0, P.totalB - P.spentB))}</span><small>left</small></div>
      <p class="hero-sub">Of your <span class="num">${money(P.totalB)}</span> budget.${P.spentB > 0.004 ? ` <span class="num">${money(P.spentB)}</span> already booked.` : ''}</p>`;
  }
  // One bar for the whole budget. The marker is where spending would be today if it followed the plan.
  const pct = Math.min(100, P.spentB / P.totalB * 100), mk0 = P.plan / P.totalB * 100, mk = P.isNow && mk0 > 0 && mk0 < 100 ? mk0 : null;
  const fk = P.status ? P.status.k : 'idle';
  h += `<div class="hbar${mk !== null ? ' marked' : ''}">${mk !== null ? `<span class="hbar-lab" style="left:${Math.min(92, Math.max(8, mk)).toFixed(1)}%">Today</span>` : ''}
      <div class="track lg"><div class="fill ${fk}" style="width:${pct.toFixed(1)}%"></div>${mk !== null ? `<div class="tick" style="left:${mk.toFixed(1)}%"></div>` : ''}</div></div>
    ${P.future ? '' : `<div class="bar-sub"><span class="num">${money(P.spentB)} of ${money(P.totalB)}</span><span>${P.past ? `${Math.round(P.spentB / P.totalB * 100)}% of budget` : gapText(P)}</span></div>`}`;
  const notes = [];
  if (P.isNow && P.overBills.length) notes.push(`${esc(listNames(P.overBills.map(c => c.name)))} ${P.overBills.length > 1 ? 'are' : 'is'} <span class="num">${money(P.overBills.reduce((n, c) => n + P.sp[c.id] - c.budget, 0))}</span> over budget, so there's less for daily spending.`);
  if (!P.past && P.due.length) notes.push(P.due.length > 3 ? `Still to come: <span class="num">${money(P.due.reduce((n, c) => n + c.budget, 0))}</span> in ${P.due.length} monthly bills.`
    : `Still to come: ${P.due.map(c => `${esc(c.name)} <span class="num">${money(c.budget)}</span>`).join(', ')}.`);
  if (notes.length) h += notes.map(n => `<p class="hero-note">${n}</p>`).join('');
  return h + heroLinks(ym) + `</section>`;
}
// Savings for the month in one line, then the way into the day by day and the trend.
function heroLinks(ym) {
  let save = '';
  const since = savingsSince(), nowYm = ymOf(todayISO());
  if (since && since <= ym) {
    const proj = ym >= nowYm, saved = (proj ? projectMonth(ym) : monthFlow(ym)).saved, target = st().saveTarget > 0 ? st().saveTarget : 0;
    const verb = proj ? (saved >= 0 ? 'Projected to save' : 'Projected shortfall') : (saved >= 0 ? 'Saved' : 'Spent more than earned by');
    const cls = saved < 0 ? 't-bad' : target && saved >= target - 0.004 ? 't-good' : '';
    save = `<button class="hero-link" data-act="goto-savings"><span>${verb} <b class="num ${cls}">${money(Math.abs(saved))}</b>${target && saved > 0 ? ` · ${Math.round(saved / target * 100)}% of target` : ''}</span>${CHEV}</button>`;
  }
  return `<div class="hero-links">${save}<button class="hero-link" data-act="stat-open" data-id="all"><span>Day by day and trend</span>${CHEV}</button></div>`;
}
function spendingSection(P) {
  const byCard = S.statsBy === 'acc';
  const seg = `<div class="seg" role="group" aria-label="Show spending by"><button class="${byCard ? '' : 'on'}" data-act="stats-by" data-by="cat" aria-pressed="${!byCard}">Category</button><button class="${byCard ? 'on' : ''}" data-act="stats-by" data-by="acc" aria-pressed="${byCard}">Card</button></div>`;
  let h = `<section class="sec" id="spending"><div class="sec-h"><h2>Spending</h2>${seg}</div>`;
  if (byCard) return h + cardRows(P.ym) + `</section>`;
  if (!P.withB.length && !P.unb.length) return h + `<p class="sv-note" style="margin:0">Nothing spent in ${esc(monthLabel(P.ym))} yet.</p></section>`;
  // In your category order (Settings), so each one is always in the same place.
  h += P.withB.map(c => {
    const v = P.sp[c.id] || 0, x = catState(c, P), mon = isMonthly(c);
    return `<button class="crow" data-act="stat-open" data-id="${esc(c.id)}" aria-label="${esc(c.name)}${mon ? ', monthly' : ''}: ${money(v)} of ${money(c.budget)}, ${esc(x.text)}">
      <span class="crow-top"><span class="crow-name">${esc(c.name)}${mon ? '<span class="bar-tag">Monthly</span>' : ''}</span><span class="crow-st ${x.k}">${esc(x.text)}</span></span>
      <span class="track"><span class="fill ${x.k}" style="width:${Math.min(100, Math.max(0, v / c.budget * 100)).toFixed(1)}%"></span>${!mon && P.isNow && P.frac < 1 ? `<span class="tick" style="left:${(P.frac * 100).toFixed(1)}%"></span>` : ''}</span>
      <span class="crow-amt num">${money(v)} of ${money(c.budget)}</span>${CHEV}</button>`;
  }).join('');
  if (P.unb.length) {
    if (P.withB.length) h += `<div class="crow-h">No budget</div>`;
    h += P.unb.map(id => `<button class="crow plain" data-act="stat-open" data-id="${esc(id)}"><span class="crow-top"><span class="crow-name">${esc(catName(id))}</span><span class="crow-st num">${money(P.sp[id])}</span></span>${CHEV}</button>`).join('');
  }
  return h + `</section>`;
}
function cardRows(ym) {
  const m = spendByAcc(ym);
  const rows = Object.entries(m).filter(([, v]) => v > 0.004).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  const total = rows.reduce((s, r) => s + r.v, 0);
  if (!rows.length) return `<p class="sv-note" style="margin:0">No card spending in ${esc(monthLabel(ym))}.</p>`;
  return rows.map(r => {
    const share = Math.round(r.v / total * 100);
    return `<button class="crow" data-act="drill-acc" data-id="${esc(r.id)}" aria-label="${esc(accName(r.id))}: ${money(r.v)}, ${share}% of spending">
      <span class="crow-top"><span class="crow-name">${esc(accName(r.id))}</span><span class="crow-st num">${money(r.v)}</span></span>
      <span class="track"><span class="fill" style="width:${share}%"></span></span>
      <span class="crow-amt">${share}% of spending</span>${CHEV}</button>`;
  }).join('');
}

/* The detail sheet for the whole month ('all') or one category: its status, what's left a day,
   the month day by day, and the last six months. */
function statSheet(el, s) {
  moneyDp = 0;
  try { el.innerHTML = statSheetHtml(s.id); } finally { moneyDp = null; }
}
function statSheetHtml(id) {
  const ym = S.month, P = monthPlan(ym), all = id === 'all', c = all ? null : catById(id);
  const mName = monthName(ym), budgeted = !all && P.withB.some(x => x.id === id), mon = budgeted && isMonthly(c);
  const name = all ? (P.totalB ? `${mName} budget` : `${mName} spending`) : catName(id);
  const v = all ? P.spentB : P.sp[id] || 0;
  // Top: what's been spent against the budget, the status in words, and what's left a day.
  let pill = '', of = '', line = '', per = '';
  const tone = k => k === 'bad' ? 't-bad' : k === 'warn' ? 't-warn' : '';
  if (all && P.totalB) {
    pill = P.future ? '<span class="pill idle">Not started</span>' : pillOf(P.status);
    of = `of <span class="sm-num">${money(P.totalB)}</span>`; line = gapText(P);
    if (P.perDay !== null) per = `${P.perDay < 0.5 ? 'Nothing left for daily spending.' : `<span class="num">${money(P.perDay)}</span> a day ${daysPhrase(P)}.`} You planned <span class="num">${money(P.planned)}</span> a day.`;
  } else if (all) {
    of = 'spent'; line = 'No budgets set';
  } else if (budgeted) {
    const x = catState(c, P);
    pill = pillOf(x.k === 'idle' ? { k: 'idle', label: x.label } : x);
    of = `of <span class="sm-num">${money(c.budget)}</span>`; line = `<span class="${tone(x.k)}">${esc(x.long || (x.k === 'bad' ? x.text + ' budget' : x.text))}</span>`;
    if (!mon && P.isNow) {
      const before = v - spentOn(ym, todayISO(), new Set([id])), left = Math.max(0, c.budget - before) / P.daysLeft;
      per = `${left < 0.5 ? `Nothing left ${P.daysLeft === 1 ? 'for today' : 'for the rest of the month'}.` : `<span class="num">${money(left)}</span> a day ${daysPhrase(P)}.`} You planned <span class="num">${money(c.budget / P.days)}</span> a day.`;
    } else if (mon) per = 'Paid monthly, so it has no daily budget.';
  } else {
    of = 'spent'; line = 'No budget set';
  }
  const shown = all && !P.totalB ? Object.keys(P.sp).reduce((n, k) => n + (isOutside(k) ? 0 : P.sp[k]), 0) : v;
  // Day by day. For the whole month that's daily categories only, so a monthly bill landing
  // doesn't read as a blowout. A category with a daily budget is measured against its share a day.
  const dailyIds = P.daily.length ? P.daily : P.withB;
  const calIds = all ? (P.totalB ? new Set(dailyIds.map(x => x.id)) : null) : new Set([id]);
  const calB = all ? (P.totalB && P.daily.length ? P.dB : 0) : budgeted && !mon ? c.budget : 0;
  const cal = calendar(ym, calIds ? (k => calIds.has(k)) : (k => !isOutside(k)), calB / P.days, all ? 'all' : id);
  // Six months: the whole budget, or this category, against its budget line.
  const tIds = all ? (P.totalB ? new Set(P.withB.map(x => x.id)) : null) : new Set([id]);
  const tr = trendChart(ym, tIds ? (k => tIds.has(k)) : (k => !isOutside(k)), all ? P.totalB : budgeted ? c.budget : 0);
  const split = all && P.totalB && P.monthly.length && P.daily.length;
  return `<div class="grab"></div>
    <p class="st-k">${esc(monthLabel(ym))}</p>
    <div class="st-head"><h2>${esc(name)}${mon ? '<span class="bar-tag">Monthly</span>' : ''}</h2>${pill}</div>
    <div class="hero-big st-big"><span class="num">${money(shown)}</span><small>${of}</small></div>
    <p class="st-sub">${line}.${per ? ' ' + per : ''}</p>
    <div class="st-sec"><div class="sec-h"><h3>Day by day</h3>${split ? '<span class="sec-r">Daily categories</span>' : ''}</div>${cal}</div>
    <div class="st-sec"><div class="sec-h"><h3>Last six months</h3>${split ? '<span class="sec-r">Whole budget</span>' : ''}</div>${tr}</div>
    <div class="sheet-actions st-acts"><button class="btn" data-act="stat-ledger" data-id="${esc(id)}">See transactions</button><button class="btn primary" data-act="close-sheet">Done</button></div>`;
}
// The month as a calendar of each day's spending. With a daily budget (allow), days above it are
// shaded by how far above: up to 25%, 75%, 150%, and beyond.
function calendar(ym, inSel, allow, cid) {
  const days = daysIn(ym), nowYm = ymOf(todayISO());
  const upto = ym < nowYm ? days : ym > nowYm ? 0 : new Date().getDate();
  const byDay = new Array(days + 1).fill(0);
  monthTx(ym).forEach(t => { if (t.type === 'exp' && inSel(t.cat)) byDay[+t.d.slice(8, 10)] += spendAmt(t); });
  const paced = allow > 0;
  let overDays = 0;
  const lead = (new Date(ym + '-01T00:00:00').getDay() + 6) % 7;
  const short = x => x >= 9999.5 ? Math.round(x / 1000) + 'k' : Math.round(x).toLocaleString('en-SG');
  let cells = '';
  for (let k = 0; k < lead; k++) cells += '<span class="cal-d blank"></span>';
  for (let d = 1; d <= days; d++) {
    const x = round2(byDay[d]), iso = ym + '-' + pad(d), fut = d > upto, over = paced && !fut && x > allow + 0.004;
    if (over) overDays++;
    const ratio = paced ? x / allow : 0;
    const heat = ratio <= 1.25 ? 'h1' : ratio <= 1.75 ? 'h2' : ratio <= 2.5 ? 'h3' : 'h4';
    const cls = over ? 'over ' + heat : fut ? 'fut' : x > 0.004 ? 'in' : 'zero';
    const label = `${dayLabel(iso)}: ${x > 0.004 ? money(x) : 'no spending'}${over ? ', ' + money(x - allow) + ' above the daily budget' : ''}`;
    cells += `<button class="cal-d ${cls}${fut && x > 0.004 ? ' ahead' : ''}" data-act="drill-day" data-id="${esc(cid)}" data-d="${iso}" aria-label="${esc(label)}"${fut && x <= 0.004 ? ' disabled' : ''}><span class="cal-n">${d}</span><span class="cal-v">${x > 0.004 ? short(x) : ''}</span></button>`;
  }
  const note = !upto ? `${esc(monthName(ym))} hasn't started.`
    : paced ? (overDays ? `Above the daily budget of <span class="num">${money(allow)}</span> on <b>${overDays} of ${upto}</b> day${upto === 1 ? '' : 's'}. Darker days went further above it.` : `Within the daily budget of <span class="num">${money(allow)}</span> every day${ym === nowYm ? ' so far' : ''}.`)
    : 'Tap a day to see what was spent.';
  return `<div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(w => `<span class="cal-w">${w}</span>`).join('')}${cells}</div><p class="st-note">${note}</p>`;
}
// Six months up to this one, with the monthly budget as a labelled dashed line.
function trendChart(ym, inSel, budget) {
  const months = []; for (let k = -5; k <= 0; k++) months.push(addMonths(ym, k));
  const vals = months.map(m => { const sp = spendByCat(m); return Object.keys(sp).reduce((n, k) => n + (inSel(k) ? sp[k] : 0), 0); });
  const max = Math.max(1, budget, ...vals) * 1.08;
  const prev = vals.slice(0, 5).filter(x => x > 0.004), avg = prev.length ? prev.reduce((n, x) => n + x, 0) / prev.length : 0;
  const bPct = budget / max * 100;
  return `<div class="trend">${months.map((m, i) => `<button class="tb${m === ym ? ' cur' : ''}${budget && vals[i] > budget + 0.004 ? ' over' : ''}" data-act="goto-month" data-ym="${m}" aria-label="${esc(monthLabel(m))}: ${money(vals[i])}${budget ? ' of ' + money(budget) : ''}">
      <span class="tb-val" style="bottom:${(vals[i] / max * 100).toFixed(1)}%">${money(vals[i])}</span>
      <span class="tb-bar" style="height:${(vals[i] / max * 100).toFixed(1)}%"></span></button>`).join('')}
      ${budget ? `<div class="trend-ov" aria-hidden="true"><div class="trend-b" style="bottom:${bPct.toFixed(1)}%"><span>Budget ${money(budget)}</span></div></div>` : ''}</div>
    <div class="trend-labs">${months.map(m => `<span class="${m === ym ? 'cur' : ''}">${esc(monthShort(m))}</span>`).join('')}</div>
    <p class="st-note">${avg ? `Average before ${esc(monthName(ym))}: <span class="num">${money(avg)}</span> a month. ` : ''}Tap a month to see it.</p>`;
}

// What you kept each month: income minus everything spent, outside-budget spending included.
// Transfers (card bills, moving money to savings or investments) don't count either way.
function monthFlow(ym) {
  let inc = 0, sp = 0;
  monthTx(ym).forEach(t => { if (t.type === 'inc') inc += t.amt; else if (t.type === 'exp') sp += spendAmt(t); });
  return { ym, inc: round2(inc), sp: round2(sp), saved: round2(inc - sp) };
}
// This month (or a future one) as it's likely to end: income is what you expect or what's come in,
// whichever is more; spending is each budgeted category's budget, or what you've spent if that's
// more, plus actual spending in categories without a budget or outside it.
function projectMonth(ym) {
  const f = monthFlow(ym), sp = spendByCat(ym), b = budgetCats(), exp = st().expIncome > 0 ? st().expIncome : 0;
  let spend = 0;
  b.forEach(c => { spend += Math.max(c.budget, sp[c.id] || 0); });
  Object.keys(sp).forEach(id => { if (!b.some(c => c.id === id)) spend += sp[id]; });
  const inc = Math.max(f.inc, exp);
  return { inc: round2(inc), incExpected: exp > f.inc, sp: round2(spend), saved: round2(inc - spend), actual: f };
}
// Savings count from the first month with income recorded (or this month, once expected income is set).
function savingsSince() {
  const nowYm = ymOf(todayISO());
  let since = Object.keys(mo()).filter(m => monthTx(m).some(t => t.type === 'inc')).sort()[0];
  if (st().expIncome > 0 && (!since || since > nowYm)) since = nowYm;
  return since;
}
function savingsSection(ym) {
  const s = st(), target = s.saveTarget > 0 ? s.saveTarget : 0;
  const nowYm = ymOf(todayISO()), ahead = ym >= nowYm, since = savingsSince();
  const head = `<section class="sec" id="savings"><div class="sec-h"><h2>Savings</h2>${target ? `<span class="sec-r">Target <span class="num">${money(target)}</span> a month</span>` : ''}</div>`;
  if (!since) {
    return head + `<p class="sv-note" style="margin-top:0">See how much you keep each month. Set your expected income and a savings target in the Budget tab, and record your salary as <b>Income</b> when it comes in.</p>
      <div class="sheet-actions" style="margin-top:12px"><button class="btn small" data-act="tab" data-tab="budget">Set income and target</button><button class="btn small" data-act="new-income">Add income</button></div></section>`;
  }
  if (since > ym) return head + `<p class="sv-note" style="margin-top:0">No income recorded for ${esc(monthLabel(ym))}.</p></section>`;
  const mine = m => m >= nowYm ? projectMonth(m) : monthFlow(m);
  const cur = mine(ym), saved = cur.saved, hit = target && saved >= target - 0.004;
  let h = head + `<div class="sv-top"><div class="hero-big${saved < 0 ? ' t-bad' : ''}"><span class="num">${money(Math.abs(saved))}</span><small>${ahead ? (saved >= 0 ? 'projected' : 'projected shortfall') : (saved >= 0 ? 'saved' : 'more spent than earned')}</small></div>${target && saved > 0 ? `<span class="sv-pct num${hit ? ' t-good' : ''}">${Math.round(saved / target * 100)}%</span>` : ''}</div>`;
  if (target) h += `<div class="track lg" style="margin-top:12px"><div class="fill ${hit ? 'good' : saved < 0 ? 'bad' : ''}" style="width:${Math.max(0, Math.min(100, saved / target * 100)).toFixed(1)}%"></div></div>`;
  h += `<p class="sv-note">${ahead ? `${cur.incExpected ? 'Expected income' : 'Income'} <span class="num">${money(cur.inc)}</span>, less <span class="num">${money(cur.sp)}</span> ${budgetCats().length ? 'if every budget is used up' : 'spent so far'}.` : `Income <span class="num">${money(cur.inc)}</span>, less spending of <span class="num">${money(cur.sp)}</span>.`}${target && hit ? (ahead ? ' That reaches your target.' : ' Target hit.') : ''}</p>`;
  if (target && ahead && !hit) {
    // Room left: what's still unspent in the budgets. If cutting all of it isn't enough, say what's reachable.
    const sp = spendByCat(ym), room = budgetCats().reduce((n, c) => n + Math.max(0, c.budget - (sp[c.id] || 0)), 0);
    h += `<p class="sv-note">${room >= target - saved - 0.004 ? `To reach it, spend <span class="num">${money(target - saved)}</span> less than your budgets allow.` : `Even with no more spending${ym === nowYm ? ' this month' : ''}, you'd save <span class="num">${money(saved + room)}</span>.`}</p>`;
  }
  // Last six months, this one projected.
  const months = []; for (let k = -5; k <= 0; k++) { const m = addMonths(ym, k); if (m >= since) months.push(Object.assign(mine(m), { ym: m })); }
  const past = []; for (let m = since; m < nowYm && m <= ym; m = addMonths(m, 1)) past.push(monthFlow(m));
  let streak = 0; for (let i = past.length - 1; i >= 0 && (target ? past[i].saved >= target - 0.004 : past[i].saved > 0); i--) streak++;
  if (streak >= 2) h += `<p class="save-cheer">${target ? `Target hit ${streak} months in a row.` : `${streak} months in a row with money saved.`}</p>`;
  if (months.length > 1) {
    const max = Math.max(1, target, ...months.map(x => Math.abs(x.saved))) * 1.1;
    h += `<div class="sv-hist">` + months.map(x => {
      const proj = x.ym >= nowYm, w = (Math.abs(x.saved) / max * 100).toFixed(1), k = x.saved < 0 ? 'down' : !target || x.saved >= target - 0.004 ? 'hit' : 'up';
      return `<button class="sv-row${x.ym === ym ? ' cur' : ''}" data-act="goto-month" data-ym="${x.ym}" aria-label="${esc(monthLabel(x.ym))}: ${money(x.saved)} ${proj ? 'projected' : 'saved'}">
        <span class="sv-m">${esc(monthShort(x.ym))}</span>
        <span class="sp-track">${target ? `<i class="save-tgt" style="left:${(target / max * 100).toFixed(1)}%"></i>` : ''}<span class="save-fill ${k}${proj ? ' proj' : ''}" style="width:${w}%"></span></span>
        <span class="num sv-v${x.saved < 0 ? ' t-bad' : ''}">${proj ? '≈' : ''}${money(x.saved)}</span></button>`;
    }).join('') + `</div>`;
    const total = round2(past.reduce((n, x) => n + x.saved, 0));
    if (past.length) h += `<p class="sv-note">${target ? 'The line on each bar is your target. ' : ''}Saved since ${esc(monthLabel(since))}: <b class="num${total < 0 ? ' t-bad' : ''}">${money(total)}</b>.</p>`;
  }
  return h + `</section>`;
}
// Running total for the year of categories kept outside the monthly budget, by month.
function specialYear(ym) {
  const oc = cats().filter(c => c.type === 'exp' && c.outside);
  if (!oc.length) return '';
  const y = ym.slice(0, 4), byCat = {}, rows = [];
  let total = 0;
  for (let m = 1; m <= 12; m++) {
    const mym = y + '-' + pad(m); let v = 0;
    monthTx(mym).forEach(t => { if (t.type === 'exp' && isOutside(t.cat)) { const a = spendAmt(t); v += a; byCat[t.cat] = (byCat[t.cat] || 0) + a; } });
    total += v;
    if (Math.abs(v) > 0.004) rows.push({ ym: mym, v: round2(v), cum: round2(total) });
  }
  const title = oc.length === 1 ? oc[0].name : 'Outside the budget';
  let h = `<section class="sec" id="special"><div class="sec-h"><h2>${esc(title)} · ${esc(y)}</h2>${rows.length ? `<span class="sec-r num">${money(total)}</span>` : ''}</div>`;
  if (!rows.length) return h + `<p class="sv-note" style="margin:0">Nothing yet in ${esc(y)}.</p></section>`;
  const split = oc.filter(c => Math.abs(byCat[c.id] || 0) > 0.004);
  if (oc.length > 1 && split.length) h += `<p class="sv-note" style="margin:0 0 8px">${split.map(c => `${esc(c.name)} <span class="num">${money(byCat[c.id])}</span>`).join(' · ')}</p>`;
  const top = Math.max(1, total);
  h += `<div class="sp-head"><span></span><span></span><span>Month</span><span>So far</span></div>` + rows.map(r => {
    const prev = r.cum - r.v;
    return `<button class="sp-row${r.ym === ym ? ' cur' : ''}" data-act="drill-special" data-ym="${r.ym}" aria-label="${esc(monthLabel(r.ym))}: ${money(r.v)}, ${money(r.cum)} for the year so far">
      <span class="sp-m">${esc(monthShort(r.ym))}</span>
      <span class="sp-track"><span class="sp-fill" style="width:${Math.max(0, prev / top * 100).toFixed(1)}%"></span><span class="sp-add" style="left:${Math.max(0, prev / top * 100).toFixed(1)}%;width:${Math.max(0, r.v / top * 100).toFixed(1)}%"></span></span>
      <span class="num sp-v">${money(r.v)}</span><span class="num sp-c">${money(r.cum)}</span></button>`;
  }).join('');
  return h + `</section>`;
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
  <section class="sec"><div class="sec-h"><h2>Paid once a month</h2></div>
    <p class="muted" style="font-size:13px;margin:0 0 12px">For bills that land once a month, like rent, tithe or utilities. They can be spread over several payments. Stats checks them against their own budget only and leaves them out of the daily pace. Tap a category to switch it between daily and monthly.</p>
    <div class="chips wrap" role="group" aria-label="Categories paid once a month">${inB.map(c => `<button class="chip${isMonthly(c) ? ' on' : ''}" data-act="toggle-monthly" data-id="${esc(c.id)}" aria-pressed="${isMonthly(c) ? 'true' : 'false'}">${esc(c.name)}</button>`).join('')}</div>
  </section>
  <section class="sec"><div class="sec-h"><h2>Savings</h2></div>
    <p class="muted" style="font-size:13px;margin:0 0 12px">Stats uses these to project how much you'll keep this month and to track each month against your target.</p>
    <div class="bgt-edit">
      <label for="s-inc">Expected monthly income</label><input class="in num" id="s-inc" data-set="expIncome" inputmode="decimal" placeholder="Not set" value="${st().expIncome > 0 ? st().expIncome : ''}">
      <label for="s-tgt">Monthly savings target</label><input class="in num" id="s-tgt" data-set="saveTarget" inputmode="decimal" placeholder="Not set" value="${st().saveTarget > 0 ? st().saveTarget : ''}">
    </div>
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
  const ids = Object.keys(bals), ow = owedState(), toYou = round2(OWERS.reduce((n, [by]) => n + Math.max(0, ow[by].outstanding), 0));
  if (ids.length) {
    let assets = 0, owed = 0;
    ids.forEach(id => { const v = bals[id].v; if (isLiab(accById(id))) owed -= v; else assets += v; });
    const net = assets + toYou - owed;
    h += `<section class="sec"><div class="sec-h"><h2>Balances</h2><span class="muted" style="font-size:13px">As of today</span></div>
      <div class="bal-sum">
        <div><span>In your accounts</span><span class="num">${money(assets)}</span></div>
        ${toYou > 0.004 ? `<div><span>Owed to you</span><span class="num">${money(toYou)}</span></div>` : ''}
        <div><span>Owed on cards</span><span class="num">${money(owed)}</span></div>
        <div class="net"><span>Net</span><span class="num${net < 0 ? ' t-bad' : ''}">${money(net)}</span></div>
      </div>
      <p class="muted" style="font-size:12px;margin:8px 0 0">From the figures you entered from your bank apps, plus everything since. Update a card or account below to check it still matches.</p></section>`;
  }
  h += owedSection(ow);
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
  const type = r.kind === 'inc' ? 'inc' : 'exp', isX = r.kind === 'xfer', isB = r.kind === 'back';
  const tags = [];
  if (isX) tags.push('<span class="tag acc">Transfer, not spending</span>');
  if (isB) tags.push('<span class="tag good">Payback, not income</span>');
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
        ${isX ? '' : isB ? `<select class="in" data-f="by" aria-label="Paid back by">${owerOptions(r.by || 'work')}</select>` : `<select class="in${r.conf === 'low' && !r.learned ? ' unsure' : ''}" data-f="cat" aria-label="Category">${catOptions(type, r.cat)}</select>`}
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
      const signed = r.kind === 'ref' ? -r.amt : r.amt, type = r.kind === 'inc' ? 'inc' : r.kind === 'back' ? 'back' : 'exp';
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
    const where = r.kind === 'xfer' ? accById(r.from) && accById(r.to) && r.from !== r.to : r.kind === 'back' ? accById(r.acc) : accById(r.acc) && catById(r.cat);
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
      mo()[ym].txns.push(paidIfAhead({ id: newId(), d: r.d, amt: round2(r.amt), type: 'xfer', acc: r.from, to: r.to, cat: '', m: (r.m || '').trim().slice(0, 60) || 'Transfer', raw: r.raw, src: 'scan', t: Date.now() }));
      rememberPayFrom(r.from, r.to);
      return;
    }
    if (r.kind === 'back') {
      mo()[ym].txns.push(paidIfAhead({ id: newId(), d: r.d, amt: round2(r.amt), type: 'back', acc: r.acc, by: r.by || 'work', cat: '', m: (r.m || '').trim().slice(0, 60), raw: r.raw, src: 'scan', t: Date.now() }));
      return;
    }
    const m = (r.m || '').trim().slice(0, 60) || catName(r.cat);
    mo()[ym].txns.push(paidIfAhead({ id: newId(), d: r.d, amt: round2(r.kind === 'ref' ? -r.amt : r.amt), type: r.kind === 'inc' ? 'inc' : 'exp', acc: r.acc, cat: r.cat, m, raw: r.raw, src: 'scan', t: Date.now() }));
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
    body: `<p>Set a monthly amount per category in <b>Budget</b>. <b>Stats</b> then leads with what you can spend a day for the rest of the month, and shows each category as <b class="t-good">On track</b>, <b class="t-warn">At risk</b> (ahead of today's plan) or <b class="t-bad">Over</b>.</p><ul><li>Tap the month or any category to see it day by day and over the last six months.</li><li>Mark bills that land once a month, like rent or utilities, as <b>monthly</b> in the Budget tab so they don't throw off the daily pace.</li><li>Big one-offs like flights go in <b>Special Spending</b>, which sits outside the monthly budget and gets a running total for the year.</li><li>Set your expected income and a savings target in the Budget tab, and Stats projects what you'll save.</li><li>Rename, reorder or add categories in Settings.</li></ul>`
  });
  steps.push({
    icon: ICON.wallet,
    title: 'Keep balances matched',
    body: `<p>Optional. In <b>Cards</b>, tap <b>Add balance</b> and copy the figure from your bank app. Spending, income and transfers then move it.</p><ul><li>Card bills and wallet top-ups are transfers between your own accounts, so they don't count as spending.</li><li>Now and then, tap <b>Update</b> on a card and enter the bank's figure. If it's off, a correction entry makes it match.</li><li>Paid for work or friends? Set <b>Paid back by</b> on the expense (all of it, or their part of a split bill). It won't count as your spending. Record each payback against what it pays for, one claim or several.</li></ul><p class="muted">Your data lives only on this phone, so use Settings → Back up now from time to time.</p>`
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
    const k = t ? kindOf(t) : (s.kind0 || 'exp');
    const type = k === 'inc' ? 'inc' : 'exp', isX = k === 'xfer', isB = k === 'back';
    const defAcc = t ? t.acc : (S.filterAcc || ((k === 'inc' || k === 'back') && (accts().find(a => a.kind === 'debit') || {}).id) || (accts()[0] || {}).id);
    const defTo = t && t.to ? t.to : suggestTo(defAcc);
    const defDate = t ? t.d : (S.month === ymOf(todayISO()) ? todayISO() : S.month + '-01');
    el.innerHTML = `<div class="grab"></div><h2>${t ? (isX ? 'Edit transfer' : isB ? 'Edit payback' : 'Edit transaction') : isB ? 'Record a payback' : 'New transaction'}</h2>
      ${accts().length ? '' : '<div class="err">Add a card first in the Cards tab.</div>'}
      <label class="field"><span>Merchant or note</span><input class="in" id="f-m" value="${esc(t ? t.m : '')}" maxlength="60" autocomplete="off" autocorrect="off" enterkeyhint="next"></label>
      ${t && t.raw ? `<p class="raw num" style="margin:-4px 0 12px">Statement: ${esc(t.raw)}</p>` : ''}
      ${t ? '' : `<div id="f-sugg"${isX || isB ? ' hidden' : ''}>${suggHtml(suggFor(''))}</div>`}
      <div class="row2"><label class="field"><span>Type</span><select class="in" id="f-kind">${kindOptions(k, accts().length > 1)}</select></label>
      <label class="field"><span>Amount</span><input class="in num" id="f-amt" inputmode="decimal" value="${t ? Math.abs(t.amt).toFixed(2) : ''}" placeholder="0.00"></label></div>
      <div class="row2"><label class="field"><span>Date</span><input class="in" id="f-date" type="date" value="${esc(defDate)}"></label>
      <label class="field"><span id="f-acc-l">${isX ? 'From' : isB ? 'Into' : 'Card'}</span><select class="in" id="f-acc">${accOptions(defAcc)}</select></label></div>
      <label class="field" id="f-by-w"${isB ? '' : ' hidden'}><span>Paid back by</span><select class="in" id="f-by">${owerOptions(t && t.by ? t.by : s.by || 'work')}</select></label>
      <div id="f-set-w"${isB ? '' : ' hidden'}><div class="field"><span>What it pays for</span></div><div id="f-set" class="set-list">${isB ? settleList(t && t.by ? t.by : s.by || 'work', t, s.claim) : ''}</div></div>
      <p class="muted" id="f-b-note" style="font-size:13px;margin:6px 0 12px"${isB ? '' : ' hidden'}>Tick what this pays for, or tick nothing to clear the oldest first. Paybacks aren't income.</p>
      <label class="field" id="f-to-w"${isX ? '' : ' hidden'}><span>To</span><select class="in" id="f-to">${accOptions(defTo)}</select></label>
      <p class="muted" id="f-x-note" style="font-size:13px;margin-top:-4px"${isX ? '' : ' hidden'}>A transfer moves money between your own accounts, like paying a card bill or topping up a wallet. It isn't spending.</p>
      <label class="field" id="f-cat-w"${isX || isB ? ' hidden' : ''}><span>Category</span><select class="in" id="f-cat">${catOptions(type, t && t.cat ? t.cat : (S.filterCat || firstCat(type)))}</select></label>
      <div id="f-ow-w"${k === 'exp' ? '' : ' hidden'}>
        <div class="row2"><label class="field"><span>Paid back by</span><select class="in" id="f-ow"><option value="">Nobody, it's mine</option>${owerOptions(t && t.owed ? t.owed.by : '')}</select></label>
        <label class="field" id="f-owa-w"${t && t.owed ? '' : ' hidden'}><span>They owe</span><input class="in num" id="f-owa" inputmode="decimal" placeholder="All of it" value="${t && t.owed ? t.owed.amt.toFixed(2) : ''}"></label></div>
        <p class="muted" id="f-ow-note" style="font-size:13px;margin-top:-4px"${t && t.owed ? '' : ' hidden'}></p>
        ${t && owedOf(t) ? (() => { const c = owedState()[t.owed.by].list.find(x => x.t.id === t.id); if (!c) return ''; const back = round2(c.owed - c.left);
          return `<div class="ow-status"><span>${c.left <= 0.004 ? `<b class="t-good">Paid back in full</b>` : `Paid back <b class="num">${money(back)}</b> of <span class="num">${money(c.owed)}</span> so far`}</span>${c.left > 0.004 ? `<button class="btn small" data-act="pay-claim" data-by="${esc(t.owed.by)}" data-id="${esc(t.id)}" data-left="${c.left.toFixed(2)}">Record a payback for this</button>` : ''}</div>`; })() : ''}
      </div>
      ${paidFields(t, defDate)}
      <div class="sheet-actions">${t ? '<button class="btn danger" data-act="del-tx">Delete</button>' : '<button class="btn" data-act="close-sheet">Cancel</button>'}<button class="btn primary" data-act="save-tx">Save</button></div>`;
    if (t && t.owed) updateOwed();
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
  } else if (s.kind === 'stat') {
    statSheet(el, s);
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

// "Already paid" for entries dated after today. The paid day defaults to when the entry was added.
function paidFields(t, d) {
  const today = todayISO(), on = !!(t && t.paid);
  const pd = on ? t.paid : t && t.t ? isoOf(new Date(t.t)) : today;
  return `<div id="f-paid-w"${d > today ? '' : ' hidden'}>
    <label class="tgl"><input type="checkbox" id="f-paid"${on ? ' checked' : ''}><span>Already paid, so it comes off the balance now</span></label>
    <label class="field" id="f-paid-d-w"${on ? '' : ' hidden'}><span>Paid on</span><input class="in" type="date" id="f-paid-d" value="${esc(pd > today ? today : pd)}" max="${today}"></label>
    <p class="muted" style="font-size:13px;margin:-4px 0 12px">Budgets and Stats still count it on its date.</p>
  </div>`;
}
function paidIfAhead(rec) { if (rec.d > todayISO()) rec.paid = todayISO(); return rec; }
function whenTag(t) {
  if (t.d <= todayISO()) return '';
  return t.paid && t.paid < t.d ? ` · <span class="tx-when">Paid ${esc(fmtDate(t.paid))}</span>` : ' · <span class="tx-when up">Upcoming</span>';
}
// Under "Paid back by": shows your share, and hides the amount box when nobody owes anything.
function updateOwed() {
  const by = $('#f-ow').value, n = $('#f-ow-note'), w = $('#f-owa-w'); if (!n) return;
  w.hidden = !by; n.hidden = !by; if (!by) return;
  const amt = parseAmt($('#f-amt').value), oa = parseAmt($('#f-owa').value), o = isFinite(oa) && oa > 0 ? Math.min(oa, amt || oa) : amt;
  n.innerHTML = isFinite(amt) && amt > 0 ? (o >= amt - 0.004 ? `None of it counts as your spending. ${esc(owerName(by))} ${by === 'work' ? 'owes' : 'owe'} you all <span class="num">${money(amt)}</span>.`
    : `Your share, <span class="num">${money(amt - o)}</span>, counts as your spending. ${esc(owerName(by))} ${by === 'work' ? 'owes' : 'owe'} you <span class="num">${money(o)}</span>.`) : 'Leave "They owe" empty if they owe all of it.';
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
  } else if (kind === 'back') {
    rec = { d, amt: round2(amt), type: 'back', acc, by: $('#f-by').value, cat: '', m: m.slice(0, 60) };
    // Spread the amount over the ticked claims, oldest first. Anything left over clears the oldest others.
    let rem = rec.amt; const alloc = [];
    tickedClaims().forEach(c => { if (rem <= 0) return; const use = round2(Math.min(c.left, rem)); if (use > 0) { alloc.push({ id: c.id, amt: use }); rem = round2(rem - use); } });
    if (alloc.length) rec.alloc = alloc;
  } else {
    rec = { d, amt: round2(kind === 'ref' ? -amt : amt), type: kind === 'inc' ? 'inc' : 'exp', acc, cat, m: m.slice(0, 60) };
    const by = kind === 'exp' ? $('#f-ow').value : '';
    if (by) {
      const oa = parseAmt($('#f-owa').value), o = isFinite(oa) && oa > 0 ? Math.min(round2(oa), rec.amt) : rec.amt;
      rec.owed = { by, amt: o };
    }
  }
  const pd = $('#f-paid') && $('#f-paid').checked ? $('#f-paid-d').value : '';
  if (d > todayISO() && /^\d{4}-\d{2}-\d{2}$/.test(pd)) rec.paid = pd < d ? pd : todayISO();
  const apply = o => { Object.assign(o, rec); if (rec.type !== 'xfer') delete o.to; if (!rec.paid) delete o.paid; if (!rec.owed) delete o.owed; if (rec.type !== 'back') delete o.by; if (!rec.alloc) delete o.alloc; return o; };
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
    if (old.raw && rec.type !== 'xfer' && rec.type !== 'back') { const k = SnapParse.normKey(old.raw); if (k) { const r = st().rules || (st().rules = {}); delete r[k]; r[k] = { c: cat, m: rec.m }; saveSettings(); } }
  } else {
    if (!mo()[ym]) mo()[ym] = { month: ym, txns: [] };
    mo()[ym].txns.push(Object.assign({ id: newId(), raw: '', src: 'manual', t: Date.now() }, rec)); saveMonth(ym);
  }
  closeSheet(); render();
  if (s.id) toast('Saved.');
  else celebrate({ badge: '+1 added', title: rec.type === 'xfer' ? 'Transfer added' : rec.type === 'back' ? 'Payback recorded' : 'Added to your ledger',
    sub: rec.type === 'xfer' ? `${accShort(rec.acc)} → ${accShort(rec.to)} · ${money(rec.amt)}` : rec.type === 'back' ? `${owerName(rec.by)} paid back ${money(rec.amt)} · ${accShort(rec.acc)}` : [rec.m || catName(rec.cat), money(Math.abs(rec.amt)) + (rec.amt < 0 ? ' refund' : ''), accShort(rec.acc)].join(' · ') }, 'Saved.');
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
  const rows = [['Date', 'Card', 'Category', 'Merchant', 'Amount', 'Type', 'Statement text', 'To card', 'Balance entered', 'Paid back by', 'Owed to you']];
  const typeL = { inc: 'Income', ref: 'Refund', exp: 'Expense', xfer: 'Transfer', adj: 'Balance correction', back: 'Payback' };
  Object.keys(mo()).sort().forEach(ym => monthTx(ym).slice().sort((a, b) => a.d.localeCompare(b.d)).forEach(t => {
    const k = kindOf(t);
    rows.push([t.d, accName(t.acc), t.cat ? catName(t.cat) : '', t.m, t.amt.toFixed(2), typeL[k], t.raw || '', t.to ? accName(t.to) : '', k === 'adj' ? shown(accById(t.acc), t.bal).toFixed(2) : '', t.type === 'back' ? owerName(t.by) : owedOf(t) ? owerName(t.owed.by) : '', owedOf(t) ? owedOf(t).toFixed(2) : '']);
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
// A full-screen moment: a ring draws itself, the swimming bunny rises through it and pops its head
// out over the top with a splash, its goggles glint, a check lands with ripples, and the summary
// fades up. Closes by itself, or on any tap.
const OK_BUNNY = 'img/bunny.webp';
function splashBits(at) {
  const colors = ['#5BC0F8', '#2F9BE8', '#8FD6FF', '#1E7FD0', '#B4E7FF'];
  let bits = '';
  for (let i = 0; i < 12; i++) {
    const a = (-165 + i * (150 / 11) + (Math.random() * 10 - 5)) * Math.PI / 180, d = 52 + Math.random() * 40, z = 4 + Math.round(Math.random() * 5);
    bits += `<i class="ok-drop" style="--x:${(Math.cos(a) * d).toFixed(1)}px;--y:${(Math.sin(a) * d).toFixed(1)}px;--c:${colors[i % colors.length]};width:${z}px;height:${z}px;animation-delay:${at + Math.round(Math.random() * 60)}ms"></i>`;
  }
  return bits;
}
function successScreen(info) {
  const el = document.createElement('div');
  el.className = 'ok-fx'; el.setAttribute('role', 'status');
  const bubbles = [[34, 7, 1050], [70, 5, 1300], [22, 4, 1550], [80, 6, 1750]].map(([x, z, t]) => `<i class="ok-bub" style="left:${x}%;width:${z}px;height:${z}px;animation-delay:${t}ms"></i>`).join('');
  el.innerHTML = `<div class="ok-bg"></div>
    <div class="ok-stage" aria-hidden="true">
      <span class="ok-ring"></span><span class="ok-ring r2"></span>
      <svg class="ok-circle" viewBox="0 0 240 240"><circle class="ok-disc" cx="120" cy="120" r="90"/><circle class="ok-stroke" cx="120" cy="120" r="90"/></svg>
      <div class="ok-splash">${splashBits(840)}</div>
      <div class="ok-peek">
        <div class="ok-bunny"><div class="ok-bob"><img src="${OK_BUNNY}" alt="" draggable="false"><i class="ok-lens l"></i><i class="ok-lens r"></i><i class="ok-gleam"></i></div></div>
        ${bubbles}
      </div>
      <svg class="ok-check" viewBox="0 0 54 54"><circle cx="27" cy="27" r="24"/><path d="M16 28l7.5 7.5L39 20"/></svg>
    </div>
    <h2 class="ok-title">${esc(info.title || 'Added')}</h2>
    ${info.sub ? `<p class="ok-sub">${esc(info.sub)}</p>` : ''}
    <p class="ok-hint">Tap anywhere to continue</p>`;
  const close = () => { if (!el.isConnected || el.classList.contains('out')) return; el.classList.add('out'); okClose = null; setTimeout(() => el.remove(), 240); };
  el.addEventListener('click', e => { e.stopPropagation(); close(); });
  document.body.appendChild(el);
  okClose = close;
  celebT = setTimeout(close, 3000);
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  switch (act) {
    case 'tab': S.tab = b.dataset.tab; S.budgetEdit = false; render(); window.scrollTo(0, 0); break;
    case 'month': S.month = addMonths(S.month, +b.dataset.k); render(); break;
    case 'this-month': S.month = ymOf(todayISO()); render(); break;
    case 'goto-month': S.month = b.dataset.ym; render(); if (S.sheet && S.sheet.kind === 'stat') renderSheet(); break;
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
    case 'stat-open': openSheet({ kind: 'stat', id }); break;
    case 'stat-ledger': closeSheet(); S.filterCat = id && id !== 'all' ? id : null; S.filterAcc = null; S.tab = 'ledger'; render(); window.scrollTo(0, 0); break;
    case 'drill-day': {
      if (S.sheet) closeSheet();
      S.filterCat = id === 'all' ? null : id; S.filterAcc = null; S.tab = 'ledger'; render(); window.scrollTo(0, 0);
      const el = document.getElementById('day-' + b.dataset.d);
      if (el) { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600); }
      break;
    }
    case 'drill-acc': S.filterAcc = id; S.filterCat = null; S.tab = 'ledger'; render(); window.scrollTo(0, 0); break;
    case 'stats-by': { S.statsBy = b.dataset.by; const y = window.scrollY; render(); window.scrollTo(0, y); break; }
    case 'new-tx': openSheet({ kind: 'txn', id: null }); break;
    case 'new-income': openSheet({ kind: 'txn', id: null, kind0: 'inc' }); break;
    case 'new-payback': openSheet({ kind: 'txn', id: null, kind0: 'back', by: b.dataset.by }); break;
    case 'pay-claim': openSheet({ kind: 'txn', id: null, kind0: 'back', by: b.dataset.by, claim: id, amtAuto: true }); { const a = $('#f-amt'); if (a) a.value = (+b.dataset.left).toFixed(2); } break;
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
    case 'toggle-monthly': {
      const c = catById(id); if (!c) break;
      if (isMonthly(c)) delete c.freq; else c.freq = 'monthly';
      saveSettings(); render();
      toast(isMonthly(c) ? `${c.name} is now a monthly bill.` : `${c.name} is back to daily.`);
      break;
    }
    case 'toggle-outside': {
      const c = catById(id); if (!c) break;
      c.outside = !c.outside; saveSettings(); render();
      toast(c.outside ? `${c.name} is now outside the monthly budget.` : `${c.name} is back in the monthly budget.`);
      break;
    }
    case 'goto-savings': { const el = document.getElementById('savings'); if (el) { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); } break; }
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
  if (el.id === 'f-date' && $('#f-paid-w')) { $('#f-paid-w').hidden = !(el.value > todayISO()); return; }
  if (el.id === 'f-paid') { $('#f-paid-d-w').hidden = !el.checked; return; }
  if (el.id === 'f-acc' && isChange && $('#f-kind') && $('#f-kind').value === 'xfer') {
    const to = $('#f-to'); if (to && to.value === el.value) { const g = suggestTo(el.value); if (g) to.value = g; }
    return;
  }
  if (el.dataset && el.dataset.claim !== undefined && isChange) { fillFromTicks(); return; }
  if (el.id === 'f-by' && isChange) { $('#f-set').innerHTML = settleList(el.value, null); if (S.sheet.amtAuto) { $('#f-amt').value = ''; } return; }
  if (el.id === 'f-amt' && !isChange && S.sheet) S.sheet.amtAuto = false;
  if (el.id === 'f-ow' || el.id === 'f-owa' || (el.id === 'f-amt' && $('#f-ow'))) { updateOwed(); if (el.id !== 'f-amt') return; }
  if (el.id === 'f-kind' && isChange) {
    const x = el.value === 'xfer', bk = el.value === 'back';
    $('#f-to-w').hidden = !x; $('#f-x-note').hidden = !x; $('#f-cat-w').hidden = x || bk; $('#f-acc-l').textContent = x ? 'From' : bk ? 'Into' : 'Card';
    $('#f-by-w').hidden = !bk; $('#f-b-note').hidden = !bk; $('#f-set-w').hidden = !bk; $('#f-ow-w').hidden = el.value !== 'exp';
    if (bk) { $('#f-set').innerHTML = settleList($('#f-by').value, null); }
    const sg = $('#f-sugg'); if (sg) sg.hidden = x || bk;
    if (bk) return;
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
    if (el.dataset.set === 'expIncome' || el.dataset.set === 'saveTarget') {
      const v = parseAmt(el.value); st()[el.dataset.set] = v > 0 ? round2(v) : null; el.value = v > 0 ? round2(v) : ''; saveSettings(); return;
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
      else if (r.kind !== 'inc' && r.kind !== 'xfer' && r.kind !== 'back') { r.cat = v; r.conf = 'high'; r.learned = false; n++; }
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
    if (r.kind === 'back' && !r.by) r.by = 'work';
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
  else if (f === 'by') { r.by = el.value; }
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
  try { const pre = new Image(); pre.src = OK_BUNNY; } catch (e) {}
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
