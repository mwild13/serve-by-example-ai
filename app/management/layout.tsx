import type { ReactNode } from "react";

// /management runs on the site-wide type pair, Newsreader and Inter, loaded
// in app/layout.tsx. It moved off its own three fonts (Lora, Outfit, DM Mono)
// in October 2026 when the console shell and Overview tab were brought to the
// docs/Pages-Redesign.md standard, so this layout no longer loads or scopes
// any fonts. /dashboard and /mobile still wrap their trees in
// PRODUCT_FONT_CLASS (Fraunces and Manrope); the console deliberately does
// not.
export default function ManagementLayout({ children }: { children: ReactNode }) {
  return children;
}
