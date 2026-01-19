const VERSION = "7.4.5"; // 🔥 GANTI SETIAP UPDATE
const CACHE_NAME = `daily-task-${VERSION}`;
const BASE = "/daily-task/";

const CORE_ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "service-worker.js",
  BASE + "icons/icon-192.png",
  BASE + "icons/icon-512.png"
];

/* ===== INSTALL ===== */
self.addEventListener("install", event => {
 event.waitUntil(
  caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
 );
 self.skipWaiting();
});

/* ===== ACTIVATE ===== */
self.addEventListener("activate", event => {
 event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));

  await self.clients.claim();

  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
   client.postMessage({ type: "UPDATE_READY", version: VERSION });
  }
 })());
});

/* ===== FETCH (Network First, SAFE) ===== */
self.addEventListener("fetch", event => {
 const req = event.request;

 if (req.method !== "GET") return;
 if (!req.url.startsWith(self.location.origin)) return;

 event.respondWith(
  fetch(req)
   .then(res => {
    // ⚠️ JANGAN cache HTML aggressively
    if (res.ok && !req.headers.get("accept")?.includes("text/html")) {
     const clone = res.clone();
     caches.open(CACHE_NAME).then(c => c.put(req, clone));
    }
    return res;
   })
   .catch(() =>
    caches.match(req).then(r => r || caches.match(BASE + "index.html"))
   )
 );
});





















