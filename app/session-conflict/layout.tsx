import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Conflict | Serve By Example",
  description: "Your Serve By Example account is signed in on another device.",
  robots: { index: false, follow: false },
};

export default function SessionConflictLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
