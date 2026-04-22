"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section style={{
      background: "white",
      padding: "80px 20px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: 800,
          color: "#1a365d",
          margin: "0 0 20px",
          lineHeight: 1.2,
        }}>
          Your Guests Notice. Your Staff Know.
        </h1>

        <p style={{
          fontSize: "1.25rem",
          color: "#4b5563",
          margin: "0 0 40px",
          lineHeight: 1.6,
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          Train faster, serve better, keep staff longer. Serve By Example does the heavy lifting so you don&apos;t have to.
        </p>

        <div style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: "40px",
        }}>
          <Link href="/demo" style={{
            display: "inline-block",
            padding: "14px 32px",
            background: "#1d4ed8",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1rem",
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
            padding: "14px 32px",
            background: "white",
            color: "#1a365d",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1rem",
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
            Book a Demo
          </Link>
        </div>

        {/* Subtext */}
        <p style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          marginTop: "30px",
          margin: "30px auto 0",
          maxWidth: "600px",
        }}>
          No credit card required. See how your team would actually engage with training in 5 minutes.
        </p>
      </div>
    </section>
  );
}
