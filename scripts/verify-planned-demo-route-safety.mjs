import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configsRoot = path.join(repoRoot, "artifacts/prospect-configs");
const manifestPath = path.join(configsRoot, "published-generic-demos.json");
const publicVerifierPath = path.join(repoRoot, "scripts/verify-published-demo-routes.mjs");
const guardRelativePath = "scripts/verify-planned-demo-route-safety.mjs";
const routePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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

const requiredDemoRules = {
  unofficialDemo: true,
  noindex: true,
  noRealServiceRequest: true,
  noFakeReviews: true,
  noClickableProspectPhone: true,
  pricingOrAppointmentPromises: false,
};

function fail(message) {
  throw new Error(`PLANNED_DEMO_ROUTE_SAFETY_FAIL ${message}`);
}

function normalizeRoute(value, field, sourceName) {
  if (typeof value !== "string" || value.trim() !== value || !routePattern.test(value)) {
    fail(`${sourceName}: ${field} must be a non-empty lowercase slug without leading/trailing slashes`);
  }
  return value;
}

function validateDemoRules(config, sourceName) {
  const rules = config.demoRules;
  if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
    fail(`${sourceName}: planned demos require demoRules`);
  }

  for (const [key, expected] of Object.entries(requiredDemoRules)) {
    if (rules[key] !== expected) {
      fail(`${sourceName}: demoRules.${key} must equal ${JSON.stringify(expected)}`);
    }
  }

  if (!Array.isArray(rules.bilingual) || !rules.bilingual.includes("en") || !rules.bilingual.includes("es")) {
    fail(`${sourceName}: demoRules.bilingual must include both en and es`);
  }
}

export function validatePlannedDemoConfigs(records, publishedRoutes = new Set()) {
  const plannedRoutes = new Map();
  let plannedCount = 0;

  for (const record of records) {
    const sourceName = record.sourceName || "unknown-config";
    const config = record.config || {};
    if (config.plannedDemoRoute == null) continue;

    plannedCount += 1;

    if (config.demoRoute != null) {
      fail(`${sourceName}: plannedDemoRoute and demoRoute may not coexist; promotion must be an explicit reviewed state change`);
    }

    const plannedRoute = normalizeRoute(config.plannedDemoRoute, "plannedDemoRoute", sourceName);
    validateDemoRules(config, sourceName);

    if (publishedRoutes.has(plannedRoute)) {
      fail(`${sourceName}: plannedDemoRoute ${plannedRoute} collides with an already published demo route`);
    }

    if (plannedRoutes.has(plannedRoute)) {
      fail(`${sourceName}: plannedDemoRoute ${plannedRoute} duplicates ${plannedRoutes.get(plannedRoute)}`);
    }

    plannedRoutes.set(plannedRoute, sourceName);
  }

  return { plannedCount, plannedRoutes };
}

function loadRepositoryConfigs() {
  return fs
    .readdirSync(configsRoot)
    .filter((name) => name.endsWith(".json") && name !== "published-generic-demos.json")
    .sort()
    .map((name) => ({
      sourceName: name,
      config: JSON.parse(fs.readFileSync(path.join(configsRoot, name), "utf8")),
    }));
}

export function parseLegacyPublicRoutes(source) {
  const legacyBlock = source.match(/const\s+legacy\s*=\s*\[([\s\S]*?)\n\];/);
  if (!legacyBlock) {
    fail("verify-published-demo-routes.mjs legacy route registry could not be parsed; review publication contract before proceeding");
  }

  const routes = new Set();
  const routeEntryPattern = /,\s*["']([a-z0-9]+(?:-[a-z0-9]+)*)["']\s*\]/g;
  for (const match of legacyBlock[1].matchAll(routeEntryPattern)) {
    routes.add(normalizeRoute(match[1], "legacy route", "verify-published-demo-routes.mjs"));
  }

  if (routes.size === 0) {
    fail("verify-published-demo-routes.mjs legacy route registry parsed zero routes; review publication contract before proceeding");
  }

  return routes;
}

function loadPublishedRoutes(records) {
  const verifierSource = fs.readFileSync(publicVerifierPath, "utf8");
  const routes = parseLegacyPublicRoutes(verifierSource);

  for (const record of records) {
    if (record.config.demoRoute == null) continue;
    routes.add(normalizeRoute(record.config.demoRoute, "demoRoute", record.sourceName));
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(manifest)) fail("published-generic-demos.json must remain an array");

  for (const [index, item] of manifest.entries()) {
    if (!item?.route) continue;
    routes.add(normalizeRoute(item.route, "route", `published-generic-demos.json[${index}]`));
  }

  return routes;
}

function toRepoRelative(fullPath) {
  return path.relative(repoRoot, fullPath).split(path.sep).join("/");
}

function collectExecutableFiles(directory = repoRoot) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github") {
      if (entry.isDirectory()) continue;
    }

    const fullPath = path.join(directory, entry.name);
    const relativePath = toRepoRelative(fullPath);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      files.push(...collectExecutableFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (relativePath === guardRelativePath) continue;
    if (!executableExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    files.push({ fullPath, relativePath });
  }

  return files;
}

function assertSourceDoesNotConsumePlannedRoute(relativePath, source) {
  if (source.includes("plannedDemoRoute")) {
    fail(`${relativePath}: executable source must not consume plannedDemoRoute; staging-only routes require explicit promotion to demoRoute`);
  }
}

function assertExecutableSourcesIgnorePlannedRoutes() {
  const files = collectExecutableFiles();
  for (const file of files) {
    assertSourceDoesNotConsumePlannedRoute(file.relativePath, fs.readFileSync(file.fullPath, "utf8"));
  }
  return files.length;
}

function validPlannedConfig(route = "safe-planned-demo") {
  return {
    companyName: "Synthetic Safety Fixture",
    plannedDemoRoute: route,
    demoRules: {
      unofficialDemo: true,
      noindex: true,
      noRealServiceRequest: true,
      noFakeReviews: true,
      noClickableProspectPhone: true,
      bilingual: ["en", "es"],
      pricingOrAppointmentPromises: false,
    },
  };
}

function runSelfTests() {
  assert.deepEqual(
    validatePlannedDemoConfigs([{ sourceName: "valid.json", config: validPlannedConfig() }]).plannedCount,
    1,
  );

  assert.throws(
    () => validatePlannedDemoConfigs([{
      sourceName: "dual-route.json",
      config: { ...validPlannedConfig(), demoRoute: "already-public" },
    }]),
    /may not coexist/,
  );

  assert.throws(
    () => validatePlannedDemoConfigs([{
      sourceName: "unsafe-rules.json",
      config: {
        ...validPlannedConfig(),
        demoRules: { ...validPlannedConfig().demoRules, noindex: false },
      },
    }]),
    /demoRules\.noindex/,
  );

  assert.throws(
    () => validatePlannedDemoConfigs([
      { sourceName: "one.json", config: validPlannedConfig("duplicate-route") },
      { sourceName: "two.json", config: validPlannedConfig("duplicate-route") },
    ]),
    /duplicates/,
  );

  assert.throws(
    () => validatePlannedDemoConfigs(
      [{ sourceName: "collision.json", config: validPlannedConfig("published-route") }],
      new Set(["published-route"]),
    ),
    /collides/,
  );

  assert.throws(
    () => validatePlannedDemoConfigs([{
      sourceName: "invalid-slug.json",
      config: validPlannedConfig("/Invalid Route/"),
    }]),
    /lowercase slug/,
  );

  assert.doesNotThrow(
    () => assertSourceDoesNotConsumePlannedRoute("safe.mjs", "const route = config.demoRoute;"),
  );

  assert.throws(
    () => assertSourceDoesNotConsumePlannedRoute("unsafe.mjs", "const route = config.plannedDemoRoute;"),
    /executable source must not consume plannedDemoRoute/,
  );

  const parsedLegacyRoutes = parseLegacyPublicRoutes(`const legacy = [\n  ["One", "one-demo"],\n  ["Two", "two-demo"],\n];`);
  assert.deepEqual([...parsedLegacyRoutes], ["one-demo", "two-demo"]);

  assert.throws(
    () => parseLegacyPublicRoutes("const somethingElse = [];"),
    /legacy route registry could not be parsed/,
  );

  console.log("PLANNED_DEMO_ROUTE_SELF_TEST_PASS cases=10");
}

runSelfTests();

const records = loadRepositoryConfigs();
const publishedRoutes = loadPublishedRoutes(records);
const result = validatePlannedDemoConfigs(records, publishedRoutes);
const executableFilesScanned = assertExecutableSourcesIgnorePlannedRoutes();

console.log(
  `PLANNED_DEMO_ROUTE_SAFETY_PASS planned=${result.plannedCount} published=${publishedRoutes.size} executable_files_scanned=${executableFilesScanned}`,
);
