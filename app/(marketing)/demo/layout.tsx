import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Guest Demo: The Cold Parmy | Serve By Example",
  description:
    "A guest's chicken parmy is cold in the middle after a 40 minute wait. Pick what you'd say, then see what she was thinking and what each reply did to speed, safety and money. No sign-up.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
