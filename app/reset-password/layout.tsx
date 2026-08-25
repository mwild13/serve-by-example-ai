import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Serve By Example",
  description: "Reset the password for your Serve By Example account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
