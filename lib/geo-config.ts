// Geo-locking configuration for Australia-only platform
const GEO_CONFIG = {
  allowedCountries: ['AU'],

  // Routes accessible to all countries regardless of geo (legal / compliance pages +
  // the geo-block destination itself). This list must stay minimal — adding marketing
  // pages here is the main source of geo-block bypasses.
  // NOTE: '/' (homepage) is intentionally NOT listed here. The homepage and all
  // marketing content (pricing, demo, platform…) are AU-only. Non-AU users that
  // land on /privacy or /terms will see a Navbar, but clicking any non-listed link
  // simply bounces them back to /restricted via the middleware.
  publicRoutes: [
    '/restricted',
    '/geo-block',
    '/privacy',
    '/terms',
    '/cookies',
    '/contact', // linked from /restricted footer — kept accessible for enquiries
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
};

function isCountryAllowed(country?: string): boolean {
  if (!country || country === 'XX') return false; // strict default-deny for unknown/missing country codes
  return GEO_CONFIG.allowedCountries.includes(country.toUpperCase());
}

export function shouldApplyGeoBlock(pathname: string, country?: string): boolean {
  // Local development bypass: `next dev` / `next build` outside production set
  // NODE_ENV accordingly, and localhost requests carry no CF country header.
  // Without this bypass, the strict default-deny below blocks every local page.
  if (process.env.NODE_ENV !== 'production') return false;

  if (isCountryAllowed(country)) return false;

  // Allow public routes to pass through
  if (GEO_CONFIG.publicRoutes.includes(pathname)) return false;

  // Allow marketing routes to pass through
  if (GEO_CONFIG.marketingRoutes.includes(pathname)) return false;

  // Block everything else for non-AU visitors
  return true;
}
