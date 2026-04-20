import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | Serve By Example",
  description: "The terms and conditions governing your use of the Serve By Example platform.",
};

export default function TermsPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">Legal</div>
            <h1>Terms of Service</h1>
            <p className="inner-hero-sub">Last updated: 17 March 2026</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="legal-prose">
              <p>
                Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the
                Serve By Example platform (&ldquo;Service&rdquo;) operated by Serve By Example
                (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or using
                the Service, you agree to be bound by these Terms.
              </p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By creating an account or using any part of the Service, you confirm that you are at
                least 16 years old, have read and understood these Terms, and agree to be bound by
                them. If you are using the Service on behalf of an organisation, you represent that
                you have authority to bind that organisation to these Terms.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                Serve By Example provides an AI-powered hospitality training platform that includes
                scenario-based learning, AI coaching, progress tracking, and management tools for
                individual hospitality workers and venue operators. Features available to you depend
                on the plan you subscribe to.
              </p>

              <h2>3. Account Registration</h2>
              <p>
                To access the full Service, you must create an account with a valid email address
                and password. You are responsible for:
              </p>
              <ul>
                <li>Keeping your login credentials secure and confidential</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of any unauthorised use of your account</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or
                that we reasonably believe have been compromised.
              </p>

              <h2>4. Acceptable Use</h2>
              <p>
                You agree to use the Service only for lawful purposes and in accordance with these
                Terms. You must not:
              </p>
              <ul>
                <li>Use the Service in any way that violates applicable laws or regulations</li>
                <li>
                  Attempt to gain unauthorised access to any part of the Service or its underlying
                  systems
                </li>
                <li>
                  Reverse engineer, decompile, or disassemble any part of the Service
                </li>
                <li>
                  Use automated scripts, bots, or scrapers to access or extract data from the Service
                </li>
                <li>
                  Upload or transmit any malicious code, viruses, or harmful content
                </li>
                <li>
                  Impersonate another person or entity, or misrepresent your affiliation with any
                  organisation
                </li>
                <li>
                  Share your account credentials with others or allow multiple individuals to use a
                  single-user account
                </li>
              </ul>

              <h2>5. Subscription Plans and Payments</h2>
              <p>
                The Service offers free and paid subscription tiers. Paid subscriptions are billed
                in advance on a recurring basis. By subscribing to a paid plan, you authorise us to
                charge your payment method on the agreed billing cycle.
              </p>
              <ul>
                <li>
                  <strong>Cancellation</strong> — You may cancel your subscription at any time.
                  Cancellation takes effect at the end of the current billing period; you will retain
                  access until then.
                </li>
                <li>
                  <strong>Refunds</strong> — We offer a 14-day refund on your first subscription
                  payment if you are not satisfied. Refunds are not available after this period
                  except where required by law.
                </li>
                <li>
                  <strong>Price changes</strong> — We may change subscription fees with at least 30
                  days&apos; advance notice. Continued use after the new pricing takes effect
                  constitutes acceptance.
                </li>
              </ul>

              <h2>6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of the Service — including but not limited
                to text, graphics, AI-generated evaluations, training scenarios, logos, and software
                — are owned by Serve By Example and are protected by copyright, trademark, and other
                intellectual property laws.
              </p>
              <p>
                You retain ownership of any content you submit to the Service (such as your training
                responses). By submitting content, you grant us a limited licence to process and
                display that content solely to provide the Service to you.
              </p>

              <h2>7. AI-Generated Content</h2>
              <p>
                The Service uses artificial intelligence to generate training feedback and coaching
                responses. AI-generated content is provided for educational and training purposes
                only and does not constitute professional advice. We make no guarantee that
                AI-generated content is accurate, complete, or suitable for any particular purpose.
                You are responsible for using your own judgement when acting on any AI-generated
                feedback.
              </p>

              <h2>8. Disclaimers</h2>
              <p>
                The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
                basis without warranties of any kind, either express or implied. We do not warrant
                that the Service will be uninterrupted, error-free, or free of harmful components.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Serve By Example shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, including but not
                limited to loss of profits, data, goodwill, or other intangible losses arising from
                your use of, or inability to use, the Service.
              </p>
              <p>
                Our total aggregate liability to you shall not exceed the greater of (a) the amounts
                you paid us in the 12 months prior to the claim, or (b) £100 GBP.
              </p>

              <h2>10. Termination</h2>
              <p>
                We may suspend or terminate your access to the Service at our discretion, without
                notice, for conduct that we believe violates these Terms or is harmful to other
                users, us, or third parties.
              </p>
              <p>
                You may terminate your account at any time by contacting us at{" "}
                <a href="mailto:hello@servebyexample.com">hello@servebyexample.com</a>. Upon
                termination, your right to use the Service ceases immediately.
              </p>

              <h2>11. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of England and
                Wales. Any disputes arising under these Terms shall be subject to the exclusive
                jurisdiction of the courts of England and Wales.
              </p>

              <h2>12. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will provide notice of material changes by
                email or by posting a notice on the Service. Your continued use of the Service after
                the effective date of the revised Terms constitutes your acceptance.
              </p>

              <h2>13. Contact Us</h2>
              <p>If you have questions about these Terms, please contact:</p>
              <p>
                <strong>Serve By Example</strong>
                <br />
                Email:{" "}
                <a href="mailto:hello@servebyexample.com">hello@servebyexample.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
