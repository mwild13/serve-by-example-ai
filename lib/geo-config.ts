// Geo-locking configuration for Australia-only platform
export const GEO_CONFIG = {
  allowedCountries: ['AU'],

  // Routes accessible to all countries (not behind geo-lock)
  publicRoutes: ['/restricted', '/geo-block', '/privacy', '/terms', '/cookies', '/'],

  // Routes that allow all countries to view (marketing pages)
  // Non-Australian users can see these but will be redirected when trying to access paid/training features
  marketingRoutes: ['/pricing', '/for-venues', '/demo', '/platform'],

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
  if (!country || country === 'XX') return true; // local dev or Cloudflare unknown
  return GEO_CONFIG.allowedCountries.includes(country.toUpperCase());
}

export function shouldApplyGeoBlock(pathname: string, country?: string): boolean {
  if (isCountryAllowed(country)) return false;

  // Only block routes that require AU access (auth + app routes)
  return GEO_CONFIG.restrictedRoutes.some((route) => pathname.startsWith(route));
}
