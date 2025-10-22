importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);
const firebaseConfig = {
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  storageBucket: "onerev-dev.firebasestorage.app",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message", payload);
  const { title, link_url, ...options } = payload.data;
  notification_options.data.link_url = link_url;

  // Customize notification here
  self.registration.showNotification(title, {
    ...notification_options,
    ...options,
  });
});

self.addEventListener("notificationclick", (event) => {
  console.log("Click:", event);
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window" })
      .then((clientList) => {
        console.log("what is client list", clientList);
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow && Boolean(event.notification.data.link_url))
          return clients.openWindow(event.notification.data.link_url);
      })
      .catch((err) => {
        console.log("There was an error waitUntil:", err);
      })
  );
});
