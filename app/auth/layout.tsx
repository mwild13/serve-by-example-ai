import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Serve By Example",
  description: "Sign in or create your Serve By Example account.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
