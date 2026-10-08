import { test, expect } from "@playwright/test";

// Every public marketing page against the Pages-Redesign.md standard:
// it loads, has one H1, ends with one CTABand where the page has one, shows
// none of the retired card-grid markup, and does not scroll sideways.

type Route = { path: string; band: boolean };

const ROUTES: Route[] = [
  { path: "/", band: true },
  { path: "/membership", band: true },
  { path: "/platform", band: true },
  { path: "/platform/challenges", band: true },
  { path: "/how-it-works", band: true },
  { path: "/solutions", band: true },
  { path: "/solutions/fine-dining", band: true },
  { path: "/solutions/franchise-systems", band: true },
  { path: "/solutions/hotel-fb", band: true },
  { path: "/solutions/pub-groups", band: true },
  { path: "/about", band: true },
  { path: "/for-venues", band: true },
  { path: "/roi", band: true },
  { path: "/resources", band: true },
  { path: "/resources/sop-toolkit", band: true },
  { path: "/roadmap", band: true },
  { path: "/security", band: true },
  { path: "/contact", band: true },
  { path: "/vs-generic-lms", band: true },
  { path: "/advisory", band: true },
  { path: "/demo", band: true },
  { path: "/demo/complaint-master", band: true },
  // The generator is the action on /toolkit, and legal pages are reading pages.
  { path: "/toolkit", band: false },
  { path: "/privacy", band: false },
  { path: "/terms", band: false },
  { path: "/cookies", band: false },
];

// Markup from the August card-grid standard. None of it should come back.
const RETIRED = ".sbe-mkt-featuregrid, .sbe-mkt-featurecard, .metrics-strip, main .eyebrow, .faq-list, .faq-item";

for (const { path, band } of ROUTES) {
  test(`${path} meets the page standard`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sbe-cookie-consent", JSON.stringify({ v: 1, analytics: false, ts: Date.now() }));
    });
    const response = await page.goto(path);
    expect(response?.status(), "status").toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".sbe-mkt-ctaband")).toHaveCount(band ? 1 : 0);
    await expect(page.locator(RETIRED)).toHaveCount(0);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
  });
}

test("/solutions/multi-venue redirects to the pub groups page", async ({ page }) => {
  await page.goto("/solutions/multi-venue");
  await expect(page).toHaveURL(/\/solutions\/pub-groups$/);
});

test("marketing headings use the heading token, and the product scope is absent", async ({ page }) => {
  await page.goto("/platform");
  const h1 = page.locator("h1");
  const body = page.locator("body");
  const [headingFamily, bodyFamily] = await Promise.all([
    h1.evaluate((el) => getComputedStyle(el).fontFamily),
    body.evaluate((el) => getComputedStyle(el).fontFamily),
  ]);
  expect(headingFamily.toLowerCase()).toContain("newsreader");
  expect(bodyFamily.toLowerCase()).toContain("inter");
  await expect(page.locator(".sbe-app-type")).toHaveCount(0);
});
