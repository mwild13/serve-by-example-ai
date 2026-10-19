// Glass parts for the picture library (Rich update, Phase 9). Each glass is
// drawn side-on on a 120 × 160 grid with the ground at y = 150, to the rules
// in docs/Rich Update/image-style-sheet.md. Real proportions: 1 unit is
// about 1.27 mm, so a 155 mm schooner stands 122 units tall.

export type GlassId = "schooner";

export type Glass = {
  id: GlassId;
  /** As staff say it. Used in alt text. */
  name: string;
  /** The outside of the glass, filled with the glass tint and outlined. */
  shape: string;
  /** The inside, closed. The drink, ice and bubbles are clipped to it. */
  bowl: string;
  /** Top and bottom of the inside, for fill levels (0 at the bottom, 1 at the rim). */
  top: number;
  bottom: number;
  /** Extra outlines, such as the top of a thick base. */
  lines: string[];
  /** The left inside wall, where the highlight runs. */
  shine: string;
  /** Millimetres per unit of height, so a 1.2 cm head can be drawn as 1.2 cm. */
  mmPerUnit: number;
};

export const GLASSES: Record<GlassId, Glass> = {
  // 425 ml. Tapers out to the rim, with a heavy base.
  schooner: {
    id: "schooner",
    name: "schooner",
    shape: "M31 28 L40 150 L80 150 L89 28 Z",
    bowl: "M33.4 28 L41.6 141 L78.4 141 L86.6 28 Z",
    top: 28,
    bottom: 141,
    lines: ["M41.6 141 L78.4 141"],
    shine: "M38.5 40 L44.5 126",
    mmPerUnit: 155 / 122,
  },
};
