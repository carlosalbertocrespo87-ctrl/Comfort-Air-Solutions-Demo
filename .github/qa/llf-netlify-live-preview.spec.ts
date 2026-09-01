import { expect, test } from '@playwright/test';

const baseURL = process.env.LLF_NETLIFY_PREVIEW_URL;
const commitSha = process.env.GITHUB_SHA || 'local';

if (!baseURL) throw new Error('LLF_NETLIFY_PREVIEW_URL is required');

test('live Netlify preview exposes the current LLF candidate with real contact links', async ({ page }) => {
  await page.goto(`${baseURL}/home-preview`, { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: /Convierte Más Tráfico Web de HVAC en Oportunidades Calificadas/i })).toBeVisible();

  await page.getByRole('button', { name: /¿Preguntas\? Consulta a LLF/i }).click();
  await expect(page.getByText('Soporte LLF + contacto directo', { exact: true })).toBeVisible();

  const contactPanel = page.locator('.llf-preview-contact.fixed > div').first();
  await expect(contactPanel).toHaveClass(/max-h-\[calc\(100vh-180px\)\]/);

  const whatsapp = page.getByRole('link', { name: 'WhatsApp' });
  await expect(whatsapp).toBeVisible();
  const whatsappHref = await whatsapp.getAttribute('href');
  expect(whatsappHref).toMatch(/^https:\/\/wa\.me\/\d+$/);
  expect(whatsappHref).not.toContain('15555550123');
  console.log(`LIVE_WHATSAPP=${whatsappHref}`);

  const facebook = page.getByRole('link', { name: /Abrir Local Lead Forge en Facebook/i });
  await expect(facebook).toBeVisible();
  const facebookHref = await facebook.getAttribute('href');
  expect(facebookHref).toMatch(/^https:\/\/(www\.)?facebook\.com\//i);
  expect(facebookHref).not.toContain('example.com');
  console.log(`LIVE_FACEBOOK=${facebookHref}`);

  const instagram = page.getByRole('link', { name: /Abrir Local Lead Forge en Instagram/i });
  await expect(instagram).toBeVisible();
  const instagramHref = await instagram.getAttribute('href');
  expect(instagramHref).toMatch(/^https:\/\/(www\.)?instagram\.com\/localleadforgeagency\/?/i);
  expect(instagramHref).not.toContain('example.com');
  console.log(`LIVE_INSTAGRAM=${instagramHref}`);

  const optionalSocials = page.locator('a[aria-label*="LinkedIn"], a[aria-label*="YouTube"]');
  for (let index = 0; index < await optionalSocials.count(); index += 1) {
    const href = await optionalSocials.nth(index).getAttribute('href');
    expect(href).not.toContain('example.com');
  }
});

test('live Netlify Forms endpoint accepts a synthetic LLF QA submission', async ({ request }) => {
  const marker = `LLF-PREVIEW-QA-${commitSha.slice(0, 8)}`;
  const response = await request.post(`${baseURL}/home-preview`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: {
      'form-name': 'llf-demo-request',
      'bot-field': '',
      source: 'github-live-preview-smoke',
      name: 'LLF QA Synthetic',
      business: marker,
      email: 'qa-preview@localleadforge.com',
      phone: '',
      need: 'Synthetic preview QA only — no customer or prospect action.',
    },
  });

  expect(response.status()).toBeGreaterThanOrEqual(200);
  expect(response.status()).toBeLessThan(300);
  console.log(`NETLIFY_FORM_QA_MARKER=${marker}`);
  console.log(`NETLIFY_FORM_HTTP_STATUS=${response.status()}`);
});
