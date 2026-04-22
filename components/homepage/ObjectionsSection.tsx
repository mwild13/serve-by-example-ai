export default function ObjectionsSection() {
  const objections = [
    {
      issue: "We do training in-house already",
      solution: "Ours is structured, measurable, and scalable. No manager burnout. Staff love it because it's interactive, not PowerPoint.",
    },
    {
      issue: "We don't have time to set it up",
      solution: "Onboarding takes 1 hour. Staff self-train on their schedule. You get a dashboard—that's it.",
    },
    {
      issue: "Why should we pay for this?",
      solution: "Average ROI in 6 months: 3× payback. Lower turnover alone saves ~£8k per staff member who stays.",
    },
    {
      issue: "Will my staff actually use it?",
      solution: "95% completion rate. Bite-sized modules, gamified. Staff compete for badges—it's actually engaging.",
    },
  ];

  return (
    <section style={{
      background: "white",
      padding: "60px 20px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#1a365d",
          textAlign: "center",
          margin: "0 0 50px",
        }}>
          Why Pubs Ditch DIY Training
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "start",
        }}>
          {objections.map((item, i) => (
            <div key={i} style={{
              paddingBottom: "30px",
              borderBottom: "1px solid #e5e7eb",
            }}>
              <h3 style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#dc2626",
                margin: "0 0 12px",
              }}>
                ❌ {item.issue}
              </h3>
              <p style={{
                fontSize: "0.95rem",
                color: "#4b5563",
                lineHeight: 1.6,
                margin: 0,
              }}>
                <strong style={{ color: "#059669" }}>✓ Solution:</strong> {item.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
