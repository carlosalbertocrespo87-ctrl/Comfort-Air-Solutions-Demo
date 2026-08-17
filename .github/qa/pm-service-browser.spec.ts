import { expect, test } from '@playwright/test';

const demoUrl = 'http://127.0.0.1:4173/';
const mailerUrl =
  'https://local-lead-forge-demo-mailer.localleadforgeagency.workers.dev/**';

test('PM Service desktop bilingual demo and lead flow work without external side effects', async ({ page }) => {
  await page.route(mailerUrl, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, qaMock: true }),
    });
  });

  await page.goto(demoUrl, { waitUntil: 'networkidle' });

  await expect(page.getByText('PM Service Company LLC').first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow, noarchive',
  );

  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.getByText('Servicios', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Probar la Demo', { exact: true }).first()).toBeVisible();

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

  await input.fill('Heat pump not keeping up');
  await send.click();
  await expect(page.getByText('What city or ZIP code is the home in?')).toBeVisible();
  await expect(input).toBeEnabled();

  await input.fill('Stonecrest, GA');
  await send.click();
  await expect(page.getByText(/When would you ideally like help/)).toBeVisible();
  await expect(input).toBeEnabled();

  await input.fill('This week');
  await send.click();
  await expect(page.getByText(/Last step: what is your name and best phone number/)).toBeVisible();
  await expect(input).toBeEnabled();

  await input.fill('QA Test 404-555-0101');
  await send.click();

  await expect(page.getByText(/Thanks, QA Test\./)).toBeVisible();
  await expect(
    page.getByText('✅ Demo lead sent to info@localleadforge.com. Check your inbox.'),
  ).toBeVisible();
});

test('PM Service mobile menu and language switch work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl, { waitUntil: 'networkidle' });

  await page.getByTestId('button-mobile-menu').click();
  await expect(page.getByTestId('link-mobile-services')).toBeVisible();
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.getByText('Idioma', { exact: true })).toBeVisible();
  await expect(page.getByTestId('link-mobile-servicios')).toBeVisible();
});
