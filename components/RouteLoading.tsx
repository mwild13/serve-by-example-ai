// The "Loading" screen for the signed-in app. It is used by the loading.tsx
// files under app/dashboard, app/management and app/mobile only. There is
// deliberately no app/loading.tsx: with one, every public page was sent as
// this screen first and its real content in a hidden block that JavaScript
// swaps in, so a reader that does not run JavaScript (Google's sign-in brand
// check, for one) saw a page that says only "Loading".
export default function RouteLoading() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="sbe-loader" aria-label="Loading…">
        <span style={{ fontSize: "1.5rem", color: "var(--text-soft)" }}>Loading…</span>
      </div>
    </div>
  );
}
