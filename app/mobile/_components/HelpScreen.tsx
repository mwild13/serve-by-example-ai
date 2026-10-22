import Screen from "./ui/Screen";
import { Group, Row } from "./ui/parts";

// Help and FAQ, from Settings and Me: how the app works, read start to
// finish, then the questions people ask. Redesign phase 6 rewrote it for the
// four tabs (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md); the rules it states come
// from docs/STAFF_APP.md and docs/MASTERY_ENGINE.md, so check there when
// either changes. Styles: the sm-prose rules in app/styles/staff.css.

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need every quiz question right?",
    a: "No. A quiz passes on 6 right, across three kinds of question, and ends on the third miss. Start it again whenever you like; nothing is lost.",
  },
  {
    q: "What is a freeze?",
    a: "Miss a shift's drill and a freeze keeps your streak going. You have two. One freeze covers every shift missed in the week from the first miss, and five shifts kept in a row earn one back.",
  },
  {
    q: "I already know a module. Do I have to do it all?",
    a: "No. On its Learn cards, tap Test out: up to 8 harder questions, and 6 right masters it straight away.",
  },
  {
    q: "Can I turn the emails off after turning them on?",
    a: "Yes, any time, with the same switch in Settings. Nothing is sent when you turn one off.",
  },
];

/** Where each thing lives, as people ask for it. */
const FIND: { what: string; where: string }[] = [
  { what: "Your profile photo", where: "Me, then tap your name at the top" },
  { what: "Sign out", where: "Me, at the very bottom. Also at the bottom of Settings" },
  { what: "Your shift days and reminder time", where: "Me, Settings, Shifts" },
  { what: "Dark mode", where: "Me, Settings, This phone, Appearance" },
  { what: "Language", where: "Me, Settings, This phone" },
  { what: "Join your venue with a code", where: "Me, Settings, Venue" },
  { what: "The reminder and digest emails", where: "Me, Settings, Email" },
  { what: "Put the app on your Home Screen", where: "Me, Settings, This phone, Add to Home Screen" },
  { what: "Your name, email or password", where: "Me, Settings, Account" },
  { what: "Cocktail specs", where: "Learn or Home, Look it up, Cocktail library. Search by name or ingredient" },
  { what: "Spirits, beer and wine notes", where: "Learn or Home, Look it up, Knowledge base" },
  { what: "Your badges", where: "Me, All badges" },
  { what: "Ask a question about a spec or a guest", where: "Me, the round green AI Coach button" },
  { what: "Today's challenge and the games", where: "Practise" },
  { what: "Your plan and billing", where: "Me, Settings, Plan (when you pay for one yourself)" },
];

/** What the marks and colours mean. */
const MARKS: { mark: string; means: string }[] = [
  { mark: "A small gold badge with a flame and a number, on your photo", means: "Your shift streak: shifts in a row with the pre-shift drill done" },
  { mark: "A green tick on a module", means: "Mastered: you passed its quiz" },
  { mark: "A part-filled ring on a module", means: "Started, and how far through mastering it you are" },
  { mark: "An empty ring on a module", means: "Not started yet" },
  { mark: "A lock on a module", means: "On a paid plan. Tap it to see the plans" },
  { mark: "Up next", means: "The module suggested for you now" },
  { mark: "Gold dots with a tick, in the row of days", means: "The days this week you finished the pre-shift drill" },
];

export default function HelpScreen({ fromMe }: { fromMe: boolean }) {
  return (
    <Screen title="Help" back={fromMe ? { href: "/mobile/progress", label: "Me" } : { href: "/mobile/settings", label: "Settings" }}>
      <div className="sm-prose">
        <p className="sm-prose-lead">How the app works and where everything is. New here? Start with Getting started.</p>

        <h2>Getting started</h2>
        <ol>
          <li>
            Before each shift, open <strong>Home</strong> and run the pre-shift drill. It takes about two minutes.
          </li>
          <li>
            Work through the 40 modules on <strong>Learn</strong>, starting with the one suggested for you.
          </li>
          <li>
            Use <strong>Practise</strong> for a spare few minutes: Saturday Rush, Live Guest and the challenges.
          </li>
          <li>
            Check <strong>Me</strong> for what you&apos;ve mastered, your streak and your badges.
          </li>
        </ol>

        <h2>The four tabs</h2>
        <dl className="sm-prose-faq">
          <div>
            <dt>Home</dt>
            <dd>What to do before tonight&apos;s shift, your streak, tonight&apos;s cocktails and a fact for the bar.</dd>
          </div>
          <div>
            <dt>Learn</dt>
            <dd>All 40 modules from Foundations to Advanced, the one suggested for you on top, and the cocktail library and knowledge base at the foot.</dd>
          </div>
          <div>
            <dt>Practise</dt>
            <dd>The mixed drill, today&apos;s challenge, Live Guest, Saturday Rush and the ten quick games.</dd>
          </div>
          <div>
            <dt>Me</dt>
            <dd>Your progress and badges, the AI Coach, Settings, Help and Sign out.</dd>
          </div>
        </dl>

        <h2>Where to find it</h2>
        <dl className="sm-help-list">
          {FIND.map((item) => (
            <div key={item.what}>
              <dt>{item.what}</dt>
              <dd>{item.where}</dd>
            </div>
          ))}
        </dl>

        <h2>What the marks mean</h2>
        <dl className="sm-help-list">
          {MARKS.map((item) => (
            <div key={item.mark}>
              <dt>{item.mark}</dt>
              <dd>{item.means}</dd>
            </div>
          ))}
        </dl>

        <h2>Home and the pre-shift drill</h2>
        <p>
          The drill asks a few questions from 3 to 5 of your modules, never two in a row from one module. Finish it and
          the shift counts toward your streak. Set the days you work in the drill&apos;s finish screen, or in Settings,
          and days off never count against you. Home also shows the cocktails for today and quick ways to look things up.
        </p>

        <h2>Learn: how mastery works</h2>
        <p>
          Modules are grouped into Foundations, Intermediate and Advanced, across the bar, service and safety. Each one
          opens on its Learn cards, then a quiz. The quiz passes on 6 right across three kinds of question and ends on
          the third miss; pass it and the module is mastered. The skill check at the start decides which module is
          suggested first.
        </p>

        <h2>Practise</h2>
        <p>
          <strong>Saturday Rush</strong> is a busy shift against the clock: twelve quick calls, 15 seconds each, while
          the queue grows. Call the bar-back when you need them. It&apos;s scored on guests, speed, money and safety, and
          your best score is kept.
        </p>
        <p>
          <strong>Live Guest</strong> is a typed conversation with a guest, or sometimes a colleague, who talks back.
          Afterwards you see what they were thinking at each turn. Turn on Voice to hear them and speak your replies.
          Live Guest is on venue plans.
        </p>
        <p>
          <strong>Challenges</strong> are ten short games on specs and service. They don&apos;t count toward mastery;
          they&apos;re for quick repetition. One is picked for you each day.
        </p>

        <h2>Me</h2>
        <p>
          Modules mastered, your shift streak, guests sorted in Live Guest, challenges done, mastery in each area and
          your badges. The AI Coach button answers questions on specs and service. The badges for days in a row count
          the days you open the app on this phone, which is separate from your shift streak.
        </p>

        <h2>On your Home Screen</h2>
        <p>
          Add the app to your Home Screen to open it in one tap. On iPhone, shift reminders on your phone only work
          from the Home Screen app. Settings has the steps under This phone.
        </p>

        <h2>Email</h2>
        <p>
          Both emails are off until you turn them on in Settings, and you&apos;re asked to confirm first. Training
          reminders come on Sunday nights, the progress digest on Monday mornings.
        </p>

        <h2>Questions people ask</h2>
        <dl className="sm-prose-faq">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Group title="Still stuck?" foot="We reply within 24 to 48 hours, or email info@servebyexample.co any time.">
        <Row href="/mobile/report-bug" label="Report a bug" sub="Something broken or confusing" />
        <Row href="/mobile/contact" label="Contact support" sub="Anything else" />
      </Group>
    </Screen>
  );
}
