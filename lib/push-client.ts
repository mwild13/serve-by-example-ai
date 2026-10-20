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

/** Turns on notifications for this browser. Throws with a message to show. */
export async function turnOnPush(token: string): Promise<void> {
  const res = await fetch("/api/push/subscription", { headers: { Authorization: `Bearer ${token}` } });
  const { publicKey } = (await res.json().catch(() => ({}))) as { publicKey?: string | null };
  if (!publicKey) throw new Error("Reminders aren't switched on yet. Your time is saved, and they'll start once they are.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notifications are blocked for this app. Allow them in your phone's settings, then try again.");

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
