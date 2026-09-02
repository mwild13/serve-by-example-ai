"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LegalSection, LegalParagraph, LegalList, LegalDivider, LegalEmailLink } from "./LegalProse";

// Mobile bugfix pass (2026-09-02) — Settings > Support > "Terms of Service"
// used to send mobile users out to the public marketing /terms page. This
// is the in-app answer: the same terms content, same full-screen shell
// pattern as HelpScreen.tsx/ReportBugScreen.tsx, so mobile users never
// leave the app. Content copied verbatim from app/terms/page.tsx — keep
// both in sync if the terms are ever updated.

export default function TermsScreen() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>Settings</span>
        </button>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Terms of Service</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Last updated: 26 April 2026</p>
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <LegalParagraph>
          Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the Serve By Example
          platform (&ldquo;Service&rdquo;). By accessing or using the Service, you confirm your acceptance of
          these Terms.
        </LegalParagraph>
      </div>

      <LegalSection title="1. Acceptance and Eligibility">
        <LegalParagraph>
          By creating an account, you confirm that you are at least 16 years old. If you are using the Service
          on behalf of an organisation (e.g., a hospitality venue), you represent that you have the legal
          authority to bind that organisation to these Terms. If you do not agree to these Terms, you must not
          use the Service.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Service Description">
        <LegalParagraph>
          Serve By Example provides an AI-powered hospitality training platform. Features include
          scenario-based learning, AI coaching, progress tracking, and management tools. We reserve the right
          to modify, update, or discontinue features of the Service at any time, provided that we give you
          reasonable notice for material changes that negatively affect your access.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="3. Account and Security">
        <LegalParagraph>You are responsible for all activity that occurs under your account. You agree to:</LegalParagraph>
        <LegalList
          items={["Keep your login credentials confidential.", "Notify us immediately of any unauthorised use."]}
        />
        <LegalParagraph>
          We reserve the right to suspend or terminate accounts that violate these Terms or are reasonably
          suspected of being compromised.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Acceptable Use Policy">
        <LegalParagraph>You agree to use the Service lawfully. You must not:</LegalParagraph>
        <LegalList
          items={[
            "Use the Service for any unlawful activity or to transmit malicious code/viruses.",
            "Attempt to gain unauthorised access to our systems or data.",
            "Reverse engineer, decompile, or disassemble our software.",
            "Use automated scripts, bots, or scrapers to extract data.",
            "Share account credentials; the Service is for licensed users only.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Subscription, Payments, and Refunds">
        <LegalList
          items={[
            <>
              <strong>Billing</strong>: Paid subscriptions are billed in advance. By subscribing, you authorise
              recurring charges on your chosen billing cycle.
            </>,
            <>
              <strong>Australian Consumer Law (ACL)</strong>: Our services come with guarantees that cannot be
              excluded under the ACL. For major failures, you are entitled to cancel your contract and receive
              a refund for the unused portion.
            </>,
            <>
              <strong>Cancellations</strong>: You may cancel at any time. You will retain access until the end
              of your current billing period.
            </>,
            <>
              <strong>Refunds</strong>: Beyond your statutory rights under the ACL, we offer a 14-day
              &ldquo;cooling-off&rdquo; period for your first subscription payment if you are dissatisfied.
            </>,
            <>
              <strong>Price Changes</strong>: We will provide at least 30 days&apos; advance notice of any
              subscription fee changes.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Intellectual Property and Data">
        <LegalParagraph>
          <strong>Our IP</strong>: All content, software, AI models, and training scenarios are the property of
          Serve By Example.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Your Content</strong>: You retain ownership of any content you submit. By submitting content,
          you grant us a non-exclusive, royalty-free licence to process and display that content solely to
          provide the Service to you.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Prohibition on Training</strong>: Serve By Example will not use your proprietary input data or
          training responses to train third-party AI models without your express written consent.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="7. AI-Generated Content and Physical Safety Disclaimer">
        <LegalParagraph>
          <strong>Educational Purpose Only</strong>: AI output is provided for educational and training purposes
          only. It does not constitute professional business, legal, financial, HR, or OHS/WHS advice. Users
          are responsible for verifying AI-generated outputs before acting on them in any professional or
          operational context.
        </LegalParagraph>
        <LegalParagraph>
          <strong>No Replacement for Physical Supervision</strong>: The Service is a supplement to, and not a
          replacement for, venue-specific safety inductions, hands-on physical training, or on-site
          supervision.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Assumption of Risk</strong>: Hospitality work involves inherent physical hazards. Serve By
          Example is not responsible for any physical injury, property damage, or legal consequences arising
          from the application of training scenarios in a physical workspace. Users and their employers remain
          solely responsible for ensuring compliance with local OHS/WHS laws and venue policies.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Venue Compliance and Indemnity">
        <LegalParagraph>If you are a Venue Operator using this Service to train staff:</LegalParagraph>
        <LegalList
          items={[
            <>
              <strong>Responsibility</strong>: You acknowledge that you retain primary duty of care for your
              staff under applicable workplace safety laws.
            </>,
            <>
              <strong>Indemnity</strong>: To the extent permitted by law, you agree to indemnify and hold
              harmless Serve By Example from any claims, damages, or losses resulting from your staff&apos;s
              actions, including injuries occurring on your premises, provided such claims do not arise from
              our gross negligence.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <LegalParagraph>To the extent permitted by law:</LegalParagraph>
        <LegalList
          items={[
            <>The Service is provided on an &ldquo;as is&rdquo; basis.</>,
            <>
              Our total liability shall be limited to the total amount paid by you to us in the 12 months
              preceding the claim, or AUD $100, whichever is greater.
            </>,
            <>This does not apply to liabilities that cannot be excluded under the Australian Consumer Law (ACL).</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Termination, Governing Law, and Changes">
        <LegalParagraph>
          <strong>Termination</strong>: We may suspend access for conduct that violates these Terms.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Governing Law</strong>: These Terms are governed by the laws of New South Wales, Australia.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Severability</strong>: If any provision is found to be unenforceable, the remaining
          provisions will remain in full force.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Changes</strong>: Continued use of the Service after the effective date of updated Terms
          constitutes your agreement.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Contact Us">
        <LegalParagraph>For terms enquiries, please contact:</LegalParagraph>
        <LegalParagraph>
          <strong>Serve By Example</strong>
          <br />
          Email: <LegalEmailLink />
        </LegalParagraph>
      </LegalSection>
    </div>
  );
}
