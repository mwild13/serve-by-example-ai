import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="login-shell">
        <div className="login-card">
          <div className="eyebrow">Member access</div>
          <h1>Log in to Serve By Example AI</h1>
          <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
            This is a placeholder login page for now. Later this will connect to
            Supabase auth and Stripe access rules.
          </p>

          <div className="form-grid">
            <label className="label">
              Email address
              <input className="input" type="email" placeholder="you@example.com" />
            </label>

            <label className="label">
              Password
              <input className="input" type="password" placeholder="••••••••" />
            </label>

            <button className="btn btn-primary">Log In</button>
            <button className="btn btn-secondary">Create Account</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}