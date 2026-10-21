// Geo-locking configuration for Australia-only platform
const GEO_CONFIG = {
  allowedCountries: ['AU'],

  // Routes accessible to all countries regardless of geo (legal / compliance pages +
  // the geo-block destination itself). This list must stay minimal — adding marketing
  // pages here is the main source of geo-block bypasses.
  // '/' (the home page) is listed since 2026-10-12: Google's sign-in brand
  // check reads it from outside Australia and refused the app while it
  // redirected to /restricted. Every other marketing page (pricing, demo,
  // platform…) and the whole app stay AU-only. A non-AU visitor on the home
  // page, /privacy or /terms sees a Navbar, but any link that is not listed
  // here bounces them to /restricted via the middleware.
  publicRoutes: [
    '/',
    '/restricted',
    '/geo-block',
    '/privacy',
    '/terms',
    '/refunds', // linked from Stripe checkout and receipts
    '/cookies',
    '/contact', // linked from /restricted footer — kept accessible for enquiries
    '/notifications/unsubscribe', // the Spam Act needs unsubscribe to work from anywhere
  ],

  // Marketing routes visible to non-AU visitors.
  // Intentionally empty — all marketing/hero content is AU-only.
  // Previously this listed /pricing, /for-venues, /demo, /platform which created
  // a bypass: /restricted → /privacy (public) → Navbar → /pricing (allowed) → full site.
  marketingRoutes: [] as string[],

  // Geo-block page path
  geoBlockPath: '/restricted',

  // Routes to apply geo-blocking to (non-Australian users redirected)
  restrictedRoutes: [
    '/login',
    '/signup',
    '/onboarding',
    '/dashboard',
    '/management',
  ],

  // The product and account screens. Search, ad-review and link-preview
  // crawlers are let through the geo-block for marketing pages only, never
  // for these: a user-agent can be faked, so the exemption must not open
  // anything a faked one should not see.
  appRoutePrefixes: [
    '/login',
    '/signup',
    '/auth',
    '/onboarding',
    '/dashboard',
    '/mobile',
    '/management',
    '/reset-password',
    '/session-conflict',
  ],
};

// Google and Bing search, Google Ads landing-page review, and the fetchers
// that build link previews. Nearly all of them request from outside
// Australia, so without an exemption they are redirected to /restricted: ads
// are disapproved for a broken destination, shared links have no preview and
// the site is indexed as a block page.
const CRAWLER_USER_AGENT =
  /Googlebot|AdsBot-Google|Mediapartners-Google|Google-InspectionTool|GoogleOther|bingbot|adidxbot|facebookexternalhit|Facebot|meta-externalagent|LinkedInBot|Twitterbot|Slackbot|WhatsApp|Applebot|DuckDuckBot|Pinterestbot/i;

export function isKnownCrawler(userAgent: string | null | undefined): boolean {
  return !!userAgent && CRAWLER_USER_AGENT.test(userAgent);
}

function isAppRoute(pathname: string): boolean {
  return GEO_CONFIG.appRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isCountryAllowed(country?: string): boolean {
  if (!country || country === 'XX') return false; // strict default-deny for unknown/missing country codes
  return GEO_CONFIG.allowedCountries.includes(country.toUpperCase());
}

export function shouldApplyGeoBlock(pathname: string, country?: string, userAgent?: string | null): boolean {
  // Local development bypass: `next dev` / `next build` outside production set
  // NODE_ENV accordingly, and localhost requests carry no CF country header.
  // Without this bypass, the strict default-deny below blocks every local page.
  if (process.env.NODE_ENV !== 'production') return false;

  if (isCountryAllowed(country)) return false;

  // Allow public routes to pass through
  if (GEO_CONFIG.publicRoutes.includes(pathname)) return false;

  // Allow marketing routes to pass through
  if (GEO_CONFIG.marketingRoutes.includes(pathname)) return false;

  // Crawlers may read the marketing pages from anywhere
  if (isKnownCrawler(userAgent) && !isAppRoute(pathname)) return false;

  // Block everything else for non-AU visitors
  return true;
}
