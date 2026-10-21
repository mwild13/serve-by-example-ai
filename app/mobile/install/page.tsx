import { Suspense } from "react";
import InstallScreen from "../_components/InstallScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add to Home Screen | Serve By Example",
  description: "Put Serve By Example on your phone's Home Screen.",
  robots: { index: false, follow: false },
};

// InstallScreen reads ?from= with useSearchParams(), which needs Suspense.
export default function MobileInstallPage() {
  return (
    <Suspense fallback={null}>
      <InstallScreen />
    </Suspense>
  );
}
