export default function FeaturesSection() {
  const features = [
    {
      title: "Interactive Training Modules",
      description: "True/false, scenarios, role-play. Staff actually engage.",
      svg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
    },
    {
      title: "Mastery Tracking",
      description: "Know exactly who's trained, who needs help, what gaps exist.",
      svg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
    },
    {
      title: "Guest-Centric Modules",
      description: "Bartending, service, upselling, complaints—skills that impact guests.",
      svg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      title: "Mobile-First",
      description: "Staff train on their phone, at their pace. No laptop needed.",
      svg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      ),
    },
    {
      title: "Progress Dashboard",
      description: "One glance: who's trained, engagement %, guest satisfaction trend.",
      svg: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ];

  return (
    <section style={{
      background: "#f3f4f6",
      padding: "60px 20px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#1a365d",
          textAlign: "center",
          margin: "0 0 20px",
        }}>
          Built For Pub Managers, By Hospitality People
        </h2>

        <p style={{
          fontSize: "1rem",
          color: "#4b5563",
          textAlign: "center",
          margin: "0 0 50px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}>
          Everything you need to train your team and see the impact. No tech jargon. Just results.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px",
        }}>
          {features.map((feature, i) => (
            <div key={i} style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}>
              <div style={{
                color: "#1a365d",
                marginBottom: "16px",
              }}>
                {feature.svg}
              </div>

              <h3 style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#1a365d",
                margin: "0 0 12px",
              }}>
                {feature.title}
              </h3>

              <p style={{
                fontSize: "0.9rem",
                color: "#4b5563",
                lineHeight: 1.6,
                margin: 0,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
