// Offline support: keep a copy of the whole app on the tablet.
// Bump VERSION whenever files change so tablets pick up the new copy.
const VERSION = 'turkey-time-v3';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'fonts/fredoka.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'js/app.js',
  'js/store.js',
  'js/fx.js',
  'js/ui.js',
  'js/turkey.js',
  'js/dress.js',
  'js/tree.js',
  'js/match.js',
  'js/catch.js',
  'js/words.js',
  'js/wordsearch.js',
  'js/crossword.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Answer from the saved copy right away, and quietly refresh it when there is internet.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then((res) => {
        if (res.ok) cache.put(req.url.split('?')[0], res.clone());
        return res;
      }).catch(() => hit);
      return hit || fresh;
    }),
  );
});
