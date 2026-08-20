import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'https://localleadforge.com';
const attempts = 12;
const retryMs = 5000;
const reportPath = process.env.LLF_PUBLIC_DEMO_REPORT || 'qa-artifacts/public-demo-verification.json';

const legacy = [
  ['PM Service Company LLC', 'pm-service-company-demo'],
  ['AB Refrigeration Heating & Cooling LLC', 'ab-refrigeration-demo'],
  ["Bob's Heating & Air", 'bobs-heating-air-demo'],
  ['Pro Cool Heating And Air', 'pro-cool-heating-air-demo'],
  ['Stinos Heating & Air Services LLC', 'stinos-heating-air-demo'],
  ['Atlanta North Cooling and Heating Inc', 'atlanta-north-cooling-heating-demo'],
  ['Affordable Air Repair Inc.', 'affordable-air-repair-demo'],
];

const generic = fs.readdirSync('artifacts/prospect-configs')
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(fs.readFileSync(path.join('artifacts/prospect-configs', name), 'utf8')))
  .filter((config) => config.demoRoute)
  .map((config) => [config.companyName, config.demoRoute]);

const targets = new Map([...legacy, ...generic].map(([company, route]) => [route, company]));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url) {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) return '';
    return await response.text();
  } catch {
    return '';
  }
}

const results = [];
let failures = 0;

for (const [route, company] of targets) {
  const url = `${baseUrl}/${route}/`;
  console.log(`Verifying ${company} -> ${url}`);
  let ok = false;
  let attemptsUsed = 0;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    attemptsUsed = attempt;
    const [html, robots] = await Promise.all([
      fetchText(url),
      fetchText(`${url}robots.txt`),
    ]);
    const normalized = html.toLowerCase();
    if (
      html &&
      normalized.includes('<title>') &&
      normalized.includes('noindex') &&
      robots.includes('Disallow: /')
    ) {
      ok = true;
      break;
    }
    if (attempt < attempts) await sleep(retryMs);
  }

  results.push({
    company,
    route,
    url,
    status: ok ? 'PASS' : 'FAIL',
    checks: {
      htmlReachableAndHasTitle: ok,
      noindexPresent: ok,
      robotsDisallowAllPresent: ok,
    },
    attemptsUsed,
  });

  if (!ok) {
    console.error(`PUBLIC_VERIFY_FAILED ${company} ${url}`);
    failures += 1;
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  repository: process.env.GITHUB_REPOSITORY || null,
  commitSha: process.env.GITHUB_SHA || null,
  workflowRunId: process.env.GITHUB_RUN_ID || null,
  baseUrl,
  totalRoutes: results.length,
  passedRoutes: results.filter((result) => result.status === 'PASS').length,
  failedRoutes: failures,
  overallStatus: failures === 0 ? 'PASS' : 'FAIL',
  results,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`PUBLIC_DEMO_REPORT ${reportPath} ${report.overallStatus} ${report.passedRoutes}/${report.totalRoutes}`);

if (failures) {
  console.error(`Public verification failures: ${failures}`);
  process.exit(1);
}
