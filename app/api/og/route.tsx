import { ImageResponse } from "next/og";

// No runtime = "edge" — OpenNext Cloudflare compiles all routes to Workers.
// ImageResponse / Satori runs fine in the Workers WASM context.

async function loadManrope(): Promise<ArrayBuffer | null> {
  try {
    // Google Fonts CSS2 — forces a subset with the text we actually use
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Manrope:wght@700&display=swap",
      {
        headers: {
          // UA that returns woff2-compatible CSS with a parseable src URL
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      }
    ).then((r) => r.text());

    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;

    return fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET() {
  const fontData = await loadManrope();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#1f4e37",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px 60px",
          fontFamily: "'Manrope', sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle texture overlay — two overlapping ellipses */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(169,129,42,0.12)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />

        {/* ── Top bar: wordmark ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Logo pill */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "rgba(255,255,255,0.14)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.02em",
            }}
          >
            SBE
          </div>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Serve By Example
          </span>
        </div>

        {/* ── Middle: headline + sub ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.06,
              letterSpacing: "-0.025em",
              maxWidth: "880px",
            }}
          >
            Training Software Built for Hospitality
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.62)",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            Scenario-based AI training that gets new staff floor-ready in six
            weeks, not six months.
          </div>
        </div>

        {/* ── Bottom: CTA badge + domain ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              background: "#a9812a",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              padding: "10px 22px",
              borderRadius: "8px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Try Free
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: "16px",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            servebyexample.co
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Manrope",
                data: fontData,
                weight: 700,
                style: "normal",
              },
            ],
          }
        : {}),
    }
  );
}
