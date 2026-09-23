// Client-side canvas compositor for the Photo Upload + Background Removal
// feature (replaces the old face-swap pipeline's server-side generation).
// A subject cutout (transparent PNG, from a data: URI returned by
// app/api/profile-photo/remove-background) is layered onto one of 4 fixed
// hospitality background photos. Pure module, no React — PhotoUploadScreen
// owns state and calls into this.
//
// Instant style switching: the caller decodes the cutout once and preloads
// all 4 backgrounds via Promise.all as soon as background removal finishes.
// Switching styles is just calling drawComposite() again with a different
// already-loaded background image — synchronous, no network call.

export const COMPOSITE_SIZE = 1024;

export type BackgroundStyleId = "cocktail-lounge" | "hotel-lobby" | "wine-cellar" | "rooftop-bar";

export const BACKGROUND_STYLES: { id: BackgroundStyleId; label: string; src: string }[] = [
  { id: "cocktail-lounge", label: "Cocktail Lounge", src: "/mobile/Backgrounds-ai/ai-style-cocktail-lounge.png" },
  { id: "hotel-lobby", label: "Hotel Lobby", src: "/mobile/Backgrounds-ai/ai-style-hotel-lobby.png" },
  { id: "wine-cellar", label: "Wine Cellar", src: "/mobile/Backgrounds-ai/ai-style-wine-cellar.png" },
  { id: "rooftop-bar", label: "Rooftop Bar", src: "/mobile/Backgrounds-ai/ai-style-rooftop-bar.png" },
];

/** Decodes an image URL (same-origin static asset or a data: URI) into an
 *  HTMLImageElement. Neither source is ever cross-origin-network-loaded in
 *  this feature, so no crossOrigin handling is needed — see
 *  remove-background/route.ts's sync_mode note for why the cutout is
 *  always a data: URI, never a fal.media URL. */
export function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 64)}`));
    img.src = src;
  });
}

/** Cover-fit draw: scales `img` to fill `size`×`size` (cropping overflow),
 *  centered, matching CSS `object-fit: cover` on a square container. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, size: number): void {
  const scale = Math.max(size / img.width, size / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const dx = (size - drawWidth) / 2;
  const dy = (size - drawHeight) / 2;
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
}

/**
 * Draws the full composite onto `canvas`: background (cover-fit) → vignette
 * (multiply blend, background only) → subject cutout (1:1, already
 * COMPOSITE_SIZE-square from the crop-lock step) → a subtle warm glow
 * (soft-light blend) to unify lighting between the two source images.
 * Synchronous — safe to call on every style-swatch tap.
 */
export function drawComposite(
  canvas: HTMLCanvasElement,
  background: HTMLImageElement,
  cutout: HTMLImageElement,
): void {
  canvas.width = COMPOSITE_SIZE;
  canvas.height = COMPOSITE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, COMPOSITE_SIZE, COMPOSITE_SIZE);

  // 1. Background, cover-fit.
  ctx.globalCompositeOperation = "source-over";
  drawCover(ctx, background, COMPOSITE_SIZE);

  // 2. Vignette — darkens the background's edges only, applied before the
  // subject is drawn so it never dims the cutout itself.
  ctx.globalCompositeOperation = "multiply";
  const vignette = ctx.createRadialGradient(
    COMPOSITE_SIZE / 2, COMPOSITE_SIZE / 2, COMPOSITE_SIZE * 0.35,
    COMPOSITE_SIZE / 2, COMPOSITE_SIZE / 2, COMPOSITE_SIZE * 0.72,
  );
  vignette.addColorStop(0, "rgba(255,255,255,1)");
  vignette.addColorStop(1, "rgba(120,110,95,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, COMPOSITE_SIZE, COMPOSITE_SIZE);

  // 3. Subject cutout, 1:1 — already square from the client's crop-lock
  // step, drawn to exactly fill the canvas with no further scaling math.
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(cutout, 0, 0, COMPOSITE_SIZE, COMPOSITE_SIZE);

  // 4. Subtle warm glow across the whole frame to soften the seam between
  // the two source images' independent lighting. Low opacity — this is a
  // unifying tint, not a visible effect on its own.
  ctx.globalCompositeOperation = "soft-light";
  const glow = ctx.createRadialGradient(
    COMPOSITE_SIZE / 2, COMPOSITE_SIZE * 0.4, 0,
    COMPOSITE_SIZE / 2, COMPOSITE_SIZE * 0.4, COMPOSITE_SIZE * 0.75,
  );
  glow.addColorStop(0, "rgba(255,214,150,0.35)");
  glow.addColorStop(1, "rgba(255,214,150,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, COMPOSITE_SIZE, COMPOSITE_SIZE);

  ctx.globalCompositeOperation = "source-over";
}

/** Exports the canvas as a WebP blob at 0.8 quality — not higher. A
 *  1024×1024 WebP at 0.8 typically lands ~150-300KB raw; base64 (Step 5's
 *  save-route payload) inflates that by ~33%, and this quality setting is
 *  what keeps that comfortably under serverless request-body limits. Do not
 *  raise it without re-checking payload size. */
export function exportCompositeBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export composite image."))),
      "image/webp",
      0.8,
    );
  });
}
