import ContactSupportScreen from "../_components/ContactSupportScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support | Serve By Example",
  description: "Get in touch with the Serve By Example team.",
  robots: { index: false, follow: false },
};

// Mobile bugfix pass (2026-09-02) — real in-app destination for Settings'
// "Contact support" link, replacing the old redirect out to the public
// marketing /contact page.
export default function MobileContactPage() {
  return <ContactSupportScreen />;
}
