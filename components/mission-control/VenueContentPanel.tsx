"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  VENUE_CONTENT_DETAILS_MAX,
  VENUE_CONTENT_KINDS,
  VENUE_CONTENT_KIND_HINT,
  VENUE_CONTENT_KIND_LABEL,
  VENUE_CONTENT_TITLE_MAX,
  type VenueContentKind,
  type VenueItemView,
  type VenueQuestionView,
} from "@/lib/venue-content-shared";
import { PageHead, Panel, StatRow, StatusText } from "./console-ui";

// The Venue Content tab (Rich update, Phase 11). The manager adds a spec, a
// special, a new product or a sold-out item; the AI drafts 3 to 5 questions;
// the manager approves each one, and approved questions go into staff's next
// mixed drill. Reads and writes /api/management/venue-content itself, like
// the Compliance tab. Server side: lib/venue-content.ts.

type Props = {
  venueId: string;
  venueName: string | undefined;
  sessionToken: string | null;
};

type Form = { kind: VenueContentKind; title: string; details: string; endsOn: string };

/** An item read off a menu photo, ticked to add. */
type PhotoItem = { kind: VenueContentKind; title: string; details: string; picked: boolean };

/** The longest side of a menu photo, after shrinking in the browser. */
const PHOTO_MAX_SIDE = 1600;

/** Shrinks a photo to a JPEG data URL, so it uploads fast on venue wifi. */
async function shrinkPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't prepare the photo.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

const EMPTY_FORM: Form = { kind: "spec", title: "", details: "", endsOn: "" };

export function VenueContentPanel({ venueId, venueName, sessionToken }: Props) {
  const [items, setItems] = useState<VenueItemView[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Item or question id with a change in flight.
  const [busy, setBusy] = useState<string | null>(null);
  // Per item: the AI couldn't draft questions, or a change failed.
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  // A menu photo: reading it, what was read, and adding the ticked items.
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoState, setPhotoState] = useState<"idle" | "reading" | "adding">("idle");
  const [photoItems, setPhotoItems] = useState<PhotoItem[] | null>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);

  const call = useCallback(
    async (method: "GET" | "POST" | "PATCH", body?: unknown, path = "/api/management/venue-content") => {
      const url = method === "GET" ? `${path}?venueId=${encodeURIComponent(venueId)}` : path;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      if (!res.ok || !data) throw new Error((data?.error as string | undefined) ?? "Something went wrong. Try again.");
      return data;
    },
    [sessionToken, venueId],
  );

  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;
    call("GET")
      .then((data) => {
        if (!cancelled) setItems(data.items as VenueItemView[]);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load venue content.");
      });
    return () => {
      cancelled = true;
    };
  }, [call, venueId]);

  function replaceItem(item: VenueItemView, note?: string) {
    setItems((list) => (list ?? []).map((i) => (i.id === item.id ? item : i)));
    setItemNotes((notes) => {
      const next = { ...notes };
      if (note) next[item.id] = note;
      else delete next[item.id];
      return next;
    });
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);
    setFormError(null);
    try {
      const data = await call("POST", { venueId, kind: form.kind, title: form.title, details: form.details, endsOn: form.endsOn || null });
      const item = data.item as VenueItemView;
      setItems((list) => [item, ...(list ?? [])]);
      if (data.draftFailed) setItemNotes((notes) => ({ ...notes, [item.id]: DRAFT_FAILED }));
      setForm({ ...EMPTY_FORM, kind: form.kind });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add that item.");
    } finally {
      setAdding(false);
    }
  }

  async function readPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoState("reading");
    setPhotoNote(null);
    setPhotoItems(null);
    try {
      const image = await shrinkPhoto(file);
      const data = await call("POST", { venueId, image }, "/api/management/venue-content/photo");
      const read = (data.items as Omit<PhotoItem, "picked">[]).map((item) => ({ ...item, picked: true }));
      setPhotoItems(read);
      if (read.length === 0) setPhotoNote("Nothing on that photo could be read as a menu item. Try a closer, straighter photo.");
    } catch (err) {
      setPhotoNote(err instanceof Error ? err.message : "Could not read that photo.");
    } finally {
      setPhotoState("idle");
    }
  }

  // Adds each ticked item through the normal route, one at a time, so each
  // gets its own drafted questions.
  async function addPicked() {
    const picked = (photoItems ?? []).filter((item) => item.picked);
    if (picked.length === 0) return;
    setPhotoState("adding");
    setPhotoNote(null);
    let added = 0;
    const left: PhotoItem[] = [];
    for (const item of picked) {
      try {
        setPhotoNote(`Drafting questions for ${item.title} (${added + 1} of ${picked.length})…`);
        const data = await call("POST", { venueId, kind: item.kind, title: item.title, details: item.details, endsOn: null });
        const view = data.item as VenueItemView;
        setItems((list) => [view, ...(list ?? [])]);
        if (data.draftFailed) setItemNotes((notes) => ({ ...notes, [view.id]: DRAFT_FAILED }));
        added += 1;
      } catch {
        left.push(item);
      }
    }
    setPhotoItems(left.length > 0 ? left : null);
    setPhotoNote(
      left.length > 0
        ? `Added ${added}. ${left.length === 1 ? "One couldn't be added" : `${left.length} couldn't be added`}; try again in a minute.`
        : `Added ${added}. Approve their questions below.`,
    );
    setPhotoState("idle");
  }

  async function change(key: string, itemId: string, body: Record<string, string>) {
    setBusy(key);
    try {
      const data = await call("PATCH", body);
      if (data.archived) {
        setItems((list) => (list ?? []).filter((i) => i.id !== itemId));
      } else {
        replaceItem(data.item as VenueItemView, data.draftFailed ? DRAFT_FAILED : undefined);
      }
    } catch (err) {
      setItemNotes((notes) => ({ ...notes, [itemId]: err instanceof Error ? err.message : "Could not save that change." }));
    } finally {
      setBusy(null);
    }
  }

  if (!venueId) {
    return (
      <div className="mc-page">
        <PageHead title="Venue Content" description="Choose a venue at the top to add its specs, specials and sold-out items." />
      </div>
    );
  }

  const all = items ?? [];
  const live = all.filter((i) => !i.ended);
  const approved = live.reduce((n, i) => n + i.questions.filter((q) => q.status === "approved").length, 0);
  const waiting = all.reduce((n, i) => n + i.questions.filter((q) => q.status === "draft").length, 0);

  return (
    <div className="mc-page">
      <PageHead
        title="Venue Content"
        description={`Add this week's specs, specials and sold-out items for ${venueName ?? "your venue"}. Staff get the questions you approve in their next mixed drill.`}
      />

      <StatRow
        items={[
          { label: "Items in drills", value: items ? String(live.filter((i) => i.questions.some((q) => q.status === "approved")).length) : null },
          { label: "Questions approved", value: items ? String(approved) : null },
          { label: "Waiting for you", value: items ? String(waiting) : null, sub: waiting > 0 ? "Approve or reject below" : undefined },
        ]}
      />

      <Panel
        title="From a photo of the menu"
        description="Take a photo of your cocktail list, drinks menu or specials board. The AI reads the items off it; tick the ones to add. The photo isn't kept."
        aside={
          <>
            <input ref={photoInput} type="file" accept="image/*" capture="environment" hidden onChange={(e) => void readPhoto(e)} />
            <button type="button" className="mc-btn" disabled={photoState !== "idle"} onClick={() => photoInput.current?.click()}>
              {photoState === "reading" ? "Reading the menu…" : "Choose a photo"}
            </button>
          </>
        }
      >
        {photoNote && <p className="mc-vc-hint" role="status">{photoNote}</p>}
        {photoItems && photoItems.length > 0 && (
          <div className="mc-vc-form">
            <ul className="mc-vc-picks">
              {photoItems.map((item, index) => (
                <li key={`${item.title}-${index}`}>
                  <label className="mc-vc-pick">
                    <input
                      type="checkbox"
                      checked={item.picked}
                      onChange={() => setPhotoItems((list) => (list ?? []).map((p, i) => (i === index ? { ...p, picked: !p.picked } : p)))}
                    />
                    <span>
                      <strong>{item.title}</strong> <span className="mc-vc-hint">{VENUE_CONTENT_KIND_LABEL[item.kind]}</span>
                      <span className="mc-vc-pick-details">{item.details}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div>
              <button
                type="button"
                className="mc-btn"
                disabled={photoState !== "idle" || !photoItems.some((p) => p.picked)}
                onClick={() => void addPicked()}
              >
                {photoState === "adding" ? "Adding…" : `Draft questions for ${photoItems.filter((p) => p.picked).length} ticked`}
              </button>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Add an item" description="The AI drafts 3 to 5 questions from what you write. Nothing reaches staff until you approve it.">
        <form className="mc-vc-form" onSubmit={add}>
          <div className="mc-vc-form-row">
            <label className="mc-field">
              What is it?
              <select className="mc-input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as VenueContentKind })}>
                {VENUE_CONTENT_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {VENUE_CONTENT_KIND_LABEL[kind]}
                  </option>
                ))}
              </select>
            </label>
            <label className="mc-field">
              Name
              <input
                className="mc-input"
                value={form.title}
                maxLength={VENUE_CONTENT_TITLE_MAX}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={form.kind === "eighty_six" ? "Coopers Pale on tap" : "Spiced Pear Sour"}
                required
              />
            </label>
            <label className="mc-field">
              Last day (optional)
              <input className="mc-input" type="date" value={form.endsOn} onChange={(e) => setForm({ ...form, endsOn: e.target.value })} />
            </label>
          </div>
          <label className="mc-field">
            Details
            <textarea
              className="mc-input"
              rows={5}
              value={form.details}
              maxLength={VENUE_CONTENT_DETAILS_MAX}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              required
            />
            <span className="mc-vc-hint">{VENUE_CONTENT_KIND_HINT[form.kind]}</span>
          </label>
          {formError && <p className="mc-error" role="alert">{formError}</p>}
          <div>
            <button type="submit" className="mc-btn mc-btn-primary" disabled={adding || !form.title.trim() || form.details.trim().length < 10}>
              {adding ? "Drafting questions…" : "Draft the questions"}
            </button>
          </div>
        </form>
      </Panel>

      {loadError && <p className="mc-error" role="alert">{loadError}</p>}
      {items && items.length === 0 && <p className="mc-panel-empty">Nothing added yet. Start with this week&apos;s special or a new cocktail.</p>}

      {all.map((item) => (
        <Panel
          key={item.id}
          title={item.title}
          description={itemLine(item)}
          aside={
            <div className="mc-vc-item-actions">
              <button
                type="button"
                className="mc-btn mc-btn-quiet mc-btn-sm"
                disabled={busy !== null}
                onClick={() => void change(item.id, item.id, { action: "redraft", itemId: item.id })}
              >
                {busy === item.id ? "Working…" : "Draft again"}
              </button>
              <button
                type="button"
                className="mc-btn mc-btn-quiet mc-btn-sm"
                disabled={busy !== null}
                onClick={() => void change(`archive-${item.id}`, item.id, { action: "archive", itemId: item.id })}
              >
                Take down
              </button>
            </div>
          }
        >
          <p className="mc-vc-details">{item.details}</p>
          {itemNotes[item.id] && <p className="mc-error" role="alert">{itemNotes[item.id]}</p>}
          {item.questions.length === 0 ? (
            <p className="mc-panel-empty">No questions yet. Press Draft again.</p>
          ) : (
            <ol className="mc-vc-questions">
              {item.questions.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  busy={busy !== null}
                  onDecide={(action) => void change(q.id, item.id, { action, questionId: q.id })}
                />
              ))}
            </ol>
          )}
        </Panel>
      ))}
    </div>
  );
}

const DRAFT_FAILED = "The AI couldn't draft questions this time. Press Draft again, or add a little more detail.";

function itemLine(item: VenueItemView): string {
  const parts = [VENUE_CONTENT_KIND_LABEL[item.kind], `added ${formatDate(item.createdAt.slice(0, 10))}`];
  if (item.endsOn) parts.push(item.ended ? `ended ${formatDate(item.endsOn)}, out of drills` : `until ${formatDate(item.endsOn)}`);
  return parts.join(", ");
}

function formatDate(isoDay: string): string {
  const date = new Date(`${isoDay}T00:00:00`);
  return Number.isNaN(date.getTime()) ? isoDay : date.toLocaleDateString("en-AU", { day: "numeric", month: "long" });
}

function QuestionRow({ question, busy, onDecide }: { question: VenueQuestionView; busy: boolean; onDecide: (action: "approve" | "reject") => void }) {
  return (
    <li className="mc-vc-question">
      <div className="mc-vc-question-main">
        <p className="mc-vc-format">{question.formatLabel}</p>
        <p className="mc-vc-prompt">{question.prompt}</p>
        {question.choices.length > 0 && (
          <ul className="mc-vc-choices">
            {question.choices.map((choice) => (
              <li key={choice} className={choice === question.answer ? "is-answer" : undefined}>
                {choice}
                {choice === question.answer && <span className="mc-vc-answer-tag"> (right answer)</span>}
              </li>
            ))}
          </ul>
        )}
        {question.choices.length === 0 || question.formatLabel === "Put in order" ? (
          <p className="mc-vc-explain">
            <strong>Answer:</strong> {question.answer}
          </p>
        ) : null}
        <p className="mc-vc-explain">{question.explanation}</p>
      </div>
      <div className="mc-vc-decide">
        {question.status === "approved" ? (
          <>
            <StatusText tone="ok">Approved, in drills</StatusText>
            <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" disabled={busy} onClick={() => onDecide("reject")}>
              Remove
            </button>
          </>
        ) : (
          <>
            <button type="button" className="mc-btn mc-btn-sm" disabled={busy} onClick={() => onDecide("approve")}>
              Approve
            </button>
            <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" disabled={busy} onClick={() => onDecide("reject")}>
              Reject
            </button>
          </>
        )}
      </div>
    </li>
  );
}
