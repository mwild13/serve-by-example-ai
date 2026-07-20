import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Serve By Example | Hospitality Training Platform",
  description:
    "Get in touch with the Serve By Example team. Questions about the platform, enterprise plans, or venue setup — we respond within one business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
