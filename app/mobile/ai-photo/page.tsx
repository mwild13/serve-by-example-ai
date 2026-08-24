import AiProfilePhotoScreen from "../_components/AiProfilePhotoScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Profile Photo | Serve By Example",
  description: "Generate an AI profile photo for your Serve By Example staff account.",
  robots: { index: false, follow: false },
};

// Phase C file 08 — real generation via app/api/profile-photo/generate and
// app/api/profile-photo/save. Reachable from ProgressScreen's avatar
// (edit-pencil badge) as well as directly at /mobile/ai-photo.
export default function MobileAiPhotoPage() {
  return <AiProfilePhotoScreen />;
}
