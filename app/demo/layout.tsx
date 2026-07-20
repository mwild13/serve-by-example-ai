import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try a Live Hospitality Scenario | Serve By Example",
  description:
    "Pick a real hospitality scenario and respond as you would on shift. Get instant AI-scored feedback on communication, sales technique, and guest experience.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
