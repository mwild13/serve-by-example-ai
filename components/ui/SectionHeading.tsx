type Props = {
  eyebrow?: string;
  title: string;
  copy: string;
};

export default function SectionHeading({ eyebrow, title, copy }: Props) {
  return (
    <div className="section-header">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}