import { useId } from "react";
import { GLASSES, type GlassId } from "@/lib/pictures/glasses";

// The picture library's renderer (Rich update, Phase 9). A picture is a small
// spec (the glass, the drink, how full, the head), drawn as inline SVG from
// the parts in lib/pictures/. Colours are the --pic-* variables, so the same
// picture suits light desktop and dark mobile. Style rules:
// docs/Rich Update/image-style-sheet.md.

export type DrinkId = "lager";

export type PictureSpec = {
  glass: GlassId;
  drink?: DrinkId;
  /** How full, from 0 (empty) to 1 (to the rim), foam included. */
  fill?: number;
  /** The head, in millimetres, on top of the liquid. */
  headMm?: number;
  /** Overrides the generated alt text. */
  alt?: string;
};

const DRINKS: Record<DrinkId, { name: string; colour: string; bubbles: boolean }> = {
  lager: { name: "lager", colour: "var(--pic-lager)", bubbles: true },
};

const LINE = 2.25;
const FINE = 1.5;

// Rising bubbles, as fractions across and up the liquid. Fixed, so the same
// spec always draws the same picture.
const BUBBLES: [number, number, number][] = [
  [0.3, 0.12, 1.4], [0.42, 0.3, 1.1], [0.62, 0.2, 1.3], [0.7, 0.45, 1],
  [0.36, 0.55, 1.2], [0.55, 0.68, 0.9], [0.66, 0.8, 1.1], [0.46, 0.86, 0.8],
];

export function pictureAlt(spec: PictureSpec): string {
  if (spec.alt) return spec.alt;
  const glass = GLASSES[spec.glass];
  if (!spec.drink || !spec.fill) return `An empty ${glass.name}`;
  const head = spec.headMm ? `, with a ${formatCm(spec.headMm)} head` : "";
  const level = spec.fill >= 0.97 ? "" : spec.fill >= 0.85 ? ", a little short of the rim" : ", well short of the rim";
  return `A ${glass.name} of ${DRINKS[spec.drink].name}${level}${head}`;
}

function formatCm(mm: number): string {
  return `${(mm / 10).toLocaleString("en-AU", { maximumFractionDigits: 1 })} cm`;
}

/** A foam top with a soft, uneven edge, from x1 to x2 at height y. */
function foamTop(x1: number, x2: number, y: number): string {
  const steps = 6;
  const w = (x2 - x1) / steps;
  let d = `M${x1 - 4} ${y + 1.5}`;
  for (let i = 0; i < steps; i++) {
    const x = x1 + w * i;
    d += ` Q${x + w / 2} ${y - (i % 2 === 0 ? 2.2 : 1.2)} ${x + w} ${y + 0.8}`;
  }
  return d;
}

export default function Picture({ spec, className }: { spec: PictureSpec; className?: string }) {
  const id = useId().replace(/:/g, "");
  const glass = GLASSES[spec.glass];
  const drink = spec.drink ? DRINKS[spec.drink] : null;
  const height = glass.bottom - glass.top;
  const fill = drink ? Math.max(0, Math.min(1, spec.fill ?? 0)) : 0;
  const surface = glass.bottom - height * fill;
  const head = drink && fill > 0 ? Math.min((spec.headMm ?? 0) / glass.mmPerUnit, height * fill) : 0;
  const liquidTop = surface + head;
  const alt = pictureAlt(spec);

  return (
    <svg
      className={className ? `pic ${className}` : "pic"}
      viewBox="0 0 120 160"
      role="img"
      aria-label={alt}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{alt}</title>
      <defs>
        <clipPath id={`${id}-bowl`}>
          <path d={glass.bowl} />
        </clipPath>
      </defs>

      <path d={glass.shape} fill="var(--pic-glass)" />

      {drink && fill > 0 && (
        <g clipPath={`url(#${id}-bowl)`}>
          <rect x="0" y={liquidTop} width="120" height={glass.bottom - liquidTop + 1} fill={drink.colour} />
          {drink.bubbles &&
            BUBBLES.filter(([, up]) => glass.bottom - (glass.bottom - liquidTop) * up > liquidTop + 3).map(([across, up, r], i) => (
              <circle
                key={i}
                cx={40 + 40 * across}
                cy={glass.bottom - (glass.bottom - liquidTop) * up}
                r={r}
                fill="var(--pic-bubble)"
              />
            ))}
          {head > 0 && (
            <>
              <rect x="0" y={surface + 1} width="120" height={head} fill="var(--pic-foam)" />
              <path d={`${foamTop(20, 100, surface)} L104 ${surface + head} L16 ${surface + head} Z`} fill="var(--pic-foam)" />
              <path d={foamTop(20, 100, surface)} stroke="var(--pic-line)" strokeWidth={FINE} strokeOpacity="0.45" fill="none" />
              <path d={`M16 ${liquidTop} L104 ${liquidTop}`} stroke="var(--pic-line)" strokeWidth={FINE} strokeOpacity="0.3" />
            </>
          )}
        </g>
      )}

      <path d={glass.shine} stroke="var(--pic-shine)" strokeWidth="3" strokeLinecap="round" fill="none" />
      {glass.lines.map((d) => (
        <path key={d} d={d} stroke="var(--pic-line)" strokeWidth={FINE} fill="none" strokeLinecap="round" />
      ))}
      <path d={glass.shape} fill="none" stroke="var(--pic-line)" strokeWidth={LINE} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
