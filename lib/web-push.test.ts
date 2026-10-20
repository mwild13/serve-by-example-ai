import { describe, expect, it } from "vitest";
import { dueReminders, isPushEndpoint, isPushKey, reminderMinutes, sydneyClock, vapidJwt, type ReminderRow } from "./web-push";

describe("push endpoints", () => {
  it("accepts the real push services only", () => {
    expect(isPushEndpoint("https://fcm.googleapis.com/fcm/send/abc123")).toBe(true);
    expect(isPushEndpoint("https://updates.push.services.mozilla.com/wpush/v2/abc")).toBe(true);
    expect(isPushEndpoint("https://web.push.apple.com/QGx")).toBe(true);
    expect(isPushEndpoint("https://wns2-par02p.notify.windows.com/w/?token=x")).toBe(true);
    expect(isPushEndpoint("http://fcm.googleapis.com/fcm/send/abc")).toBe(false);
    expect(isPushEndpoint("https://fcm.googleapis.com.evil.com/x")).toBe(false);
    expect(isPushEndpoint("https://169.254.169.254/latest")).toBe(false);
    expect(isPushEndpoint("https://fcm.googleapis.com:8443/x")).toBe(false);
    expect(isPushEndpoint("not a url")).toBe(false);
    expect(isPushEndpoint(42)).toBe(false);
  });

  it("checks the browser's keys", () => {
    expect(isPushKey("BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM", 200)).toBe(true);
    expect(isPushKey("short", 200)).toBe(false);
    expect(isPushKey("has spaces in it", 200)).toBe(false);
  });
});

describe("vapidJwt", () => {
  it("signs a JWT the public key verifies, for the push service's origin", async () => {
    const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
    const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
    const jwt = await vapidJwt("https://fcm.googleapis.com/fcm/send/abc", "mailto:info@servebyexample.co", jwk, Date.UTC(2026, 9, 20));
    const [header, claims, signature] = jwt.split(".");
    const decode = (part: string) => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
    expect(decode(header)).toEqual({ typ: "JWT", alg: "ES256" });
    expect(decode(claims)).toMatchObject({ aud: "https://fcm.googleapis.com", sub: "mailto:info@servebyexample.co" });
    const ok = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      pair.publicKey,
      Buffer.from(signature, "base64url"),
      new TextEncoder().encode(`${header}.${claims}`),
    );
    expect(ok).toBe(true);
  });
});

describe("dueReminders", () => {
  // Friday 2026-10-23, 4:40pm in Sydney.
  const clock = { date: "2026-10-23", weekday: 5, minutes: 16 * 60 + 40 };
  const row = (over: Partial<ReminderRow>): ReminderRow => ({
    user_id: "u",
    shift_days: [5, 6, 0],
    reminder_time: "16:30:00",
    last_reminded_on: null,
    ...over,
  });

  it("reminds on a shift day, within the hour after the chosen time", () => {
    expect(dueReminders([row({})], clock, new Set())).toEqual(["u"]);
    expect(dueReminders([row({ reminder_time: "17:00" })], clock, new Set())).toEqual([]);
    expect(dueReminders([row({ reminder_time: "15:30" })], clock, new Set())).toEqual([]);
  });

  it("skips days off, a reminder already sent, a drill already done, and no time", () => {
    expect(dueReminders([row({ shift_days: [1, 2] })], clock, new Set())).toEqual([]);
    expect(dueReminders([row({ last_reminded_on: "2026-10-23" })], clock, new Set())).toEqual([]);
    expect(dueReminders([row({})], clock, new Set(["u"]))).toEqual([]);
    expect(dueReminders([row({ reminder_time: null })], clock, new Set())).toEqual([]);
  });

  it("treats no shift days as every day", () => {
    expect(dueReminders([row({ shift_days: [] })], { ...clock, weekday: 2 }, new Set())).toEqual(["u"]);
  });
});

describe("times", () => {
  it("reads reminder times", () => {
    expect(reminderMinutes("16:30")).toBe(990);
    expect(reminderMinutes("07:00:00")).toBe(420);
    expect(reminderMinutes("25:00")).toBeNull();
    expect(reminderMinutes(null)).toBeNull();
  });

  it("uses the Sydney clock", () => {
    // 2026-10-23 05:40 UTC is 4:40pm on Friday in Sydney (daylight saving).
    expect(sydneyClock(new Date("2026-10-23T05:40:00Z"))).toEqual({ date: "2026-10-23", weekday: 5, minutes: 16 * 60 + 40 });
  });
});
