import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local headless-browser probes and screenshots.
    ".shots/**",
    // Electron main process (CommonJS runtime, not bundled by Next).
    "electron/**",
    // electron-builder output (includes a bundled Next server).
    "release/**",
    // CommonJS build hooks.
    "scripts/**/*.cjs",
  ]),
]);

export default eslintConfig;
