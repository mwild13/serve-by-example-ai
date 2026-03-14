import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    title: "AI Scenario Training",
    description:
      "Staff practice real hospitality situations through guided AI roleplay and structured response coaching.",
  },
  {
    title: "Role-Based Learning Paths",
    description:
      "Tailor training to bartenders, floor staff, sales-focused team members and managers.",
  },
  {
    title: "Performance Tracking",
    description:
      "Track progress across communication, hospitality, drink knowledge, sales and service decision-making.",
  },
  {
    title: "Adaptive Recommendations",
    description:
      "The platform recommends what to train next based on performance trends and skill gaps.",
  },
  {
    title: "Manager Visibility",
    description:
      "Venue leaders can see team completion, strengths, weaknesses and where coaching is needed.",
  },
  {
    title: "Scalable Team Training",
    description:
      "Train individuals, single venues or multi-site teams with consistent service standards.",
  },
];

const productBlocks = [
  {
    heading: "For staff",
    points: [
      "Short learning modules",
      "Scenario-based practice",
      "Instant AI feedback",
      "Clear progress tracking",
    ],
  },
  {
    heading: "For managers",
    points: [
      "View team progress",
      "Spot skill gaps early",
      "Assign pathways by role",
      "Improve training consistency",
    ],
  },
  {
    heading: "For venues",
    points: [
      "Faster onboarding",
      "Stronger service standards",
      "Better upselling confidence",
      "Scalable team development",
    ],
  },
];

export default function PlatformPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Platform</span>
            <h1>
              AI training software built for modern hospitality&nbsp;teams.
            </h1>
            <p className="inner-hero-sub">
              Serve By Example combines practical learning, realistic service
              simulations and performance tracking in one training platform
              built specifically for bars, restaurants and venue groups.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Demo
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="card-grid card-grid-3">
              {features.map((feature) => (
                <article key={feature.title} className="info-card">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Three Layers ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Built to Serve Different Users</span>
              <h2>One platform, three layers of value.</h2>
            </div>
            <div className="card-grid card-grid-3">
              {productBlocks.map((block) => (
                <article key={block.heading} className="info-card">
                  <h3>{block.heading}</h3>
                  <ul className="check-list">
                    {block.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>More than a course library.</h3>
              <p>
                The value of Serve By Example is not just information.
                It&rsquo;s guided scenario practice, measurable improvement and
                a smarter way for hospitality teams to build confidence on
                shift.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/how-it-works" className="btn btn-gold btn-lg">
                See How It Works
              </Link>
              <Link
                href="/for-venues"
                className="btn btn-outline-light btn-lg"
              >
                For Venues
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
