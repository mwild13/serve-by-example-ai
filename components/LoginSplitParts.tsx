import Link from "next/link";
import Image from "next/image";

// The brand mark and the right-hand panel of the split sign-in layout,
// shared by /login and /reset-password.

export const BrandMark = () => (
  <Link href="/" className="login-brand">
    <Image src="/logo.webp" alt="" width={36} height={36} className="login-brand-mark" />
    <span className="login-brand-name">Serve By Example</span>
  </Link>
);

const VALUE_POINTS = [
  "Consistent standards across every venue",
  "Track readiness before problems show up",
  "Manage every site from one console",
];

export const RightPanel = () => (
  <aside className="login-split-right">
    <div className="login-visual-text">
      <p className="sbe-mkt-kicker">Hospitality staff training</p>
      <p className="login-visual-headline">
        Floor-ready staff in 6 weeks, not 6 months.
      </p>
      <ul className="login-visual-points">
        {VALUE_POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
    <div className="login-visual-shot">
      <Image
        src="/shots/console-staff.webp"
        alt="Serve By Example management console: the staff list with each person's training progress and whether they are ready for the floor"
        width={2000}
        height={1250}
        sizes="(max-width: 900px) 0px, 900px"
        priority
        className="sbe-shot"
      />
    </div>
  </aside>
);
