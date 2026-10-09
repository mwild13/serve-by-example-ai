import type { Metadata } from "next";
import Link from "next/link";
import SopGeneratorPreview from "@/app/toolkit/_components/SopGeneratorPreview";
import PageHero from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Free Staff Onboarding SOP Templates | Serve By Example",
  description:
    "Customisable FOH and BOH onboarding SOP templates for Australian hospitality venues. Covers RSA compliance, Day 1 orientation, food safety, and progress review.",
  robots: "noindex",
  alternates: { canonical: "/toolkit" },
};

export default function ToolkitPage() {
  return (
    <main className="sbe-mkt-toolkit">
      {/* Deliberately chrome-less lead-magnet page — PageHero for markup
          consistency, but no Navbar/Footer/CTABand: the generator below IS
          the conversion action, and extra nav is an exit route. */}
      <nav className="sbe-mkt-toolkit-bar" aria-label="Site">
        <Link href="/">Serve By Example</Link>
      </nav>

      <PageHero
        compact
        eyebrow="Free for Australian hospitality operators"
        title="Your venue’s staff onboarding SOP, built in 60 seconds."
        subtitle="Select your venue type and biggest compliance pain point. We’ll generate a structured, copy-pasteable SOP template matched to your operation."
      />

      <section className="sbe-mkt-toolkit-tool">
        <SopGeneratorPreview />
      </section>

      <footer className="sbe-mkt-toolkit-foot">
        <p>
          Templates are aligned to the Hospitality Industry (General) Award 2020 and applicable state licensing
          requirements. Not a substitute for legal or HR advice. Current as at June 2026.
        </p>
        <p>
          <Link href="/">servebyexample.co</Link>
          {" · "}
          <Link href="/privacy">Privacy policy</Link>
        </p>
      </footer>
    </main>
  );
}
