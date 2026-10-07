import { test, expect, type Page } from "@playwright/test";

// Public pages only: the homepage sticky bar, /advisory CTAs and the
// attribution params the /contact form forwards.

const SLUGS = [
  "general", "health-check", "bar-profit", "service-reset", "ongoing",
  "remote-review", "systems-upgrade", "strategy-session", "hub-pilot",
];

const isPhone = (name: string) => name.startsWith("phone");

// Pre-answer the cookie banner so it never covers what a test clicks.
async function setConsent(page: Page, analytics: boolean) {
  await page.addInitScript((a) => {
    localStorage.setItem("sbe-cookie-consent", JSON.stringify({ v: 1, analytics: a, ts: Date.now() }));
  }, analytics);
}

async function scrollPastFold(page: Page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
}

test("homepage sticky bar appears after the fold on phones only", async ({ page }, testInfo) => {
  await setConsent(page, false);
  await page.goto("/");
  const bar = page.locator(".sbe-mkt-hero-sticky");
  await expect(bar).toBeHidden();

  await scrollPastFold(page);
  if (isPhone(testInfo.project.name)) {
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("14-day free trial");
    const cta = bar.getByRole("link", { name: "Start Free Trial" });
    await expect(cta).toHaveAttribute("href", "/login?intent=trial&tier=boutique");
  } else {
    await expect(bar).toBeHidden();
  }
});

test("advisory sticky bar links to contact with the general slug", async ({ page }, testInfo) => {
  test.skip(!isPhone(testInfo.project.name), "Sticky bar is mobile-only");
  await setConsent(page, false);
  await page.goto("/advisory");
  await scrollPastFold(page);
  const bar = page.locator(".sbe-mkt-hero-sticky");
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("link", { name: "Book a free call" })).toHaveAttribute(
    "href",
    "/contact?source=advisory&package=general",
  );
});

test("every advisory contact link carries source and a known package slug", async ({ page }) => {
  await page.goto("/advisory");
  const hrefs = await page
    .locator("main a[href^='/contact']")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));

  expect(hrefs.length).toBeGreaterThanOrEqual(12);
  const seen = new Set<string>();
  for (const href of hrefs) {
    const params = new URL(href, "http://x").searchParams;
    expect(params.get("source"), href).toBe("advisory");
    expect(SLUGS, href).toContain(params.get("package"));
    seen.add(params.get("package") ?? "");
  }
  expect([...seen].sort()).toEqual([...SLUGS].sort());
});

test("advisory is noindex, keeps its FAQ JSON-LD and has no horizontal scroll", async ({ page }) => {
  await page.goto("/advisory");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  // The root layout adds its own site-wide JSON-LD, so check them all.
  const ld = await page.locator("script[type='application/ld+json']").allTextContents();
  expect(ld.join("\n")).toContain("FAQPage");
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("advisory CTA click sends a GA event once analytics is accepted", async ({ page }) => {
  await page.route("**://www.googletagmanager.com/**", (route) => route.abort());
  await setConsent(page, true);
  await page.goto("/advisory");
  await page.waitForFunction(() => "gtag" in window);
  await page.locator(".sbe-adv-hub").getByRole("link", { name: "Join the founding pilot" }).click();
  await page.waitForURL(/\/contact\?source=advisory&package=hub-pilot/);
  const events = await page.evaluate(() =>
    ((window as unknown as { dataLayer: ArrayLike<unknown>[] }).dataLayer ?? []).map((e) => Array.from(e)),
  );
  expect(events).toContainEqual([
    "event",
    "advisory_cta_click",
    { package: "hub-pilot", link_text: "Join the founding pilot" },
  ]);
});

test("advisory CTA click sends nothing without analytics consent", async ({ page }) => {
  await setConsent(page, false);
  await page.goto("/advisory");
  await page.locator(".sbe-adv-hub").getByRole("link", { name: "Join the founding pilot" }).click();
  await page.waitForURL(/\/contact\?source=advisory/);
  expect(await page.evaluate(() => "dataLayer" in window)).toBe(false);
});

async function submitContact(page: Page) {
  let posted: Record<string, unknown> | null = null;
  await page.route("**/api/contact", async (route) => {
    posted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ json: { ok: true } });
  });
  await page.locator("#contact-name").fill("Test Person");
  await page.locator("#contact-email").fill("test@example.com");
  await page.locator("#contact-message").fill("Hello");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".auth-status-success")).toBeVisible();
  return posted as Record<string, unknown> | null;
}

test("contact form forwards source and package from the URL", async ({ page }) => {
  await setConsent(page, false);
  await page.goto("/contact?source=advisory&package=service-reset");
  await expect(page.locator("input[type='hidden'][name='source']")).toHaveValue("advisory");
  await expect(page.locator("input[type='hidden'][name='package']")).toHaveValue("service-reset");
  const body = await submitContact(page);
  expect(body).toMatchObject({ source: "advisory", package: "service-reset" });
});

test("contact form is unchanged without params and drops malformed ones", async ({ page }) => {
  await setConsent(page, false);
  await page.goto("/contact");
  await expect(page.locator("form.contact-form input[type='hidden']")).toHaveCount(0);
  const body = await submitContact(page);
  expect(Object.keys(body ?? {}).sort()).toEqual(
    ["email", "message", "name", "venueName", "venueType", "website"],
  );

  await page.goto("/contact?source=%3Cscript%3E&package=Not%20A%20Slug");
  await expect(page.locator("#contact-name")).toBeVisible();
  await expect(page.locator("form.contact-form input[type='hidden']")).toHaveCount(0);
});
