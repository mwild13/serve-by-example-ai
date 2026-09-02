"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LegalSection, LegalSubheading, LegalParagraph, LegalList, LegalDivider, LegalLink, LegalEmailLink } from "./LegalProse";

// Mobile bugfix pass (2026-09-02) — Settings > Support > "Privacy Policy"
// used to send mobile users out to the public marketing /privacy page. This
// is the in-app answer: the same policy content, same full-screen shell
// pattern as HelpScreen.tsx/ReportBugScreen.tsx, so mobile users never
// leave the app. Content copied verbatim from app/privacy/page.tsx — keep
// both in sync if the policy is ever updated.

export default function PrivacyScreen() {
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
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Privacy Policy</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Last updated: 3 July 2026</p>
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <LegalParagraph>
          Serve By Example is committed to protecting your privacy in accordance with the Privacy Act 1988
          (Cth) and the Australian Privacy Principles (APPs). This Privacy Policy explains how we collect, use,
          and safeguard personal information.
        </LegalParagraph>
      </div>

      <LegalSection title="1. What We Collect">
        <LegalList
          items={[
            <>
              <strong>Account Info</strong>: Name, email address, and venue affiliation.
            </>,
            <>
              <strong>Profile Data</strong>: Plan type, display name, and preferences.
            </>,
            <>
              <strong>Training Data</strong>: Responses entered during AI scenario evaluations and performance
              metrics.
            </>,
            <>
              <strong>Communication Data</strong>: Messages sent to us via email or forms.
            </>,
            <>
              <strong>Automated Data</strong>: Usage patterns, device identifiers, IP addresses, and server
              logs.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <LegalParagraph>We use your information to:</LegalParagraph>
        <LegalList
          items={[
            "Operate the Service and manage your account.",
            "Provide AI-powered training evaluations and personalised feedback.",
            "Allow Venue Managers to track training compliance.",
            "Improve the platform and fix bugs.",
            "Comply with our legal obligations.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Data Storage and Sovereignty">
        <LegalParagraph>
          We prioritise data security and utilise infrastructure primarily hosted in Australia
          (ap-southeast-2).
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. How We Share Your Information">
        <LegalParagraph>
          We share information only with trusted service providers contractually obligated to protect your
          data:
        </LegalParagraph>
        <LegalList
          items={[
            <>
              <strong>Supabase</strong>: Authentication and database storage.
            </>,
            <>
              <strong>Cloudflare</strong>: Hosting and security.
            </>,
            <>
              <strong>OpenAI</strong>: Used for AI scenario evaluation (OpenAI does not use data submitted via
              the API to train their foundational models).
            </>,
            <>
              <strong>Google Analytics</strong>: We use Google Analytics (ID: G-EF9YRFXKBG) to understand
              platform usage patterns and improve user experience. See{" "}
              <LegalLink href="https://policies.google.com/privacy">Google&apos;s Privacy Policy</LegalLink>. You
              can opt out using the{" "}
              <LegalLink href="https://tools.google.com/dlpage/gaoptout">
                Google Analytics Opt-out Browser Extension
              </LegalLink>
              .
            </>,
            <>
              <strong>Legal Requirements</strong>: Disclosure as required by Australian law.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <LegalParagraph>
          We retain account data while the account is active. If you delete your account, we delete or
          anonymise your personal data within 30 days, unless required for legal purposes. Aggregated,
          anonymised usage data may be retained indefinitely for analytics.
        </LegalParagraph>
        <LegalSubheading>5.1 Data Retention Schedule</LegalSubheading>
        <LegalList
          items={[
            <>
              <strong>Account &amp; Profile Data</strong>: Retained while account is active; deleted within 30
              days of account deletion (unless required by law).
            </>,
            <>
              <strong>Training Progress &amp; Quiz Responses</strong>: Retained for the duration of active
              subscription; deleted within 30 days upon account deletion.
            </>,
            <>
              <strong>Billing Records &amp; Stripe Webhook Events</strong>: Retained for 7 years to comply with
              Australian tax and financial regulation requirements.
            </>,
            <>
              <strong>Manager Analytics &amp; Staff Performance Data</strong>: Retained for the duration of
              venue subscription; deleted within 30 days of venue removal.
            </>,
            <>
              <strong>Aggregated &amp; Anonymised Data</strong>: Retained indefinitely for service improvement
              and analytics purposes.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Payment Processing">
        <LegalParagraph>
          We use Stripe to process payments for subscriptions. When you subscribe, Stripe receives your payment
          information (credit card details are not stored by us). Stripe may issue webhook events (e.g.,
          subscription creation, updates, and invoice notifications) which we store securely to track billing
          state. Stripe&apos;s privacy practices are governed by their{" "}
          <LegalLink href="https://stripe.com/privacy">Privacy Policy</LegalLink>.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="7. Manager Analytics">
        <LegalParagraph>
          Venue managers can access real-time team analytics and staff training progress through the Manager
          Console. We track staff_progress, scenario_mastery, and staff membership data to provide managers
          with compliance reporting and performance insights. Only the managers of a specific venue can see
          that venue&apos;s staff data; data is segregated by row-level security (RLS) policies in our
          database.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Venue Codes & Staff Invitations">
        <LegalParagraph>
          Venues can generate unique venue codes to invite staff members. When a staff member joins via a venue
          code, they are added to the organisation_members table and receive sponsored access to training
          modules. Only the venue that created the code can see its associated staff; staff members can see
          their own profile and progress, and managers at their venue can see aggregated team performance.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Your Rights Under Australian Law">
        <LegalParagraph>Under the APPs, you have the right to:</LegalParagraph>
        <LegalList
          items={[
            <>
              <strong>Access/Correction</strong>: Request a copy of or correction to the personal data we hold
              about you.
            </>,
            <>
              <strong>Deletion</strong>: Request that we delete your personal data.
            </>,
            <>
              <strong>Complaints</strong>: Contact us at <LegalEmailLink />. If unsatisfied, you may lodge a
              complaint with the Office of the Australian Information Commissioner (OAIC).
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Security and Changes">
        <LegalParagraph>
          We implement industry-standard measures, including encryption and strict access controls. We may
          update this policy periodically; continued use of the Service constitutes acceptance of the updated
          policy.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Contact Us">
        <LegalParagraph>For privacy related inquiries, please contact:</LegalParagraph>
        <LegalParagraph>
          <strong>Serve By Example</strong>
          <br />
          Email: <LegalEmailLink />
        </LegalParagraph>
      </LegalSection>
    </div>
  );
}
