import type { Metadata } from "next";
import "../styles/auth.css";

export const metadata: Metadata = {
  title: "Log In | Serve By Example",
  description: "Log in to your Serve By Example staff or management account.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
