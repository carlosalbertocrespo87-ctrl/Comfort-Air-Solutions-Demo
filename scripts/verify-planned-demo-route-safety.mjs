import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configsRoot = path.join(repoRoot, "artifacts/prospect-configs");
const manifestPath = path.join(configsRoot, "published-generic-demos.json");
const routePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const publicConsumers = [
  "scripts/build-generic-pages-demos.mjs",
  "scripts/verify-published-demo-routes.mjs",
  ".github/workflows/local-lead-forge-pages.yml",
];

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

function loadPublishedRoutes(records) {
  const routes = new Set();

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

function assertPublicationConsumersIgnorePlannedRoutes() {
  for (const relativePath of publicConsumers) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
    if (source.includes("plannedDemoRoute")) {
      fail(`${relativePath}: public build/verification path must not consume plannedDemoRoute`);
    }
  }
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

  console.log("PLANNED_DEMO_ROUTE_SELF_TEST_PASS cases=6");
}

runSelfTests();

const records = loadRepositoryConfigs();
const publishedRoutes = loadPublishedRoutes(records);
const result = validatePlannedDemoConfigs(records, publishedRoutes);
assertPublicationConsumersIgnorePlannedRoutes();

console.log(
  `PLANNED_DEMO_ROUTE_SAFETY_PASS planned=${result.plannedCount} published=${publishedRoutes.size} consumers=${publicConsumers.length}`,
);
