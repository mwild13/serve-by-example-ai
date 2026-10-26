import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionSubNav from "@/components/SectionSubNav";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import {
  Faq,
  Ledger,
  MediaRows,
  RuledList,
  SplitPanel,
  Steps,
  Strip,
  type FaqItem,
  type LedgerRow,
  type MediaRow,
  type RuledItem,
  type SplitPanelItem,
  type Step,
  type StripItem,
} from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hospitality Pre-Employment Test for Bar, Floor, Kitchen and Managers | Serve By Example",
  description:
    "Email a job applicant a 30 minute hospitality skills test for bartenders, floor staff, chefs and managers. Read every answer in their own words, how each one was produced, and questions to ask in the interview.",
  alternates: { canonical: "/applicant-testing" },
};

// Claims rule: docs/MARKETING_SITE.md §3 (Applicant Testing). Say what it does
// today. Never that it predicts performance, cuts turnover or catches
// cheating; the signals are things to ask about, and the manager decides.
// The example situation is written for this page and is not in the test, so
// applicants can't read the real questions here.

const SHOWCASE: MediaRow = {
  tag: "In the Manager Console",
  title: "They answer on their phone. You read the report.",
  body: "The applicant gets one question at a time, with nothing to install. You get a report in the Manager Console with the scores, every answer and how each one was produced.",
  points: [
    "Scores for each part and a band",
    "Written answers in their own words",
    "Time taken, pasted text and time away, as things to ask about",
    "A summary and questions for the interview",
  ],
  image: {
    src: "/shots/console-applicant-report.webp",
    alt: "Serve By Example Manager Console: an applicant's test report with an overall score, a score for each part, time on the test and an AI summary with strengths, things to explore and interview questions",
    width: 2000,
    height: 1250,
  },
  phone: {
    src: "/shots/phone-applicant-written.webp",
    alt: "The applicant test on a phone: a written situation about a chipped glass in the ice well, with the applicant's answer typed in",
    width: 836,
    height: 1744,
  },
};

const SECTIONS: LedgerRow[] = [
  { metric: "10", title: "Hospitality basics", body: "Multiple choice on what every venue shares: food safety, allergies, complaints, conflict, emergencies and responsible service. Kitchen applicants skip the bar questions." },
  { metric: "8", title: "Knowledge for the role", body: "Multiple choice for the job they applied for: the bar, the floor, the kitchen or running a shift." },
  { metric: "2", title: "First things first", body: "Put five or six jobs in order, such as a rush with a spill, an allergy docket and a queue. Part marks for being close." },
  { metric: "4", title: "What would you do?", body: "Short situations answered in their own words, marked for process, guest care, safety and judgement." },
];

const ROLES: SplitPanelItem[] = [
  {
    label: "Bar",
    title: "Bartenders",
    points: ["Responsible service and refusing service", "Glass in the ice well, spills and a three deep bar", "Product and pouring basics"],
  },
  {
    label: "Floor",
    title: "Floor and front of house",
    points: ["Allergy questions at the table", "Late meals, complaints and service recovery", "Running a section on a busy night"],
  },
  {
    label: "Kitchen",
    title: "Chefs and cooks",
    points: ["Food safety, storage and temperatures", "Allergy changes on a ticket", "Working the line safely"],
  },
  {
    label: "Management",
    title: "Supervisors and managers",
    points: ["Running a shift and backing the team", "Liquor licence duties", "People and money: rosters, tills and pay"],
  },
];

const REPORT: StripItem[] = [
  {
    label: "Scores",
    title: "A score for each part",
    body: "Each part out of 100, an overall score and a band: Strong, Solid, Developing or Not yet. The written answers carry the most weight.",
  },
  {
    label: "Answers",
    title: "Every answer in full",
    body: "What they picked, the order they gave and what they wrote, with a line on what was strong and what was missing in each written answer.",
  },
  {
    label: "Interview",
    title: "Questions to ask them",
    body: "A short summary of strengths and things to explore, with questions for the interview drawn from their answers.",
  },
];

const HOW: Step[] = [
  {
    num: "01",
    title: "Send the test",
    body: "From the Hiring tab in your Manager Console, enter their name and email and pick the role. Edit the welcome note if you like. The email carries your venue's name, and replies come to you.",
  },
  {
    num: "02",
    title: "They take it on their phone",
    body: "No account, no app, no timer. About 30 minutes for someone who knows the work, and they can close it and come back to the same link within 14 days.",
  },
  {
    num: "03",
    title: "You read the report",
    body: "You get an email when they finish. Open the report in the console, print it or download it, and take the questions into the interview.",
  },
];

const FAIR: RuledItem[] = [
  {
    title: "Signals, not verdicts",
    body: "Beside each answer you see how long it took, whether text was pasted in, and time away from the page. A pasted note or a phone call can explain any of them, so they're shown as things to ask about, never as a fail.",
  },
  {
    title: "Marked on what they'd do",
    body: "The AI marker is told never to mark down spelling, grammar or English as a second language, and that a longer answer earns nothing extra. Any sensible approach that keeps guests safe gets the credit.",
  },
  {
    title: "You make the call",
    body: "The report supports your decision and doesn't make it. Nobody is rejected automatically, and the summary never says whether to hire.",
  },
  {
    title: "Nothing personal asked",
    body: "No questions about age, background or health. Tests and answers are deleted 12 months after the invite, or sooner if you delete them, and they're never used to train AI.",
  },
];

// Feeds both the accordion and the FAQPage JSON-LD.
const FAQS: FaqItem[] = [
  {
    q: "What is a hospitality pre-employment test?",
    a: "A short test an applicant takes before the interview, so you can see how they think about the work. Ours covers hospitality basics, knowledge for the role, putting jobs in order, and four situations they answer in their own words.",
  },
  {
    q: "Can I test a bartender's skills before I hire them?",
    a: "Yes. The bar test covers responsible service, safety behind the bar and drink basics, plus four bar situations. There are tests for floor staff, chefs and managers as well.",
  },
  {
    q: "How long does it take?",
    a: "About 30 minutes for someone who knows hospitality. There's no time limit and no timer on screen, so nobody rushes or gives up halfway.",
  },
  {
    q: "Does the applicant need an account or an app?",
    a: "No. They open the link in the email on a phone or computer. They don't become a user, and they don't take a staff seat.",
  },
  {
    q: "Can they look the answers up?",
    a: "They can, the same as anyone at home. That's why the report shows how each answer was produced, such as time taken and pasted text, and the written situations ask what they'd do, which is hard to copy. Treat anything unusual as a question for the interview.",
  },
  {
    q: "Which plans include it?",
    a: "Venue (Boutique) includes 10 tests a month and Group (Commercial) 40. You can send 2 during the 14-day free trial.",
  },
  {
    q: "Does every applicant get the same test?",
    a: "Every applicant for a role gets the same parts, the same weights and the same marking, but the questions are drawn from a pool, so two applicants rarely see the same set.",
  },
];

const pageSchema = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://servebyexample.co" },
      { "@type": "ListItem", "position": 2, "name": "Applicant Testing", "item": "https://servebyexample.co/applicant-testing" },
    ],
  },
];

export default function ApplicantTestingPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main id="main-content">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
        <div className="section-subnav-sentinel" aria-hidden="true" />
        <SectionSubNav items={[
          { id: "tested", label: "What's tested" },
          { id: "roles", label: "Roles" },
          { id: "report", label: "The report" },
          { id: "fair", label: "Fairness" },
          { id: "questions", label: "Questions" },
        ]} />

        <PageHero
          eyebrow="Applicant Testing"
          title="See how an applicant thinks before you meet them."
          subtitle="Email a bartender, floor staff member, chef or manager a 30 minute test built from the same training your team uses. You get their answers in their own words, how each one was produced, and questions to ask in the interview."
          actions={[
            { label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique", variant: "primary" },
            { label: "Compare plans", href: "/membership", variant: "secondary" },
          ]}
        />

        <MediaRows rows={[SHOWCASE]} />

        <Ledger
          id="tested"
          tone="alt"
          kicker="What's tested"
          title="Four parts, one sitting."
          lede="The same structure for every role, with questions for the job they applied for."
          rows={SECTIONS}
        />

        <SplitPanel
          id="roles"
          kicker="One test per role"
          title="Bar, floor, kitchen or management."
          lede="Only what holds in every Australian venue, from a country pub to a hotel group. Where venues do things differently, it tests the principle, not your house rule."
          items={ROLES}
        />

        <Strip
          id="report"
          tone="warm"
          kicker="What you get back"
          title="A report you can take into the interview."
          lede={
            <>
              An example of a written situation: <em>&ldquo;A guest at the end of the bar tells you the man beside her has been bothering her all night. What do you do?&rdquo;</em> You read exactly what they wrote.
            </>
          }
          items={REPORT}
        />

        <Steps
          kicker="How it works"
          title="Three steps, no admin."
          steps={HOW}
        />

        <RuledList
          id="fair"
          tone="alt"
          kicker="Fair to the applicant"
          title="Built to help you ask better questions."
          lede="The test shows you how someone reasons on shift. The interview, the trial shift and your judgement do the rest."
          items={FAIR}
          primary={{ label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Compare plans and prices", href: "/membership" }}
        />

        <Faq
          id="questions"
          kicker="Before you send one"
          title="Questions managers ask."
          items={FAQS}
          name="applicant-faq"
        />

        <CTABand
          title="Send your next applicant a test."
          copy="On Venue and Group plans. 14-day free trial, cancel anytime."
          primary={{ label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "See the whole platform", href: "/platform" }}
        />
      </main>
      <Footer />
    </div>
  );
}
