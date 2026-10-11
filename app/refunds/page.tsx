import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy | Serve By Example",
  description: "How refunds and cancellations work for Serve By Example subscriptions.",
  alternates: { canonical: "/refunds" },
};

// Restates section 5 of /terms. If the refund terms change, change both.
export default function RefundsPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <PageHero
          compact
          variant="light"
          eyebrow="Legal"
          title="Refund and Cancellation Policy"
          subtitle="Last updated: 12 October 2026"
        />

        <section className="section">
          <div className="container">
            <div className="legal-prose">
              <p>
                This page sets out how refunds and cancellations work for paid Serve By Example
                subscriptions. It forms part of our <Link href="/terms">Terms of Service</Link>.
                Serve By Example is a digital subscription, so there is nothing to return.
              </p>

              <h2>1. 14-day refund on your first payment</h2>
              <p>
                If you are dissatisfied, you can ask for a refund of your first subscription
                payment within 14 days of that payment. After those 14 days we do not offer
                refunds, other than where the Australian Consumer Law gives you a right to one.
              </p>

              <h2>2. Cancelling your subscription</h2>
              <p>
                You may cancel at any time from the Billing section of your account. You keep
                access until the end of the billing period you have already paid for, and you are
                not charged again.
              </p>

              <h2>3. Your rights under the Australian Consumer Law</h2>
              <p>
                Our services come with guarantees that cannot be excluded under the Australian
                Consumer Law. For a major failure, you are entitled to cancel your contract and
                receive a refund for the unused portion. Nothing on this page limits those rights.
              </p>

              <h2>4. How to ask for a refund</h2>
              <p>
                Email <a href="mailto:info@servebyexample.co">info@servebyexample.co</a> from the
                address on your account and tell us you would like a refund. An approved refund is
                returned to the payment method you paid with.
              </p>

              <h2>Contact Us</h2>
              <p>
                <strong>Serve By Example</strong>
                <br />
                Email:{" "}
                <a href="mailto:info@servebyexample.co">info@servebyexample.co</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
