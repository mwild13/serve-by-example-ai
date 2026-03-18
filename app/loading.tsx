export default function Loading() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="sbe-loader" aria-label="Loading…">
        <span style={{ fontSize: "1.5rem", color: "var(--text-soft)" }}>Loading…</span>
      </div>
    </div>
  );
}
