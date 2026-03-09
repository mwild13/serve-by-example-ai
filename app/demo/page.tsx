import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/SectionHeading";

export default function DemoPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="page-hero">
          <div className="container">
            <div className="eyebrow">Interactive demo</div>
            <h1>See how the AI training experience works.</h1>
            <p>
              This page gives users a taste of the platform before they buy.
              Later, this can become a true interactive prompt flow connected to
              your AI trainer.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 24 }}>
          <div className="container">
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="dashboard-shell" style={{ minHeight: 700 }}>
                <aside className="dashboard-sidebar">
                  <div className="mockup-logo">SBE AI</div>
                  <div className="mockup-nav">
                    <div className="mockup-nav-item active">Free Demo</div>
                    <div className="mockup-nav-item">Cocktail Drill</div>
                    <div className="mockup-nav-item">Sales Scenario</div>
                    <div className="mockup-nav-item">Manager Prompt</div>
                  </div>
                </aside>

                <section className="dashboard-main">
                  <h2 className="dash-welcome">Demo Training Session</h2>
                  <div className="dash-copy">
                    Example bartender prompt below.
                  </div>

                  <div className="chat-box">
                    <div className="chat-prompt">
                      AI Coach: A guest orders a Negroni. Name the three
                      ingredients, the garnish, and the correct glass.
                    </div>

                    <div className="chat-actions">
                      <div className="chat-pill">Gin</div>
                      <div className="chat-pill">Campari</div>
                      <div className="chat-pill">Sweet Vermouth</div>
                      <div className="chat-pill">Orange peel</div>
                      <div className="chat-pill">Rocks glass</div>
                    </div>
                  </div>

                  <div className="grid-3" style={{ marginTop: 24 }}>
                    <div className="card">
                      <h3>Cocktail Knowledge</h3>
                      <p>
                        Specs, garnish, glassware and confidence under pressure.
                      </p>
                    </div>
                    <div className="card">
                      <h3>Guest Communication</h3>
                      <p>
                        Practice how to respond clearly, calmly and with service
                        confidence.
                      </p>
                    </div>
                    <div className="card">
                      <h3>Sales Skills</h3>
                      <p>
                        Learn the difference between helpful recommendations and
                        poor upselling.
                      </p>
                    </div>
                  </div>
                </section>

                <aside className="dashboard-right">
                  <h3 className="side-panel-title">What’s inside</h3>
                  <div className="history-item">
                    <strong>Bartending drills</strong>
                    <span>Classic cocktails, spirits, service standards.</span>
                  </div>
                  <div className="history-item">
                    <strong>Sales training</strong>
                    <span>
                      Recommending with confidence and increasing spend.
                    </span>
                  </div>
                  <div className="history-item">
                    <strong>Management prompts</strong>
                    <span>Leadership, standards, coaching and operations.</span>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <Link href="/pricing" className="btn btn-primary">
                      Unlock Full Access
                    </Link>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Why demo first"
              title="Show the product before asking people to pay."
              copy="A strong demo increases trust and gives users an instant feel for how the platform teaches."
            />

            <div className="grid-3">
              <div className="card">
                <h3>Reduces friction</h3>
                <p>
                  People understand the value faster when they can see and feel
                  the product.
                </p>
              </div>
              <div className="card">
                <h3>Builds confidence</h3>
                <p>
                  A practical preview makes the offer feel more credible and
                  useful.
                </p>
              </div>
              <div className="card">
                <h3>Improves conversion</h3>
                <p>
                  Demo-first pages often outperform generic sales pages for new
                  software products.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}