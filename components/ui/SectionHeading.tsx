type Props = {
  eyebrow?: string;
  title: string;
  copy?: string;
  /** Section headers default to left-aligned (Pages-Redesign.md §2.2).
   *  Reserve 'center' for genuinely climactic moments, not as a default. */
  align?: 'left' | 'center';
};

export default function SectionHeading({ eyebrow, title, copy, align = 'left' }: Props) {
  return (
    <div className={align === 'center' ? 'section-header center' : 'section-header'}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}
