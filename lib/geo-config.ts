// Geo-locking configuration for Australia-only platform
export const GEO_CONFIG = {
  allowedCountries: ['AU'],

  // Routes accessible to all countries (not behind geo-lock)
  publicRoutes: ['/restricted', '/geo-block', '/privacy', '/terms', '/cookies', '/'],

  // Routes that allow all countries to view (marketing pages)
  // Non-Australian users can see these but will be redirected when trying to access paid/training features.
  // Prefix-matched: '/solutions' also covers '/solutions/pub-groups', etc.
  marketingRoutes: [
    '/pricing',
    '/membership',
    '/for-venues',
    '/demo',
    '/platform',
    '/solutions',
    '/about',
    '/how-it-works',
    '/roi',
    '/resources',
    '/toolkit',
    '/roadmap',
    '/security',
    '/contact',
    '/vs-generic-lms',
  ],

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

export function isCountryAllowed(country?: string): boolean {
  if (!country || country === 'XX') return false; // strict default-deny for unknown/missing country codes
  return GEO_CONFIG.allowedCountries.includes(country.toUpperCase());
}

export function shouldApplyGeoBlock(pathname: string, country?: string): boolean {
  if (isCountryAllowed(country)) return false;

  // Allow public routes to pass through
  if (GEO_CONFIG.publicRoutes.includes(pathname)) return false;

  // Allow marketing routes to pass through (prefix match so sub-pages like
  // /solutions/pub-groups and /resources/sop-toolkit are covered)
  if (
    GEO_CONFIG.marketingRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return false;
  }

  // Block everything else for non-AU visitors
  return true;
}
