import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selfRelativePath = "scripts/verify-planned-demo-route-static-access.mjs";
const primaryGuardRelativePath = "scripts/verify-planned-demo-route-safety.mjs";
const executableExtensions = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".sh",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);

function fail(message) {
  throw new Error(`PLANNED_DEMO_ROUTE_STATIC_ACCESS_FAIL ${message}`);
}

function toRepoRelative(fullPath) {
  return path.relative(repoRoot, fullPath).split(path.sep).join("/");
}

function decodeUnicodeEscapes(source) {
  return source
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (match, codePoint) => {
      const value = Number.parseInt(codePoint, 16);
      return Number.isFinite(value) && value <= 0x10ffff ? String.fromCodePoint(value) : match;
    })
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, codePoint) => {
      const value = Number.parseInt(codePoint, 16);
      return Number.isFinite(value) ? String.fromCharCode(value) : match;
    });
}

export function sourceConsumesPlannedDemoRoute(source) {
  const decoded = decodeUnicodeEscapes(source);

  // Catch the direct identifier/string form first.
  if (decoded.includes("plannedDemoRoute")) return true;

  // Collapse simple static property construction such as:
  // config["planned" + "DemoRoute"]
  const collapsed = decoded.replace(/[\s"'`+\[\]().]/g, "");
  if (collapsed.includes("plannedDemoRoute")) return true;

  // Catch common static concat form without trying to execute source.
  if (/["'`]planned["'`]\s*\.\s*concat\(\s*["'`]DemoRoute["'`]\s*\)/.test(decoded)) {
    return true;
  }

  return false;
}

function collectExecutableFiles(directory = repoRoot) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github" && entry.isDirectory()) continue;

    const fullPath = path.join(directory, entry.name);
    const relativePath = toRepoRelative(fullPath);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      files.push(...collectExecutableFiles(fullPath));
      continue;
    }

    if (entry.isSymbolicLink()) {
      fail(`${relativePath}: symbolic executable/source links are not allowed in this safety scan`);
    }

    if (!entry.isFile()) continue;
    if (relativePath === selfRelativePath || relativePath === primaryGuardRelativePath) continue;
    if (!executableExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    files.push({ fullPath, relativePath });
  }

  return files;
}

function runSelfTests() {
  assert.equal(sourceConsumesPlannedDemoRoute("const route = config.demoRoute;"), false);
  assert.equal(sourceConsumesPlannedDemoRoute("const route = config.plannedDemoRoute;"), true);
  assert.equal(sourceConsumesPlannedDemoRoute('const route = config["planned" + "DemoRoute"];'), true);
  assert.equal(sourceConsumesPlannedDemoRoute('const route = config["planned".concat("DemoRoute")];'), true);
  assert.equal(sourceConsumesPlannedDemoRoute(String.raw`const route = config.planned\u0044emoRoute;`), true);
  console.log("PLANNED_DEMO_ROUTE_STATIC_ACCESS_SELF_TEST_PASS cases=5");
}

runSelfTests();

const executableFiles = collectExecutableFiles();
for (const file of executableFiles) {
  const source = fs.readFileSync(file.fullPath, "utf8");
  if (sourceConsumesPlannedDemoRoute(source)) {
    fail(`${file.relativePath}: executable source can statically resolve staging-only planned route access`);
  }
}

console.log(
  `PLANNED_DEMO_ROUTE_STATIC_ACCESS_PASS executable_files_scanned=${executableFiles.length}`,
);
