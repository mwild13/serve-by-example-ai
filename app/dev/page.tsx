import { notFound } from "next/navigation";

// Only available in local development — returns 404 in production
export default function DevSandboxPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "2rem" }}>
      {/* Header */}
      <div style={{ maxWidth: "900px", margin: "0 auto 2rem" }}>
        <div style={{
          background: "#1b4332",
          color: "white",
          borderRadius: "12px",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "2rem",
        }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Dev Sandbox
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.6, fontFamily: "monospace" }}>
            localhost only · not visible in production
          </div>
        </div>

        {/* ── Drop components below this line ── */}

        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          border: "2px dashed #d1d5db",
          color: "#6b7280",
          textAlign: "center",
          fontSize: "0.9rem",
        }}>
          Drop components here to preview them
        </div>
      </div>
    </div>
  );
}
