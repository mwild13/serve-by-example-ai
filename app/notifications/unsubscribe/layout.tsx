import type { Metadata } from "next";
import "../../styles/auth.css";

export const metadata: Metadata = {
  title: "Unsubscribe | Serve By Example",
  description: "Turn off a Serve By Example notification email.",
  robots: { index: false, follow: false },
};

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
