// sw.js — PWA minimal version
self.addEventListener("install", (event) => {
  console.log("[SW] installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] activated");
  self.clients.claim();
});
