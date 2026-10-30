const CACHE = "zippair-v1";
const CORE = ["/", "/index.html", "/manifest.json", "/assets/zipp-air-logo.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
  } else {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request).then(h => h || caches.match("/index.html"))));
  }
});
