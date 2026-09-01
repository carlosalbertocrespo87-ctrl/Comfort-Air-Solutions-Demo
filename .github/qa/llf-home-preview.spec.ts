import { expect, test } from '@playwright/test';

const baseURL = process.env.LLF_HOME_QA_BASE_URL || 'http://127.0.0.1:4174';

async function interceptDemoSubmission(page: import('@playwright/test').Page) {
  const ok = async (route: import('@playwright/test').Route) => {
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>ok</title>' });
  };

  await page.route('**/llf-form-blueprint.html', ok);
  await page.route('**/home-preview', async (route) => {
    if (route.request().method() === 'POST') await ok(route);
    else await route.continue();
  });
}

test('LLF approved home candidate is bilingual and functional on desktop', async ({ page }) => {
  await page.goto(`${baseURL}/`);

  await expect(page).toHaveTitle(/Local Lead Forge \| HVAC Lead Capture & Follow-Up/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { name: /Convierte Más Tráfico Web de HVAC en Oportunidades Calificadas/i })).toBeVisible();

  for (const id of ['solutions', 'how-it-works', 'pricing', 'results', 'about']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  await expect(page.locator('a[href="#solutions"]')).toHaveCount(1);
  await expect(page.locator('a[href="#how-it-works"]')).toHaveCount(2);
  await expect(page.locator('a[href="#pricing"]')).toHaveCount(1);
  await expect(page.locator('a[href="#results"]')).toHaveCount(1);
  await expect(page.locator('a[href="#about"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: /Turn More HVAC Website Traffic Into Qualified Opportunities/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cambiar a español' })).toBeVisible();

  await page.getByRole('button', { name: /Questions\? Ask LLF/i }).click();
  await expect(page.getByText('LLF support + direct contact', { exact: true })).toBeVisible();
  await expect(page.getByText('LLF Support Assistant', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/15555550123');

  await page.getByPlaceholder('Ask about LLF…').fill('Does the assistant support English and Spanish?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.getByText(/Yes\. The LLF experience is designed for both English and Spanish\./i)).toBeVisible();

  await page.getByRole('button', { name: 'Usar español' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { name: /Convierte Más Tráfico Web de HVAC en Oportunidades Calificadas/i })).toBeVisible();
  await expect(page.getByText('Asistente de Soporte LLF', { exact: true })).toBeVisible();

  await expect(page.getByRole('link', { name: 'Abrir Local Lead Forge en Facebook' })).toHaveAttribute('href', 'https://example.com/facebook');
  await expect(page.getByRole('link', { name: 'Abrir Local Lead Forge en Instagram' })).toHaveAttribute('href', 'https://example.com/instagram');
  await expect(page.getByRole('link', { name: 'Política de Privacidad' })).toHaveAttribute('href', '/privacy');
  await expect(page.getByRole('link', { name: 'Términos del Sitio' })).toHaveAttribute('href', '/terms');

  await interceptDemoSubmission(page);
  await page.getByRole('button', { name: 'Solicitar Demo' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Nombre').fill('QA Carlos');
  await dialog.getByLabel('Negocio').fill('LLF QA HVAC');
  await dialog.getByLabel('Correo').fill('qa@example.com');
  await dialog.getByLabel('Teléfono').fill('5555550123');
  await dialog.getByLabel('¿Qué parte de tu proceso de captación y seguimiento te gustaría mejorar?').fill('Seguimiento de oportunidades');
  await dialog.getByRole('button', { name: 'Enviar Solicitud' }).click();
  await expect(dialog.getByText('Gracias — recibimos tu solicitud.', { exact: true })).toBeVisible();
});

test('private /home-preview route remains noindex and renders the same approved home', async ({ page }) => {
  await page.goto(`${baseURL}/home-preview`);
  await expect(page.getByRole('heading', { name: /Convierte Más Tráfico Web de HVAC en Oportunidades Calificadas/i })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive');
});

test.describe('mobile candidate', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('LLF home, language switch, modal and support stay usable without horizontal overflow', async ({ page }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.getByRole('heading', { name: /Convierte Más Tráfico Web de HVAC en Oportunidades Calificadas/i })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole('button', { name: 'Switch to English' }).click();
    await expect(page.getByRole('heading', { name: /Turn More HVAC Website Traffic Into Qualified Opportunities/i })).toBeVisible();

    await page.getByRole('button', { name: /Request a Demo/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    expect(dialogBox!.width).toBeLessThanOrEqual(390);
    await dialog.getByRole('button', { name: 'Close' }).click();

    await page.getByRole('button', { name: /Questions\? Ask LLF/i }).click();
    await expect(page.getByText('LLF support + direct contact', { exact: true })).toBeVisible();
    const contactOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(contactOverflow).toBeLessThanOrEqual(1);
  });
});
