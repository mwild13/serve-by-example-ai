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
            <p className="inner-hero-sub">Last updated: April 26, 2026</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="legal-prose">
              <p>
                Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the
                Serve By Example platform (&ldquo;Service&rdquo;). By accessing or using the
                Service, you confirm your acceptance of these Terms.
              </p>

              <h2>1. Acceptance and Eligibility</h2>
              <p>
                By creating an account, you confirm that you are at least 16 years old. If you are
                using the Service on behalf of an organisation (e.g., a hospitality venue), you
                represent that you have the legal authority to bind that organisation to these Terms.
                If you do not agree to these Terms, you must not use the Service.
              </p>

              <h2>2. Service Description</h2>
              <p>
                Serve By Example provides an AI-powered hospitality training platform. Features
                include scenario-based learning, AI coaching, progress tracking, and management
                tools. We reserve the right to modify, update, or discontinue features of the
                Service at any time, provided that we give you reasonable notice for material
                changes that negatively affect your access.
              </p>

              <h2>3. Account and Security</h2>
              <p>
                You are responsible for all activity that occurs under your account. You agree to:
              </p>
              <ul>
                <li>Keep your login credentials confidential.</li>
                <li>Notify us immediately of any unauthorised use.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or
                are reasonably suspected of being compromised.
              </p>

              <h2>4. Acceptable Use Policy</h2>
              <p>You agree to use the Service lawfully. You must not:</p>
              <ul>
                <li>Use the Service for any unlawful activity or to transmit malicious code/viruses.</li>
                <li>Attempt to gain unauthorised access to our systems or data.</li>
                <li>Reverse engineer, decompile, or disassemble our software.</li>
                <li>Use automated scripts, bots, or scrapers to extract data.</li>
                <li>
                  Share account credentials; the Service is for licensed users only.
                </li>
              </ul>

              <h2>5. Subscription, Payments, and Refunds</h2>
              <ul>
                <li>
                  <strong>Billing</strong> — Paid subscriptions are billed in advance. By
                  subscribing, you authorise recurring charges on your chosen billing cycle.
                </li>
                <li>
                  <strong>Australian Consumer Law (ACL)</strong> — Our services come with
                  guarantees that cannot be excluded under the ACL. For major failures, you are
                  entitled to cancel your contract and receive a refund for the unused portion.
                </li>
                <li>
                  <strong>Cancellations</strong> — You may cancel at any time. You will retain
                  access until the end of your current billing period.
                </li>
                <li>
                  <strong>Refunds</strong> — Beyond your statutory rights under the ACL, we offer a
                  14-day &ldquo;cooling-off&rdquo; period for your first subscription payment if you
                  are dissatisfied.
                </li>
                <li>
                  <strong>Price Changes</strong> — We will provide at least 30 days&apos; advance
                  notice of any subscription fee changes.
                </li>
              </ul>

              <h2>6. Intellectual Property and Data</h2>
              <p>
                <strong>Our IP</strong> — All content, software, AI models, and training scenarios
                are the property of Serve By Example.
              </p>
              <p>
                <strong>Your Content</strong> — You retain ownership of any content you submit. By
                submitting content, you grant us a non-exclusive, royalty-free licence to process
                and display that content solely to provide the Service to you.
              </p>
              <p>
                <strong>Prohibition on Training</strong> — Serve By Example will not use your
                proprietary input data or training responses to train third-party AI models without
                your express written consent.
              </p>

              <h2>7. AI-Generated Content and Physical Safety Disclaimer</h2>
              <p>
                <strong>Educational Purpose Only</strong> — AI output is provided for educational
                and training purposes only. It does not constitute professional business, legal, or
                OHS/WHS advice.
              </p>
              <p>
                <strong>No Replacement for Physical Supervision</strong> — The Service is a
                supplement to, and not a replacement for, venue-specific safety inductions,
                hands-on physical training, or on-site supervision.
              </p>
              <p>
                <strong>Assumption of Risk</strong> — Hospitality work involves inherent physical
                hazards. Serve By Example is not responsible for any physical injury, property
                damage, or legal consequences arising from the application of training scenarios in
                a physical workspace. Users and their employers remain solely responsible for
                ensuring compliance with local OHS/WHS laws and venue policies.
              </p>

              <h2>8. Venue Compliance and Indemnity</h2>
              <p>If you are a Venue Operator using this Service to train staff:</p>
              <ul>
                <li>
                  <strong>Responsibility</strong> — You acknowledge that you retain primary duty of
                  care for your staff under applicable workplace safety laws.
                </li>
                <li>
                  <strong>Indemnity</strong> — To the extent permitted by law, you agree to
                  indemnify and hold harmless Serve By Example from any claims, damages, or losses
                  resulting from your staff&apos;s actions, including injuries occurring on your
                  premises, provided such claims do not arise from our gross negligence.
                </li>
              </ul>

              <h2>9. Limitation of Liability</h2>
              <p>To the extent permitted by law:</p>
              <ul>
                <li>The Service is provided on an &ldquo;as is&rdquo; basis.</li>
                <li>
                  Our total liability shall be limited to the total amount paid by you to us in the
                  12 months preceding the claim, or AUD $100, whichever is greater.
                </li>
                <li>
                  This does not apply to liabilities that cannot be excluded under the Australian
                  Consumer Law (ACL).
                </li>
              </ul>

              <h2>10. Termination, Governing Law, and Changes</h2>
              <p>
                <strong>Termination</strong> — We may suspend access for conduct that violates
                these Terms.
              </p>
              <p>
                <strong>Governing Law</strong> — These Terms are governed by the laws of New South
                Wales, Australia.
              </p>
              <p>
                <strong>Severability</strong> — If any provision is found to be unenforceable, the
                remaining provisions will remain in full force.
              </p>
              <p>
                <strong>Changes</strong> — Continued use of the Service after the effective date of
                updated Terms constitutes your agreement.
              </p>

              <h2>Contact Us</h2>
              <p>For terms inquiries, please contact:</p>
              <p>
                <strong>Serve By Example</strong>
                <br />
                Email:{" "}
                <a href="mailto:info@serve-by-example.com">info@serve-by-example.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
