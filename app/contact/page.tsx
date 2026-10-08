import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import ContactForm from "@/components/marketing/ContactForm";

// Metadata lives in app/contact/layout.tsx.
export default function ContactPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main id="main-content">
        <PageHero
          compact
          eyebrow="Get in touch"
          title="Talk to us"
          subtitle="Questions, partnership enquiries, or just want to see if we're a fit. We'd love to hear from you."
        />

        {/* Form left, the two other routes right. Sized so the submit button is
            visible in a 1440×900 window (Pages-Redesign.md §5.4). */}
        <section className="sbe-mkt-contact">
          <div className="container sbe-mkt-contact-grid">
            <div className="sbe-mkt-contact-main">
              <h2 className="sbe-mkt-strip-title">Send a message</h2>
              <ContactForm />
            </div>
            <ul className="sbe-mkt-contact-aside">
              <li>
                <span className="sbe-mkt-plan-tier">Direct email</span>
                <a href="mailto:info@servebyexample.co" className="sbe-mkt-contact-email">
                  info@servebyexample.co
                </a>
                <p>We reply to all enquiries within one business day.</p>
              </li>
              <li>
                <span className="sbe-mkt-plan-tier">For venues &amp; groups</span>
                <p>
                  Looking to onboard your whole team? Visit our For Venues page to explore multi-staff plans and venue
                  rollout options.
                </p>
                <Link href="/for-venues" className="sbe-mkt-btn-text">
                  See Venue Plans
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <CTABand
          background="neutral"
          title="Not ready to talk yet?"
          copy="Try the demo first — no account needed, no sales conversation required."
          primary={{ label: "Try the Demo", href: "/demo" }}
        />
      </main>
      <Footer />
    </div>
  );
}
