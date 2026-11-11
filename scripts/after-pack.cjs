const fs = require("node:fs");
const path = require("node:path");

/**
 * electron-builder ignores node_modules in extraResources, but the bundled
 * Next.js standalone server needs them. Copy them after packing, before the
 * NSIS/DMG artifact is built.
 *
 * Use process.platform (win32 / darwin / linux) instead of the builder's
 * platform name: on macOS it has been reported as both "mac" and "darwin".
 */
module.exports = async function afterPack(context) {
  const source = path.join(
    context.packager.projectDir,
    ".next",
    "standalone",
    "node_modules",
  );

  const isMac = process.platform === "darwin";
  const resourcesDir = isMac
    ? path.join(context.appOutDir, "Contents", "Resources")
    : path.join(context.appOutDir, "resources");
  const appServerDir = path.join(resourcesDir, "app-server");
  const target = path.join(appServerDir, "node_modules");

  if (!fs.existsSync(source)) {
    throw new Error(`[afterPack] missing standalone node_modules: ${source}`);
  }
  if (!fs.existsSync(path.join(appServerDir, "server.js"))) {
    throw new Error(
      `[afterPack] app-server/server.js not found at ${appServerDir}`,
    );
  }

  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });

  if (!fs.existsSync(path.join(target, "next", "package.json"))) {
    throw new Error(
      `[afterPack] failed to copy node_modules/next into ${target}`,
    );
  }

  console.log(`[afterPack] copied standalone node_modules -> ${target}`);
};
