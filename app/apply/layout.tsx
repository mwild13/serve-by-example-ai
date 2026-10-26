import type { Metadata } from "next";
import "../styles/applicant.css";

// The applicant test (docs/APPLICANT_TESTING.md §2). No sign-in, no nav: the
// link in the invite email is the only way in. Never indexed, and the link
// never leaves in a Referer header.
export const metadata: Metadata = {
  title: "Applicant test | Serve By Example",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
