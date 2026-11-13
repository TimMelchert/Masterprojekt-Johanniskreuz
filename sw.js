// Masterprojekt Johanniskreuz – Service Worker
// VERSION muss exakt gleich sein wie in js/config.js (bei jeder Änderung beide hochzählen).
const VERSION = '0.2.3';
const CACHE_NAME = 'johanniskreuz-' + VERSION;

// App-Hülle: alle Dateien, die die App zum Starten braucht. Neue Dateien hier eintragen.
// Daten aus dem Google Sheet kommen nie hierher (siehe docs/STAND.md 1.5).
const HUELLE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/app.js',
  './js/config.js',
  './js/api.js',
  './js/store.js',
  './js/daten.js',
  './js/rechnen.js',
  './js/ui/dom.js',
  './js/ui/aussehen.js',
  './js/ui/fenster.js',
  './js/ui/formular.js',
  './js/ui/meldung.js',
  './js/views/formulare.js',
  './js/views/todo-zeile.js',
  './js/views/arbeitsschritte.js',
  './js/views/todos.js',
  './js/views/zeitplan.js',
  './js/views/start.js',
  './js/views/info.js',
  './js/views/platzhalter.js',
  './js/views/nichtgefunden.js',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  // cache: 'reload' holt jede Datei frisch vom Server, nicht aus dem Browser-Speicher
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(HUELLE.map((u) => new Request(u, { cache: 'reload' })))));
  // Kein skipWaiting hier: Die Seite fragt erst („Jetzt neu laden“).
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => (k.startsWith('johanniskreuz-') || k.startsWith('pfalzturm-')) && k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Die Seite schickt diese Nachricht, wenn die Person „Jetzt neu laden“ tippt.
self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

// Nur eigene Dateien aus dem Zwischenspeicher. Anfragen an das Google-Skript gehen immer ins Netz.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((res) => res || fetch(e.request))
  );
});
