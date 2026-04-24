"use client";

export default function BrowserMockup() {
  return (
    <div className="browser-mockup">
      <div className="browser-chrome">
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-url">Dashboard/</span>
      </div>
      <div className="browser-body">
        <div className="mockup-scenario-anim">
          {/* Scenario prompt */}
          <div className="anim-scenario-card">
            <div className="anim-badge">Bartending · Scenario 3</div>
            <div className="anim-prompt">
              A guest asks for a &ldquo;strong but smooth&rdquo; cocktail.
              How do you recommend something that matches?
            </div>
          </div>

          {/* Typing response */}
          <div className="anim-response-area">
            <div className="anim-response-text">
              <span className="anim-typed">
                I&rsquo;d suggest an Old Fashioned — it&rsquo;s spirit-forward,
                smooth from the sugar and bitters, and feels premium&hellip;
              </span>
              <span className="anim-cursor" />
            </div>
          </div>

          {/* Score result flying in */}
          <div className="anim-score-card">
            <div className="anim-score-value">22<span>/25</span></div>
            <div className="anim-score-bars">
              <div className="anim-bar"><span className="anim-bar-label">Communication</span><div className="anim-bar-track"><div className="anim-bar-fill" style={{ width: "90%" }} /></div></div>
              <div className="anim-bar"><span className="anim-bar-label">Hospitality</span><div className="anim-bar-track"><div className="anim-bar-fill" style={{ width: "88%" }} /></div></div>
              <div className="anim-bar"><span className="anim-bar-label">Problem Solving</span><div className="anim-bar-track"><div className="anim-bar-fill" style={{ width: "84%" }} /></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
