import { test, expect } from '@playwright/test';

const baseURL = process.env.LLF_PRODUCTION_URL || 'https://localleadforge.com';

const publicLegalRoutes = [
  {
    path: '/privacy/',
    title: 'Privacy Policy | Local Lead Forge',
    heading: 'Privacy Policy / Política de Privacidad',
    englishMarker: 'Information we collect',
    spanishMarker: 'Información que recopilamos',
  },
  {
    path: '/terms/',
    title: 'Website Terms | Local Lead Forge',
    heading: 'Website Terms / Términos del Sitio',
    englishMarker: 'Website purpose',
    spanishMarker: 'Propósito del sitio',
  },
];

for (const route of publicLegalRoutes) {
  test(`${route.path} exposes the current bilingual public legal page`, async ({ page }) => {
    const response = await page.goto(`${baseURL}${route.path}`, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(route.title);
    await expect(page.getByRole('heading', { name: route.heading, level: 1 })).toBeVisible();
    await expect(page.getByText(route.englishMarker, { exact: true })).toBeVisible();
    await expect(page.getByText(route.spanishMarker, { exact: true })).toBeVisible();
    await expect(page.getByText('Internal release gate active.', { exact: false })).toHaveCount(0);
    await expect(page.getByText('Version: 2026-09-01', { exact: true })).toBeVisible();
    await expect(page.getByText('Effective: September 1, 2026', { exact: true })).toBeVisible();
  });
}

test('/dpa/ remains unreleased and noindex', async ({ page }) => {
  const response = await page.goto(`${baseURL}/dpa/`, { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle('Data Processing Addendum | Local Lead Forge');
  await expect(page.getByText('Internal release gate active.', { exact: false })).toBeVisible();
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute('content', /noindex/i);
  await expect(robots).toHaveAttribute('content', /nofollow/i);
  await expect(robots).toHaveAttribute('content', /noarchive/i);
});

test('/start/ remains fail-closed in production', async ({ page }) => {
  const response = await page.goto(`${baseURL}/start/`, { waitUntil: 'networkidle' });
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle('Review & Accept | Local Lead Forge');
  await expect(page.getByText('Checkout release is intentionally locked', { exact: false })).toBeVisible();

  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute('content', /noindex/i);
  await expect(robots).toHaveAttribute('content', /nofollow/i);
  await expect(robots).toHaveAttribute('content', /noarchive/i);

  const checkbox = page.locator('input[type="checkbox"]');
  await expect(checkbox).not.toBeChecked();
  await expect(checkbox).toBeDisabled();

  // An anchor without href is intentionally absent from the accessibility
  // tree's link role while checkout is locked. Select the rendered control
  // directly so the gate verifies the fail-closed attributes themselves.
  const continueControl = page.locator('a').filter({ hasText: 'Continue to secure payment' });
  await expect(continueControl).toHaveCount(1);
  await expect(continueControl).toHaveAttribute('aria-disabled', 'true');
  await expect(continueControl).not.toHaveAttribute('href', /.+/);
});
