"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MobileScreenShell from "./MobileScreenShell";

// Mobile cleanup pass (2026-08-25) — Settings > Support > "Help & FAQ" used
// to send users to the public marketing /resources page. This is the real
// in-app answer: a static how-the-app-works reference, same full-screen
// shell pattern as SettingsScreen.tsx (dark bg, ArrowLeft back button, 390px
// frame) rather than a bottom sheet, since this is meant to be read start to
// finish, not glanced at.
//
// Round 2 (2026-08-25) — expanded from a plain feature list into a real
// reference: a "Getting Started" path for brand-new users up top, deeper
// mechanics explanations for each feature (how mastery actually works, not
// just what the screen is called), and an FAQ block answering the specific
// questions users have actually asked (module numbering/completion, why an
// attempt count might look off, notifications, reporting a bug).

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 20px 24px" }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{title}</p>
      <div style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>{children}</div>
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-mobile)" }}>{q}</p>
      <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>{children}</p>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border-mobile)", margin: "0 20px 24px" }} />;
}

export default function HelpScreen() {
  const router = useRouter();

  return (
    <MobileScreenShell>
      {/* header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>Settings</span>
        </button>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Help &amp; FAQ</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
          A full tour of the app. New here? Start with Getting Started below. Already using it daily? Jump to the FAQ.
        </p>
      </div>

      <Section title="Getting Started">
        <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>Open <strong>Home</strong> each shift for your daily warm-up quiz and today&apos;s featured cocktails.</li>
          <li>Head to <strong>Learn</strong> to work through your 40 training modules in order. Each one ends in a short quiz.</li>
          <li>Try <strong>Live Guest</strong> from Learn: a conversation with a guest who talks back, to go deeper than the quiz alone.</li>
          <li>Check <strong>Me</strong> any time to see your mastery breakdown, streaks, and badges.</li>
        </ol>
      </Section>

      <Divider />

      <Section title="Home">
        Your daily warm-up quiz and today&apos;s cocktail picks rotate once a day, so there&apos;s always something fresh to
        practice. The Continue Learning card always points at whichever module you&apos;re mid-way through, or your next
        recommended one if you&apos;re starting fresh. Quick Access at the bottom jumps straight to Challenges, Cocktail
        Library, Knowledge Base, and your Achievements.
      </Section>

      <Section title="Learn / Modules: how mastery works">
        Training is split into Bartending, Sales, and Management modules, 40 in total, numbered 1 through 40. Each module
        is mastered by answering its True/False quiz correctly <strong>5 times in a row</strong>. Get one wrong and the
        streak resets to zero. You keep answering from the same question pool until you land a clean run, so it rewards
        genuine consistency over lucky guessing, not a one-shot pass/fail test.
        <br /><br />
        Once you master a module, tap <strong>Next Module</strong> to move straight on to the next one in the sequence.
        After module 40, you&apos;ll see &quot;All modules completed. Start again&quot;, a deliberate finish line, not a
        dead end. Starting again lets you refresh modules you haven&apos;t touched in a while; your existing mastery and
        badges are never lost.
      </Section>

      <Section title="Live Guest">
        A typed conversation with a guest, or sometimes a colleague, who talks back: three to six replies, the way you
        would on shift. Afterwards you see what they were thinking at each turn and how the four dials moved: the
        guest, speed, money and safety. Guests get tougher as you master modules. A pass counts toward the
        &quot;Live Guest&quot; bar on the Me page. Live Guest is on venue plans.
      </Section>

      <Section title="Challenges">
        Short, tap-based mini-games that reinforce specs and service skills in bursts, good for a spare minute before
        a shift. These don&apos;t count toward module mastery, they&apos;re for quick repetition.
      </Section>

      <Section title="Knowledge Base &amp; Cocktail Library">
        Reference material you can look up mid-shift: cocktail specs, technique notes, and compliance basics, all
        searchable. Not gated behind quizzes. Just open it and look things up whenever you need to.
      </Section>

      <Section title="Me / Progress">
        Your mastery breakdown by category (Modules and Live Guest), best streak, skill level, and badges all live
        here. The ring percentage for each category is the average of the two bars underneath it, so if you&apos;ve
        only ever done the quizzes, the ring reflects that honestly rather than showing 100% early.
      </Section>

      <Section title="Notifications">
        Off by default. Turning on <strong>Weekly progress digest</strong> or <strong>Training reminders</strong> asks
        you to confirm first. Digest emails send Monday mornings, reminders send Sunday nights, and you can switch
        either back off any time from Settings.
      </Section>

      <Section title="Reporting a problem">
        Found something broken or confusing? Use <strong>Report a Bug</strong> in Settings: describe what happened and
        it goes straight to our team by email. You&apos;ll get a note back within 24–48 hours.
      </Section>

      <Divider />

      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 20px 8px" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Frequently asked questions</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "0 20px 32px" }}>
        <FaqItem q="What happens when I finish all 40 modules?">
          You&apos;ll land on a completion screen instead of the usual &quot;Next Module&quot; button. It&apos;s the
          finish line, not a dead end. Tap Start Again to loop back to module 1 and keep your skills sharp; nothing you
          already mastered is reset.
        </FaqItem>
        <FaqItem q="Why does a module's attempt count look low even though I've retried it?">
          Each module tracks a running attempt total behind the scenes every time you retake its quiz. The number shown
          on the module card reflects that real total, so if it looks off after a fresh retry, pull-to-refresh or
          reopen the Learn tab to fetch the latest numbers.
        </FaqItem>
        <FaqItem q="Do I need to get every quiz question right first try?">
          No. A wrong answer just resets your streak toward the 5-in-a-row requirement, it doesn&apos;t fail the whole
          quiz or cost you anything. Take your time.
        </FaqItem>
        <FaqItem q="Where did Scenario Practice and Live Arena go?">
          They became Live Guest: the same situations, now as a real back-and-forth conversation with a guest. Your
          earlier results are kept.
        </FaqItem>
        <FaqItem q="Can I turn notifications off after enabling them?">
          Yes, any time: Settings &gt; Notifications, same toggle you used to turn it on. No email is sent when you
          turn a notification off.
        </FaqItem>
        <FaqItem q="Something looks wrong or broken. What do I do?">
          Use Report a Bug in Settings (just above this page). Tell us the screen and what happened; our team replies
          within 24–48 hours, or email us any time at{" "}
          <a href="mailto:info@servebyexample.co" style={{ color: "var(--gold-mobile)", fontWeight: 600 }}>
            info@servebyexample.co
          </a>
          .
        </FaqItem>
      </div>
    </MobileScreenShell>
  );
}
