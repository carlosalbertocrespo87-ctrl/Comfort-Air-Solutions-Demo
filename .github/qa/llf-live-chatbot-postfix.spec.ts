import { expect, test } from '@playwright/test';

test('live LLF chatbot answers generic Spanish prospect inquiry', async ({ page }) => {
  test.setTimeout(150_000);
  let lastConversation = '';

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    await page.goto('https://localleadforge.com/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /¿Preguntas\? Consulta a LLF/i }).click();
    const input = page.getByPlaceholder('Pregunta sobre LLF…');
    await input.fill('hola me gustaria saber mas informacion');
    await page.getByRole('button', { name: 'Enviar pregunta' }).click();
    await page.waitForTimeout(500);

    lastConversation = await page.locator('.llf-preview-contact').innerText().catch(() => page.locator('body').innerText());
    if (/Claro\. Local Lead Forge está diseñado para negocios HVAC y otros servicios locales/i.test(lastConversation)) {
      expect(lastConversation).not.toMatch(/No tengo suficiente información aprobada para responder con seguridad/i);
      console.log(`LIVE_CHATBOT_HOTFIX=PASS attempt=${attempt}`);
      return;
    }

    console.log(`LIVE_CHATBOT_HOTFIX=WAIT attempt=${attempt}`);
    if (attempt < 12) await page.waitForTimeout(5000);
  }

  throw new Error(`Live LLF chatbot did not converge to the approved generic-information answer. Last conversation: ${lastConversation}`);
});
