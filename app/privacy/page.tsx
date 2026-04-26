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
            <p className="inner-hero-sub">Last updated: April 26, 2026</p>
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
                  <strong>Account Info</strong> — Name, email address, and venue affiliation.
                </li>
                <li>
                  <strong>Profile Data</strong> — Plan type, display name, and preferences.
                </li>
                <li>
                  <strong>Training Data</strong> — Responses entered during AI scenario evaluations
                  and performance metrics.
                </li>
                <li>
                  <strong>Communication Data</strong> — Messages sent to us via email or forms.
                </li>
                <li>
                  <strong>Automated Data</strong> — Usage patterns, device identifiers, IP
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
                  <strong>Supabase</strong> — Authentication and database storage.
                </li>
                <li>
                  <strong>Cloudflare</strong> — Hosting and security.
                </li>
                <li>
                  <strong>OpenAI</strong> — Used for AI scenario evaluation (OpenAI does not use
                  data submitted via the API to train their foundational models).
                </li>
                <li>
                  <strong>Legal Requirements</strong> — Disclosure as required by Australian law.
                </li>
              </ul>

              <h2>5. Data Retention</h2>
              <p>
                We retain account data while the account is active. If you delete your account, we
                delete or anonymise your personal data within 30 days, unless required for legal
                purposes. Aggregated, anonymised usage data may be retained indefinitely for
                analytics.
              </p>

              <h2>6. Your Rights Under Australian Law</h2>
              <p>Under the APPs, you have the right to:</p>
              <ul>
                <li>
                  <strong>Access/Correction</strong> — Request a copy of or correction to the
                  personal data we hold about you.
                </li>
                <li>
                  <strong>Deletion</strong> — Request that we delete your personal data.
                </li>
                <li>
                  <strong>Complaints</strong> — Contact us at{" "}
                  <a href="mailto:info@serve-by-example.com">info@serve-by-example.com</a>. If
                  unsatisfied, you may lodge a complaint with the Office of the Australian
                  Information Commissioner (OAIC).
                </li>
              </ul>

              <h2>7. Security and Changes</h2>
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
