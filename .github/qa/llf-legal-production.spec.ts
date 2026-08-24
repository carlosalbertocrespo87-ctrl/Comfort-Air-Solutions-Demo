import { test, expect } from '@playwright/test';

const baseURL = process.env.LLF_PRODUCTION_URL || 'https://localleadforge.com';

const legalRoutes = [
  { path: '/privacy/', title: 'Privacy Policy | Local Lead Forge', blockedText: 'Internal release gate active.' },
  { path: '/terms/', title: 'Service Terms | Local Lead Forge', blockedText: 'Internal release gate active.' },
  { path: '/dpa/', title: 'Data Processing Addendum | Local Lead Forge', blockedText: 'Internal release gate active.' },
];

for (const route of legalRoutes) {
  test(`${route.path} remains unreleased and noindex`, async ({ page }) => {
    const response = await page.goto(`${baseURL}${route.path}`, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(route.title);
    await expect(page.getByText(route.blockedText, { exact: false })).toBeVisible();
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/i);
    await expect(robots).toHaveAttribute('content', /nofollow/i);
    await expect(robots).toHaveAttribute('content', /noarchive/i);
  });
}

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
