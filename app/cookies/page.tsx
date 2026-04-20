import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Cookies Policy | Serve By Example",
  description: "How Serve By Example uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">Legal</div>
            <h1>Cookies Policy</h1>
            <p className="inner-hero-sub">Last updated: 20 April 2026</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="legal-prose">
              <p>
                This Cookies Policy explains how Serve By Example (&ldquo;we&rdquo;,
                &ldquo;us&rdquo;, or &ldquo;our&rdquo;) uses cookies and similar tracking
                technologies on our platform at servebyexample.com (the &ldquo;Service&rdquo;).
              </p>

              <h2>1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit a website.
                They are widely used to make websites work, improve performance, and provide
                information to website owners. Cookies can be &ldquo;session cookies&rdquo; (deleted
                when you close your browser) or &ldquo;persistent cookies&rdquo; (which remain on
                your device until they expire or you delete them).
              </p>

              <h2>2. Categories of Cookies We Use</h2>

              <h3>Essential cookies</h3>
              <p>
                These cookies are strictly necessary for the Service to function. Without them, core
                features such as account authentication and session management cannot work. You
                cannot opt out of essential cookies while using the Service.
              </p>
              <ul>
                <li>
                  <strong>Authentication session</strong> — Maintained by Supabase to keep you
                  logged in while you use the platform. Session cookies, deleted when you sign out
                  or close your browser.
                </li>
                <li>
                  <strong>CSRF protection</strong> — Prevents cross-site request forgery attacks.
                  Session cookie.
                </li>
              </ul>

              <h3>Functional cookies</h3>
              <p>
                These cookies remember your preferences and personalise your experience on the
                platform — for example, remembering your selected training scenario or display
                settings.
              </p>

              <h3>Analytics cookies</h3>
              <p>
                We may use analytics tools to understand how users interact with the Service, which
                pages are most visited, and where improvements can be made. This data is collected in
                aggregate and does not identify you personally.
              </p>

              <h3>Infrastructure cookies</h3>
              <p>
                Cloudflare, our hosting and security provider, may set cookies related to DDoS
                protection, bot detection, and traffic routing. These are essential for the security
                and reliability of the Service.
              </p>

              <h2>3. Third-Party Cookies</h2>
              <p>
                Some cookies on the Service are set by third-party providers who help us deliver the
                platform:
              </p>
              <ul>
                <li>
                  <strong>Supabase</strong> — authentication and session management. See{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Supabase&apos;s Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong>Cloudflare</strong> — security and performance. See{" "}
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cloudflare&apos;s Privacy Policy
                  </a>
                  .
                </li>
              </ul>
              <p>
                We do not use advertising cookies or share cookie data with advertising networks.
              </p>

              <h2>4. Managing Cookies</h2>
              <p>
                You can control and manage cookies in several ways:
              </p>
              <ul>
                <li>
                  <strong>Browser settings</strong> — Most browsers allow you to view, delete, and
                  block cookies. Visit your browser&apos;s help documentation for instructions:
                  <ul>
                    <li>
                      <a
                        href="https://support.google.com/chrome/answer/95647"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Chrome
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Mozilla Firefox
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apple Safari
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Microsoft Edge
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Opt-out tools</strong> — You can opt out of analytics tracking through
                  your browser&apos;s &ldquo;Do Not Track&rdquo; setting where supported.
                </li>
              </ul>
              <p>
                Please note that blocking essential cookies will impair your ability to sign in and
                use the Service.
              </p>

              <h2>5. Changes to This Policy</h2>
              <p>
                We may update this Cookies Policy from time to time. Changes will be posted on this
                page with an updated &ldquo;Last updated&rdquo; date. Your continued use of the
                Service after any changes constitutes acceptance of the updated policy.
              </p>

              <h2>6. Contact Us</h2>
              <p>
                If you have questions about this Cookies Policy, please contact us at:
              </p>
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
