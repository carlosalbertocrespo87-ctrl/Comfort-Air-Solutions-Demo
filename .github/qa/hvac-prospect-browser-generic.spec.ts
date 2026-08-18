import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const slug = process.env.PROSPECT_SLUG;
if (!slug) throw new Error('PROSPECT_SLUG is required');

const config = JSON.parse(
  fs.readFileSync(path.resolve(`artifacts/prospect-configs/${slug}.json`), 'utf8'),
);
const demoUrl = 'http://127.0.0.1:4173/';

const configuredServices = Array.isArray(config.primaryServices) && config.primaryServices.length
  ? config.primaryServices
  : Array.isArray(config.verifiedServices) && config.verifiedServices.length
    ? config.verifiedServices
    : ['AC not cooling', 'Heating issue', 'Maintenance', 'New system'];
const firstConfiguredService = String(configuredServices[0]);

test('generic private demo passes desktop visual and bilingual assistant QA', async ({ page }) => {
  await page.goto(demoUrl, { waitUntil: 'networkidle' });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow, noarchive',
  );
  await expect(page.getByText(`Prepared for ${config.companyName}`, { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /A Better Way to Turn Website Visitors Into Qualified HVAC Leads/i }),
  ).toBeVisible();
  await expect(page.getByText('Captured Lead', { exact: true })).toBeVisible();
  await expect(page.getByText('Founding Client Offer', { exact: true })).toBeVisible();
  await expect(page.getByText('Your Potential Results with Local Lead Forge')).toBeVisible();

  const assistant = page.locator('#assistant');
  await expect(assistant).toBeVisible();
  await assistant.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(assistant.getByText(new RegExp(`Asistente IA de ${config.shortName}`))).toBeVisible();
  await assistant.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(assistant.getByText(new RegExp(`${config.shortName} AI Assistant`))).toBeVisible();

  await assistant.getByRole('button', { name: firstConfiguredService, exact: true }).click();
  await expect(assistant.getByText(firstConfiguredService, { exact: true })).toHaveCount(2);
  await assistant.getByRole('button', { name: 'Today if possible', exact: true }).click();
  await expect(assistant.getByRole('button', { name: /Lead ready for the team/i })).toBeVisible();
});

test('generic private demo stays usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl, { waitUntil: 'networkidle' });

  await expect(page.getByText(new RegExp(`Private concept demo prepared for ${config.companyName}`, 'i'))).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /A Better Way to Turn Website Visitors Into Qualified HVAC Leads/i }),
  ).toBeVisible();
  await expect(page.locator('#assistant')).toBeVisible();
  await expect(page.getByText('Captured Lead', { exact: true })).toBeVisible();
});
