/**
 * Generates PWA / desktop icons from one SVG source.
 * Usage: node scripts/generate-icons.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const iconSvg = (scale) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#bd4b32"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <rect x="112" y="128" width="288" height="272" rx="48" fill="#fffdf8"/>
    <path d="M112 176a48 48 0 0 1 48-48h192a48 48 0 0 1 48 48v72H112z" fill="#f4ded7"/>
    <rect x="168" y="100" width="28" height="64" rx="14" fill="#fffdf8"/>
    <rect x="316" y="100" width="28" height="64" rx="14" fill="#fffdf8"/>
    <circle cx="184" cy="256" r="13" fill="#bd4b32" opacity="0.22"/>
    <circle cx="256" cy="256" r="13" fill="#bd4b32" opacity="0.22"/>
    <circle cx="328" cy="256" r="13" fill="#bd4b32" opacity="0.22"/>
    <circle cx="184" cy="318" r="13" fill="#bd4b32" opacity="0.22"/>
    <circle cx="256" cy="318" r="13" fill="#bd4b32" opacity="0.22"/>
    <circle cx="328" cy="318" r="20" fill="#bd4b32"/>
    <circle cx="328" cy="318" r="7" fill="#fffdf8"/>
    <circle cx="184" cy="376" r="13" fill="#bd4b32" opacity="0.22"/>
    <circle cx="256" cy="376" r="13" fill="#bd4b32" opacity="0.22"/>
  </g>
</svg>`;

const svgBuffer = (scale = 1) => Buffer.from(iconSvg(scale));

async function writePng(size, output, scale = 1) {
  await sharp(svgBuffer(scale))
    .resize(size, size, { fit: "contain" })
    .png()
    .toFile(output);
  console.log(`wrote ${output} (${size}x${size})`);
}

mkdirSync("public/icons", { recursive: true });
mkdirSync("build", { recursive: true });

await writePng(192, "public/icons/icon-192.png");
await writePng(512, "public/icons/icon-512.png");
await writePng(512, "public/icons/icon-maskable-512.png", 0.82);
await writePng(180, "public/icons/apple-touch-icon.png");
await writePng(512, "src/app/icon.png");
await writePng(180, "src/app/apple-icon.png");
await writePng(512, "build/icon.png");
await writePng(32, "build/tray.png");

const icoSizes = [16, 32, 48, 64, 128, 256];
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(svgBuffer(1)).resize(size, size, { fit: "contain" }).png().toBuffer(),
  ),
);
const ico = await pngToIco(icoBuffers);
writeFileSync("build/icon.ico", ico);
writeFileSync("src/app/favicon.ico", ico);
console.log("wrote build/icon.ico and src/app/favicon.ico");
