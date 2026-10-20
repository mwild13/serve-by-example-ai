"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AREA_LABEL,
  DIFFICULTY_LABEL,
  LIVE_GUEST_MAX_RECORDING_SECONDS,
  LIVE_GUEST_MAX_REPLY_CHARS,
  LiveGuestError,
  MOOD_LABEL,
  SAFETY_LABEL,
  SPEED_LABEL,
  formatDollars,
  listLiveGuests,
  sendLiveGuestReply,
  startLiveGuest,
  type DialLevel,
  type GuestArea,
  type GuestDifficulty,
  type GuestMood,
  type LiveGuestList,
  type LiveGuestResult,
  type PublicGuest,
  type RevealTurn,
} from "@/lib/live-guest-client";
import { useGuestVoice } from "@/components/live-guest/useGuestVoice";

// Live Guest (Rich update, Phases 6 and 7): pick a guest, talk to them over
// 3 or 4 replies, then see what they were thinking at each turn, which of the
// things that help you found, and how the four dials (guest, speed, money,
// safety) moved. A guest is "Guest" until they say their name. Shared by desktop
// (light) and mobile (dark), like QuizRun. The server plays the guest and
// keeps the transcript (app/api/live-guest/). Styles: .lg rules in
// app/styles/staff.css, inside .qz--light / .qz--dark for the colours.

type Props = {
  getToken: () => Promise<string>;
  theme: "light" | "dark";
  /** The one-line intro above the picker. Desktop says it in the page header instead. */
  intro?: boolean;
};

type Line = { from: "guest" | "staff"; text: string };

type Chat = {
  sessionId: string;
  guest: PublicGuest;
  maxReplies: number;
  lines: Line[];
  replies: number;
  result: LiveGuestResult | null;
  /** The guest's name once the staff member knows it. */
  name: string | null;
};

const LEVEL_LABEL: Record<PublicGuest["level"], string> = { 1: "Gentle", 2: "Tricky", 3: "Hard" };

const DIFFICULTY_TEXT: Record<GuestDifficulty, string> = {
  1: "Going easy on you while you're learning. Guests get tougher as you master modules and pass conversations.",
  2: "Played as written.",
  3: "You know this area well now, so expect less patience.",
};

function GuestCard({
  guest,
  starting,
  onPlan,
  onStart,
}: {
  guest: PublicGuest;
  starting: string | null;
  onPlan: boolean;
  onStart: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className="lg-guest"
      onClick={() => onStart(guest.id)}
      disabled={!guest.available || starting !== null}
    >
      <span className="lg-guest-top">
        <span className="lg-guest-title">{guest.title}</span>
        <span className={`lg-level lg-level--${guest.level}`}>{LEVEL_LABEL[guest.level]}</span>
      </span>
      <span className="lg-guest-setting">{guest.setting}</span>
      {guest.available && (
        <span className="lg-guest-meta">
          {DIFFICULTY_LABEL[guest.difficulty]} with you{guest.passed ? " · Passed" : ""}
        </span>
      )}
      <span className="lg-guest-cta">
        {!guest.available ? (onPlan ? "Not on your plan" : "On venue plans") : starting === guest.id ? "Starting…" : guest.name ? `Talk to ${guest.name}` : "Talk to this guest"}
      </span>
    </button>
  );
}

export default function LiveGuest({ getToken, theme, intro = true }: Props) {
  const [guests, setGuests] = useState<PublicGuest[] | null>(null);
  const [onPlan, setOnPlan] = useState(true);
  const [taster, setTaster] = useState<LiveGuestList["taster"]>(undefined);
  const [listError, setListError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ message: string; restart: boolean } | null>(null);
  const [area, setArea] = useState<GuestArea | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voice = useGuestVoice(getToken);
  const { play: playLine, reset: resetVoice, unlock: unlockVoice } = voice;
  const voiceOn = voice.supported && voice.on;

  useEffect(() => {
    let cancelled = false;
    getToken()
      .then(listLiveGuests)
      .then((list) => {
        if (cancelled) return;
        setGuests(list.guests);
        setOnPlan(list.onPlan);
        setTaster(list.taster);
      })
      .catch((err: unknown) => {
        if (!cancelled) setListError(err instanceof Error ? err.message : "Could not load the guests.");
      });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [chat?.lines.length, sending, chat?.result]);

  const begin = useCallback(
    async (guestId: string) => {
      setStarting(guestId);
      setError(null);
      resetVoice();
      if (voiceOn) unlockVoice();
      try {
        const started = await startLiveGuest(await getToken(), guestId);
        setChat({
          sessionId: started.sessionId,
          guest: started.guest,
          maxReplies: started.maxReplies,
          lines: [{ from: "guest", text: started.guest.opening }],
          replies: 0,
          result: null,
          name: started.guest.name,
        });
        setDraft("");
        if (voiceOn) void playLine(started.sessionId, 0);
      } catch (err) {
        setError({ message: err instanceof Error ? err.message : "Could not start the conversation.", restart: false });
      } finally {
        setStarting(null);
      }
    },
    [getToken, playLine, resetVoice, unlockVoice, voiceOn],
  );

  const send = useCallback(async () => {
    if (!chat || chat.result || sending) return;
    const text = draft.trim();
    if (!text) return;
    if (voiceOn) unlockVoice();
    setSending(true);
    setError(null);
    // Shown straight away; taken back out if the guest can't answer.
    setChat({ ...chat, lines: [...chat.lines, { from: "staff", text }] });
    setDraft("");
    try {
      const answer = await sendLiveGuestReply(await getToken(), chat.sessionId, chat.replies, text);
      setChat((c) =>
        c && {
          ...c,
          lines: [...c.lines, { from: "guest", text: answer.guest }],
          replies: answer.replies,
          result: answer.result,
          name: answer.guestName ?? c.name,
        },
      );
      if (voiceOn) void playLine(chat.sessionId, answer.replies);
    } catch (err) {
      setChat((c) => c && { ...c, lines: c.lines.slice(0, -1) });
      setDraft(text);
      const code = err instanceof LiveGuestError ? err.code : null;
      setError({
        message: err instanceof Error ? err.message : "Something went wrong. Send your reply again.",
        restart: code === "EXPIRED" || code === "ENDED" || code === "TURN_MISMATCH" || code === "UNKNOWN_GUEST",
      });
    } finally {
      setSending(false);
    }
  }, [chat, draft, getToken, playLine, sending, unlockVoice, voiceOn]);

  /** Speak, then the words land in the reply box to check and send. */
  const talk = useCallback(async () => {
    if (!chat || chat.result || sending || voice.transcribing) return;
    if (!voice.recording) {
      await voice.startTalking();
      return;
    }
    const text = await voice.stopTalking(chat.sessionId, chat.replies);
    if (text) {
      setDraft((d) => (d.trim() ? `${d.trim()} ${text}` : text).slice(0, LIVE_GUEST_MAX_REPLY_CHARS));
      inputRef.current?.focus();
    }
  }, [chat, sending, voice]);

  // A recording that reaches 30 seconds is written out as if they'd tapped stop.
  useEffect(() => {
    voice.setAutoStop(() => void talk());
  }, [talk, voice]);

  const suggested = guests?.filter((g) => g.suggested) ?? [];
  const others = guests?.filter((g) => !g.suggested) ?? [];
  // Sixty guests is a long scroll, so the rest are shown one area at a time.
  const areas = (Object.keys(AREA_LABEL) as GuestArea[]).filter((a) => others.some((g) => g.area === a));
  const shownArea = area && areas.includes(area) ? area : areas[0];
  const shown = others.filter((g) => g.area === shownArea);

  if (!chat) {
    return (
      <div className={`qz qz--${theme} lg`}>
        {intro && (
          <p className="lg-intro">
            Talk to a guest who talks back. Reply the way you would on shift. Afterwards you&apos;ll see what they were thinking at each turn.
          </p>
        )}
        {error && <p className="lg-error" role="alert">{error.message}</p>}
        {listError && <p className="lg-error" role="alert">{listError}</p>}
        {!guests && !listError && <p className="lg-muted">Loading guests…</p>}
        {guests && !onPlan && (
          <div className="lg-upgrade">
            <p className="lg-upgrade-title">Live Guest is on venue plans</p>
            <p className="lg-upgrade-text">
              Practise real conversations with {guests.length} guests, from a flat schooner to a regular who&apos;s had too many, and
              see what they were thinking at each turn. It comes with Boutique, Commercial and Enterprise, and with every venue
              trial. If you work at a venue, ask your manager to add you.
            </p>
            {taster && (
              <p className="lg-upgrade-text">
                {taster.used
                  ? "You've had your free conversation. The rest of the guests come with a venue plan."
                  : `Try one conversation free: ${tasterLabel(guests.find((g) => g.id === taster.guestId))} is waiting below.`}
              </p>
            )}
            <Link className="qz-next lg-upgrade-cta" href="/pricing">
              See the plans
            </Link>
          </div>
        )}
        {suggested.length > 0 && (
          <>
            <h3 className="lg-group-title">Suggested for you</h3>
            <div className="lg-guests">
              {suggested.map((g) => (
                <GuestCard key={g.id} guest={g} starting={starting} onPlan={onPlan} onStart={(id) => void begin(id)} />
              ))}
            </div>
          </>
        )}
        {others.length > 0 && (
          <>
            <h3 className="lg-group-title">{suggested.length > 0 ? "All guests" : "Guests"}</h3>
            <div className="lg-areas" role="group" aria-label="Guests by area">
              {areas.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={a === shownArea ? "lg-area lg-area--on" : "lg-area"}
                  aria-pressed={a === shownArea}
                  onClick={() => setArea(a)}
                >
                  {AREA_LABEL[a]} <span className="lg-area-count">{others.filter((g) => g.area === a).length}</span>
                </button>
              ))}
            </div>
            <div className="lg-guests">
              {shown.map((g) => (
                <GuestCard key={g.id} guest={g} starting={starting} onPlan={onPlan} onStart={(id) => void begin(id)} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  const { guest, result } = chat;
  const label = chat.name ?? "Guest";
  const replyNumber = Math.min(chat.replies + 1, chat.maxReplies);

  return (
    <div className={`qz qz--${theme} lg`}>
      <div className="lg-head">
        <button
          type="button"
          className="lc-skip"
          onClick={() => {
            resetVoice();
            setChat(null);
          }}
          disabled={sending}
        >
          All guests
        </button>
        <div className="lg-head-right">
          {voice.supported && (
            <button
              type="button"
              className={voiceOn ? "lg-voice-toggle lg-voice-toggle--on" : "lg-voice-toggle"}
              aria-pressed={voiceOn}
              onClick={voice.toggle}
            >
              <SpeakerIcon off={!voiceOn} />
              {voiceOn ? "Voice on" : "Voice off"}
            </button>
          )}
          <p className="lc-count">{result ? "Finished" : `Reply ${replyNumber} of up to ${chat.maxReplies}`}</p>
        </div>
      </div>

      {/* Desktop: the scene sits in a sticky side column. Mobile: above the conversation. */}
      <div className="lg-play">
        <aside className="lg-side">
          <div className="lg-scene">
            <p className="lg-scene-label">{guest.title}</p>
            <p className="lg-scene-text">{guest.setting}</p>
            <p className="lg-scene-patience">
              <span className={`lg-patience lg-patience--${guest.difficulty}`}>{DIFFICULTY_LABEL[guest.difficulty]}</span>
              {DIFFICULTY_TEXT[guest.difficulty]}
            </p>
          </div>
        </aside>

        <div className="lg-main">
          {/* The conversation stays in English: it's English practice. The rest of the page can be translated. */}
          <div className="lg-lines" aria-live="polite" data-no-translate="true">
            {chat.lines.map((line, i) => {
              // Guest lines alternate with staff ones: line 0 is the opening, then one per reply.
              const guestLine = Math.floor(i / 2);
              return (
                <div key={i} className={line.from === "guest" ? "lg-line lg-line--guest" : "lg-line lg-line--staff"}>
                  <span className="lg-line-who">
                    {line.from === "guest" ? label : "You"}
                    {line.from === "guest" && voiceOn && (
                      <button
                        type="button"
                        className="lg-replay"
                        onClick={() => (voice.playing === guestLine ? voice.stopPlaying() : void voice.play(chat.sessionId, guestLine))}
                        aria-label={voice.playing === guestLine ? "Stop" : "Play this line"}
                      >
                        <SpeakerIcon playing={voice.playing === guestLine} />
                      </button>
                    )}
                  </span>
                  <p className="lg-bubble">{line.text}</p>
                </div>
              );
            })}
            {sending && (
              <div className="lg-line lg-line--guest">
                <span className="lg-line-who">{label}</span>
                <p className="lg-bubble lg-typing">
                  <span className="qz-visually-hidden">{label} is typing</span>
                  <span aria-hidden="true" className="lg-dot" />
                  <span aria-hidden="true" className="lg-dot" />
                  <span aria-hidden="true" className="lg-dot" />
                </p>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {error && (
            <div className="lg-error" role="alert">
              <p style={{ margin: 0 }}>{error.message}</p>
              {error.restart && (
                <button type="button" className="lc-testout-link" onClick={() => void begin(guest.id)}>
                  Start again
                </button>
              )}
            </div>
          )}

          {!result && (
            <form
              className="lg-compose"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <label className="qz-visually-hidden" htmlFor="lg-reply">Your reply to {chat.name ?? "the guest"}</label>
              <textarea
                ref={inputRef}
                id="lg-reply"
                className="lg-input"
                rows={3}
                value={draft}
                maxLength={LIVE_GUEST_MAX_REPLY_CHARS}
                placeholder={`What do you say to ${chat.name ?? "the guest"}?`}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  // Desktop: Enter sends, Shift+Enter is a new line.
                  if (theme === "light" && e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                disabled={sending || voice.recording || voice.transcribing}
              />
              {voice.error && (
                <p className="lg-voice-error" role="alert">
                  {voice.error}
                </p>
              )}
              <div className="lg-compose-row">
                <span className="lg-muted">
                  {voice.recording
                    ? `Listening… ${voice.seconds}s of ${LIVE_GUEST_MAX_RECORDING_SECONDS}. Tap stop when you're done.`
                    : voice.transcribing
                      ? "Writing it out…"
                      : draft.length > LIVE_GUEST_MAX_REPLY_CHARS - 100
                        ? `${LIVE_GUEST_MAX_REPLY_CHARS - draft.length} characters left`
                        : voiceOn && !draft
                          ? "Speak or type. Check what's written before you send."
                          : ""}
                </span>
                <span className="lg-compose-actions">
                  {voiceOn && (
                    <button
                      type="button"
                      className={voice.recording ? "lg-mic lg-mic--on" : "lg-mic"}
                      onClick={() => void talk()}
                      disabled={sending || voice.transcribing}
                      aria-pressed={voice.recording}
                    >
                      <MicIcon />
                      {voice.recording ? "Stop" : "Speak"}
                    </button>
                  )}
                  <button type="submit" className="qz-next" disabled={sending || voice.recording || voice.transcribing || !draft.trim()}>
                    Send
                  </button>
                </span>
              </div>
            </form>
          )}

          {result && <Reveal name={result.name ?? guest.name ?? "The guest"} result={result} onAgain={() => void begin(guest.id)} onOthers={() => {
            resetVoice();
            setChat(null);
          }} />}
        </div>
      </div>
    </div>
  );
}

function SpeakerIcon({ off = false, playing = false }: { off?: boolean; playing?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor" />
      {off ? (
        <path d="M13 8l4 4M17 8l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path
          d={playing ? "M13 7.5a3.5 3.5 0 010 5M15.2 5.5a6.5 6.5 0 010 9" : "M13 7.5a3.5 3.5 0 010 5"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
      <rect x="7" y="2.5" width="6" height="10" rx="3" fill="currentColor" />
      <path d="M4.5 9.5a5.5 5.5 0 0011 0M10 15v2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** The taster guest, as the upgrade note names them. */
function tasterLabel(guest: PublicGuest | undefined): string {
  if (!guest) return "the guest";
  return guest.name ?? `"${guest.title}"`;
}

function headline(name: string, result: LiveGuestResult): string {
  switch (result.outcome) {
    case "resolved":
      return `${name} is sorted`;
    case "walked_out":
      return `${name} walked out`;
    case "breach":
      return "That broke a rule you can't break";
    default:
      return `${name} isn't sorted yet`;
  }
}

function MoodChip({ mood }: { mood: GuestMood }) {
  return <span className={`lg-mood lg-mood--${mood}`}>{MOOD_LABEL[mood]}</span>;
}

function Dial({ name, from, to, notInPlay }: { name: string; from?: string; to?: string; notInPlay?: boolean }) {
  return (
    <div className={notInPlay ? "lg-dial lg-dial--off" : "lg-dial"}>
      <span className="lg-dial-name">{name}</span>
      {notInPlay ? (
        <span className="lg-dial-value">Not in play here</span>
      ) : (
        <span className="lg-dial-value">
          {from && from !== to ? (
            <>
              {from} <span aria-hidden="true">→</span>
              <span className="qz-visually-hidden">became</span> {to}
            </>
          ) : (
            to
          )}
        </span>
      )}
    </div>
  );
}

function DialPanel({ result }: { result: LiveGuestResult }) {
  const { speed, safety, money } = result.dials;
  const endMood = result.turns.length > 0 ? result.turns[result.turns.length - 1].mood : result.startMood;
  return (
    <div className="lg-dials-wrap">
      <h3 className="lg-reveal-title">The four dials</h3>
      <div className="lg-dials">
        <Dial name="Guest" from={MOOD_LABEL[result.startMood]} to={MOOD_LABEL[endMood]} />
        {speed ? <Dial name="Speed" from={SPEED_LABEL[speed.start]} to={SPEED_LABEL[speed.end]} /> : <Dial name="Speed" notInPlay />}
        {money ? (
          <Dial name="Money" to={`About ${formatDollars(money.total)}${money.per ? ` ${money.per}` : ""}`} />
        ) : (
          <Dial name="Money" notInPlay />
        )}
        {safety ? <Dial name="Safety" from={SAFETY_LABEL[safety.start]} to={SAFETY_LABEL[safety.end]} /> : <Dial name="Safety" notInPlay />}
      </div>
      {money?.note && <p className="lg-dial-note">{money.note}</p>}
      {money && (
        <p className="lg-muted lg-dial-help">
          Anything given away or made again counts at cost, and an extra sale at menu price. The figures are rough.
        </p>
      )}
    </div>
  );
}

/** What a reply did to the speed, safety and money dials. Empty when nothing moved. */
function dialMoves(turn: RevealTurn, before: { speed: DialLevel | null; safety: DialLevel | null }, per: string | null): string[] {
  const moves: string[] = [];
  if (turn.speed !== null && before.speed !== null && turn.speed !== before.speed) {
    moves.push(`Speed: ${SPEED_LABEL[before.speed]} to ${SPEED_LABEL[turn.speed]}`);
  }
  if (turn.safety !== null && before.safety !== null && turn.safety !== before.safety) {
    moves.push(`Safety: ${SAFETY_LABEL[before.safety]} to ${SAFETY_LABEL[turn.safety]}`);
  }
  for (const m of turn.money) moves.push(`Money: about ${formatDollars(m.dollars)}${per ? ` ${per}` : ""}, ${m.label.charAt(0).toLowerCase()}${m.label.slice(1)}`);
  return moves;
}

/** What helps, ticked off when the staff member did it. */
function HelpsList({ result }: { result: LiveGuestResult }) {
  const done = result.brief.calmsDone;
  if (!done) return <ul className="lg-list">{result.brief.calms.map((c) => <li key={c}>{c}</li>)}</ul>;
  return (
    <>
      <p className="lg-helps-count">
        You found {done.length} of {result.brief.calms.length}
      </p>
      <ul className="lg-helps">
        {result.brief.calms.map((c, i) => {
          const found = done.includes(i);
          return (
            <li key={c} className={found ? "lg-help lg-help--done" : "lg-help"}>
              <span className="lg-help-mark" aria-hidden="true">
                {found ? (
                  <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                )}
              </span>
              <span>
                {c}
                <span className="qz-visually-hidden">{found ? ": you did this" : ": missed"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Reveal({
  name,
  result,
  onAgain,
  onOthers,
}: {
  name: string;
  result: LiveGuestResult;
  onAgain: () => void;
  onOthers: () => void;
}) {
  return (
    <div className="lg-reveal">
      <div className={result.passed ? "lg-verdict lg-verdict--pass" : "lg-verdict lg-verdict--fail"}>
        <p className="lg-verdict-title">{headline(name, result)}</p>
        <p className="lg-verdict-score">
          Score {result.score} · {result.passed ? "Passed" : "Not passed: 75 to pass"}
        </p>
      </div>

      <div className="lg-debrief">
        <p className="lc-why-label">What went well</p>
        <p className="lc-why-text">{result.wentWell}</p>
        <p className="lc-why-label" style={{ marginTop: 12 }}>Try next time</p>
        <p className="lc-why-text">{result.tryNext}</p>
      </div>

      <DialPanel result={result} />

      <h3 className="lg-reveal-title">What {name} was thinking</h3>
      <ol className="lg-thoughts">
        <li className="lg-thought">
          <span className="lg-thought-you">{name} arrived</span>
          <MoodChip mood={result.startMood} />
        </li>
        {result.turns.map((t, i) => {
          const before = i === 0 ? result.startMood : result.turns[i - 1].mood;
          const dialsBefore =
            i === 0
              ? { speed: result.dials.speed?.start ?? null, safety: result.dials.safety?.start ?? null }
              : { speed: result.turns[i - 1].speed, safety: result.turns[i - 1].safety };
          const moves = dialMoves(t, dialsBefore, result.dials.money?.per ?? null);
          return (
            <li key={i} className="lg-thought">
              <span className="lg-thought-you" data-no-translate="true">You: &ldquo;{t.staff}&rdquo;</span>
              <span className="lg-thought-shift">
                <MoodChip mood={before} />
                <span aria-hidden="true">→</span>
                <span className="qz-visually-hidden">became</span>
                <MoodChip mood={t.mood} />
              </span>
              {t.thought && <p className="lg-thought-text">{t.thought}</p>}
              {(t.helped ?? []).map((h) => (
                <p key={h} className="lg-thought-help">Helped: {h}</p>
              ))}
              {(t.setOff ?? []).map((h) => (
                <p key={h} className="lg-thought-worse">Made it worse: {h}</p>
              ))}
              {moves.length > 0 && (
                <ul className="lg-thought-dials">
                  {moves.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className="lg-debrief">
        <p className="lc-why-label">What {name} wanted</p>
        <p className="lc-why-text">{result.brief.wants}</p>
        <p className="lc-why-label" style={{ marginTop: 12 }}>What helps</p>
        <HelpsList result={result} />
        <p className="lc-why-label" style={{ marginTop: 12 }}>What makes it worse</p>
        <ul className="lg-list">{result.brief.setsOff.map((c) => <li key={c}>{c}</li>)}</ul>
        {result.brief.mustDo && (
          <>
            <p className="lc-why-label" style={{ marginTop: 12 }}>The rule you can&apos;t break</p>
            <p className="lc-why-text">{result.brief.mustDo}</p>
          </>
        )}
      </div>

      {!result.saved && <p className="lg-muted">Your result couldn&apos;t be saved this time.</p>}

      <div className="lc-nav">
        <button type="button" className="lc-back" onClick={onOthers}>
          All guests
        </button>
        <button type="button" className="qz-next" onClick={onAgain}>
          Talk to {name} again
        </button>
      </div>
    </div>
  );
}
