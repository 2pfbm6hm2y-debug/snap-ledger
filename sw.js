/* Snap Ledger service worker: makes the app open and scan offline. */
const APP_CACHE = 'snapledger-app-1.1.1';
const LIB_CACHE = 'snapledger-lib-1';
const FONT_CACHE = 'snapledger-fonts-1';
const APP_FILES = ['./', './index.html', './app.js', './parse.js', './ocr-worker.js', './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];
const LIB_FILES = ['./lib/pdf.min.js', './lib/pdf.worker.min.js', './lib/tesseract-core-simd-lstm.wasm.js',
  './lib/tesseract-core-lstm.wasm.js', './lib/eng.traineddata'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const app = await caches.open(APP_CACHE);
    await app.addAll(APP_FILES);
    const lib = await caches.open(LIB_CACHE);
    await Promise.all(LIB_FILES.map(async u => { if (!(await lib.match(u))) { try { await lib.add(u); } catch (x) {} } }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [APP_CACHE, LIB_CACHE, FONT_CACHE];
    for (const k of await caches.keys()) if (k.startsWith('snapledger-') && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.includes('/lib/')) {
      e.respondWith((async () => {
        const c = await caches.open(LIB_CACHE);
        const hit = await c.match(req, { ignoreSearch: true });
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      })());
      return;
    }
    e.respondWith((async () => {
      const c = await caches.open(APP_CACHE);
      try {
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      } catch (err) {
        return (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await c.match('./index.html') : Response.error());
      }
    })());
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const c = await caches.open(FONT_CACHE);
      const hit = await c.match(req);
      const net = fetch(req).then(res => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })());
  }
});
