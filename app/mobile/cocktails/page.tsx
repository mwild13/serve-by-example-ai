import { Suspense } from "react";
import CocktailLibraryScreen from "../_components/CocktailLibraryScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cocktail Library | Serve By Example",
  description: "A curated reference library of cocktail recipes and specs.",
  robots: { index: false, follow: false },
};

// Phase 1b (mobile bug-fix plan) — CocktailLibraryScreen now reads the open
// cocktail detail sheet via useSearchParams() (?cocktail_id=...), which
// Next.js requires to be wrapped in Suspense (same pattern as
// app/mobile/quiz/page.tsx, app/mobile/arena/page.tsx).
export default function MobileCocktailsPage() {
  return (
    <Suspense fallback={null}>
      <CocktailLibraryScreen />
    </Suspense>
  );
}
