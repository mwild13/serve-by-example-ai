import Link from 'next/link';

/*
 * CTABand — the single end-of-page call-to-action band (Pages-Redesign.md §3.1, §5.2).
 * Every marketing page ends with exactly one of these.
 * Rule: one primary action per band. The optional secondary renders as a
 * text link, never as a second equal-weight button.
 * Server component.
 */

type CTAAction = {
  label: string;
  href: string;
};

type Props = {
  title: string;
  eyebrow?: string;
  copy?: string;
  primary: CTAAction;
  secondary?: CTAAction;
  background?: 'green' | 'gold' | 'neutral';
};

export default function CTABand({
  title,
  eyebrow,
  copy,
  primary,
  secondary,
  background = 'green',
}: Props) {
  return (
    <section className={`sbe-mkt-ctaband sbe-mkt-ctaband-${background}`}>
      <div className="container sbe-mkt-ctaband-inner">
        {eyebrow ? <p className="sbe-mkt-ctaband-eyebrow">{eyebrow}</p> : null}
        <h2 className="sbe-mkt-ctaband-title">{title}</h2>
        {copy ? <p className="sbe-mkt-ctaband-copy">{copy}</p> : null}
        <div className="sbe-mkt-ctaband-actions">
          <Link href={primary.href} className="sbe-mkt-btn-primary sbe-mkt-ctaband-btn">
            {primary.label}
          </Link>
          {secondary ? (
            <Link href={secondary.href} className="sbe-mkt-btn-text sbe-mkt-ctaband-secondary">
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
