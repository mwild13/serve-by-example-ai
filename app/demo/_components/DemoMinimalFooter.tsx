import Link from "next/link";

export default function DemoMinimalFooter() {
  return (
    <footer className="demo-minimal-footer">
      <div className="container">
        <span>
          © 2026 Serve By Example · <Link href="/">Back to Home</Link>
        </span>
      </div>
    </footer>
  );
}
