"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section style={{
      background: "white",
      padding: "80px 20px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          color: "#1a365d",
          margin: "0 0 24px",
          lineHeight: 1.2,
        }}>
          Ready to Transform Your Team?
        </h2>

        <p style={{
          fontSize: "1.1rem",
          color: "#4b5563",
          margin: "0 0 40px",
          lineHeight: 1.6,
        }}>
          See your dashboard in 5 minutes. No credit card required.
        </p>

        <div style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <Link href="/demo" style={{
            display: "inline-block",
            padding: "16px 40px",
            background: "#1d4ed8",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1.05rem",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#1e40af"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#1d4ed8"}
          >
            See Live Dashboard →
          </Link>

          <Link href="/contact" style={{
            display: "inline-block",
            padding: "16px 40px",
            background: "white",
            color: "#1a365d",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1.05rem",
            border: "2px solid #1a365d",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
          }}
          >
            Book a Consultation
          </Link>
        </div>

        <p style={{
          fontSize: "0.85rem",
          color: "#6b7280",
          marginTop: "30px",
          margin: "30px auto 0",
        }}>
          Join pubs across the UK seeing real guest satisfaction and retention gains.
        </p>
      </div>
    </section>
  );
}
