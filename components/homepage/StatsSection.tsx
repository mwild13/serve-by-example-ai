export default function StatsSection() {
  const stats = [
    { value: "34%", label: "Guest Satisfaction", detail: "Trained staff in 3 weeks, not 3 months" },
    { value: "18%", label: "Staff Retention", detail: "Better training = staff who stay" },
    { value: "12%", label: "Revenue per Cover", detail: "Service skills translate to upsells" },
    { value: "95%", label: "Completion Rate", detail: "Engagement that actually happens" },
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "30px",
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#059669",
                margin: "0 0 10px",
              }}>
                ↑ {stat.value}
              </div>
              <div style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1a365d",
                margin: "0 0 8px",
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                margin: 0,
              }}>
                {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
