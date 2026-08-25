import KnowledgeBaseScreen from "../_components/KnowledgeBaseScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "101 Knowledge Base | Serve By Example",
  description: "Quick-reference hospitality knowledge base.",
  robots: { index: false, follow: false },
};

// Phase B preview route — renders the dumb-UI skeleton so it can be viewed at
// /mobile/knowledge. No auth/data wiring yet.
export default function MobileKnowledgePage() {
  return <KnowledgeBaseScreen />;
}
