/**
 * Usage: node scripts/generate-qr.mjs <url> <output.png>
 */
import QRCode from "qrcode";

const [url, output] = process.argv.slice(2);

if (!url || !output) {
  console.error("usage: node scripts/generate-qr.mjs <url> <output.png>");
  process.exit(1);
}

await QRCode.toFile(output, url, {
  width: 720,
  margin: 2,
  color: {
    dark: "#1f2228",
    light: "#fffdf8",
  },
});

console.log("wrote", output);
console.log("url", url);
