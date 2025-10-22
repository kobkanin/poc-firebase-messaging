/* firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// ✅ ใช้ compat API ใน SW
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  storageBucket: "onerev-dev.firebasestorage.app",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

// Base ของ GitHub Pages (เดาว่า repo ชื่อ poc-firebase-messaging)
const scopeBase = self.registration.scope; // e.g. https://kobkanin.github.io/poc-firebase-messaging/
const iconUrl = new URL("icon-192.png", scopeBase).toString();

const notification_options = {
  body: "Background message from FCM",
  icon: iconUrl,
  badge: iconUrl,
  tag: "bg",
  data: { link_url: scopeBase },
};

// เมื่อได้รับข้อความตอนอยู่เบื้องหลัง
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload);
  const data = payload?.data || {};
  const { title = "Message", link_url, ...rest } = data;

  const opts = {
    ...notification_options,
    ...rest,
    data: { link_url: link_url || notification_options.data.link_url },
  };

  self.registration.showNotification(title, opts);
});

// เมื่อผู้ใช้คลิกที่ Notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.link_url || scopeBase;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          // ถ้าแท็บเดิมเปิดอยู่แล้ว ก็โฟกัสไปที่แท็บนั้น
          if (client.url.startsWith(scopeBase) && "focus" in client) {
            return client.focus();
          }
        }
        // ไม่งั้นก็เปิดแท็บใหม่
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
