import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Serve By Example",
  description:
    "How Serve By Example collects, uses, and protects your personal data under the Australian Privacy Principles.",
};

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">Legal</div>
            <h1>Privacy Policy</h1>
            <p className="inner-hero-sub">Last updated: 3 July 2026</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="legal-prose">
              <p>
                Serve By Example is committed to protecting your privacy in accordance with the
                Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). This Privacy
                Policy explains how we collect, use, and safeguard personal information.
              </p>

              <h2>1. What We Collect</h2>
              <ul>
                <li>
                  <strong>Account Info</strong>: Name, email address, and venue affiliation.
                </li>
                <li>
                  <strong>Profile Data</strong>: Plan type, display name, and preferences.
                </li>
                <li>
                  <strong>Training Data</strong>: Responses entered during AI scenario evaluations
                  and performance metrics.
                </li>
                <li>
                  <strong>Communication Data</strong>: Messages sent to us via email or forms.
                </li>
                <li>
                  <strong>Automated Data</strong>: Usage patterns, device identifiers, IP
                  addresses, and server logs.
                </li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Operate the Service and manage your account.</li>
                <li>Provide AI-powered training evaluations and personalised feedback.</li>
                <li>Allow Venue Managers to track training compliance.</li>
                <li>Improve the platform and fix bugs.</li>
                <li>Comply with our legal obligations.</li>
              </ul>

              <h2>3. Data Storage and Sovereignty</h2>
              <p>
                We prioritize data security and utilize infrastructure primarily hosted in Australia
                (ap-southeast-2).
              </p>

              <h2>4. How We Share Your Information</h2>
              <p>
                We share information only with trusted service providers contractually obligated to
                protect your data:
              </p>
              <ul>
                <li>
                  <strong>Supabase</strong>: Authentication and database storage.
                </li>
                <li>
                  <strong>Cloudflare</strong>: Hosting and security.
                </li>
                <li>
                  <strong>OpenAI</strong>: Used for AI scenario evaluation (OpenAI does not use
                  data submitted via the API to train their foundational models).
                </li>
                <li>
                  <strong>Google Analytics</strong>: We use Google Analytics (ID: G-EF9YRFXKBG) to
                  understand platform usage patterns and improve user experience. See{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  . You can opt out using the{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Analytics Opt-out Browser Extension
                  </a>
                  .
                </li>
                <li>
                  <strong>Legal Requirements</strong>: Disclosure as required by Australian law.
                </li>
              </ul>

              <h2>5. Data Retention</h2>
              <p>
                We retain account data while the account is active. If you delete your account, we
                delete or anonymise your personal data within 30 days, unless required for legal
                purposes. Aggregated, anonymised usage data may be retained indefinitely for
                analytics.
              </p>

              <h3>5.1 Data Retention Schedule</h3>
              <ul>
                <li>
                  <strong>Account & Profile Data</strong>: Retained while account is active; deleted
                  within 30 days of account deletion (unless required by law).
                </li>
                <li>
                  <strong>Training Progress & Quiz Responses</strong>: Retained for the duration of
                  active subscription; deleted within 30 days upon account deletion.
                </li>
                <li>
                  <strong>Billing Records & Stripe Webhook Events</strong>: Retained for 7 years to
                  comply with Australian tax and financial regulation requirements.
                </li>
                <li>
                  <strong>Manager Analytics & Staff Performance Data</strong>: Retained for the
                  duration of venue subscription; deleted within 30 days of venue removal.
                </li>
                <li>
                  <strong>Aggregated & Anonymised Data</strong>: Retained indefinitely for service
                  improvement and analytics purposes.
                </li>
              </ul>

              <h2>6. Payment Processing</h2>
              <p>
                We use Stripe to process payments for subscriptions. When you subscribe, Stripe
                receives your payment information (credit card details are not stored by us). Stripe
                may issue webhook events (e.g., subscription creation, updates, and invoice
                notifications) which we store securely to track billing state. Stripe&apos;s privacy
                practices are governed by their{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </p>

              <h2>7. Manager Analytics</h2>
              <p>
                Venue managers can access real-time team analytics and staff training progress
                through Mission Control. We track staff_progress, scenario_mastery, and
                staff membership data to provide managers with compliance reporting and
                performance insights. Only the managers of a specific venue can see that
                venue&apos;s staff data; data is segregated by row-level security (RLS) policies
                in our database.
              </p>

              <h2>8. Venue Codes & Staff Invitations</h2>
              <p>
                Venues can generate unique venue codes to invite staff members. When a staff member
                joins via a venue code, they are added to the organisation_members table and receive
                sponsored access to training modules. Only the venue that created the code can see
                its associated staff; staff members can see their own profile and progress, and
                managers at their venue can see aggregated team performance.
              </p>

              <h2>9. Your Rights Under Australian Law</h2>
              <p>Under the APPs, you have the right to:</p>
              <ul>
                <li>
                  <strong>Access/Correction</strong>: Request a copy of or correction to the
                  personal data we hold about you.
                </li>
                <li>
                  <strong>Deletion</strong>: Request that we delete your personal data.
                </li>
                <li>
                  <strong>Complaints</strong>: Contact us at{" "}
                  <a href="mailto:info@servebyexample.co">info@servebyexample.co</a>. If
                  unsatisfied, you may lodge a complaint with the Office of the Australian
                  Information Commissioner (OAIC).
                </li>
              </ul>

              <h2>10. Security and Changes</h2>
              <p>
                We implement industry-standard measures, including encryption and strict access
                controls. We may update this policy periodically; continued use of the Service
                constitutes acceptance of the updated policy.
              </p>

              <h2>Contact Us</h2>
              <p>For privacy related inquiries, please contact:</p>
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
