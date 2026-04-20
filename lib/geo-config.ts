// Geo-locking configuration for Australia-only platform
export const GEO_CONFIG = {
  allowedCountries: ['AU'],

  // Routes accessible to all countries (not behind geo-lock)
  publicRoutes: ['/geo-block', '/privacy', '/terms', '/cookies', '/'],

  // Routes that allow all countries to view (marketing pages)
  // Non-Australian users can see these but will be redirected when trying to access paid/training features
  marketingRoutes: ['/pricing', '/for-venues', '/demo', '/platform'],

  // Geo-block page path
  geoBlockPath: '/geo-block',

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
  if (!country) return false;
  return GEO_CONFIG.allowedCountries.includes(country.toUpperCase());
}

export function shouldApplyGeoBlock(pathname: string, country?: string): boolean {
  if (!country || isCountryAllowed(country)) return false;

  // Allow public routes to pass through
  if (GEO_CONFIG.publicRoutes.includes(pathname)) return false;

  // Allow marketing routes to pass through
  if (GEO_CONFIG.marketingRoutes.includes(pathname)) return false;

  // Block everything else
  return true;
}
