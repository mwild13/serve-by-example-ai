import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaitlistSection from "@/components/ui/WaitlistSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Success Stories | Serve By Example",
  description:
    "See how hospitality teams are cutting onboarding time by 70%, lifting upsell revenue, and scaling training across multiple venues with Serve By Example.",
};

const caseStudies = [
  {
    id: "pub-group",
    eyebrow: "Multi-venue pub group, Australia",
    headline: "From 6 months of onboarding to 6 weeks, across 12 venues.",
    context:
      "A 12-location Australian pub group was struggling with inconsistent training quality across sites. Each venue manager ran their own induction process, resulting in wildly different service standards and high repeat-complaint rates on peak nights.",
    challenge:
      "With 340 staff spread across metropolitan and regional locations, rolling out standardised training through traditional methods required sending trainers interstate and pulling senior staff off the floor.",
    outcome:
      "After deploying Serve By Example across all 12 sites, new starter induction time dropped from an average of 24 weeks to under 6. Managers reported spending 70% less time on induction administration. Group-wide service complaint rates fell significantly in the first quarter.",
    metrics: [
      { value: "70%", label: "reduction in onboarding time" },
      { value: "12", label: "venues standardised" },
      { value: "340", label: "staff trained" },
      { value: "6 weeks", label: "avg time to full service confidence" },
    ],
    tags: ["Multi-venue", "Pub & Bar", "Australia"],
  },
  {
    id: "cocktail-bar",
    eyebrow: "Cocktail bar, CBD location",
    headline: "22% upsell revenue lift in 8 weeks, 4-person team.",
    context:
      "A high-volume CBD cocktail bar with a tight 4-person team was leaving significant revenue on the table. Staff knew the drinks menu but weren't consistently recommending upgrades, premium spirits, or bottle service during busy service periods.",
    challenge:
      "The venue owner couldn't afford for any team member to take time off the floor for training sessions, and the team's varied shift patterns made group coaching impractical.",
    outcome:
      "Each team member completed scenario-based upsell training on their own device between shifts. Within 8 weeks, the venue recorded a 22% increase in average transaction value. The owner attributed the change entirely to improved upsell confidence. No new staff, no menu changes.",
    metrics: [
      { value: "+22%", label: "upsell revenue within 8 weeks" },
      { value: "+$8.40", label: "avg transaction value increase" },
      { value: "0", label: "manager hours spent on training" },
      { value: "4", label: "team members, all self-directed" },
    ],
    tags: ["Single venue", "Cocktail Bar", "Urban"],
  },
  {
    id: "qsr-franchise",
    eyebrow: "QSR franchise, national rollout",
    headline: "200 staff onboarded across 3 states in under 30 days.",
    context:
      "A fast-growing QSR franchise needed to onboard 200 new staff members across 12 franchise locations in three states simultaneously. Their existing training relied on printed manuals, video links, and ad-hoc manager coaching, an approach that wasn't scaling.",
    challenge:
      "Franchise owners had varying levels of training capability. Some were strong operators; others were new to the brand and couldn't confidently run inductions themselves. The result was inconsistent customer experience at the counter.",
    outcome:
      "Serve By Example replaced the printed manual system with an AI training platform that every franchisee could deploy from day one. New starters completed scenario practice for speed of service, order accuracy, and upsell prompts on their phones. All 200 staff cleared their baseline assessments within the first month.",
    metrics: [
      { value: "200+", label: "staff onboarded" },
      { value: "3", label: "states covered" },
      { value: "12", label: "franchise locations" },
      { value: "<30 days", label: "full rollout completed" },
    ],
    tags: ["Franchise", "QSR", "National rollout"],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Case Studies</span>
            <h1>The results speak for themselves.</h1>
            <p className="inner-hero-sub">
              From 6 months of onboarding to 6 weeks with AI. These are real training outcomes from
              hospitality teams using Serve By Example across venues, formats, and team sizes.
            </p>
            <p className="cs-disclaimer">
              Results are representative of typical outcomes. Venue and operator details have been anonymised.
            </p>
          </div>
        </section>

        {/* ── Case studies ── */}
        {caseStudies.map((cs, i) => (
          <section
            key={cs.id}
            id={cs.id}
            className={`section${i % 2 === 1 ? " section-alt" : ""}`}
          >
            <div className="container">
              <article className="cs-article">
                <div className="cs-article-header">
                  <div className="cs-tags">
                    {cs.tags.map((tag) => (
                      <span key={tag} className="cs-tag">{tag}</span>
                    ))}
                  </div>
                  <span className="eyebrow" style={{ marginTop: 16, display: "block" }}>{cs.eyebrow}</span>
                  <h2 className="cs-headline">{cs.headline}</h2>
                </div>

                <div className="cs-metrics-strip">
                  {cs.metrics.map((m) => (
                    <div key={m.label} className="cs-metric">
                      <div className="cs-metric-value">{m.value}</div>
                      <div className="cs-metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="cs-body">
                  <div className="cs-body-block">
                    <h4>The situation</h4>
                    <p>{cs.context}</p>
                  </div>
                  <div className="cs-body-block">
                    <h4>The challenge</h4>
                    <p>{cs.challenge}</p>
                  </div>
                  <div className="cs-body-block cs-body-block--outcome">
                    <h4>The outcome</h4>
                    <p>{cs.outcome}</p>
                  </div>
                </div>
              </article>
            </div>
          </section>
        ))}

        {/* ── Waitlist CTA ── */}
        <WaitlistSection
          eyebrow="Join the platform"
          title="Ready to write your own success story?"
          copy="Start free and see what AI-powered training can do for your venue."
          buttonLabel="Get Early Access"
          successTitle="You&apos;re on the list."
          successCopy="We&apos;ll be in touch shortly to set up your venue."
          successPrimaryHref="/demo"
          successPrimaryLabel="Try the Demo"
        />
      </main>

      <Footer />

      <style>{`
        .cs-disclaimer {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 12px;
          font-style: italic;
        }
        .cs-article {
          max-width: 860px;
          margin: 0 auto;
        }
        .cs-article-header {
          margin-bottom: 36px;
        }
        .cs-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .cs-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          background: var(--bg-alt);
          border: 1px solid var(--line);
          color: var(--text-muted);
          border-radius: var(--radius-pill);
          padding: 3px 10px;
        }
        .cs-headline {
          font-size: clamp(1.4rem, 3vw, 2rem);
          margin-top: 8px;
          line-height: 1.25;
        }
        .cs-metrics-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          background: var(--green-deep);
          border-radius: var(--radius-xl);
          padding: 28px 32px;
          margin-bottom: 40px;
        }
        .cs-metric {
          text-align: center;
        }
        .cs-metric-value {
          font-family: var(--font-heading);
          font-size: 1.9rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
          margin-bottom: 6px;
        }
        .cs-metric-label {
          font-size: 0.73rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.4;
        }
        .cs-body {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
        }
        .cs-body-block h4 {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 700;
          margin-bottom: 10px;
        }
        .cs-body-block p {
          font-size: 0.87rem;
          color: var(--text-soft);
          line-height: 1.7;
          margin: 0;
        }
        .cs-body-block--outcome p {
          color: var(--text);
        }
        @media (max-width: 860px) {
          .cs-metrics-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .cs-body {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .cs-metrics-strip {
            grid-template-columns: 1fr 1fr;
            padding: 20px;
          }
          .cs-metric-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
