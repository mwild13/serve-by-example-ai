import KnowledgeBaseScreen from "../_components/KnowledgeBaseScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "101 Knowledge Base | Serve By Example",
  description: "Quick-reference hospitality knowledge base.",
  robots: { index: false, follow: false },
};

// Opened from Learn, and from Home (?from=home), which decides the back button.
export default async function MobileKnowledgePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return <KnowledgeBaseScreen fromHome={from === "home"} />;
}
