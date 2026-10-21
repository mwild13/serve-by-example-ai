import Screen from "./ui/Screen";
import { Group, Row } from "./ui/parts";

// Help and FAQ, from Settings and Me: how the app works, read start to
// finish, then the questions people ask. Redesign phase 6 rewrote it for the
// four tabs (docs/STAFF_MOBILE_REDESIGN_PLAN.md); the rules it states come
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
    q: "Where did Scenario Practice and Live Arena go?",
    a: "They became Live Guest: the same situations as a real back and forth with a guest. Your earlier results are kept.",
  },
  {
    q: "Can I turn the emails off after turning them on?",
    a: "Yes, any time, with the same switch in Settings. Nothing is sent when you turn one off.",
  },
];

export default function HelpScreen({ fromMe }: { fromMe: boolean }) {
  return (
    <Screen title="Help" back={fromMe ? { href: "/mobile/progress", label: "Me" } : { href: "/mobile/settings", label: "Settings" }}>
      <div className="sm-prose">
        <p className="sm-prose-lead">How the app works. New here? Start with Getting started.</p>

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
