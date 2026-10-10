/**
 * scripts/optimize-images.mjs
 *
 * Converts a PNG or JPG in public/ to a right-sized WebP next to it.
 * Production does not resize images (/_next/image returns the original file
 * on Cloudflare Pages), so the file in public/ is what every visitor downloads.
 *
 * Usage:
 *   node scripts/optimize-images.mjs <max-width> <quality> <file> [<file> ...]
 *   node scripts/optimize-images.mjs 2000 82 "public/shots/New Shot.png"
 *
 * Writes <file>.webp, never enlarges, and leaves the original in place.
 * Delete the original and point the code at the .webp once it looks right.
 * Rule of thumb for max-width: twice the widest size the image is shown at.
 */

import { statSync } from "node:fs";
import sharp from "sharp";

const [maxWidth, quality, ...files] = process.argv.slice(2);
if (!Number(maxWidth) || !Number(quality) || files.length === 0) {
  console.error("Usage: node scripts/optimize-images.mjs <max-width> <quality> <file> [<file> ...]");
  process.exit(1);
}

for (const file of files) {
  const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
  if (out === file) {
    console.error(`skip ${file}: not a PNG or JPG`);
    continue;
  }
  const info = await sharp(file)
    .resize({ width: Number(maxWidth), withoutEnlargement: true })
    .webp({ quality: Number(quality), effort: 6 })
    .toFile(out);
  const before = statSync(file).size;
  console.log(`${(before / 1000).toFixed(0)}K -> ${(info.size / 1000).toFixed(0)}K  ${info.width}x${info.height}  ${out}`);
}
