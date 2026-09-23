import type { Metadata } from "next";
import PhotoUploadScreen from "../_components/PhotoUploadScreen";

export const metadata: Metadata = {
  title: "Profile Photo | Serve By Example",
  description: "Update your profile photo for your Serve By Example staff account.",
  robots: { index: false, follow: false },
};

export default function MobileAiPhotoPage() {
  return <PhotoUploadScreen />;
}
