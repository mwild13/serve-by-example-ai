import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { SplitPanel, type SplitPanelItem } from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Hospitality Operator Resources | Serve By Example",
  description:
    "Free SOP templates for Australian hospitality venues. Select your venue type and get a structured, copy-pasteable onboarding SOP in under 60 seconds.",
  alternates: { canonical: "/resources" },
};

// The four areas each template covers; wording matches /resources/sop-toolkit.
const COVERS: SplitPanelItem[] = [
  { title: "RSA & Responsible Service" },
  { title: "Allergen Communication" },
  { title: "Opening & Closing Procedures" },
  { title: "Pre-Start Compliance Paperwork" },
];

export default function ResourcesPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <PageHero
          compact
          eyebrow="Free Resources"
          title="Practical tools for Australian hospitality operators."
          subtitle="Download, use, and keep them. No strings attached."
        />

        <SplitPanel
          kicker="Interactive builder, free"
          title="Free Staff Onboarding SOP Templates"
          lede="Select your venue type, state, and biggest compliance pain point. We generate a structured, copy-pasteable SOP template matched to your operation in under 60 seconds. Covers RSA, allergens, opening/closing, and pre-start paperwork."
          items={COVERS}
        >
          <div className="sbe-mkt-plans-actions">
            <Link href="/resources/sop-toolkit" className="sbe-mkt-btn-primary">
              Build my free SOP template
            </Link>
            <span className="sbe-mkt-footnote">Customised to your venue type and jurisdiction.</span>
          </div>
        </SplitPanel>

        <CTABand
          background="neutral"
          eyebrow="Take it further"
          title="Want the full training platform?"
          copy="The SOP templates give you a starting point. Serve By Example gives your team AI-scored scenario practice, progress tracking, and a manager console, all in one place."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "View Pricing", href: "/membership" }}
        />
      </main>
      <Footer />
    </div>
  );
}
