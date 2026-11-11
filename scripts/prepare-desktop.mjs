/**
 * Copies the assets that Next.js standalone does not include by itself.
 * Run after `next build`.
 */
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const standalone = ".next/standalone";
const entry = join(standalone, "server.js");

if (!existsSync(entry)) {
  throw new Error(
    `未找到 ${entry}。请确认 next.config.ts 已设置 output: "standalone" 并先运行 npm run build。`,
  );
}

const copies = [
  [".next/static", join(standalone, ".next", "static")],
  ["public", join(standalone, "public")],
];

for (const [from, to] of copies) {
  if (!existsSync(from)) {
    console.warn(`skip missing ${from}`);
    continue;
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`copied ${from} -> ${to}`);
}

console.log("desktop server folder is ready:", standalone);
