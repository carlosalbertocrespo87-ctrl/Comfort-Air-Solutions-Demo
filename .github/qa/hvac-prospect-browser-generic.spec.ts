import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const slug = process.env.PROSPECT_SLUG;
if (!slug) throw new Error('PROSPECT_SLUG is required');
const config = JSON.parse(fs.readFileSync(path.resolve(`artifacts/prospect-configs/${slug}.json`), 'utf8'));
const demoUrl = 'http://127.0.0.1:4173/';
const mailerUrl = 'https://local-lead-forge-demo-mailer.localleadforgeagency.workers.dev/**';

test('generic prospect demo passes desktop bilingual lead-flow QA without external side effects', async ({ page }) => {
  await page.route(mailerUrl, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, qaMock: true }) });
  });
  await page.goto(demoUrl, { waitUntil: 'networkidle' });
  await expect(page.getByText(config.shortName).first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive');
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.getByText('Servicios', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByText('Services', { exact: true }).first()).toBeVisible();
  const demoEmail = page.getByTestId('input-demo-email');
  await demoEmail.fill('not-an-email');
  await page.getByTestId('button-demo-start').click();
  await expect(page.getByText('Please enter a valid email.')).toBeVisible();
  await demoEmail.fill('info@localleadforge.com');
  await page.getByTestId('button-demo-start').click();
  await expect(page.getByTestId('widget-chat')).toBeVisible();
  const input = page.getByTestId('input-chat-message');
  const send = page.getByTestId('button-chat-send');
  await input.fill('AC is not cooling'); await send.click();
  await expect(page.getByText('What city or ZIP code is the home in?')).toBeVisible();
  await input.fill(config.serviceArea); await send.click();
  await expect(page.getByText(/When would you ideally like help/)).toBeVisible();
  await input.fill('As soon as possible'); await send.click();
  await expect(page.getByText(/Last step: what is your name and best phone number/)).toBeVisible();
  await input.fill('QA Test 404-555-0101'); await send.click();
  await expect(page.getByText(/Thanks, QA Test\./)).toBeVisible();
  await expect(page.getByText('✅ Demo lead sent to info@localleadforge.com. Check your inbox.')).toBeVisible();
});

test('generic prospect demo passes mobile menu and language QA', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl, { waitUntil: 'networkidle' });
  await page.getByTestId('button-mobile-menu').click();
  await expect(page.getByTestId('link-mobile-services')).toBeVisible();
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.getByText('Idioma', { exact: true })).toBeVisible();
  await expect(page.getByTestId('link-mobile-servicios')).toBeVisible();
});
