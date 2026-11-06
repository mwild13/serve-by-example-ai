import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { DemoVideoPlayer } from "@/components/marketing/DemoVideo";
import DemoMinimalFooter from "../demo/_components/DemoMinimalFooter";

// Where the demo video picture in emails links to (docs/DEMO_VIDEO_PLAN.md
// section 10). Links carry utm_ tags, so Analytics shows which email sent
// each viewer.
export const metadata: Metadata = {
  title: "Watch the demo | Serve By Example",
  description: "Serve By Example in 30 seconds: what your new starter practises on their phone before the shift, and what you see in the Manager Console.",
  alternates: { canonical: "/watch" },
};

export default function WatchPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main id="main-content">
        <PageHero
          compact
          eyebrow="Serve By Example in 30 seconds"
          title="Your new starter, before their first shift."
          subtitle="What your team practises on their phone, and what you see in the Manager Console."
        />

        <section className="sbe-mkt-video-section sbe-mkt-video-section-tight">
          <div className="container">
            <DemoVideoPlayer which="short" where="watch" />
            <p className="sbe-mkt-video-more">
              Want the full minute? <Link href="/how-it-works">Watch the longer version</Link>.
            </p>
          </div>
        </section>

        <CTABand
          background="neutral"
          title="Put your own roster through it."
          copy="14-day free trial. Create your account in 2 minutes, launch your venue in under 10."
          primary={{ label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Try Sharon yourself", href: "/demo" }}
        />
      </main>

      <DemoMinimalFooter />
    </div>
  );
}
