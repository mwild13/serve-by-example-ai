import Image from "next/image";
import ApplicantTest, { type ApplicantStart } from "@/components/applicant/ApplicantTest";
import { effectiveStatus, findTestByToken, isMissingTable, trackLabel } from "@/lib/applicant/service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// The page behind the invite email's link. Reads the test by its token and
// shows the welcome, picks up where the applicant left off, or says the link
// has closed. Serving items happens in the browser, through
// /api/applicant/[token]/*, so a mail scanner opening the link starts nothing.

type Props = { params: Promise<{ token: string }> };

async function load(token: string): Promise<ApplicantStart> {
  try {
    const admin = createSupabaseAdminClient();
    const row = await findTestByToken(admin, token);
    if (!row) return { stage: "invalid" };
    const status = effectiveStatus(row);
    if (status === "expired" || status === "withdrawn") return { stage: "closed", reason: status };
    if (status === "submitted") return { stage: "finished" };

    const { data: venue } = await admin.from("venues").select("name").eq("id", row.venue_id).maybeSingle();
    const venueName = ((venue?.name as string | undefined) ?? "").trim() || "the venue";
    if (status === "started") return { stage: "resume", venueName };
    return {
      stage: "welcome",
      venueName,
      firstName: row.applicant_name.split(/\s+/)[0] ?? "",
      intro: row.intro_message ?? "",
      trackLabel: trackLabel(row.track),
    };
  } catch (error) {
    if (isMissingTable(error as { code?: string })) return { stage: "invalid" };
    throw error;
  }
}

export default async function ApplyPage({ params }: Props) {
  const { token } = await params;
  const start = await load(token);
  return (
    <div className="ap-shell">
      <header className="ap-header">
        <span className="ap-logo">
          <Image src="/logo.webp" alt="" width={28} height={28} />
        </span>
        <span className="ap-brand">Serve By Example</span>
      </header>
      <main className="ap-main">
        <ApplicantTest token={token} start={start} />
      </main>
    </div>
  );
}
