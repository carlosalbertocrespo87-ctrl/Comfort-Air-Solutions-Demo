import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'https://localleadforge.com';
const attempts = 12;
const retryMs = 5000;

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

let failures = 0;
for (const [route, company] of targets) {
  const url = `${baseUrl}/${route}/`;
  console.log(`Verifying ${company} -> ${url}`);
  let ok = false;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
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
  if (!ok) {
    console.error(`PUBLIC_VERIFY_FAILED ${company} ${url}`);
    failures += 1;
  }
}

if (failures) {
  console.error(`Public verification failures: ${failures}`);
  process.exit(1);
}
