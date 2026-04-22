export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Set up your pub",
      time: "30 min",
      description: "Add your venue, team, pick modules. One person does this.",
    },
    {
      number: 2,
      title: "Invite your staff",
      time: "instant",
      description: "Send email invites. They access via app in their pocket.",
    },
    {
      number: 3,
      title: "Watch the dashboard",
      time: "ongoing",
      description: "See who's trained, who needs help, guest satisfaction trending up.",
    },
  ];

  return (
    <section style={{
      background: "white",
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
          margin: "0 0 50px",
        }}>
          3 Steps to Launch
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "40px",
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              position: "relative",
            }}>
              {/* Step number badge */}
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#1d4ed8",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 800,
                marginBottom: "20px",
              }}>
                {step.number}
              </div>

              {/* Step content */}
              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#1a365d",
                margin: "0 0 8px",
              }}>
                {step.title}
              </h3>

              <p style={{
                fontSize: "0.875rem",
                color: "#059669",
                fontWeight: 600,
                margin: "0 0 12px",
              }}>
                {step.time}
              </p>

              <p style={{
                fontSize: "0.95rem",
                color: "#4b5563",
                lineHeight: 1.6,
                margin: 0,
              }}>
                {step.description}
              </p>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute",
                  top: "30px",
                  left: "29px",
                  width: "2px",
                  height: "80px",
                  background: "#e5e7eb",
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
