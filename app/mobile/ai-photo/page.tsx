import AiProfilePhotoScreen from "../_components/AiProfilePhotoScreen";

// Phase C file 08 — real generation via app/api/profile-photo/generate (Fal.ai
// flux/schnell) and app/api/profile-photo/save. Reachable from ProgressScreen's
// avatar (edit-pencil badge) as well as directly at /mobile/ai-photo.
export default function MobileAiPhotoPage() {
  return <AiProfilePhotoScreen />;
}
