export default function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="mockup-logo">SBE AI</div>

        <div className="mockup-nav">
          <div className="mockup-nav-item active">Home</div>
          <div className="mockup-nav-item">Bartending Training</div>
          <div className="mockup-nav-item">Sales Training</div>
          <div className="mockup-nav-item">Management Training</div>
          <div className="mockup-nav-item">Mock Scenarios</div>
          <div className="mockup-nav-item">Cocktail Library</div>
          <div className="mockup-nav-item">Progress</div>
          <div className="mockup-nav-item">Settings</div>
        </div>

        <div
          style={{
            marginTop: 28,
            background: "white",
            border: "1px solid #e7decb",
            borderRadius: 22,
            padding: 18,
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>Founding plan</strong>
          <div style={{ color: "var(--text-soft)", fontSize: ".95rem" }}>
            Pro member access with bartender, sales and management modules.
          </div>
        </div>
      </aside>

      <section className="dashboard-main">
        <h1 className="dash-welcome">Welcome, Mitch.</h1>
        <div className="dash-copy">
          How would you like to train today?
        </div>

        <div className="dash-cards">
          <div className="dash-card">
            <h3>Bartending Training</h3>
            <p>Classic cocktails, service standards and bar knowledge.</p>
          </div>
          <div className="dash-card">
            <h3>Sales Training</h3>
            <p>Upselling, recommendations and guest communication.</p>
          </div>
          <div className="dash-card">
            <h3>Management Training</h3>
            <p>Leadership, standards, coaching and venue decisions.</p>
          </div>
        </div>

        <div className="chat-box">
          <div className="chat-prompt">
            AI Coach: A customer says, “I usually drink vodka soda — what would
            you recommend that’s similar but a bit more premium?”
          </div>

          <div className="chat-actions">
            <div className="chat-pill">Suggest a clean premium spirit</div>
            <div className="chat-pill">Ask a taste question first</div>
            <div className="chat-pill">Recommend based on style</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <h3>Today’s focus</h3>
            <p>
              Continue with classic cocktails, premium upselling and handling a
              busy guest queue with confidence.
            </p>
          </div>
          <div className="card">
            <h3>Progress snapshot</h3>
            <p>
              12 modules started, 4 completed, strongest area: sales prompts.
            </p>
          </div>
        </div>
      </section>

      <aside className="dashboard-right">
        <h3 className="side-panel-title">Recent training</h3>

        <div className="history-item">
          <strong>Negroni build</strong>
          <span>Ingredients, garnish and confident guest language.</span>
        </div>

        <div className="history-item">
          <strong>Upselling drill</strong>
          <span>Moving a house pour to a premium recommendation.</span>
        </div>

        <div className="history-item">
          <strong>Late staff scenario</strong>
          <span>Manager response and standards conversation.</span>
        </div>

        <div className="history-item">
          <strong>Busy service simulation</strong>
          <span>Prioritising tickets, guests and team communication.</span>
        </div>
      </aside>
    </main>
  );
}