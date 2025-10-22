/* firebase-messaging-sw.js (SW-managed only) */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// ใช้ compat API ใน SW
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  storageBucket: "onerev-dev.firebasestorage.app",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

// base ของ GitHub Pages (เช่น https://kobkanin.github.io/poc-firebase-messaging/)
const scopeBase = self.registration.scope;
const iconUrl = new URL("icon-192.png", scopeBase).toString();

const notification_options = {
  body: "Background message from FCM",
  icon: iconUrl,
  badge: iconUrl,
  tag: "kob-demo", // tag เดิมๆ ไว้รวมกลุ่ม
  renotify: true, // ถ้ามี tag เดิม ให้สั่น/เด้งเตือนอีก
  requireInteraction: true, // อยู่ค้างจนกดปิด (บางเครื่องช่วยให้ heads-up)
  vibrate: [200, 100, 200], // ให้สั่น (Android มัก heads-up ถ้ามีสั่น/เสียง)
  timestamp: Date.now(),
  data: { link_url: scopeBase },
  actions: [
    // ปุ่ม action ก็ช่วยดึงความสนใจ
    { action: "open", title: "Open" },
  ],
};

// ถ้ามี payload.notification แปลว่าเบราว์เซอร์/FCM จะโชว์เอง → ไม่ต้องซ้ำ
messaging.onBackgroundMessage((payload) => {
  if (payload?.notification) {
    console.log("[SW] has notification -> skip duplicate");
    return;
  }

  console.log("[SW] background payload:", payload);
  const data = payload?.data || {};
  const { title = "Message", link_url, ...rest } = data;

  const opts = {
    ...notification_options,
    ...rest,
    data: { link_url: link_url || notification_options.data.link_url },
  };

  self.registration.showNotification(title, opts);
});

// คลิกแล้วโฟกัส/เปิดแท็บใน scope
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.link_url || scopeBase;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(scopeBase) && "focus" in client)
            return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
