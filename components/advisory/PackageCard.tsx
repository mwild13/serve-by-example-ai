"use client";

import { useState } from "react";
import Link from "next/link";

/*
 * Advisory package column. Inclusions are always visible on desktop; on mobile
 * they sit behind a "What's included" toggle (the list stays in the DOM and
 * is hidden by CSS, so the copy is still crawlable).
 */

export type AdvisoryPackage = {
  id: string;
  name: string;
  price: string;
  priceSuffix?: string;
  audience: string;
  inclusions: string[];
  /** Short condition shown directly under the price (e.g. a minimum term). */
  note?: string;
  cta: string;
  /** One package may be marked as the suggested starting point. No popularity claims. */
  recommended?: boolean;
};

type Props = {
  pkg: AdvisoryPackage;
  href: string;
};

export default function PackageCard({ pkg, href }: Props) {
  const [open, setOpen] = useState(false);
  const listId = `advisory-pkg-${pkg.id}`;

  return (
    <article className={`sbe-adv-pkg${pkg.recommended ? " sbe-adv-pkg-popular" : ""}`}>
      {pkg.recommended ? <span className="sbe-adv-pkg-tag">Recommended</span> : null}

      <h3 className="sbe-adv-pkg-name">{pkg.name}</h3>

      <p className="sbe-adv-pkg-price">
        <span className="sbe-adv-pkg-from">From</span>
        <span className="sbe-adv-pkg-figure">{pkg.price}</span>
        {pkg.priceSuffix ? <span className="sbe-adv-pkg-suffix">{pkg.priceSuffix}</span> : null}
      </p>
      {pkg.note ? <p className="sbe-adv-pkg-note">{pkg.note}</p> : null}

      <p className="sbe-adv-pkg-audience">{pkg.audience}</p>

      <button
        type="button"
        className="sbe-adv-pkg-toggle"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        What&apos;s included
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      <div id={listId} className="sbe-adv-pkg-body" data-open={open}>
        <ul className="sbe-adv-pkg-list">
          {pkg.inclusions.map((item) => (
            <li key={item} className="sbe-mkt-pricefeature">
              <span className="sbe-mkt-pricefeature-name">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sbe-adv-pkg-foot">
        <Link
          href={href}
          className={`btn ${pkg.recommended ? "btn-primary" : "btn-secondary"} sbe-mkt-pricecard-btn`}
        >
          {pkg.cta}
        </Link>
      </div>
    </article>
  );
}
