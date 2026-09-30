import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Fakes ─────────────────────────────────────────────────────────────────
// requireManager() is the real code under test, as are lib/session.ts
// (validateSession, role/tier helpers), lib/trial.ts and lib/rate-limit.ts.
// Only the auth lookup and the Supabase admin client are faked: the admin
// client is an in-memory table store that honours .eq()/.is() filters.

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};
let currentUser: { id: string; email: string } | null = null;

function query(table: string) {
  const filters: Array<(r: Row) => boolean> = [];
  const builder = {
    select: () => builder,
    eq: (col: string, val: unknown) => {
      filters.push((r) => r[col] === val);
      return builder;
    },
    is: (col: string, val: unknown) => {
      filters.push((r) => (r[col] ?? null) === val);
      return builder;
    },
    maybeSingle: async () => ({ data: (db[table] ?? []).find((r) => filters.every((f) => f(r))) ?? null, error: null }),
    single: async () => {
      const row = (db[table] ?? []).find((r) => filters.every((f) => f(r)));
      return row ? { data: row, error: null } : { data: null, error: { message: "not found" } };
    },
  };
  return builder;
}

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdminClient: () => ({ from: (table: string) => query(table) }),
}));
vi.mock("@/lib/supabase-server", () => ({
  getUserFromRequest: async () => ({ user: currentUser, supabase: null }),
}));

const { requireManager, managementErrorResponse, ManagementAccessError } = await import("@/lib/management/auth");

// ── Helpers ───────────────────────────────────────────────────────────────

let reqCounter = 0;
function request(opts: { sessionCookie?: string } = {}) {
  const headers: Record<string, string> = { "cf-connecting-ip": `10.9.0.${++reqCounter % 250}` };
  if (opts.sessionCookie) headers.cookie = `sbe_session_id=${opts.sessionCookie}`;
  return new Request("http://test/api/management/x", { method: "POST", headers });
}

let rateKeyCounter = 0;
const freshKey = () => `test-${++rateKeyCounter}`;

function setProfile(id: string, fields: Row) {
  db.profiles = [...(db.profiles ?? []).filter((r) => r.id !== id), { id, current_session_id: null, ...fields }];
}

const OWNER = { id: "owner-1", email: "owner@venue.test" };

beforeEach(() => {
  for (const k of Object.keys(db)) delete db[k];
  currentUser = OWNER;
  delete process.env.ADMIN_EMAILS;
  db.venues = [
    { id: "venue-own", owner_user_id: OWNER.id },
    { id: "venue-foreign", owner_user_id: "other-owner" },
  ];
  db.venue_staff = [
    { id: "staff-own", manager_user_id: OWNER.id },
    { id: "staff-foreign", manager_user_id: "other-owner" },
  ];
});

// ── Tests ─────────────────────────────────────────────────────────────────

describe("requireManager — identity and session", () => {
  it("401 when there is no authenticated user (missing, expired or forged token)", async () => {
    currentUser = null;
    const res = await requireManager(request(), { rateKey: freshKey() });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.response.status).toBe(401);
  });

  it("409 when the session cookie doesn't match the stored session", async () => {
    setProfile(OWNER.id, { platform_role: "venue_manager", tier: "boutique", current_session_id: "device-A" });
    const res = await requireManager(request({ sessionCookie: "device-B" }), { rateKey: freshKey() });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.response.status).toBe(409);
  });

  it("allows a matching session cookie, and a missing one (middleware semantics)", async () => {
    setProfile(OWNER.id, { platform_role: "venue_manager", tier: "boutique", current_session_id: "device-A" });
    expect((await requireManager(request({ sessionCookie: "device-A" }), { rateKey: freshKey() })).ok).toBe(true);
    expect((await requireManager(request(), { rateKey: freshKey() })).ok).toBe(true);
  });

  it("429 once the per-user limit is spent", async () => {
    setProfile(OWNER.id, { platform_role: "venue_manager", tier: "boutique" });
    const rateKey = freshKey();
    expect((await requireManager(request(), { rateKey, limit: 2 })).ok).toBe(true);
    expect((await requireManager(request(), { rateKey, limit: 2 })).ok).toBe(true);
    const third = await requireManager(request(), { rateKey, limit: 2 });
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.response.status).toBe(429);
  });
});

describe("requireManager — role, tier and trial (mirrors the dashboard page gate)", () => {
  it("403 for a staff member on the free tier", async () => {
    setProfile(OWNER.id, { platform_role: "staff", tier: "free" });
    const res = await requireManager(request(), { rateKey: freshKey() });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.response.status).toBe(403);
  });

  it("403 for a pro (individual) subscriber — pro is not a venue tier", async () => {
    setProfile(OWNER.id, { platform_role: "staff", tier: "pro" });
    const res = await requireManager(request(), { rateKey: freshKey() });
    expect(res.ok).toBe(false);
  });

  it("allows manager roles", async () => {
    for (const role of ["venue_manager", "multi_venue_manager", "duty_manager"]) {
      setProfile(OWNER.id, { platform_role: role, tier: "free" });
      expect((await requireManager(request(), { rateKey: freshKey() })).ok).toBe(true);
    }
  });

  it("allows a non-lapsed B2B tier, denies a lapsed one", async () => {
    setProfile(OWNER.id, { platform_role: "staff", tier: "commercial", subscription_status: "active" });
    expect((await requireManager(request(), { rateKey: freshKey() })).ok).toBe(true);
    setProfile(OWNER.id, { platform_role: "staff", tier: "commercial", subscription_status: "canceled" });
    expect((await requireManager(request(), { rateKey: freshKey() })).ok).toBe(false);
  });

  it("allows an active org trial, denies an expired one", async () => {
    setProfile(OWNER.id, { platform_role: "staff", tier: "free", org_id: "org-1" });
    db.organizations = [{ id: "org-1", trial_tier: "boutique", trial_ends_at: new Date(Date.now() + 86_400_000).toISOString(), trial_converted: false }];
    expect((await requireManager(request(), { rateKey: freshKey() })).ok).toBe(true);
    db.organizations = [{ id: "org-1", trial_tier: "boutique", trial_ends_at: new Date(Date.now() - 86_400_000).toISOString(), trial_converted: false }];
    expect((await requireManager(request(), { rateKey: freshKey() })).ok).toBe(false);
  });

  it("allows an ADMIN_EMAILS account regardless of role", async () => {
    process.env.ADMIN_EMAILS = "someone@else.test, OWNER@venue.test";
    setProfile(OWNER.id, { platform_role: "staff", tier: "free" });
    const res = await requireManager(request(), { rateKey: freshKey(), ownerOnly: true });
    expect(res.ok).toBe(true);
  });

  it("ownerOnly: 403 for a duty manager, ok for an owner-level role", async () => {
    setProfile(OWNER.id, { platform_role: "duty_manager", tier: "free" });
    const duty = await requireManager(request(), { rateKey: freshKey(), ownerOnly: true });
    expect(duty.ok).toBe(false);
    if (!duty.ok) expect(duty.response.status).toBe(403);

    setProfile(OWNER.id, { platform_role: "venue_manager", tier: "boutique" });
    expect((await requireManager(request(), { rateKey: freshKey(), ownerOnly: true })).ok).toBe(true);
  });

  it("never trusts role or tier from the request — only the DB row counts", async () => {
    setProfile(OWNER.id, { platform_role: "staff", tier: "free" });
    const req = new Request("http://test/api/management/x", {
      method: "POST",
      headers: { "content-type": "application/json", "x-platform-role": "venue_manager" },
      body: JSON.stringify({ platform_role: "venue_manager", tier: "enterprise" }),
    });
    expect((await requireManager(req, { rateKey: freshKey() })).ok).toBe(false);
  });
});

describe("requireManager — ownership assertions", () => {
  async function ctx() {
    setProfile(OWNER.id, { platform_role: "venue_manager", tier: "boutique" });
    const res = await requireManager(request(), { rateKey: freshKey() });
    if (!res.ok) throw new Error("expected access");
    return res.ctx;
  }

  it("assertOwnsVenue: resolves for own venue, 404 for another org's venue", async () => {
    const c = await ctx();
    await expect(c.assertOwnsVenue("venue-own")).resolves.toBeUndefined();
    await expect(c.assertOwnsVenue("venue-foreign")).rejects.toMatchObject({ status: 404, code: "VENUE_NOT_FOUND" });
    await expect(c.assertOwnsVenue("does-not-exist")).rejects.toBeInstanceOf(ManagementAccessError);
  });

  it("assertOwnsStaff: resolves for own staff, 404 for another manager's staff", async () => {
    const c = await ctx();
    await expect(c.assertOwnsStaff("staff-own")).resolves.toBeUndefined();
    await expect(c.assertOwnsStaff("staff-foreign")).rejects.toMatchObject({ status: 404, code: "STAFF_NOT_FOUND" });
  });
});

describe("managementErrorResponse", () => {
  it("keeps ManagementAccessError status and message", async () => {
    const res = managementErrorResponse(new ManagementAccessError(404, "VENUE_NOT_FOUND", "Venue not found."), "fallback", "t");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Venue not found.", code: "VENUE_NOT_FOUND" });
  });

  it("hides raw database errors behind the fallback message", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = managementErrorResponse({ message: "permission denied for table venues", hint: "secret detail" }, "Unable to create venue.", "t", 500);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Unable to create venue." });
  });
});
