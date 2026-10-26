"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { ReportItem, StoredReport } from "@/lib/applicant/service";
import { ExportButton, PageHead, Panel, StatRow, StatusText, downloadCsv, type StatusTone } from "./console-ui";

// The Applicant Testing tab (docs/APPLICANT_TESTING.md). The manager sends a
// job applicant a link to a test of about 30 minutes, and reads the report
// when they've finished: scores, every answer in full, how each answer was
// produced, and an AI summary with questions for the interview. Reads and
// writes /api/management/applicants itself, like Venue Content. A link from
// the "has finished" email opens a report straight away (?test=<id>).

type Props = {
  venueId: string;
  venueName: string | undefined;
  sessionToken: string | null;
  /** Owners can delete an applicant's data; duty managers can't. */
  isOwnerLevel: boolean;
};

type Status = "invited" | "started" | "submitted" | "expired" | "withdrawn";

type TestRow = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  trackLabel: string;
  status: Status;
  answered: number;
  items: number;
  sentAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  expiresAt: string;
  createdAt: string;
  overall: number | null;
  band: string | null;
  flagCount: number;
};

type Track = { id: string; label: string; ready: boolean };

type ListData = {
  setupNeeded: boolean;
  tests: TestRow[];
  allowance: { used: number; limit: number; left: number } | null;
  tracks?: Track[];
  defaultIntro?: string;
};

type ReportData = {
  test: TestRow & { visits: number };
  report: StoredReport;
  items: ReportItem[];
};

const STATUS: Record<Status, { label: string; tone: StatusTone }> = {
  invited: { label: "Not started", tone: "neutral" },
  started: { label: "In progress", tone: "warn" },
  submitted: { label: "Finished", tone: "ok" },
  expired: { label: "Link expired", tone: "neutral" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

const SECTION_LABELS: { id: keyof StoredReport["sections"]; label: string }[] = [
  { id: "core", label: "Hospitality basics" },
  { id: "role", label: "Knowledge for the role" },
  { id: "order", label: "First things first" },
  { id: "written", label: "What would you do?" },
];

const MARK_LABELS: { id: "process" | "guestCare" | "safety" | "judgement"; label: string }[] = [
  { id: "process", label: "Process" },
  { id: "guestCare", label: "Guest care" },
  { id: "safety", label: "Safety" },
  { id: "judgement", label: "Judgement" },
];

function formatDay(iso: string | null): string {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function resultText(row: Pick<TestRow, "band" | "overall" | "status">): string {
  if (row.status !== "submitted" || row.overall === null) return "–";
  return `${row.band} (${row.overall})`;
}

/** Keeps ?test=<id> in the address bar in step with the open report, without a navigation. */
function setTestParam(id: string | null) {
  const params = new URLSearchParams(window.location.search);
  if (id) params.set("test", id);
  else params.delete("test");
  window.history.replaceState(null, "", `?${params.toString()}`);
}

export function ApplicantTestingPanel({ venueId, venueName, sessionToken, isOwnerLevel }: Props) {
  const [data, setData] = useState<ListData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("test"),
  );

  const call = useCallback(
    async (method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown) => {
      const res = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json", ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      if (!res.ok || !json) throw new Error((json?.error as string | undefined) ?? "Something went wrong. Try again.");
      return json;
    },
    [sessionToken],
  );

  const load = useCallback(async () => {
    try {
      setData((await call("GET", `/api/management/applicants?venueId=${encodeURIComponent(venueId)}`)) as unknown as ListData);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load applicant tests.");
    }
  }, [call, venueId]);

  useEffect(() => {
    if (!venueId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the tab's data from the API on mount, as Venue Content does.
    void load();
  }, [load, venueId]);

  function open(id: string | null) {
    setOpenId(id);
    setTestParam(id);
  }

  async function act(test: TestRow, action: "resend" | "withdraw" | "delete") {
    if (action === "withdraw" && !window.confirm(`Close ${test.applicantName}'s test? Their link will stop working.`)) return;
    if (action === "delete" && !window.confirm(`Delete everything about ${test.applicantName}: their answers and report? This can't be undone.`)) return;
    setBusy(test.id);
    setNotice(null);
    try {
      if (action === "delete") {
        await call("DELETE", `/api/management/applicants?id=${encodeURIComponent(test.id)}`);
        setNotice(`${test.applicantName}'s test and answers are deleted.`);
      } else {
        const result = await call("PATCH", "/api/management/applicants", { id: test.id, action });
        if (action === "resend") {
          setNotice(result.inviteSent ? `A new link is on its way to ${test.applicantEmail}. The old one no longer works.` : String(result.inviteEmailError ?? "The email didn't send."));
        } else {
          setNotice(`${test.applicantName}'s test is closed.`);
        }
      }
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "That didn't work. Try again.");
    } finally {
      setBusy(null);
    }
  }

  if (!venueId) {
    return (
      <div className="mc-page">
        <PageHead title="Applicant Testing" description="Choose a venue at the top to send job applicants a test." />
      </div>
    );
  }

  if (openId) {
    return <ApplicantReport testId={openId} call={call} onBack={() => { open(null); void load(); }} />;
  }

  if (data?.setupNeeded) {
    return (
      <div className="mc-page">
        <PageHead title="Applicant Testing" description="Applicant Testing isn't switched on for this account yet." />
      </div>
    );
  }

  const tests = data?.tests ?? [];
  const allowance = data?.allowance ?? null;
  const onPlan = allowance !== null && allowance.limit > 0;
  const readyTracks = (data?.tracks ?? []).filter((t) => t.ready);
  const canSend = onPlan && (allowance?.left ?? 0) > 0 && readyTracks.length > 0;

  return (
    <div className="mc-page">
      <PageHead
        title="Applicant Testing"
        description={`Send a job applicant a test of about 30 minutes before you meet them. You see their reasoning in their own words, how each answer was produced, and questions to ask in the interview.`}
        actions={
          onPlan ? (
            <button type="button" className="mc-btn mc-btn-primary" disabled={!canSend} onClick={() => { setNotice(null); setInviting(true); }}>
              Send a test
            </button>
          ) : undefined
        }
      />

      {loadError && <p className="mc-error" role="alert">{loadError}</p>}
      {notice && <p className="mc-at-notice" role="status">{notice}</p>}

      {data && !onPlan ? (
        <Panel title="On the Boutique and Commercial plans">
          <p className="mc-at-text">
            Every applicant gets a test built for their role (bar, floor, kitchen or management) from the same training your team uses: a quiz, tasks about what to do first, and real situations to answer in their own words.
            You get their answers, how long each took and whether text was pasted in, and an AI summary with questions for the interview.
          </p>
          <a className="mc-btn mc-btn-primary" href="/management/dashboard?tab=settings&subtab=billing">See the plans</a>
        </Panel>
      ) : (
        <>
          <StatRow
            items={[
              { label: "Sent this month", value: allowance ? `${allowance.used} of ${allowance.limit}` : null, sub: allowance && allowance.left === 0 ? "None left this month" : undefined },
              { label: "Not started", value: data ? String(tests.filter((t) => t.status === "invited").length) : null },
              { label: "In progress", value: data ? String(tests.filter((t) => t.status === "started").length) : null },
              { label: "Finished", value: data ? String(tests.filter((t) => t.status === "submitted").length) : null },
            ]}
          />

          <Panel
            title="Applicants"
            description={`Tests sent from ${venueName ?? "this venue"}, newest first. Kept for 12 months.`}
            flush
            aside={
              tests.length > 0 ? (
                <ExportButton
                  label="Export"
                  onClick={() =>
                    downloadCsv("applicant-tests.csv", [
                      ["Name", "Email", "Role", "Status", "Sent", "Finished", "Result", "Notes"],
                      ...tests.map((t) => [t.applicantName, t.applicantEmail, t.trackLabel, STATUS[t.status].label, formatDay(t.sentAt), formatDay(t.submittedAt), resultText(t), String(t.flagCount)]),
                    ])
                  }
                />
              ) : undefined
            }
          >
            {data && tests.length === 0 ? (
              <p className="mc-panel-empty mc-at-pad">No tests sent yet. Press Send a test to send your first.</p>
            ) : (
              <div className="mc-table-wrap">
                <table className="mc-table">
                  <thead>
                    <tr>
                      <th scope="col">Applicant</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Sent</th>
                      <th scope="col">Result</th>
                      <th scope="col" className="is-num">Notes</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t) => (
                      <tr key={t.id}>
                        <td className="is-main">
                          {t.applicantName}
                          <span className="mc-at-sub">{t.applicantEmail}</span>
                        </td>
                        <td>{t.trackLabel}</td>
                        <td>
                          <StatusText tone={STATUS[t.status].tone}>{STATUS[t.status].label}</StatusText>
                          {t.status === "started" && <span className="mc-at-sub">{t.answered} of {t.items} answered</span>}
                        </td>
                        <td className="is-soft">{formatDay(t.sentAt ?? t.createdAt)}</td>
                        <td>{resultText(t)}</td>
                        <td className="is-num">{t.status === "submitted" ? t.flagCount : "–"}</td>
                        <td>
                          <div className="mc-at-actions">
                            {(t.status === "submitted" || t.status === "started") && (
                              <button type="button" className="mc-btn mc-btn-sm" onClick={() => open(t.id)}>
                                {t.status === "submitted" ? "Report" : "Answers so far"}
                              </button>
                            )}
                            {(t.status === "invited" || t.status === "started" || t.status === "expired") && (
                              <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" disabled={busy !== null} onClick={() => void act(t, "resend")}>
                                {busy === t.id ? "Working…" : "Resend"}
                              </button>
                            )}
                            {(t.status === "invited" || t.status === "started") && (
                              <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" disabled={busy !== null} onClick={() => void act(t, "withdraw")}>
                                Withdraw
                              </button>
                            )}
                            {isOwnerLevel && (
                              <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" disabled={busy !== null} onClick={() => void act(t, "delete")}>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="How it works">
            <ul className="mc-at-list">
              <li>The applicant gets an email from {venueName ?? "your venue"} with a link that only works for them, for 14 days. Replies come to you.</li>
              <li>There is no time limit and no timer on screen. Someone who knows hospitality takes 25 to 30 minutes.</li>
              <li>You see how long each answer took, when text was pasted in, and when they left the page. Treat these as things to ask about, not proof of anything.</li>
              <li>The scores and the AI summary support your decision. They don&apos;t make it.</li>
            </ul>
          </Panel>
        </>
      )}

      {inviting && data && (
        <InviteDialog
          venueId={venueId}
          tracks={data.tracks ?? []}
          defaultIntro={data.defaultIntro ?? ""}
          call={call}
          onClose={() => setInviting(false)}
          onSent={(message) => {
            setInviting(false);
            setNotice(message);
            void load();
          }}
        />
      )}
    </div>
  );
}

type Call = (method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown) => Promise<Record<string, unknown>>;

function InviteDialog({
  venueId,
  tracks,
  defaultIntro,
  call,
  onClose,
  onSent,
}: {
  venueId: string;
  tracks: Track[];
  defaultIntro: string;
  call: Call;
  onClose: () => void;
  onSent: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [track, setTrack] = useState(tracks.find((t) => t.ready)?.id ?? "");
  const [intro, setIntro] = useState(defaultIntro);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const result = await call("POST", "/api/management/applicants", { venueId, applicantName: name, applicantEmail: email, track, introMessage: intro });
      onSent(result.inviteSent ? `Test sent to ${name.trim()}.` : `${name.trim()}'s test is set up, but the email didn't send. ${String(result.inviteEmailError ?? "")} Use Resend to try again.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the test.");
      setSending(false);
    }
  }

  return (
    <div className="mc-dialog-backdrop">
      <div className="mc-dialog mc-at-dialog" role="dialog" aria-modal="true" aria-labelledby="mc-at-invite-title">
        <h2 id="mc-at-invite-title" className="mc-dialog-title">Send a test</h2>
        <form onSubmit={send}>
          <div className="mc-dialog-fields">
            <label className="mc-field">
              Applicant&apos;s name
              <input ref={firstField} className="mc-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="off" required />
            </label>
            <label className="mc-field">
              Their email
              <input className="mc-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="off" required />
            </label>
            <label className="mc-field">
              The role they&apos;re applying for
              <select className="mc-input" value={track} onChange={(e) => setTrack(e.target.value)} required>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id} disabled={!t.ready}>
                    {t.label}{t.ready ? "" : " (coming soon)"}
                  </option>
                ))}
              </select>
            </label>
            <label className="mc-field">
              Your message
              <textarea className="mc-input" rows={6} value={intro} onChange={(e) => setIntro(e.target.value)} maxLength={2000} />
              <span className="mc-at-hint">This opens the email, above a Start button. The email also says how their answers are used and kept.</span>
            </label>
          </div>
          {error && <p className="mc-error" role="alert" style={{ marginTop: 16 }}>{error}</p>}
          <div className="mc-dialog-actions">
            <button type="button" className="mc-btn mc-btn-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="mc-btn mc-btn-primary" disabled={sending || !name.trim() || !email.trim() || !track}>
              {sending ? "Sending…" : "Send the test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplicantReport({ testId, call, onBack }: { testId: string; call: Call; onBack: () => void }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    call("GET", `/api/management/applicants/${encodeURIComponent(testId)}`)
      .then((json) => live && setData(json as unknown as ReportData))
      .catch((err: unknown) => live && setError(err instanceof Error ? err.message : "Could not load the report."));
    return () => {
      live = false;
    };
  }, [call, testId]);

  const back = (
    <button type="button" className="mc-btn mc-btn-quiet" onClick={onBack}>
      Back to applicants
    </button>
  );

  if (error) {
    return (
      <div className="mc-page">
        <PageHead title="Applicant report" actions={back} />
        <p className="mc-error" role="alert">{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mc-page">
        <PageHead title="Applicant report" description="Loading the report. If the last answers are still being marked, this can take a few seconds." actions={back} />
      </div>
    );
  }

  const { test, report, items } = data;
  const finished = test.status === "submitted";
  const summary = report.summary;
  return (
    <div className="mc-page mc-at-report">
      <PageHead
        title={test.applicantName}
        description={`${test.trackLabel} test. ${finished ? `Finished ${formatDay(test.submittedAt)}` : `${test.answered} of ${test.items} answered so far`}. ${report.signals.line}`}
        actions={
          <>
            {back}
            {finished && (
              <button type="button" className="mc-btn" onClick={() => window.print()}>
                Print the report
              </button>
            )}
          </>
        }
      />

      <StatRow
        items={[
          { label: "Overall", value: report.overall === null ? null : `${report.overall}`, sub: report.band ?? undefined },
          ...SECTION_LABELS.map((s) => ({ label: s.label, value: report.sections[s.id] === null ? null : String(report.sections[s.id]) })),
          { label: "Time on the test", value: formatTime(report.signals.totalMs), sub: test.visits > 0 ? `Came back ${test.visits} ${test.visits === 1 ? "time" : "times"}` : "In one sitting" },
        ]}
      />

      {report.pendingScores > 0 && finished && (
        <p className="mc-at-notice" role="status">Some written answers are still being marked. Open the report again in a minute.</p>
      )}

      {summary && (summary.strengths.length > 0 || summary.explore.length > 0 || summary.questions.length > 0) && (
        <Panel title="Summary" description="Written by AI from the answers only. It supports your decision; it doesn't make it.">
          <div className="mc-at-summary">
            <SummaryList title="Strengths" items={summary.strengths} />
            <SummaryList title="Worth exploring" items={summary.explore} />
            <SummaryList title="Questions for the interview" items={summary.questions} />
          </div>
        </Panel>
      )}

      {SECTION_LABELS.map((section) => {
        const inSection = items.filter((i) => i.section === section.id);
        if (inSection.length === 0) return null;
        return (
          <Panel key={section.id} title={section.label} description={section.id === "written" ? "Their answers in their own words, as typed." : undefined}>
            <ol className="mc-at-items">
              {inSection.map((item) => (
                <ReportEntry key={item.position} item={item} />
              ))}
            </ol>
          </Panel>
        );
      })}
    </div>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mc-at-summary-title">{title}</h3>
      <ul className="mc-at-list">
        {items.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

function ReportEntry({ item }: { item: ReportItem }) {
  const written = item.section === "written";
  return (
    <li className="mc-at-item">
      <div className="mc-at-item-head">
        <p className="mc-at-prompt">{item.prompt}</p>
        <p className="mc-at-meta">
          {written
            ? item.score === null ? "Being marked" : `${item.score} out of 100`
            : item.section === "order"
              ? `${item.score ?? 0} out of 100`
              : item.correct ? <StatusText tone="ok">Right</StatusText> : <StatusText>Wrong</StatusText>}
          <span className="mc-at-time">{formatTime(item.timeMs)}</span>
        </p>
      </div>
      {item.setting && <p className="mc-at-setting">{item.setting}</p>}

      {written ? (
        <blockquote className="mc-at-answer">{item.given[0]}</blockquote>
      ) : (
        <div className="mc-at-given">
          <p><span className="mc-at-label">{item.section === "order" ? "Their order:" : "Their answer:"}</span> {item.section === "order" ? "" : item.given.join(", ")}</p>
          {item.section === "order" && <ol className="mc-at-order">{item.given.map((step) => <li key={step}>{step}</li>)}</ol>}
          {!item.correct && item.rightAnswer && (
            item.section === "order" ? (
              <>
                <p><span className="mc-at-label">The right order:</span></p>
                <ol className="mc-at-order">{item.rightAnswer.map((step) => <li key={step}>{step}</li>)}</ol>
              </>
            ) : (
              <p><span className="mc-at-label">Right answer:</span> {item.rightAnswer.join(", ")}</p>
            )
          )}
        </div>
      )}

      {item.marks && (
        <div className="mc-at-marks">
          <p className="mc-at-mark-line">
            {MARK_LABELS.map((m) => (
              <span key={m.id}>{m.label} {item.marks?.[m.id]}/5</span>
            ))}
          </p>
          {item.guide && (
            <ul className="mc-at-guide">
              {item.guide.map((g) => (
                <li key={g.point} className={g.covered ? "is-covered" : undefined}>
                  <span className="sr-only">{g.covered ? "Covered: " : "Not covered: "}</span>
                  {g.point}
                </li>
              ))}
            </ul>
          )}
          {item.strengths && <p><span className="mc-at-label">Did well:</span> {item.strengths}</p>}
          {item.gaps && <p><span className="mc-at-label">Missed:</span> {item.gaps}</p>}
          {item.followUp && <p><span className="mc-at-label">Ask them:</span> {item.followUp}</p>}
        </div>
      )}

      {item.flags.length > 0 && (
        <ul className="mc-at-flags" aria-label="How this answer was produced">
          {item.flags.map((f) => (
            <li key={f.text}>{f.text}</li>
          ))}
        </ul>
      )}
    </li>
  );
}
