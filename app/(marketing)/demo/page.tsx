import Navbar from "@/components/Navbar";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import GuestDemo from "./_components/GuestDemo";
import DemoMinimalFooter from "./_components/DemoMinimalFooter";

// A scripted Live Guest (lib/demo-guest.ts): no sign-up and no AI call.
export default function DemoPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main id="main-content">
        <PageHero
          compact
          eyebrow="Live Guest demo · No sign-up"
          title="Her parmy is cold. What do you say?"
          subtitle="Three replies, about a minute. Then see what the guest was thinking at each turn, and what every reply did to speed, safety and money."
        />

        <GuestDemo />

        <CTABand
          background="neutral"
          title="Put your own roster through it."
          copy="14-day free trial. Create your account in 2 minutes, launch your venue in under 10."
          primary={{ label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Compare plans and prices", href: "/membership" }}
        />
      </main>

      <DemoMinimalFooter />
    </div>
  );
}
