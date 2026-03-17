import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Serve By Example",
  description: "How Serve By Example collects, uses, and protects your personal data.",
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
            <p className="inner-hero-sub">Last updated: 17 March 2026</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="legal-prose">
              <p>
                Serve By Example (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you use our AI-powered hospitality training platform at
                servebyexample.com (the &ldquo;Service&rdquo;).
              </p>

              <h2>1. Information We Collect</h2>
              <h3>Information you provide</h3>
              <ul>
                <li>
                  <strong>Account data</strong> — email address, display name, and password when
                  you register an account.
                </li>
                <li>
                  <strong>Profile data</strong> — plan type, display name, and any preferences you
                  set inside your account settings.
                </li>
                <li>
                  <strong>Training responses</strong> — text you enter during AI scenario
                  evaluations and training sessions.
                </li>
                <li>
                  <strong>Communications</strong> — messages you send us via email or contact forms.
                </li>
              </ul>

              <h3>Information collected automatically</h3>
              <ul>
                <li>
                  <strong>Usage data</strong> — pages visited, features used, session duration, and
                  click interactions.
                </li>
                <li>
                  <strong>Device data</strong> — browser type, operating system, IP address, and
                  device identifiers.
                </li>
                <li>
                  <strong>Log data</strong> — server logs including timestamps and error reports.
                </li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Create and manage your account and deliver the Service</li>
                <li>Provide AI-powered training evaluations and personalised feedback</li>
                <li>Track your progress, streaks, and performance metrics</li>
                <li>Send transactional emails (account confirmation, password resets)</li>
                <li>Improve the platform, fix bugs, and develop new features</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>
                We do not sell your personal data to third parties. We do not use your training
                responses for advertising purposes.
              </p>

              <h2>3. How We Share Your Information</h2>
              <p>
                We may share your information with trusted service providers who assist us in
                operating the Service:
              </p>
              <ul>
                <li>
                  <strong>Supabase</strong> — authentication, database storage, and user management
                  (processed in EU regions).
                </li>
                <li>
                  <strong>Cloudflare</strong> — hosting, edge delivery, and DDoS protection.
                </li>
                <li>
                  <strong>OpenAI</strong> — AI scenario evaluation (your training responses are sent
                  to OpenAI&apos;s API for analysis; OpenAI does not use API data to train its models).
                </li>
              </ul>
              <p>
                All service providers are contractually required to process your data only for the
                purposes we specify and in accordance with this policy.
              </p>
              <p>
                We may also disclose your data where required by law, court order, or regulatory
                authority.
              </p>

              <h2>4. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. If you delete
                your account, we will delete or anonymise your personal data within 30 days, unless
                we are required to retain it for legal or regulatory purposes.
              </p>
              <p>
                Anonymised, aggregated usage data (which cannot identify you) may be retained
                indefinitely for product analytics.
              </p>

              <h2>5. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul>
                <li>
                  <strong>Access</strong> — request a copy of the personal data we hold about you.
                </li>
                <li>
                  <strong>Correction</strong> — request that we correct inaccurate or incomplete data.
                </li>
                <li>
                  <strong>Deletion</strong> — request that we delete your personal data
                  (&ldquo;right to be forgotten&rdquo;).
                </li>
                <li>
                  <strong>Portability</strong> — request your data in a machine-readable format.
                </li>
                <li>
                  <strong>Objection</strong> — object to processing based on legitimate interests.
                </li>
                <li>
                  <strong>Restriction</strong> — request that we restrict processing of your data.
                </li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:hello@servebyexample.com">hello@servebyexample.com</a>. We will
                respond within 30 days.
              </p>

              <h2>6. Cookies</h2>
              <p>
                We use cookies and similar technologies to operate the Service. Please see our{" "}
                <a href="/cookies">Cookies Policy</a> for full details.
              </p>

              <h2>7. Children&apos;s Privacy</h2>
              <p>
                The Service is not directed to individuals under the age of 16. We do not knowingly
                collect personal data from children. If you believe a child has provided us with
                their information, please contact us and we will delete it promptly.
              </p>

              <h2>8. Security</h2>
              <p>
                We implement industry-standard technical and organisational measures to protect your
                data, including encrypted data transmission (HTTPS), hashed password storage, and
                access controls. No method of transmission over the internet is 100% secure, and we
                cannot guarantee absolute security.
              </p>

              <h2>9. International Transfers</h2>
              <p>
                Your data may be processed in countries outside your own. Where we transfer data
                internationally, we ensure appropriate safeguards are in place (such as Standard
                Contractual Clauses) to protect your rights.
              </p>

              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material
                changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
                Continued use of the Service after changes constitutes acceptance of the updated
                policy.
              </p>

              <h2>11. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy, please contact us at:
              </p>
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
