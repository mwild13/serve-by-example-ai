import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Fakes ─────────────────────────────────────────────────────────────────
// lib/billing-sync.ts and the Stripe webhook route are the real code under
// test, with the real Stripe signature check. Only Supabase is faked: an
// in-memory table store that honours .eq() filters, with a switch to make
// one table's writes fail the way supabase-js reports them (an error in the
// result, not a throw).

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};
const failWrites = new Set<string>();
let authEmails: Record<string, string> = {};

function table(name: string) {
  return (db[name] ??= []);
}

function query(name: string) {
  const filters: Array<(r: Row) => boolean> = [];
  let action: { kind: "select" } | { kind: "update"; patch: Row } | { kind: "delete" } | { kind: "insert"; row: Row } = { kind: "select" };
  let limit = Infinity;
  const matches = () => table(name).filter((r) => filters.every((f) => f(r)));

  function run(): { data: unknown; error: { message: string; code?: string } | null } {
    if (action.kind !== "select" && failWrites.has(name)) return { data: null, error: { message: `${name} is down` } };
    if (action.kind === "update") {
      const patch = action.patch;
      for (const r of matches()) Object.assign(r, patch);
      return { data: null, error: null };
    }
    if (action.kind === "delete") {
      db[name] = table(name).filter((r) => !filters.every((f) => f(r)));
      return { data: null, error: null };
    }
    if (action.kind === "insert") {
      const row = action.row;
      // billing_events.stripe_event_id is UNIQUE in the real schema.
      if (name === "billing_events" && table(name).some((r) => r.stripe_event_id === row.stripe_event_id)) {
        return { data: null, error: { message: "duplicate key", code: "23505" } };
      }
      const stored = { id: `${name}-${table(name).length + 1}`, ...row };
      table(name).push(stored);
      return { data: [stored], error: null };
    }
    return { data: matches().slice(0, limit), error: null };
  }

  const builder = {
    select: () => builder,
    update: (patch: Row) => ((action = { kind: "update", patch }), builder),
    delete: () => ((action = { kind: "delete" }), builder),
    insert: (row: Row) => ((action = { kind: "insert", row }), builder),
    eq: (col: string, val: unknown) => (filters.push((r) => r[col] === val), builder),
    limit: (n: number) => ((limit = n), builder),
    maybeSingle: async () => {
      const { data, error } = run();
      return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
    },
    single: async () => {
      const { data, error } = run();
      const row = Array.isArray(data) ? data[0] : data;
      return error ? { data: null, error } : row ? { data: row, error: null } : { data: null, error: { message: "not found" } };
    },
    then: (resolve: (v: ReturnType<typeof run>) => unknown, reject?: (e: unknown) => unknown) => Promise.resolve().then(run).then(resolve, reject),
  };
  return builder;
}

const fakeClient = {
  from: (name: string) => query(name),
  auth: { admin: { getUserById: async (id: string) => ({ data: { user: authEmails[id] ? { email: authEmails[id] } : null } }) } },
};

vi.mock("@/lib/supabase-admin", () => ({ createSupabaseAdminClient: () => fakeClient }));
vi.mock("@/lib/report-error", () => ({ reportError: async () => undefined }));

const { applySubscription, downgradeByCustomer, upsertOrganization } = await import("@/lib/billing-sync");
const { POST: webhook } = await import("@/app/api/billing/webhook/route");

type AdminClient = Parameters<typeof applySubscription>[0];
const admin = fakeClient as unknown as AdminClient;

// ── Helpers ───────────────────────────────────────────────────────────────

const PRICE_TO_TIER = { price_pro: "pro", price_boutique: "boutique", price_commercial: "commercial" };
const CUSTOMER = "cus_owner";
const OWNER_ID = "owner-1";

function subscription(status: string, priceId = "price_boutique", metadata: Record<string, string> = {}): Stripe.Subscription {
  return {
    id: "sub_1",
    customer: CUSTOMER,
    status,
    metadata,
    items: { data: [{ price: { id: priceId }, current_period_end: 1_900_000_000 }] },
  } as unknown as Stripe.Subscription;
}

const profile = () => table("profiles").find((r) => r.id === OWNER_ID)!;
const orgsFor = (customer: string) => table("organizations").filter((r) => r.stripe_customer_id === customer);

beforeEach(() => {
  for (const k of Object.keys(db)) delete db[k];
  failWrites.clear();
  authEmails = { [OWNER_ID]: "owner@thecorner.test" };
  db.profiles = [{ id: OWNER_ID, stripe_customer_id: CUSTOMER, tier: "free", subscription_status: null, org_id: null }];
});

// ── applySubscription ─────────────────────────────────────────────────────

describe("applySubscription: what a payment does to the account", () => {
  it("an active venue plan sets the tier, status and renewal date, and creates the organisation with its seats", async () => {
    await applySubscription(admin, subscription("active"), PRICE_TO_TIER);

    expect(profile()).toMatchObject({
      tier: "boutique",
      subscription_status: "active",
      subscription_period_end: new Date(1_900_000_000 * 1000).toISOString(),
    });
    const [org] = orgsFor(CUSTOMER);
    expect(org).toMatchObject({ subscription_tier: "boutique", seat_limit: 15, owner_user_id: OWNER_ID, name: "thecorner.test" });
    expect(profile().org_id).toBe(org.id);
  });

  it("an upgrade updates the existing organisation instead of making a second one", async () => {
    db.organizations = [{ id: "org-1", stripe_customer_id: CUSTOMER, subscription_tier: "boutique", seat_limit: 15, owner_user_id: OWNER_ID }];
    await applySubscription(admin, subscription("active", "price_commercial"), PRICE_TO_TIER);

    expect(orgsFor(CUSTOMER)).toHaveLength(1);
    expect(orgsFor(CUSTOMER)[0]).toMatchObject({ subscription_tier: "commercial", seat_limit: 35 });
    expect(profile().org_id).toBe("org-1");
  });

  it("the price decides the tier, not metadata left over from an older checkout", async () => {
    await applySubscription(admin, subscription("active", "price_commercial", { tier: "boutique", seat_limit: "15" }), PRICE_TO_TIER);
    expect(profile().tier).toBe("commercial");
    expect(orgsFor(CUSTOMER)[0].seat_limit).toBe(35);
  });

  it("moving down to a personal plan leaves the organisation with no seats", async () => {
    db.organizations = [{ id: "org-1", stripe_customer_id: CUSTOMER, subscription_tier: "boutique", seat_limit: 15, owner_user_id: OWNER_ID }];
    await applySubscription(admin, subscription("active", "price_pro"), PRICE_TO_TIER);

    expect(profile().tier).toBe("pro");
    expect(orgsFor(CUSTOMER)[0]).toMatchObject({ subscription_tier: "free", seat_limit: 0 });
  });

  it("past_due keeps the plan while Stripe retries the card", async () => {
    profile().tier = "boutique";
    await applySubscription(admin, subscription("past_due"), PRICE_TO_TIER);
    expect(profile()).toMatchObject({ tier: "boutique", subscription_status: "past_due" });
  });

  it.each(["canceled", "unpaid", "incomplete_expired"])("%s takes the plan and the seats away", async (status) => {
    profile().tier = "boutique";
    db.organizations = [{ id: "org-1", stripe_customer_id: CUSTOMER, subscription_tier: "boutique", seat_limit: 15 }];
    await applySubscription(admin, subscription(status), PRICE_TO_TIER);

    expect(profile()).toMatchObject({ tier: "free", subscription_status: "canceled" });
    expect(orgsFor(CUSTOMER)[0]).toMatchObject({ subscription_tier: "free", seat_limit: 0 });
  });

  it("a price this build doesn't know, with no metadata, changes nothing", async () => {
    await applySubscription(admin, subscription("active", "price_unknown"), PRICE_TO_TIER);
    expect(profile().tier).toBe("free");
    expect(table("organizations")).toHaveLength(0);
  });

  it("throws when the profile write fails, so the webhook answers 500 and Stripe retries", async () => {
    failWrites.add("profiles");
    await expect(applySubscription(admin, subscription("active"), PRICE_TO_TIER)).rejects.toThrow(/profiles update failed/);
  });

  it("downgradeByCustomer throws on a failed write rather than reporting success", async () => {
    failWrites.add("organizations");
    await expect(downgradeByCustomer(CUSTOMER, admin)).rejects.toThrow(/organizations update failed/);
  });
});

// ── upsertOrganization ────────────────────────────────────────────────────

describe("upsertOrganization: whose organisation a subscription attaches to", () => {
  const opts = { stripeCustomerId: CUSTOMER, ownerUserId: OWNER_ID, name: "thecorner.test", tier: "boutique", seatLimit: 15 };

  it("converts the owner's own trial organisation and marks the trial converted", async () => {
    db.organizations = [{ id: "trial-org", stripe_customer_id: null, owner_user_id: OWNER_ID, trial_converted: false }];
    profile().org_id = "trial-org";
    await upsertOrganization(admin, opts);

    expect(table("organizations")).toHaveLength(1);
    expect(table("organizations")[0]).toMatchObject({ stripe_customer_id: CUSTOMER, subscription_tier: "boutique", seat_limit: 15, trial_converted: true });
  });

  it("never attaches a subscription to an organisation someone else owns", async () => {
    // A staff member linked to their manager's organisation buys a venue plan.
    db.organizations = [{ id: "managers-org", stripe_customer_id: null, owner_user_id: "their-manager", subscription_tier: "commercial", seat_limit: 35 }];
    profile().org_id = "managers-org";
    await upsertOrganization(admin, opts);

    const managers = table("organizations").find((r) => r.id === "managers-org")!;
    expect(managers).toMatchObject({ stripe_customer_id: null, subscription_tier: "commercial", seat_limit: 35 });
    const own = orgsFor(CUSTOMER);
    expect(own).toHaveLength(1);
    expect(own[0].owner_user_id).toBe(OWNER_ID);
    expect(profile().org_id).toBe(own[0].id);
  });
});

// ── Stripe webhook ────────────────────────────────────────────────────────

describe("POST /api/billing/webhook", () => {
  const SECRET = "whsec_test_secret";

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_unit";
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    process.env.STRIPE_PRICE_BOUTIQUE = "price_boutique";
  });

  function signedRequest(event: object, secret = SECRET) {
    const payload = JSON.stringify(event);
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    return new Request("http://test/api/billing/webhook", { method: "POST", body: payload, headers: { "stripe-signature": header } });
  }

  const deletedEvent = (id = "evt_1") => ({ id, object: "event", type: "customer.subscription.deleted", data: { object: subscription("canceled") } });

  it("rejects a request without a valid Stripe signature and changes nothing", async () => {
    profile().tier = "boutique";
    const forged = await webhook(signedRequest(deletedEvent(), "whsec_someone_else"));
    expect(forged.status).toBe(400);
    const unsigned = await webhook(new Request("http://test/api/billing/webhook", { method: "POST", body: JSON.stringify(deletedEvent()) }));
    expect(unsigned.status).toBe(400);
    expect(profile().tier).toBe("boutique");
    expect(table("billing_events")).toHaveLength(0);
  });

  it("applies a signed event once and records it", async () => {
    profile().tier = "boutique";
    const res = await webhook(signedRequest(deletedEvent()));
    expect(res.status).toBe(200);
    expect(profile().tier).toBe("free");
    expect(table("billing_events").map((r) => r.stripe_event_id)).toEqual(["evt_1"]);
  });

  it("answers 200 to a repeat delivery without running it again", async () => {
    profile().tier = "boutique";
    await webhook(signedRequest(deletedEvent()));
    profile().tier = "commercial"; // Changed since, by a later event.
    const repeat = await webhook(signedRequest(deletedEvent()));
    expect(repeat.status).toBe(200);
    expect(profile().tier).toBe("commercial");
  });

  it("answers 500 and forgets the event when a write fails, so Stripe's retry is processed", async () => {
    profile().tier = "boutique";
    failWrites.add("profiles");
    const failed = await webhook(signedRequest(deletedEvent()));
    expect(failed.status).toBe(500);
    expect(table("billing_events")).toHaveLength(0);

    failWrites.clear();
    const retried = await webhook(signedRequest(deletedEvent()));
    expect(retried.status).toBe(200);
    expect(profile().tier).toBe("free");
  });

  it("a completed checkout applies the plan to the account that started it, never one matched by email", async () => {
    const checkout = (metadata: Record<string, string>) => ({
      id: `evt_${Object.keys(metadata).length}`,
      object: "event",
      type: "checkout.session.completed",
      data: { object: { id: "cs_1", customer: CUSTOMER, subscription: null, metadata, customer_details: { email: "owner@thecorner.test" } } },
    });

    const noUser = await webhook(signedRequest(checkout({ tier: "boutique", seat_limit: "15" })));
    expect(noUser.status).toBe(200);
    expect(profile().tier).toBe("free");

    const res = await webhook(signedRequest(checkout({ userId: OWNER_ID, tier: "boutique", seat_limit: "15" })));
    expect(res.status).toBe(200);
    expect(profile().tier).toBe("boutique");
    expect(orgsFor(CUSTOMER)[0]).toMatchObject({ subscription_tier: "boutique", seat_limit: 15, owner_user_id: OWNER_ID });
  });
});
