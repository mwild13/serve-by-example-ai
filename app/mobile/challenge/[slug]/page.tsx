import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChallengeScreen from "../../_components/ChallengeScreen";
import { challengeBySlug } from "@/lib/challenge-content";

export const metadata: Metadata = {
  title: "Challenge | Serve By Example",
  description: "A one-minute Challenges game.",
  robots: { index: false, follow: false },
};

// The challenges added after the first five (lib/challenge-content.ts),
// reached from ChallengesScreen's rows.
export default async function MobileChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const challenge = challengeBySlug(slug);
  if (!challenge) notFound();
  return <ChallengeScreen challenge={challenge} />;
}
