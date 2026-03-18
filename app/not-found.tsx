import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <h1 style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>404</h1>
      <h2 style={{ marginBottom: "1rem", color: "var(--text-soft)" }}>Page not found</h2>
      <p style={{ marginBottom: "2rem", maxWidth: 420, color: "var(--text-soft)" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
