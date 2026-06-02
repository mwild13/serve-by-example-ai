import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { SCENARIO_COUNTS } from "@/lib/mastery";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BadgeStreakSection from "@/components/learning-engine/BadgeStreakSection";
import { BadgeProgressRing } from "@/components/learning-engine/BadgeProgressRing";
import {
  computeBadges,
  countEarned,
  type Badge,
  type ModuleSummaryForBadges,
  type CategoryScores,
} from "@/lib/badges";

export const dynamic = "force-dynamic";

// B3: 3-state badge card
function BadgeCard({ badge, isSpecial = false }: { badge: Badge; isSpecial?: boolean }) {
  const inProgress = !badge.earned && badge.progress && badge.progress.current > 0;
  const stateClass = badge.earned
    ? "badge-card--earned"
    : inProgress
    ? "badge-card--progress"
    : "badge-card--locked";
  const specialClass = isSpecial && !badge.earned ? " badge-card--special" : "";

  const barWidth = badge.progress
    ? `${Math.max(4, Math.min(100, Math.round((badge.progress.current / badge.progress.required) * 100)))}%`
    : "4px";

  return (
    <div className={`badge-card ${stateClass}${specialClass}`}>
      <div className="badge-card-icon">
        {badge.earned ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>

      {/* B5: "What it takes" label for special locked badges */}
      {isSpecial && !badge.earned && (
        <span className="badge-what-it-takes">What it takes:</span>
      )}

      <div className="badge-card-label">{badge.label}</div>
      <div className="badge-card-desc">{badge.description}</div>

      {!badge.earned && (
        <div className="badge-card-progress">
          <div className="badge-progress-bar">
            <div className="badge-progress-fill" style={{ width: barWidth }} />
          </div>
          {badge.progress && (
            <span className="badge-progress-label">
              {badge.progress.current} / {badge.progress.required} {badge.progress.unit}
            </span>
          )}
        </div>
      )}
      {badge.earned && <div className="badge-card-earned-tick">Earned</div>}
    </div>
  );
}

// B2 + B6: Section with earned chip, gold accent, and empty nudge state
function BadgeSection({
  title,
  subtitle,
  badges,
  isSpecial = false,
}: {
  title: string;
  subtitle: string;
  badges: Badge[];
  isSpecial?: boolean;
}) {
  const earned = badges.filter((b) => b.earned).length;
  const hasEarned = earned > 0;

  return (
    <div className="badge-section">
      {/* B2: Section header with earned-count chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          flex: 1,
          borderLeft: hasEarned ? "3px solid var(--gold)" : "none",
          paddingLeft: hasEarned ? 12 : 0,
        }}>
          <h2 style={{
            fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px",
            color: "var(--text)", opacity: hasEarned ? 1 : 0.7,
          }}>
            {title}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>{subtitle}</p>
        </div>
        <span style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: "var(--radius-pill)",
          background: hasEarned ? "var(--gold-dim)" : "var(--bg-alt)",
          color: hasEarned ? "var(--gold)" : "var(--text-muted)",
          border: `1px solid ${hasEarned ? "var(--gold)" : "var(--line)"}`,
          flexShrink: 0,
          whiteSpace: "nowrap" as const,
        }}>
          {earned} / {badges.length} earned
        </span>
      </div>

      {/* B6: Empty state for zero-earned sections — show nudge card */}
      {!hasEarned ? (
        <div className="badge-nudge-card">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          <p className="badge-nudge-card-title">Start earning {title} badges</p>
          <p className="badge-nudge-card-desc">
            Complete your first {title.toLowerCase()} module to begin unlocking achievements.
          </p>
          <Link href="/dashboard">
            <button className="badge-nudge-btn" type="button">Go to Modules</button>
          </Link>
        </div>
      ) : (
        <div className="badge-grid">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} isSpecial={isSpecial} />
          ))}
        </div>
      )}
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
    const scenarioTotal = SCENARIO_COUNTS[`module_${m.id}`] ?? 10;
    const masteryPct = scenarioTotal > 0 ? Math.round((stats.mastered / scenarioTotal) * 100) : 0;
    return {
      category: m.category as "technical" | "service" | "compliance",
      mastered: masteryPct >= 80,
      attempted: stats.attempted > 0,
    };
  });

  function avgMastery(cat: string) {
    const mods = (allModules ?? []).filter((m) => m.category === cat);
    if (mods.length === 0) return 0;
    return Math.round(
      mods.reduce((sum, m) => {
        const stats = byModuleId[m.id] ?? { mastered: 0, attempted: 0 };
        const total = SCENARIO_COUNTS[`module_${m.id}`] ?? 10;
        return sum + (total > 0 ? (stats.mastered / total) * 100 : 0);
      }, 0) / mods.length
    );
  }

  const scores: CategoryScores = {
    bartending: avgMastery("technical"),
    sales: avgMastery("service"),
    management: avgMastery("compliance"),
  };

  const serverBadges = computeBadges(modules, scores, 0, bestStreak, sbeElite);
  const nonStreakBadges = serverBadges.filter((b) => b.category !== "streak");
  const earnedCount = countEarned(nonStreakBadges);
  const totalBadgeCount = nonStreakBadges.length;

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

            {/* B1: Achievement hero strip with SVG progress ring */}
            <div className="badge-hero-strip">
              <div>
                <h1 style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2rem",
                  color: "#fff",
                  margin: "0 0 6px",
                  lineHeight: 1.15,
                }}>
                  Your Badges
                </h1>
                <p style={{
                  color: "var(--gold-light)",
                  fontSize: "0.9rem",
                  opacity: 0.85,
                  margin: 0,
                }}>
                  {earnedCount} of {totalBadgeCount} earned — keep going
                </p>
                <Link href="/dashboard" className="badge-back-link">
                  ← Back to dashboard
                </Link>
              </div>
              <BadgeProgressRing earned={earnedCount} total={totalBadgeCount} />
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

            {/* B4: Streak section — dark treatment handled by BadgeStreakSection wrapper */}
            <BadgeStreakSection
              modules={modules}
              scores={scores}
              bestStreak={bestStreak}
              sbeElite={sbeElite}
            />

            {/* B5: Special badges — dashed aspirational treatment */}
            <BadgeSection
              title="Special"
              subtitle="Platform-wide achievements"
              badges={special}
              isSpecial
            />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
