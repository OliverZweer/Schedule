const fs = require("node:fs");
const path = require("node:path");

/**
 * electron-builder ignores node_modules in extraResources, but the bundled
 * Next.js standalone server needs them. Copy them after packing, before the
 * NSIS/DMG artifact is built.
 */
module.exports = async function afterPack(context) {
  const source = path.join(
    context.packager.projectDir,
    ".next",
    "standalone",
    "node_modules",
  );
  const resourcesDir =
    context.packager.platform.name === "mac"
      ? path.join(context.appOutDir, "Contents", "Resources")
      : path.join(context.appOutDir, "resources");
  const target = path.join(resourcesDir, "app-server", "node_modules");

  if (!fs.existsSync(source)) {
    throw new Error(`[afterPack] missing standalone node_modules: ${source}`);
  }

  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });
  console.log(`[afterPack] copied standalone node_modules -> ${target}`);
};
