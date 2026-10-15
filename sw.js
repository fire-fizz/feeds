// Lets the app open with no signal. Tries the network first so updates show
// up right away, and falls back to the saved copy when offline.
const CACHE = 'feeds-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(cache =>
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cache.match(e.request, { ignoreSearch: true }))
  ));
});
