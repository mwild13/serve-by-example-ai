import Image from "next/image";
import Link from "next/link";
import { isUnsubscribeKind, type UnsubscribeKind } from "@/lib/notifications/unsubscribe-token";

// Landing page for the unsubscribe link in the digest and reminder emails.
// It asks before changing anything: mail scanners open every link with GET,
// so the change happens only on the button's POST to
// /api/notifications/unsubscribe, which checks the signature. Open from any
// country (lib/geo-config.ts), since an unsubscribe has to work.

const NAMES: Record<UnsubscribeKind, string> = {
  digest: "the weekly progress digest",
  reminders: "Sunday training reminders",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const params = await searchParams;
  const done = one(params.done);
  const userId = one(params.u);
  const kind = one(params.k);
  const token = one(params.t);
  const error = one(params.error);

  let heading: string;
  let body: React.ReactNode;

  if (isUnsubscribeKind(done)) {
    heading = "You are unsubscribed";
    body = (
      <p className="onboarding-hint">
        You will not get {NAMES[done]} again. You can turn it back on any time in Settings &gt; Notifications.
      </p>
    );
  } else if (error === "failed") {
    heading = "That did not work";
    body = (
      <p className="onboarding-hint">
        Something went wrong on our side. Open the link from the email again in a minute, or turn the email off in Settings &gt; Notifications.
      </p>
    );
  } else if (userId && token && isUnsubscribeKind(kind)) {
    heading = "Unsubscribe?";
    body = (
      <>
        <p className="onboarding-hint">Stop getting {NAMES[kind]} by email. Your training and other settings stay as they are.</p>
        <form method="post" action="/api/notifications/unsubscribe">
          <input type="hidden" name="u" value={userId} />
          <input type="hidden" name="k" value={kind} />
          <input type="hidden" name="t" value={token} />
          <button className="btn btn-primary btn-block" type="submit">Unsubscribe</button>
        </form>
      </>
    );
  } else {
    heading = error === "invalid" ? "This link is not valid" : "This link is not complete";
    body = (
      <p className="onboarding-hint">
        Open the unsubscribe link from the email again, or turn emails off in Settings &gt; Notifications after signing in.
      </p>
    );
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-header">
        <span className="onboarding-logo-bg">
          <Image src="/logo.webp" alt="Serve By Example" width={28} height={28} />
        </span>
        <span className="onboarding-brand">Serve By Example</span>
      </div>
      <div className="onboarding-card">
        <h1 className="onboarding-heading">{heading}</h1>
        {body}
        <p className="onboarding-hint" style={{ marginTop: 20, marginBottom: 0 }}>
          <Link href="/login">Sign in</Link> to change all your notification settings.
        </p>
      </div>
    </div>
  );
}
