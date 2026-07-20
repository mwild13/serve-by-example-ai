import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaint Master — Hospitality Service Recovery Demo | Serve By Example",
  description:
    "Practice handling guest complaints in real hospitality scenarios. Get AI-scored feedback on de-escalation, empathy, and service recovery skills.",
  alternates: { canonical: "/demo/complaint-master" },
};

export default function ComplaintMasterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
