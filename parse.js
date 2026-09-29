/* Snap Ledger: on-device statement parser and categoriser.
   Turns text from OCR, PDF statements or pasted text into candidate transactions,
   and works out which of your cards a screenshot belongs to. No network calls.
   Exposes window.SnapParse (also works under Node for tests). */
(function (root) {
  'use strict';

  const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
  const MON_RE = '(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\\.?';
  const WEEKDAY_RE = /\b(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)(day|nesday|rsday|urday|sday)?\b\.?,?/gi;
  const FX = 'USD|EUR|GBP|JPY|AUD|MYR|RM|IDR|THB|HKD|CNY|RMB|KRW|TWD|NZD|CHF|CAD|INR|PHP|VND';

  // Lines that are never transactions (balances, limits, totals, headers).
  const SKIP_RE = /\b(current\s+balance|previous\s+(statement\s+)?balance|balance\s+(b\/?f|brought|carried|forward|due)|new\s+balance|statement\s+balance|closing\s+balance|opening\s+balance|outstanding(\s+balance)?|available\s+(credit|limit|balance)|credit\s+limit|combined\s+limit|minimum\s+(amount\s+)?(payment|due)|payment\s+due|amount\s+due|due\s+date|not\s+required|unbilled\s+(amount|balance)|sub[\s-]?total|grand\s+total|total\s+(amount|balance|due|spend|spent|credits?|debits?)|^total\b|reward\s+points|points\s+(earned|balance)|page\s+\d+\s+of\s+\d+|transaction\s+date|posting\s+date|description\s+amount)\b/i;
  const STMT_DATE_RE = /\b(statement\s+date|statement\s+period|billing\s+date|statement\s+as\s+at)\b/i;
  const PAYMENT_RE = /\b(payment\s*[-–]?\s*thank\s*you|thank\s+you|payment\s+by|bill\s+payment|payment\s+received|payment\s+-\s*(ibanking|internet|giro|fast|paynow)|giro\s+payment|auto(matic)?\s*payment|autopay|fast\s+payment|paynow\s+(to|payment)|card\s+payment|payment\s+via|ibg\s+payment|interbank\s+giro|pymt|paymt)\b/i;
  const TOPUP_RE = /\b(top[\s-]?up|topup|reload(ed)?\s+(wallet|card)|add(ed)?\s+money|cash\s+in|send\s+back\s+from|withdraw(al)?\s+(from|to)\s+(wallet|paylah|grabpay|bank))\b/i;
  const CASHBACK_RE = /\b(cash\s*back|cashback|rebate|reward(s)?\s+(credit|redemption)|statement\s+credit|bonus\s+credit)\b/i;
  const FEE_RE = /\b(interest(\s+charge)?|finance\s+charge|late\s+(payment\s+)?(fee|charge)|annual\s+fee|card\s+fee|ccy\s+conversion|currency\s+conversion|foreign\s+(transaction|currency)\s+(fee|charge)|fx\s+fee|admin(istrative)?\s+fee|service\s+charge|over\s*limit\s+fee|cash\s+advance\s+fee)\b/i;
  const SUBTITLE_RE = /^(pending|posted|completed|authori[sz]ed|debit|credit|card\s+ending.*|card\s+\*+\s*\d+|purchase|online|contactless|in[\s-]store|transport(ation)?|groceries|food(\s*&\s*drinks?)?|dining|shopping|bills?|utilities|entertainment|travel|health.*|others?|subscriptions?|transfer|fast|paynow|nets|visa|mastercard|amex|x{2,}[x\s-]*\d{0,4})$/i;

  // Known merchants: [pattern, clean name or null (keep cleaned statement name), category id]
  const MERCHANTS = [
    [/grab\s*\*?\s*food|grabfood/i, 'GrabFood', 'food'],
    [/grab\s*\*?\s*mart|grabmart/i, 'GrabMart', 'groceries'],
    [/grab\s*\*?\s*(express|parcel)/i, 'GrabExpress', 'other'],
    [/\bgrab\b|grab\s*\*|grabcar|grabpay/i, 'Grab ride', 'transport'],
    [/gojek/i, 'Gojek ride', 'transport'],
    [/\b(tada|ryde|zig|comfort\s*del\s*gro|comfortdelgro|cdg\s+taxi|citycab|strides|trans-?cab)\b/i, 'Taxi', 'transport'],
    [/bus\s*\/\s*mrt|simplygo|transit\s*link|ez-?link|\bsmrt\b|\bsbs\s+transit\b|nets\s+flashpay/i, 'Bus/MRT', 'transport'],
    [/\b(shell|esso|caltex|spc|sinopec)\b.*(station|service|petrol|s\/s)|\bpetrol\b/i, null, 'transport'],
    [/\b(carpark|car\s+park|parking|\berp\b|parking\.sg|lta\b)/i, null, 'transport'],
    [/foodpanda/i, 'foodpanda', 'food'],
    [/mr\.?\s*bean/i, 'Mr Bean', 'food'],
    [/tip\s*top|curry\s*puff/i, null, 'food'],
    [/guzman\s*y?\s*gomez/i, 'Guzman y Gomez', 'food'],
    [/wingstop|shake\s+shack|five\s+guys|a&w\b|arnold'?s|fish\s*&\s*co|stuff'?d|super\s*simple|salad\s*stop|grain\s*traders|bread\s*street/i, null, 'food'],
    [/deliveroo/i, 'Deliveroo', 'food'],
    [/fair\s*price|ntuc|finest\b|unity\s+pharmacy/i, 'FairPrice', 'groceries'],
    [/sheng\s*siong/i, 'Sheng Siong', 'groceries'],
    [/cold\s*storage|cs\s+fresh/i, 'Cold Storage', 'groceries'],
    [/\bgiant\b/i, 'Giant', 'groceries'],
    [/don\s*don\s*donki|\bdonki\b/i, 'Don Don Donki', 'groceries'],
    [/redmart/i, 'RedMart', 'groceries'],
    [/7-?eleven|seven\s*eleven/i, '7-Eleven', 'groceries'],
    [/prime\s+supermarket|hao\s+mart|u\s+stars|marketplace|supermarket|minimart|mini\s+mart|cheers\b/i, null, 'groceries'],
    [/mcdonald|\bmcd\b/i, "McDonald's", 'food'],
    [/\bkfc\b/i, 'KFC', 'food'],
    [/starbucks/i, 'Starbucks', 'food'],
    [/toast\s*box/i, 'Toast Box', 'food'],
    [/ya\s*kun/i, 'Ya Kun', 'food'],
    [/kopitiam/i, 'Kopitiam', 'food'],
    [/food\s*republic/i, 'Food Republic', 'food'],
    [/koufu/i, 'Koufu', 'food'],
    [/din\s*tai\s*fung/i, 'Din Tai Fung', 'food'],
    [/subway/i, 'Subway', 'food'],
    [/burger\s*king/i, 'Burger King', 'food'],
    [/jollibee|mos\s+burger|pastamania|saizeriya|sukiya|yoshinoya|genki|sushiro|nando|pizza\s*hut|domino|popeyes|texas\s+chicken|long\s+john|swensen|astons|jumbo|paradise|tim\s*ho\s*wan|crystal\s+jade|hai\s*di\s*lao|haidilao|putien|so\s+pho|ippudo|ichiran|tonkatsu|kei\s+kaisendon|luckin|chagee|gong\s*cha|koi\s+the|\bkoi\b|liho|heytea|mr\s+coconut|each\s+a\s+cup|playmade|yakun|the\s+coffee\s+bean|coffee\s+bean|flash\s+coffee|% arabica|arabica|common\s+man|tiong\s+bahru\s+bakery|bengawan\s+solo|old\s+chang\s+kee|polar\s+puffs|breadtalk|four\s+leaves|han\s+s\b/i, null, 'food'],
    [/\b(cafe|caf[eé]|coffee|kopi|bakery|bakehouse|restaurant|restaurants|kitchen|bistro|dining|eatery|hawker|food\s*(court|centre|center|hall|village)|canteen|noodle|ramen|sushi|bbq|grill|tea\s*house|bubble\s*tea|dessert|chicken\s+rice|nasi|prata|dim\s*sum|hotpot|steamboat|mala|pizza|burger)\b/i, null, 'food'],
    [/shopee/i, 'Shopee', 'shopping'],
    [/lazada/i, 'Lazada', 'shopping'],
    [/amazon\s*prime|prime\s+video/i, 'Amazon Prime', 'subs'],
    [/\bamazon\b|\bamzn\b|amazon\.sg/i, 'Amazon', 'shopping'],
    [/taobao|tmall|alibaba|aliexpress/i, 'Taobao', 'shopping'],
    [/temu/i, 'Temu', 'shopping'],
    [/uniqlo/i, 'Uniqlo', 'shopping'],
    [/zalora/i, 'Zalora', 'shopping'],
    [/\bikea\b/i, 'IKEA', 'home'],
    [/muji/i, 'Muji', 'shopping'],
    [/daiso/i, 'Daiso', 'shopping'],
    [/\bh\s*&\s*m\b|\bhm\s+sg/i, 'H&M', 'shopping'],
    [/\bzara\b/i, 'Zara', 'shopping'],
    [/decathlon/i, 'Decathlon', 'shopping'],
    [/courts|harvey\s+norman|best\s+denki|challenger|gain\s+city|apple\s+store|apple\s+orchard|apple\s+jewel|apple\s+marina/i, null, 'shopping'],
    [/love\s*bonito|cotton\s*on|charles\s*&?\s*keith|pedro|sephora|typo\b|popular\s+book|mustafa|isetan|takashimaya|tangs|robinsons|metro\b|bhg\b|don\s+don/i, null, 'shopping'],
    [/singtel/i, 'Singtel', 'bills'],
    [/starhub/i, 'StarHub', 'bills'],
    [/\bm1\b|m1\s+limited/i, 'M1', 'bills'],
    [/circles\.?life|circles\s+life|\bgomo\b|giga\b|simba\s+tel|\bmyrepublic\b|viewqwest|whizcomms/i, null, 'bills'],
    [/sp\s*services|sp\s*group|spgroup|sp\s+digital|\bsp\s+utilities/i, 'SP Group', 'bills'],
    [/\bpub\b|geneco|senoko|tuas\s+power|keppel\s+electric|city\s+energy|sembcorp\s+power|pacific\s+light|town\s+council|conservancy|iras\b|hdb\b/i, null, 'bills'],
    [/aia\b|great\s+eastern|prudential|ntuc\s+income|income\s+insurance|manulife|\bfwd\b|singlife|aviva|hsbc\s+life|etiqa|insurance/i, null, 'bills'],
    [/netflix/i, 'Netflix', 'subs'],
    [/spotify/i, 'Spotify', 'subs'],
    [/disney\s*\+|disneyplus|disney\s+plus/i, 'Disney+', 'subs'],
    [/youtube/i, 'YouTube Premium', 'subs'],
    [/apple\.com\/bill|apple\.com|itunes|icloud|apple\s+services/i, 'Apple', 'subs'],
    [/google\s*\*?\s*(storage|one|play|workspace|gsuite|youtube)|google\s*\*/i, 'Google', 'subs'],
    [/microsoft|msft|xbox/i, 'Microsoft', 'subs'],
    [/openai|chatgpt/i, 'ChatGPT', 'subs'],
    [/anthropic|claude\.ai/i, 'Claude', 'subs'],
    [/adobe/i, 'Adobe', 'subs'],
    [/dropbox|notion|canva|patreon|linkedin|medium\.com|nytimes|straits\s+times|sph\s+media|economist|audible|kindle|scribd|duolingo|headspace|strava|zoom\.us|1password|nordvpn|expressvpn|github|figma/i, null, 'subs'],
    [/guardian/i, 'Guardian', 'care'],
    [/watsons/i, 'Watsons', 'care'],
    [/\b(salon|barber|hair|nails?|spa|massage|beauty|cosmetic)\b/i, null, 'care'],
    [/\b(clinic|hospital|medical|dental|dentist|pharmacy|polyclinic|raffles\s+medical|parkway|mount\s+elizabeth|gleneagles|healthway|fullerton\s+health|physio|optical|optometr)/i, null, 'health'],
    [/agoda/i, 'Agoda', 'travel'],
    [/booking\.com/i, 'Booking.com', 'travel'],
    [/airbnb/i, 'Airbnb', 'travel'],
    [/expedia|trip\.com|traveloka|klook\s+travel|hotels?\b|resort|hostel|marriott|hilton|hyatt|accor|ihg|shangri/i, null, 'travel'],
    [/singapore\s+airlines|\bsia\b|scoot|jetstar|airasia|cathay\s+pacific|qantas|emirates|garuda|batik|lion\s+air|malaysia\s+airlines|thai\s+airways|\bana\b|japan\s+airlines|\bjal\b|korean\s+air|airline|airways|changi\s+airport/i, null, 'travel'],
    [/golden\s+village|\bgv\b|shaw\s+theatres|shaw\s+theatre|cathay\s+cineplex|filmgarde|we\s+cinemas|cinema/i, null, 'fun'],
    [/klook|sistic|ticketmaster|ticketek|eventbrite|steam\b|steampowered|playstation|nintendo|epic\s+games|timezone|sentosa|universal\s+studios|mandai|zoo\b|gardens\s+by\s+the\s+bay/i, null, 'fun'],
    [/udemy|coursera|edx|skillsfuture|masterclass|kinokuniya|\bbooks?\b|bookstore|tuition|\bschool\b|universit/i, null, 'edu'],
    [/charity|donation|donate|giving\.sg|church|temple|mosque/i, null, 'gifts'],
    [/\bgym\b|fitness|anytime\s+fitness|virgin\s+active|activesg|climb|yoga|pilates|ufc\s+gym|\bf45\b|barry'?s/i, null, 'health'],
    [/\btello\b/i, 'Tello', 'bills'],
    [/t-?mobile|verizon|at&t|mint\s+mobile|google\s+fi\b|airalo|holafly/i, null, 'bills']
  ];

  const pad = n => String(n).padStart(2, '0');
  const iso = (y, m, d) => y + '-' + pad(m) + '-' + pad(d);
  const letterCount = s => (String(s || '').match(/[A-Za-z]/g) || []).length;
  // Drop icon debris: tokens with at most one letter or digit ("©", "($)", "6)", "x", ">").
  const dropDebris = s => String(s || '').split(/\s+/).filter(t => (t.match(/[A-Za-z0-9]/g) || []).length > 1).join(' ');

  function normaliseLine(s) {
    s = String(s || '')
      .replace(/[−–—]/g, '-')
      .replace(/[§]/g, '$')
      .replace(/[“”"~]\s?(?=\$\s?\d)/g, '-')
      .replace(/(\d)[Oo](?=\d)/g, '$10').replace(/(\d)[Oo](?=\.\d)/g, '$10').replace(/\.[Oo](\d)/g, '.0$1').replace(/\.(\d)[Oo]\b/g, '.$10')
      .replace(/(\d)\s*,\s(\d{3})\b/g, '$1,$2')
      .replace(/(\d)\s+\.\s*(\d{2})\b/g, '$1.$2')
      .replace(/(\d)\.\s+(\d{2})\b/g, '$1.$2')
      .replace(/S\s+\$/g, 'S$')
      .replace(/\b(\d{1,2})\s+Se\b(?!p)/g, '$1 Sep').replace(/\b(\d{1,2})\s+Au\b(?!g)/g, '$1 Aug')
      .replace(/\s+/g, ' ')
      .trim();
    // OCR often misreads a small grey "SGD" as "sep", "scD", "sob"... when it sits alone before an amount.
    s = s.replace(/^([^A-Za-z0-9]*)([Ss5][A-Za-z0-9]{1,3})(\s+[-+]?\s?\$?\s?\d[\d,]*\.\d{2}\W*)$/, (m, a, tok, rest) => a + 'SGD' + rest);
    return s;
  }
  function commaDecimal(line) {
    return line.replace(/(\s|^|\$|SGD)(\d{1,4}),(\d{2})(?=\s*(CR|DR)?\s*[>›]?\s*$)/i, '$1$2.$3');
  }

  // ---- dates ----
  function findDates(line) {
    const out = [];
    let m;
    const r1 = new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s?[-/ .]?\\s?' + MON_RE + '(?:(?:\\s*,?\\s+|\\s*[-/.]\\s*)(\\d{4})|[-/.\'](\\d{2}))?(?![\\d:])', 'gi');
    while ((m = r1.exec(line))) {
      const d = +m[1], mo = MON[m[2].toLowerCase().slice(0, 3)] || MON[m[2].toLowerCase()];
      if (d >= 1 && d <= 31 && mo) out.push({ i: m.index, len: m[0].length, d, m: mo, y: m[3] ? +m[3] : m[4] ? 2000 + +m[4] : null });
    }
    const r2 = new RegExp('\\b' + MON_RE + '\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?(?![\\d:.,])', 'gi');
    while ((m = r2.exec(line))) {
      const mo = MON[m[1].toLowerCase().slice(0, 3)] || MON[m[1].toLowerCase()], d = +m[2];
      if (d >= 1 && d <= 31 && mo && !out.some(o => m.index >= o.i && m.index < o.i + o.len)) out.push({ i: m.index, len: m[0].length, d, m: mo, y: m[3] ? +m[3] : null });
    }
    const r3 = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
    while ((m = r3.exec(line))) out.push({ i: m.index, len: m[0].length, y: +m[1], m: +m[2], d: +m[3] });
    const r4 = /(?:^|[^\w/])(\d{1,2})\/(\d{1,2})(?:\/(\d{4}|\d{2}))?(?![\w/])/g;
    while ((m = r4.exec(line))) {
      const d = +m[1], mo = +m[2];
      const i = m.index + m[0].indexOf(m[1]);
      if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) out.push({ i, len: m[0].length - (i - m.index), d, m: mo, y: m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : null });
    }
    const r5 = /\b(today|yesterday)\b/gi;
    while ((m = r5.exec(line))) out.push({ i: m.index, len: m[0].length, rel: m[1].toLowerCase() });
    return out.sort((a, b) => a.i - b.i);
  }
  const pickDate = ds => ds.find(d => !d.rel) || ds[0];
  function resolveDate(dt, ref) {
    if (!dt) return null;
    if (dt.rel) {
      const x = new Date(ref.today.getTime());
      if (dt.rel === 'yesterday') x.setDate(x.getDate() - 1);
      return { iso: iso(x.getFullYear(), x.getMonth() + 1, x.getDate()) };
    }
    let y = dt.y;
    const anchor = ref.stmt || ref.today;
    if (!y) {
      y = anchor.getFullYear();
      const cand = new Date(y, dt.m - 1, dt.d);
      if (cand.getTime() - anchor.getTime() > 3 * 864e5) y -= 1;
    }
    const chk = new Date(y, dt.m - 1, dt.d);
    if (chk.getMonth() !== dt.m - 1) return null;
    return { iso: iso(y, dt.m, dt.d) };
  }

  // ---- amounts ----
  const AMT_RE = new RegExp('(\\()?(?:([+-])\\s?)?(?:(S\\$|SGD|US\\$|\\$|' + FX + ')\\s?)?(?:([+-])\\s?)?((?:\\d{1,3}(?:,\\d{3})+|\\d+)\\.\\d{2})(?![\\d.,]\\d)(\\))?(?:\\s?(CR|DR|Cr|Dr|cr)(?![A-Za-z]))?', 'g');
  function findAmounts(line) {
    const out = [];
    let m;
    AMT_RE.lastIndex = 0;
    while ((m = AMT_RE.exec(line))) {
      const before = line[m.index - 1];
      if (before && /[A-Za-z0-9]/.test(before) && !m[3]) continue;
      const cur = (m[3] || '').toUpperCase();
      const sign = (m[2] || m[4] || '');
      out.push({
        i: m.index, len: m[0].length,
        value: parseFloat(m[5].replace(/,/g, '')),
        minus: sign === '-', plus: sign === '+',
        paren: !!(m[1] && m[6]),
        cr: /^cr$/i.test(m[7] || ''), dr: /^dr$/i.test(m[7] || ''),
        fx: cur && !/^(S\$|SGD|\$)$/.test(cur) ? cur.replace('US$', 'USD') : ''
      });
    }
    return out;
  }

  // ---- merchant clean-up & categories ----
  const STOP = new Set(['SINGAPORE', 'SGP', 'SG', 'SIN', 'PTE', 'LTD', 'THE', 'CO', 'SGD', 'VISA', 'MASTERCARD', 'NETS', 'POS', 'PURCHASE', 'CARD', 'SGPORE', 'XXXX', 'XXX']);
  function normKey(raw) {
    return String(raw || '').toUpperCase().split(/[^A-Z0-9]+/).filter(w => w.length > 1 && !/\d/.test(w) && !/^X+$/.test(w) && !STOP.has(w)).slice(0, 3).join(' ');
  }
  function titleCase(s) {
    return s.toLowerCase().replace(/\b([a-z])([a-z']*)/g, (w, a, b) => a.toUpperCase() + b)
      .replace(/\b(Sg|Ntuc|Mrt|Kfc|Sp|Nus|Ntu|Smu|Hdb|Cpf|Iras|Gv|Ikea|Dbs|Uob|Ocbc|Posb|Atm|Usa|Uk|Us|Bbq|Ec)\b/g, w => w.toUpperCase())
      .replace(/\bMc([a-z])/g, (w, c) => 'Mc' + c.toUpperCase())
      .replace(/'S\b/g, "'s");
  }
  function cleanMerchant(raw) {
    let s = dropDebris(String(raw || ''))
      .replace(/X{2,}[X\s-]*\d{0,4}/gi, ' ')
      .replace(/\b(singapore|sgp|sgpore|sg|sin)\b\.?/gi, ' ')
      .replace(/\s\b(us|gb|au|my|id|th|hk|jp|kr|tw|nz|ca|in|ph|vn|cn|de|fr|nl|ie|se|lu)\s*$/i, ' ')
      .replace(/\*\s?[A-Z0-9-]{5,}/gi, ' ')
      .replace(/\b(ref|txn|trx|auth)\s*[:#]?\s*\w+/gi, ' ')
      .split(/\s+/).filter(t => !(t.length >= 5 && /[A-Za-z]\d|\d[A-Za-z]/.test(t))).join(' ')
      .replace(/\*/g, ' ')
      .replace(/\b\d{4,}\b/g, ' ')
      .replace(/card\s+ending\s+\d+/gi, ' ')
      .replace(/(\.\.\.|…)/g, ' ')
      .replace(/[|_~>›]+/g, ' ')
      .replace(/\s*[-–,.:;*@(]+\s*$/g, '')
      .replace(/^\s*[-–,.:;*@)]+\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!s) s = String(raw || '').replace(/\s{2,}/g, ' ').trim();
    if (s === s.toUpperCase() && /[A-Z]{3}/.test(s)) s = titleCase(s);
    return s.slice(0, 48);
  }
  function categorise(raw, opts) {
    const rules = (opts && opts.rules) || {};
    const has = (opts && opts.hasCat) || (() => true);
    const k = normKey(raw);
    if (k && rules[k] && has(rules[k].c)) return { cat: rules[k].c, merchant: rules[k].m || cleanMerchant(raw), how: 'learned' };
    for (const [re, name, cat] of MERCHANTS) {
      if (re.test(raw) && has(cat)) return { cat, merchant: name || cleanMerchant(raw), how: 'known' };
    }
    if (FEE_RE.test(raw) && has('fees')) return { cat: 'fees', merchant: cleanMerchant(raw), how: 'known' };
    return { cat: null, merchant: cleanMerchant(raw), how: 'none' };
  }

  // ---- card / account detection ----
  const GENERIC = new Set(['CARD', 'CREDIT', 'DEBIT', 'BANK', 'ACCOUNT', 'THE', 'MY', 'VISA', 'MASTERCARD', 'SAVINGS', 'CASH', 'WALLET', 'PLATINUM', 'SIGNATURE', 'WORLD', 'REWARDS', 'GOLD', 'CLASSIC']);
  function accountSignals(text) {
    const t = String(text || '');
    const last4 = new Set();
    let m;
    const reMask = /(?:[•·●∙*+©xX#.eo]{2,}[\s-]?){1,4}(\d{4,6})(?!\d)/g;
    while ((m = reMask.exec(t))) last4.add(m[1].slice(-4));
    const reFull = /\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-](\d{2,4})\b/g;
    while ((m = reFull.exec(t))) last4.add(m[1].padStart(4, '0').slice(-4));
    const reEnd = /ending(?:\s+in)?\s*[:#]?\s*(\d{4})\b/gi;
    while ((m = reEnd.exec(t))) last4.add(m[1]);
    const lines = t.split('\n').map(l => l.trim()).filter(Boolean);
    let head = '';
    for (const l of lines.slice(0, 10)) {
      if (/^\d{1,2}:\d{2}/.test(l)) continue;
      if (letterCount(dropDebris(l)) >= 5 && !findAmounts(l).length && !findDates(l).length) { head = l; break; }
    }
    let upper = t.toUpperCase();
    if (/AMERICAN\s+EXPRESS/.test(upper)) upper += ' AMEX';
    const headKey = normKey(head.replace(/[®™]/g, ''));
    return { last4: [...last4], upper, headUpper: lines.slice(0, 10).join(' ').toUpperCase() + (/AMERICAN\s+EXPRESS/i.test(lines.slice(0, 10).join(' ')) ? ' AMEX' : ''), headKey };
  }
  function detectAccount(text, accounts, hints) {
    hints = hints || {};
    const sig = accountSignals(text);
    const tokenCount = {};
    accounts.forEach(a => new Set(tokens(a.name)).forEach(tk => { tokenCount[tk] = (tokenCount[tk] || 0) + 1; }));
    const scored = accounts.map(a => {
      let s = 0, why = '';
      const l4 = String(a.last4 || '').replace(/\D/g, '');
      if (l4.length >= 3 && sig.last4.some(n => n.endsWith(l4) || l4.endsWith(n))) { s += 10; why = 'number ••' + l4; }
      sig.last4.forEach(n => { if (hints['n:' + n] === a.id) { s += 8; why = why || 'number ••' + n; } });
      if (sig.headKey && hints['h:' + sig.headKey] === a.id) { s += 5; why = why || 'screen layout you used before'; }
      String(a.match || '').split(/[,;\n]/).map(w => w.trim().toUpperCase()).filter(w => w.length >= 3).forEach(w => {
        if (sig.upper.includes(w)) { s += 6; why = why || '"' + w + '"'; }
      });
      tokens(a.name).forEach(tk => {
        if (sig.headUpper.includes(tk)) { s += tokenCount[tk] > 1 ? 0.5 : 3; if (tokenCount[tk] === 1) why = why || 'name "' + tk + '"'; }
      });
      return { id: a.id, s, why };
    }).sort((x, y) => y.s - x.s);
    const best = scored[0], second = scored[1];
    const found = best && best.s >= 2 && (!second || best.s > second.s) ? { id: best.id, why: best.why } : null;
    return { found, signals: { last4: sig.last4, headKey: sig.headKey } };
  }
  function tokens(name) {
    let n = String(name || '').toUpperCase();
    if (/AMERICAN\s+EXPRESS/.test(n)) n += ' AMEX';
    return n.split(/[^A-Z0-9]+/).filter(w => w.length >= 3 && !GENERIC.has(w));
  }

  // ---- main parse ----
  const STATUS_RE = /\b(pending|posted|completed|processing|authori[sz]ed|successful|success)\b/gi;
  function parse(text, opts) {
    opts = opts || {};
    const today = opts.today ? new Date(opts.today + 'T00:00:00') : new Date(new Date().toDateString());
    const ref = { today, stmt: null };
    const lines = [];
    String(text || '').split(/\r?\n/).forEach(l => {
      const t = String(l).trim();
      if (!t) return;
      if (/^---\s*(page|screenshot)\s+\d+\s*---$/i.test(t)) { lines.push('BREAK'); return; }
      const n = normaliseLine(commaDecimal(normaliseLine(t)));
      if (n) lines.push(n);
    });
    for (const l of lines) {
      if (l !== 'BREAK' && STMT_DATE_RE.test(l)) {
        const ds = findDates(l).filter(d => !d.rel && d.y);
        if (ds.length) { const last = ds[ds.length - 1]; ref.stmt = new Date(last.y, last.m - 1, last.d); break; }
      }
    }
    const core = l => l === 'BREAK' ? l : l.replace(STATUS_RE, ' ').replace(/[>›»]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    const cl = lines.map(core);
    const amountOnly = i => {
      for (let k = i; k < cl.length; k++) {
        const l = cl[k];
        if (l === 'BREAK') return false;
        if (!l || letterCount(dropDebris(l)) === 0 && !findAmounts(l).length) continue; // debris or status-only line
        const a = findAmounts(l);
        return a.length > 0 && letterCount(dropDebris(strip(l, findDates(l), a))) < 2;
      }
      return false;
    };
    const items = [], skipped = [];
    // A screenshot often starts mid-list, below a date heading that was on the previous screenshot.
    // opts.startDate carries that heading over; headings seen later fill any gap that's left.
    let curDate = opts.startDate ? { iso: opts.startDate, carried: true } : null, pending = [], lastTx = null, skipArmed = 0;
    const headings = [];
    for (let li = 0; li < cl.length; li++) {
      const line = cl[li];
      if (line === 'BREAK') { curDate = null; pending = []; lastTx = null; skipArmed = 0; continue; }
      if (!line) continue;
      if (STMT_DATE_RE.test(line)) { lastTx = null; continue; }
      const amts = findAmounts(line);
      const dates = findDates(line);
      if (!amts.length) {
        const rest = dropDebris(strip(line, dates, [])).replace(WEEKDAY_RE, '');
        if (dates.length && letterCount(rest) < 3) { const r = resolveDate(pickDate(dates), ref); if (r) { curDate = r; headings.push({ at: items.length, iso: r.iso }); } pending = []; lastTx = null; skipArmed = 0; continue; }
        if (SKIP_RE.test(line)) { pending = []; lastTx = null; skipArmed = 2; continue; }
        if (letterCount(rest) < 2 || /^\d{1,2}:\d{2}/.test(line)) { if (skipArmed) skipArmed--; continue; }
        if (isNav(rest)) { lastTx = null; pending = []; continue; }
        const txt = dropDebris(strip(line, dates, [])) || rest;
        if (SUBTITLE_RE.test(txt.trim())) continue;
        if (lastTx && !amountOnly(li + 1) && lastTx.cont < 2 && sameCase(lastTx.raw, txt)) { lastTx.raw += ' ' + txt; lastTx.cont++; continue; }
        pending.push({ text: fixWords(txt), date: dates.length ? resolveDate(pickDate(dates), ref) : null });
        if (pending.length > 3) pending.shift();
        lastTx = null;
        if (skipArmed) skipArmed--;
        continue;
      }
      if (SKIP_RE.test(line) && !PAYMENT_RE.test(line)) { pending = []; lastTx = null; skipArmed = 2; continue; }
      let amt = amts[amts.length - 1];
      const text2 = dropDebris(strip(line, dates, amts));
      const isAmountOnly = letterCount(text2) < 2;
      if (amt.fx && lastTx && text2.replace(/\b(foreign|currency|amount|exchange|rate|fx|transaction|original)\b/gi, '').replace(/[^A-Za-z]/g, '').length < 4) { continue; }
      let fxNote = '';
      if (amt.fx) {
        const sgd = amts.filter(a => !a.fx);
        if (sgd.length) amt = sgd[sgd.length - 1];
        else {
          const next = cl[li + 1];
          const nA = next && next !== 'BREAK' ? findAmounts(next).filter(a => !a.fx) : [];
          if (nA.length && letterCount(dropDebris(strip(next, findDates(next), nA))) < 3) { amt = nA[nA.length - 1]; li++; }
          else fxNote = amt.fx;
        }
      }
      let raw, pDate = null;
      if (isAmountOnly) {
        if (skipArmed) { skipArmed = 0; pending = []; lastTx = null; continue; }
        if (!pending.length) { lastTx = null; continue; }
        raw = pending.map(p => p.text).join(' ');
        const pd = pending.filter(p => p.date); pDate = pd.length ? pd[pd.length - 1].date : null;
      } else {
        raw = fixWords(text2);
        if (pending.length && !dates.length && pending.length <= 2) raw = pending.map(p => p.text).join(' ') + ' ' + raw;
      }
      skipArmed = 0;
      raw = raw.replace(/^[\s\-–:|•·@]+|[\s\-–:|•·@]+$/g, '');
      const ownDate = dates.length ? resolveDate(pickDate(dates), ref) : null;
      const date = ownDate || pDate || curDate;
      const item = { raw, cont: 0, value: amt.value, minus: amt.minus, plus: amt.plus, paren: amt.paren, cr: amt.cr, dr: amt.dr, fx: fxNote, date: date ? date.iso : null, dateGuessed: !date, dateCarried: !!(date && date.carried) };
      items.push(item);
      // When the amount sits on its own line under its description, text after it starts the next entry.
      lastTx = isAmountOnly ? null : item;
      pending = [];
    }
    // Lines still without a date: use the next date heading below them (lists run newest first),
    // else the statement date. Either way they are flagged for a check.
    items.forEach((t, k) => {
      if (t.date) return;
      const h = headings.find(x => x.at > k);
      t.date = h ? h.iso : (ref.stmt ? iso(ref.stmt.getFullYear(), ref.stmt.getMonth() + 1, ref.stmt.getDate()) : null);
      t.dateGuessed = true;
    });
    // Sign convention: app lists that mark spending with "-" vs statements that mark credits with "-", "( )" or CR.
    const minusN = items.filter(t => t.minus).length, plainN = items.filter(t => !t.minus && !t.plus && !t.cr && !t.paren).length;
    const minusIsSpend = minusN > 0 && minusN >= plainN;
    const out = [];
    items.forEach(t => {
      t.raw = t.raw.slice(0, 160);
      const credit = !!(t.cr || t.paren || t.plus || (t.minus && !minusIsSpend));
      // Payments and top-ups move money between your own accounts. credit: money came into this account.
      // back: money returned from a wallet to the bank ("send back from", "withdraw from").
      const move = { raw: t.raw, amount: Math.round(t.value * 100) / 100, date: t.date, dateGuessed: t.dateGuessed, dateCarried: t.dateCarried, credit, back: /send\s+back\s+from|withdraw(al)?\s+(from|to\s+bank)/i.test(t.raw) };
      if (TOPUP_RE.test(t.raw)) { skipped.push(Object.assign(move, { kind: 'topup' })); return; }
      if (PAYMENT_RE.test(t.raw)) { skipped.push(Object.assign(move, { kind: 'payment' })); return; }
      let kind = 'exp';
      if (credit) kind = CASHBACK_RE.test(t.raw) ? 'inc' : 'ref';
      const c = categorise(t.raw, opts);
      let cat = c.cat;
      if (kind === 'inc' && opts.hasCat && opts.hasCat('cashback')) cat = 'cashback';
      out.push({ date: t.date, dateGuessed: t.dateGuessed, dateCarried: t.dateCarried, raw: t.raw, merchant: c.merchant, amount: Math.round(t.value * 100) / 100, kind, cat, how: kind === 'inc' ? 'known' : c.how, fx: t.fx });
    });
    return { transactions: out, skipped, lastDate: curDate ? curDate.iso : null, statementDate: ref.stmt ? iso(ref.stmt.getFullYear(), ref.stmt.getMonth() + 1, ref.stmt.getDate()) : null };
  }
  // App navigation bars and screen furniture ("Home  History  Rewards  More").
  const NAV_WORDS = new Set(['HOME', 'HISTORY', 'REWARDS', 'MORE', 'MEMBERSHIP', 'OFFERS', 'ACCOUNT', 'ACCOUNTS', 'PAY', 'SCAN', 'CARDS', 'PROFILE', 'SETTINGS', 'MENU', 'TRANSFER', 'INVEST', 'SEARCH', 'FILTER', 'STATEMENTS', 'ACTIVITY', 'AND', 'PLAN', 'INSIGHTS', 'WEALTH', 'SERVICES', 'INBOX', 'DASHBOARD', 'OVERVIEW', 'DISCOVER', 'DEALS', 'SUPPORT', 'HELP']);
  function isNav(s) {
    const ws = String(s || '').toUpperCase().split(/[^A-Z]+/).filter(w => w.length > 1);
    if (ws.length < 2) return false;
    const hits = ws.filter(w => NAV_WORDS.has(w)).length;
    return hits >= 2 && hits / ws.length >= 0.6;
  }
  // Continuation lines of a merchant share its lettering (all caps vs mixed); icon debris usually doesn't.
  function sameCase(a, b) {
    const up = x => { const l = String(x).match(/[A-Za-z]/g) || []; return l.length ? l.filter(c => c === c.toUpperCase()).length / l.length : 0; };
    return letterCount(b) >= 3 && Math.abs(up(a) - up(b)) < 0.45;
  }
  function fixWords(s) {
    return String(s || '').replace(/([A-Za-z])1(?=[A-Za-z])/g, '$1I').replace(/([A-Za-z])0(?=[A-Za-z])/g, '$1O').replace(/\b1(?=[A-Z]{2})/g, 'I').replace(/\b0(?=[A-Z]{2})/g, 'O');
  }
  function strip(line, dates, amts) {
    const cut = [];
    dates.forEach(d => cut.push([d.i, d.i + d.len]));
    amts.forEach(a => cut.push([a.i, a.i + a.len]));
    cut.sort((a, b) => b[0] - a[0]);
    let s = line;
    cut.forEach(([a, b]) => { s = s.slice(0, a) + ' ' + s.slice(b); });
    return s.replace(/\b(SGD|S\$)\b/gi, ' ').replace(/(^|\s)\$(?=\s|$)/g, ' ').replace(WEEKDAY_RE, ' ').replace(/\s{2,}/g, ' ').trim();
  }

  const api = { parse, categorise, cleanMerchant, normKey, findDates, findAmounts, detectAccount, accountSignals, MERCHANTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SnapParse = api;
})(typeof window !== 'undefined' ? window : globalThis);
