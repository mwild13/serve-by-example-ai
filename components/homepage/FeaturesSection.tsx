export default function FeaturesSection() {
  const features = [
    {
      icon: "✓",
      title: "Interactive Training Modules",
      description: "True/false, scenarios, role-play. Staff actually engage.",
    },
    {
      icon: "📊",
      title: "Mastery Tracking",
      description: "Know exactly who's trained, who needs help, what gaps exist.",
    },
    {
      icon: "🍺",
      title: "Guest-Centric Modules",
      description: "Bartending, service, upselling, complaints—skills that impact guests.",
    },
    {
      icon: "📱",
      title: "Mobile-First",
      description: "Staff train on their phone, at their pace. No laptop needed.",
    },
    {
      icon: "📈",
      title: "Progress Dashboard",
      description: "One glance: who's trained, engagement %, guest satisfaction trend.",
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
                fontSize: "2.5rem",
                marginBottom: "16px",
              }}>
                {feature.icon}
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
