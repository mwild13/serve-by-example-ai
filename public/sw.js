// Serve By Example service worker: shift reminders only (Rich update,
// Phase 12). A reminder push carries no message (lib/web-push.ts), so the
// text is fixed here. It caches nothing and handles no fetches, so it can
// never serve a stale page.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  event.waitUntil(
    self.registration.showNotification("Ready for your shift?", {
      body: "Six quick questions, about three minutes, and you're set for tonight.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "preshift",
      data: { url: "/mobile/drill?mode=preshift" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/mobile/home";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client && new URL(client.url).origin === self.location.origin) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
