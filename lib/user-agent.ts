// Phone-only detection, shared by middleware.ts (the /dashboard ->
// /mobile/home auto-route) and app/dashboard/page.tsx (the checkout return).
// Deliberately narrow: only iPhone/iPod and Android-with-"Mobile"-token match.
// iPad is NOT special-cased — modern iPadOS reports a desktop Safari UA by
// default (no "iPhone"/"Mobile" token), so it falls through to the desktop
// /dashboard experience on its own, matching the product decision that
// tablets use the desktop version.
export function isMobilePhoneUserAgent(ua: string): boolean {
  return /iPhone|iPod/i.test(ua) || (/Android/i.test(ua) && /Mobile/i.test(ua));
}
