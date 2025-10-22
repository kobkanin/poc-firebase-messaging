// sw.js  —  PWA App Service Worker (คนละไฟล์กับ firebase-messaging-sw.js)
const VERSION = "v1.0.0";
const STATIC_CACHE = `static-${VERSION}`;
const OFFLINE_URL = "offline.html";

// รายการไฟล์ที่อยากแคชตอนติดตั้ง
const PRECACHE = [
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  OFFLINE_URL,
];

// ติดตั้ง SW + แคชไฟล์พื้นฐาน
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// เคลียร์แคชเก่าตอน activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// กลยุทธ์:
// - หน้าเว็บ (navigation): Network First → ถ้าเน็ตล่มค่อยเสิร์ฟ offline.html
// - ไฟล์ static อื่นๆ: Stale-While-Revalidate
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // handle navigations
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(STATIC_CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (err) {
          const cache = await caches.open(STATIC_CACHE);
          const cached = await cache.match(req);
          return cached || cache.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // static assets: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((resp) => {
          cache.put(req, resp.clone());
          return resp;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
