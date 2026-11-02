// Offline-Cache: App läuft auch ohne Internet (z. B. im Gym-Keller).
// Bei jedem Update VERSION hochzählen, damit das iPhone die neuen Dateien lädt.
const VERSION = 'gymlog-v6';
const FILES = [
  './', 'index.html', 'styles.css', 'app.js', 'lexikon.js', 'muskeln.js', 'meal.js', 'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'img/eq_barbell.png', 'img/eq_barbell_bench.png', 'img/eq_bodyweight.png',
  'img/eq_cable.png', 'img/eq_dumbbell.png', 'img/eq_machine.png', 'img/eq_pullupbar.png'
];

self.addEventListener('install', e => {
  // cache: 'reload' umgeht den Browser-Cache, damit wirklich die neuen Dateien gespeichert werden.
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Netzwerk zuerst (damit Updates sofort ankommen), sonst Cache.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }) // immer beim Server nachfragen, ob es eine neuere Version gibt
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
