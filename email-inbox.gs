/* Snap Ledger email inbox
   Runs in your own Google account. When Snap Ledger asks for it, with the secret key below, it
   looks for emails from your banks that arrived since the last check and sends back their text.
   It only reads emails from the bank addresses listed below, it never sends, changes or deletes
   anything, and it keeps nothing.

   Set up:
   1. Paste this whole file into a new project on script.google.com.
   2. Deploy > New deployment > Select type > Web app.
      Execute as: Me. Who has access: Anyone. Then Deploy, and allow access when Google asks.
   3. Copy the Web app URL into Snap Ledger (Settings > Payments from email).
   The key is what keeps the link private. Don't share this file once it has your key in it. */

const KEY = '__SNAP_LEDGER_KEY__';

// Banks whose emails it reads. Only these senders, nothing else in your inbox.
const BANK_DOMAINS = ['dbs.com', 'dbs.com.sg', 'posb.com.sg', 'citibank.com.sg', 'citibank.com', 'citi.com',
  'americanexpress.com', 'aexp.com', 'ocbc.com', 'sc.com', 'uob.com.sg', 'uobgroup.com', 'hsbc.com.sg',
  'maybank.com.sg', 'trustbank.sg', 'gxs.com.sg'];

const VERSION = 1;
const MAX_DAYS = 14;

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (KEY.indexOf('__') === 0 || p.key !== KEY) return reply({ error: 'key' });
  const now = Math.floor(Date.now() / 1000);
  const since = Math.max(Number(p.since) || 0, now - MAX_DAYS * 86400);
  if (p.ping) return reply({ v: VERSION, now: now, ok: true });
  const query = 'after:' + since + ' {' + BANK_DOMAINS.map(function (d) { return 'from:' + d; }).join(' ') + '}';
  const threads = GmailApp.search(query, 0, 100);
  const items = [];
  GmailApp.getMessagesForThreads(threads).forEach(function (msgs) {
    msgs.forEach(function (m) {
      const at = m.getDate().getTime() / 1000;
      if (at <= since || !fromBank(m.getFrom())) return;
      items.push({ id: m.getId(), at: m.getDate().toISOString(), from: m.getFrom(), subject: m.getSubject(), text: textOf(m).slice(0, 6000) });
    });
  });
  items.sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; });
  return reply({ v: VERSION, now: now, items: items });
}

function fromBank(from) {
  const m = String(from || '').match(/<([^>]+)>/);
  const addr = (m ? m[1] : String(from || '')).trim().toLowerCase();
  const domain = addr.split('@')[1] || '';
  return BANK_DOMAINS.some(function (d) { return domain === d || domain.slice(-(d.length + 1)) === '.' + d; });
}

function textOf(m) {
  const plain = m.getPlainBody();
  if (plain && plain.trim()) return plain;
  return String(m.getBody() || '')
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d|table)>/gi, '\n')
    .replace(/<\/t[dh]>/gi, '\t')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
