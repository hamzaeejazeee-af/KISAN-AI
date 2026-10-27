/* Kisan Dost service worker: the app opens even with no internet. API calls are never cached. */
const V = "kd-v5", CORE = ["/", "/static/css/app.css", "/static/css/splash.css", "/static/css/lawn.css", "/static/js/voice.js", "/static/js/app.js", "/static/js/splash.js", "/static/js/aisetup.js", "/static/js/auth.js", "/static/js/bg.js", "/static/js/features.js", "/static/js/lawn.js", "/static/icons/icon-192.png", "/static/icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(V).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match("/"))));
});
