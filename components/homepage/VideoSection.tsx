export default function VideoSection() {
  const scriptPoints = [
    {
      time: "0-10s",
      label: "Manager opens dashboard",
      text: '"One view of everything."',
    },
    {
      time: "10-30s",
      label: "Staff logs in, starts training",
      text: '"Staff love it."',
    },
    {
      time: "30-60s",
      label: "Dashboard showing impact",
      text: "Guest satisfaction ↑, staff retained",
    },
    {
      time: "60-90s",
      label: "Manager insight",
      text: '"Easy to launch, impossible to ignore."',
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
          See It In Action
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "center",
        }}>
          {/* Video placeholder */}
          <div style={{
            background: "#1a365d",
            borderRadius: "16px",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            <div style={{
              textAlign: "center",
              color: "white",
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "12px",
              }}>
                ▶️
              </div>
              <p style={{
                fontSize: "0.9rem",
                margin: 0,
              }}>
                Demo video<br />90 seconds
              </p>
            </div>
          </div>

          {/* Script timeline */}
          <div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}>
              {scriptPoints.map((point, i) => (
                <div key={i} style={{
                  paddingBottom: "20px",
                  borderBottom: i < scriptPoints.length - 1 ? "1px solid #e5e7eb" : "none",
                }}>
                  <p style={{
                    fontSize: "0.8rem",
                    color: "#059669",
                    fontWeight: 700,
                    margin: "0 0 6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    {point.time}
                  </p>

                  <h4 style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#1a365d",
                    margin: "0 0 8px",
                  }}>
                    {point.label}
                  </h4>

                  <p style={{
                    fontSize: "0.9rem",
                    color: "#4b5563",
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {point.text}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: "30px",
              padding: "16px",
              background: "#f3f4f6",
              borderRadius: "12px",
              borderLeft: "4px solid #059669",
            }}>
              <p style={{
                fontSize: "0.85rem",
                color: "#4b5563",
                margin: 0,
                fontStyle: "italic",
              }}>
                See how teams go from inconsistent service to confident, guest-ready staff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
