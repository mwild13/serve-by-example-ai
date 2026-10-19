import LiveGuestScreen from "../_components/LiveGuestScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Guest | Serve By Example",
  description: "Practise with a guest who talks back.",
  robots: { index: false, follow: false },
};

export default function MobileLiveGuestPage() {
  return <LiveGuestScreen />;
}
