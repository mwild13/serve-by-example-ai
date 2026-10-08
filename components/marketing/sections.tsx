import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/*
 * Section patterns for marketing sub-pages (Pages-Redesign.md §4.2).
 * Each export is one of the homepage layouts with its content passed in, so a
 * page file stays metadata, content constants and a short list of sections.
 * All server components. Neighbouring sections on a page must not use the
 * same pattern (§2.3).
 */

type Tone = "plain" | "alt" | "warm";

type Action = { label: string; href: string };

type HeadProps = {
  kicker: string;
  title: string;
  lede?: ReactNode;
  /** Heading left, lede right from 900px up. */
  split?: boolean;
};

const toneClass = (tone: Tone = "plain") => (tone === "plain" ? "" : ` sbe-mkt-tone-${tone}`);

export function SectionHead({ kicker, title, lede, split }: HeadProps) {
  if (split) {
    return (
      <header className="sbe-mkt-head sbe-mkt-head-split">
        <div>
          <p className="sbe-mkt-kicker">{kicker}</p>
          <h2 className="sbe-mkt-display">{title}</h2>
        </div>
        {lede ? <p className="sbe-mkt-lede">{lede}</p> : null}
      </header>
    );
  }
  return (
    <header className="sbe-mkt-head">
      <p className="sbe-mkt-kicker">{kicker}</p>
      <h2 className="sbe-mkt-display">{title}</h2>
      {lede ? <p className="sbe-mkt-lede">{lede}</p> : null}
    </header>
  );
}

/* ── Split panel: a claim on parchment, proofs on a dark panel that bleeds right ── */

export type SplitPanelItem = {
  label?: string;
  title: string;
  body?: ReactNode;
  points?: string[];
};

export function SplitPanel({
  id,
  kicker,
  title,
  lede,
  items,
  children,
}: HeadProps & { id?: string; items: SplitPanelItem[]; children?: ReactNode }) {
  return (
    <section id={id} className="sbe-mkt-duo">
      <div className="sbe-mkt-duo-lead">
        <p className="sbe-mkt-kicker">{kicker}</p>
        <h2 className="sbe-mkt-display">{title}</h2>
        {lede ? <p className="sbe-mkt-lede">{lede}</p> : null}
        {children}
      </div>
      <div className="sbe-mkt-duo-panel">
        {items.map((item) => (
          <div key={item.title} className="sbe-mkt-duo-item">
            {item.label ? <p className="sbe-mkt-duo-for">{item.label}</p> : null}
            <h3>{item.title}</h3>
            {item.points ? (
              <ul className="sbe-mkt-points">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
            {item.body ? <p>{item.body}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Media rows: text beside a product screenshot, alternating side row to row ── */

export type Shot = { src: string; alt: string; width: number; height: number };

export type MediaRow = {
  tag?: string;
  title: string;
  body: ReactNode;
  points?: string[];
  action?: Action;
  image: Shot;
  /** A phone screenshot standing over the corner of the main image. */
  phone?: Shot;
  /** Render the image as a bare phone (no screenshot frame). */
  bare?: boolean;
};

export function MediaRows({
  id,
  tone,
  head,
  rows,
  startFlipped = false,
}: {
  id?: string;
  tone?: Tone;
  head?: HeadProps;
  rows: MediaRow[];
  startFlipped?: boolean;
}) {
  return (
    <section id={id} className={`sbe-mkt-showcase${toneClass(tone)}`}>
      <div className="container">
        {head ? <SectionHead {...head} /> : null}
        {rows.map((row, i) => {
          const flip = (i % 2 === 1) !== startFlipped;
          return (
            <div key={row.title} className={`sbe-mkt-show-row${flip ? " sbe-mkt-show-row-flip" : ""}`}>
              <div className="sbe-mkt-show-text">
                {row.tag ? <p className="sbe-mkt-show-tag">{row.tag}</p> : null}
                <h3>{row.title}</h3>
                <p>{row.body}</p>
                {row.points ? (
                  <ul className="sbe-mkt-points">
                    {row.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
                {row.action ? (
                  <Link href={row.action.href} className="sbe-mkt-btn-text sbe-mkt-show-action">
                    {row.action.label}
                  </Link>
                ) : null}
              </div>
              <div
                className={`sbe-mkt-show-media sbe-mkt-show-media-${flip ? "start" : "end"}${row.phone ? " sbe-mkt-show-stack" : ""}${row.bare ? " sbe-mkt-show-bare" : ""}`}
              >
                <Image
                  src={row.image.src}
                  alt={row.image.alt}
                  width={row.image.width}
                  height={row.image.height}
                  sizes={row.bare ? "(max-width: 900px) 60vw, 280px" : "(max-width: 900px) 100vw, 760px"}
                  loading="lazy"
                  className={row.bare ? undefined : "sbe-shot"}
                />
                {row.phone ? (
                  <Image
                    src={row.phone.src}
                    alt={row.phone.alt}
                    width={row.phone.width}
                    height={row.phone.height}
                    sizes="(max-width: 900px) 30vw, 200px"
                    loading="lazy"
                    className="sbe-mkt-show-phone"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Ledger rows: a figure or numeral leads, then label and explanation ── */

export type LedgerRow = { metric: string; unit?: string; title: string; body: ReactNode };

export function Ledger({
  id,
  tone,
  rows,
  footnote,
  ...head
}: HeadProps & { id?: string; tone?: Tone; rows: LedgerRow[]; footnote?: ReactNode }) {
  return (
    <section id={id} className={`sbe-mkt-measures${toneClass(tone)}`}>
      <div className="container">
        <SectionHead {...head} />
        <dl className="sbe-mkt-ledger">
          {rows.map((row) => (
            <div key={row.title} className="sbe-mkt-ledger-row">
              <dt>
                <span className="sbe-mkt-ledger-metric">
                  {row.metric}
                  {row.unit ? <span className="sbe-mkt-ledger-unit">{row.unit}</span> : null}
                </span>
                <span className="sbe-mkt-ledger-title">{row.title}</span>
              </dt>
              <dd>{row.body}</dd>
            </div>
          ))}
        </dl>
        {footnote ? <p className="sbe-mkt-footnote">{footnote}</p> : null}
      </div>
    </section>
  );
}

/* ── Ruled list: sticky intro and action on the left, hairline rows on the right ── */

export type RuledItem = { label?: string; title: string; body: ReactNode; href?: string; linkLabel?: string };

export function RuledList({
  id,
  tone,
  items,
  primary,
  secondary,
  note,
  ...head
}: HeadProps & {
  id?: string;
  tone?: Tone;
  items: RuledItem[];
  primary?: Action;
  secondary?: Action;
  /** One closing statement under the list, e.g. the page's risk-reversal line. */
  note?: { title: string; body: ReactNode };
}) {
  return (
    <section id={id} className={`sbe-mkt-plans${toneClass(tone)}`}>
      <div className="container sbe-mkt-plans-grid">
        <div className="sbe-mkt-plans-intro">
          <p className="sbe-mkt-kicker">{head.kicker}</p>
          <h2 className="sbe-mkt-display">{head.title}</h2>
          {head.lede ? <p className="sbe-mkt-lede">{head.lede}</p> : null}
          {primary || secondary ? (
            <div className="sbe-mkt-plans-actions">
              {primary ? (
                <Link href={primary.href} className="sbe-mkt-btn-primary">
                  {primary.label}
                </Link>
              ) : null}
              {secondary ? (
                <Link href={secondary.href} className="sbe-mkt-btn-text">
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
        <ul className="sbe-mkt-plans-list">
          {items.map((item) => (
            <li key={item.title} className={`sbe-mkt-plan${item.label ? "" : " sbe-mkt-plan-nolabel"}`}>
              {item.label ? <span className="sbe-mkt-plan-tier">{item.label}</span> : null}
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {item.href ? (
                <Link href={item.href} className="sbe-mkt-btn-text sbe-mkt-plan-link">
                  {item.linkLabel ?? "Read more"}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
        {note ? (
          <p className="sbe-mkt-guarantee">
            <strong>{note.title}</strong>
            {note.body}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ── Numbered steps: three or four, staggered, on the dark band ── */

export type Step = { num: string; title: string; body: ReactNode };

export function Steps({ id, steps, ...head }: HeadProps & { id?: string; steps: Step[] }) {
  return (
    <section id={id} className="sbe-mkt-path sbe-mkt-on-dark">
      <div className="container">
        <SectionHead {...head} split={head.split ?? Boolean(head.lede)} />
        <ol className={`sbe-mkt-path-steps${steps.length === 4 ? " sbe-mkt-path-steps-4" : ""}`}>
          {steps.map((step) => (
            <li key={step.num} className="sbe-mkt-path-step">
              <span className="sbe-mkt-path-num" aria-hidden="true">
                {step.num}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Aligned strip: intro in the first track, points on the tracks beside it ── */

export type StripItem = { label?: string; title: string; body: ReactNode; image?: Shot };

export function Strip({
  id,
  tone,
  items,
  action,
  ...head
}: HeadProps & { id?: string; tone?: Tone; items: StripItem[]; action?: Action }) {
  return (
    <section id={id} className={`sbe-mkt-strip${toneClass(tone)}`}>
      <div className="container sbe-mkt-strip-grid">
        <div className="sbe-mkt-strip-intro">
          <p className="sbe-mkt-kicker">{head.kicker}</p>
          <h2 className="sbe-mkt-strip-title">{head.title}</h2>
          {head.lede ? <p className="sbe-mkt-strip-lede">{head.lede}</p> : null}
          {action ? (
            <Link href={action.href} className="sbe-mkt-btn-text">
              {action.label}
            </Link>
          ) : null}
        </div>
        <ul className={`sbe-mkt-strip-list sbe-mkt-strip-list-${Math.min(items.length, 3)}`}>
          {items.map((item) => (
            <li key={item.title} className="sbe-mkt-strip-item">
              {item.image ? (
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="(max-width: 900px) 60vw, 260px"
                  loading="lazy"
                  className="sbe-mkt-strip-img"
                />
              ) : null}
              {item.label ? <span className="sbe-mkt-plan-tier">{item.label}</span> : null}
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Hairline accordion: sticky heading left, one answer open at a time ── */

export type FaqItem = { q: string; a: ReactNode };

export function Faq({
  id,
  tone,
  items,
  name,
  ...head
}: HeadProps & { id?: string; tone?: Tone; items: FaqItem[]; name: string }) {
  return (
    <section id={id} className={`sbe-mkt-faq${toneClass(tone)}`}>
      <div className="container sbe-mkt-faq-grid">
        <SectionHead {...head} />
        <div className="sbe-mkt-faq-list">
          {items.map(({ q, a }) => (
            <details key={q} className="sbe-mkt-faq-item" name={name}>
              <summary className="sbe-mkt-faq-q">
                <span>{q}</span>
                <span className="sbe-mkt-faq-icon" aria-hidden="true" />
              </summary>
              <div className="sbe-mkt-faq-a">
                <p>{a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
