// MRM S5 offline start (registered only while GitHub sync is on, over https). Network first: when online, every page
// load gets the current app from the server (an update or a rollback takes effect at once); only when the network fails
// is the last copy served from this cache. Only this origin's app files are cached (the page, its CSS, fonts and the two
// vendored libraries). GitHub API requests, the sign-in exchange and everything cross-origin go straight to the network
// and are never cached. Removal: the rollback worker in docs/S6_MIGRATION_CHECKLIST.md (same file name, unregisters itself).
const CACHE = 'mrm-s5-shell-1';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.add(new URL('./', self.location).href)).catch(() => {}).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || u.pathname.endsWith('/sw.js') || u.search) return; // never cache a sign-in return (?code=…)
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(u.origin + u.pathname, copy)); }
    return res;
  }).catch(() => caches.match(u.origin + u.pathname).then(m => m || Response.error())));
});
