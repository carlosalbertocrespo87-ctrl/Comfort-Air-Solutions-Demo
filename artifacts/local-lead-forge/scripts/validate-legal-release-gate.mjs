import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('artifacts/local-lead-forge/src');
const configPath = path.join(root, 'lib/legal-release.ts');
const startPath = path.join(root, 'pages/start.tsx');
const mainPath = path.join(root, 'main.tsx');

const config = fs.readFileSync(configPath, 'utf8');
const start = fs.readFileSync(startPath, 'utf8');
const main = fs.readFileSync(mainPath, 'utf8');

const failures = [];

const requireMatch = (source, pattern, message) => {
  if (!pattern.test(source)) failures.push(message);
};

requireMatch(config, /export const LEGAL_RELEASED = false;/, 'LEGAL_RELEASED must remain false until explicit launch release.');
requireMatch(config, /setup:\s*""/, 'Setup checkout URL must remain empty before legal release.');
requireMatch(config, /monthly:\s*""/, 'Monthly checkout URL must remain empty before legal release.');
requireMatch(config, /privacy:\s*"\/privacy\/"/, 'Privacy route missing from legal path registry.');
requireMatch(config, /terms:\s*"\/terms\/"/, 'Terms route missing from legal path registry.');
requireMatch(config, /dpa:\s*"\/dpa\/"/, 'DPA route missing from legal path registry.');
requireMatch(config, /start:\s*"\/start\/"/, 'Start route missing from legal path registry.');

requireMatch(start, /const canContinue = LEGAL_RELEASED && checkoutConfigured && accepted;/, 'Checkout must require legal release, configured checkout, and affirmative acceptance.');
requireMatch(start, /checked=\{accepted\}/, 'Acceptance checkbox must be controlled by explicit user state.');
requireMatch(start, /disabled=\{!LEGAL_RELEASED\}/, 'Acceptance checkbox must stay disabled while legal release is false.');
requireMatch(start, /href=\{canContinue \? target : undefined\}/, 'Checkout link must fail closed when release requirements are unmet.');

requireMatch(main, /private:\s*!LEGAL_RELEASED/, 'Legal routes must remain private/noindex until release.');
requireMatch(main, /noindex, nofollow, noarchive/, 'Private legal routes must explicitly use noindex/nofollow/noarchive.');

if (failures.length) {
  console.error('Legal release gate validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Legal release gate validation passed. Release remains fail-closed.');
