import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BadgeStreakSection from "@/components/learning-engine/BadgeStreakSection";
import {
  computeBadges,
  countEarned,
  type Badge,
  type ModuleSummaryForBadges,
  type CategoryScores,
} from "@/lib/badges";

export const dynamic = "force-dynamic";

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className={`badge-card ${badge.earned ? "badge-card--earned" : "badge-card--locked"}`}>
      <div className="badge-card-icon">
        {badge.earned ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>
      <div className="badge-card-label">{badge.label}</div>
      <div className="badge-card-desc">{badge.description}</div>
      {!badge.earned && badge.progress && (
        <div className="badge-card-progress">
          <div className="badge-progress-bar">
            <div
              className="badge-progress-fill"
              style={{ width: `${Math.min(100, Math.round((badge.progress.current / badge.progress.required) * 100))}%` }}
            />
          </div>
          <span className="badge-progress-label">
            {badge.progress.current} / {badge.progress.required} {badge.progress.unit}
          </span>
        </div>
      )}
      {badge.earned && <div className="badge-card-earned-tick">Earned</div>}
    </div>
  );
}

function BadgeSection({
  title,
  subtitle,
  badges,
}: {
  title: string;
  subtitle: string;
  badges: Badge[];
}) {
  return (
    <div className="badge-section">
      <div className="badge-section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="badge-grid">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}

export default async function BadgesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createSupabaseAdminClient();

  const [{ data: allModules }, { data: masteryRows }, { data: profile }] = await Promise.all([
    admin.from("modules").select("id, category").order("id", { ascending: true }),
    admin
      .from("scenario_mastery")
      .select("module_id, mastery_level")
      .eq("user_id", user.id)
      .not("module_id", "is", null),
    admin
      .from("profiles")
      .select("best_correct_streak, sbe_elite_number")
      .eq("id", user.id)
      .single(),
  ]);

  const bestStreak = profile?.best_correct_streak ?? 0;
  const sbeElite = profile?.sbe_elite_number ?? 0;

  // Aggregate mastery data per module_id
  const byModuleId: Record<number, { mastered: number; attempted: number }> = {};
  for (const row of masteryRows ?? []) {
    if (row.module_id == null) continue;
    const cur = byModuleId[row.module_id] ?? { mastered: 0, attempted: 0 };
    cur.attempted += 1;
    if (row.mastery_level >= 3) cur.mastered += 1;
    byModuleId[row.module_id] = cur;
  }

  const modules: ModuleSummaryForBadges[] = (allModules ?? []).map((m) => {
    const stats = byModuleId[m.id] ?? { mastered: 0, attempted: 0 };
    return {
      category: m.category as "technical" | "service" | "compliance",
      mastered: stats.mastered >= 1,
      attempted: stats.attempted > 0,
    };
  });

  function avgMastery(cat: string) {
    const mods = (allModules ?? []).filter((m) => m.category === cat);
    if (mods.length === 0) return 0;
    const masteredCount = mods.filter((m) => (byModuleId[m.id]?.mastered ?? 0) >= 1).length;
    return Math.round((masteredCount / mods.length) * 100);
  }

  const scores: CategoryScores = {
    bartending: avgMastery("technical"),
    sales: avgMastery("service"),
    management: avgMastery("compliance"),
  };

  // Compute all non-streak badges server-side (streak=0 placeholder; streaks rendered client-side)
  const serverBadges = computeBadges(modules, scores, 0, bestStreak, sbeElite);
  const nonStreakBadges = serverBadges.filter((b) => b.category !== "streak");
  const earnedCount = countEarned(nonStreakBadges);

  const technical  = nonStreakBadges.filter((b) => b.category === "technical");
  const service    = nonStreakBadges.filter((b) => b.category === "service");
  const compliance = nonStreakBadges.filter((b) => b.category === "compliance");
  const special    = nonStreakBadges.filter((b) => b.category === "special");

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <div className="badge-page">
          <div className="container">
            <div className="badge-page-header">
              <div>
                <Link href="/dashboard" className="badge-back-link">
                  &larr; Back to dashboard
                </Link>
                <h1>Your Badges</h1>
              </div>
              <span className="badge-earned-chip">{earnedCount} earned</span>
            </div>

            <BadgeSection
              title="Technical"
              subtitle="Bartending and product knowledge"
              badges={technical}
            />
            <BadgeSection
              title="Service"
              subtitle="Sales, upselling, and guest experience"
              badges={service}
            />
            <BadgeSection
              title="Compliance"
              subtitle="RSA, operations, and shift leadership"
              badges={compliance}
            />

            {/* Streak section is client-rendered to avoid localStorage hydration flash */}
            <BadgeStreakSection
              modules={modules}
              scores={scores}
              bestStreak={bestStreak}
              sbeElite={sbeElite}
              userId={user.id}
            />

            <BadgeSection
              title="Special"
              subtitle="Platform-wide achievements"
              badges={special}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
