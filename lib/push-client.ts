// Browser side of shift reminders (Rich update, Phase 12, part 2): register
// the service worker (public/sw.js), ask for permission, and hand the
// subscription to /api/push/subscription. The server side is lib/web-push.ts.

export type PushSupport = "ok" | "install" | "unsupported";

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isInstalled(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** "install": on iPhone, reminders need the app added to the Home Screen first. */
export function pushSupport(): PushSupport {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return "unsupported";
  if (isIos() && !isInstalled()) return "install";
  return "PushManager" in window && "Notification" in window ? "ok" : "unsupported";
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64url.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Whether this browser lets the site notify: "granted", "denied" or "default" (not asked yet). */
export function notificationPermission(): NotificationPermission {
  return typeof Notification === "undefined" ? "denied" : Notification.permission;
}

/**
 * Asks for permission. Call it first thing in a button's click handler, with
 * no await before it: Safari (and so every iPhone) only shows the prompt
 * when the request comes straight from a tap, and otherwise answers
 * "denied" without asking. A dropdown change doesn't count as a tap.
 */
export function askNotificationPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission();
}

/** How to unblock notifications on this device, step by step. */
export function blockedHelp(): string {
  const ua = navigator.userAgent;
  if (isIos()) {
    return "Notifications are off for Serve By Example. On your iPhone, open Settings, then Notifications, then Serve By Example, and turn on Allow Notifications. Then come back and tap Allow notifications again.";
  }
  if (/Android/i.test(ua)) {
    return "Notifications are blocked for this site. In Chrome, tap the three dots, then Settings, Site settings, Notifications, and allow servebyexample.co. If you added the app to your home screen, you can also press and hold its icon, tap App info, then Notifications.";
  }
  if (/^((?!chrome|chromium|crios|edg|android).)*safari/i.test(ua)) {
    return "Notifications are blocked for this site. In Safari, open Settings, then Websites, then Notifications, and set servebyexample.co to Allow. Then tap Allow notifications again.";
  }
  return "Notifications are blocked for this site. Click the icon just left of the web address, open Site settings, and set Notifications to Allow. Then tap Allow notifications again.";
}

/**
 * Turns on notifications for this browser, once permission is granted (ask
 * with askNotificationPermission first). Throws with a message to show.
 */
export async function turnOnPush(token: string): Promise<void> {
  if (notificationPermission() !== "granted") throw new Error(blockedHelp());
  const res = await fetch("/api/push/subscription", { headers: { Authorization: `Bearer ${token}` } });
  const { publicKey } = (await res.json().catch(() => ({}))) as { publicKey?: string | null };
  if (!publicKey) throw new Error("Reminders aren't switched on yet. Your time is saved, and they'll start once they are.");

  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) }));

  const save = await fetch("/api/push/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!save.ok) throw new Error("Could not turn on notifications on this phone.");
}

/** Turns off notifications for this browser. Best effort. */
export async function turnOffPush(token: string): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await fetch("/api/push/subscription", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => undefined);
  await subscription.unsubscribe().catch(() => false);
}
