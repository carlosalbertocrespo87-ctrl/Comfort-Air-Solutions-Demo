import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;
if (!rawPort) throw new Error('PORT environment variable is required but was not provided.');
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);
const basePath = process.env.BASE_PATH;
if (!basePath) throw new Error('BASE_PATH environment variable is required but was not provided.');

const prospectTransform: Plugin = {
  name: 'ar-sims-prospect-transform',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('/src/App.tsx')) return null;
    const replacements: Array<[string, string]> = [
      ['      body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable.",','      copy: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable.",'],
      ['      answerPlaceholder: "Type your answer...",','      placeholderAnswer: "Type your answer...",'],
      ['      closeNote:\n        "You can close this window — your summary is ready for the team.",','      doneNote:\n        "You can close this window — your summary is ready for the team.",'],
      ['      talk: "Talk to us",\n      hours: "Mon–Fri · 8:00am–5:00pm",','      talk: "Talk to us",\n      phone: prospectConfig.phoneDisplay,\n      hours: "Mon–Fri · 8:00am–5:00pm",'],
      ['"PROSPECT HVAC COMPANY"','"A.R. Sims Heating & Air Conditioning Inc."'],
      ['"PROSPECT HVAC"','"A.R. Sims HVAC"'],
      ['"prospectcompany.com"','"arsimshvac.com"'],
      ['"(000) 000-0000"','"770-545-8530"'],
      ['"TARGET SERVICE AREA"','"Gwinnett County & Metro Atlanta"'],
      ['"20XX"','"30+ years of HVAC experience"'],
      ['`Serving ${prospectConfig.serviceArea} since`','`Serving ${prospectConfig.serviceArea}`'],
      ['"Kind words"','"Verified highlights"'],
      ['"Comfortable"','"Experienced"'],
      ['"company."','"HVAC craftsmanship."'],
      ['"Our upstairs was finally comfortable again by dinner. The technician found the issue quickly and took time to show me what he was doing."','"Family-owned and operated in Lawrenceville, serving Gwinnett County and the surrounding Metro Atlanta area."'],
      ['"Marianne R."','"Company profile"'], ['"Decatur, GA"','"Official website"'], ['"MR"','"AR"'],
      ['"Clear communication, thoughtful diagnosis, and professional HVAC service."','"Licensed for residential and commercial HVAC work, with more than 30 years of industry experience."'],
      ['"Daniel K."','"Service standards"'], ['"East Cobb, GA"','"Official website"'], ['"DK"','"HV"'],
      ['"The installation team treated our home like it was their own. Quiet, tidy, and our energy bill noticed the difference."','"Residential and commercial heating, cooling, heat-pump, furnace and indoor-air-quality services."'],
      ['"Priya S."','"Service coverage"'], ['"Brookhaven, GA"','"Official website"'], ['"PS"','"AC"'],
      ['"El equipo local de confort del oeste metropolitano de Georgia"','"El equipo local de confort de Gwinnett y Metro Atlanta"'],
      ['"en el oeste metropolitano de Georgia"','"en Gwinnett y Metro Atlanta"'],
      ['"Servicio HVAC confiable en el oeste metropolitano de Georgia. Encontramos la causa del problema y te la explicamos claramente."','"Servicio HVAC confiable en Gwinnett y Metro Atlanta. Encontramos la causa del problema y te la explicamos claramente."'],
      ['"Palabras amables"','"Datos verificados"'], ['"Compañía"','"Experiencia HVAC"'], ['"confortable."','"local."'],
    ];
    let next = code;
    for (const [from, to] of replacements) next = next.split(from).join(to);
    next = next.replace(
      'import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";',
      'import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";\nimport { SelfClosingFunnel } from "@/components/self-closing-funnel";',
    );
    next = next.replace(
      '      <Footer lang={lang} />',
      '      <SelfClosingFunnel companyName={prospectConfig.companyName} website="arsimshvac.com" />\n      <Footer lang={lang} />',
    );
    return { code: next, map: null };
  },
  transformIndexHtml(html) {
    return html.split('PROSPECT HVAC COMPANY').join('A.R. Sims Heating & Air Conditioning Inc.').split('Prospect HVAC').join('A.R. Sims HVAC');
  },
};

export default defineConfig({
  base: basePath,
  plugins: [prospectTransform, react(), tailwindcss(), runtimeErrorOverlay(), ...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined ? [await import('@replit/vite-plugin-cartographer').then((m) => m.cartographer({ root: path.resolve(import.meta.dirname, '..') })), await import('@replit/vite-plugin-dev-banner').then((m) => m.devBanner())] : [])],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src'), '@assets': path.resolve(import.meta.dirname, '..', '..', 'attached_assets') }, dedupe: ['react', 'react-dom'] },
  root: path.resolve(import.meta.dirname),
  build: { outDir: path.resolve(import.meta.dirname, 'dist/public'), emptyOutDir: true },
  server: { port, strictPort: true, host: '0.0.0.0', allowedHosts: true, fs: { strict: true } },
  preview: { port, host: '0.0.0.0', allowedHosts: true },
});
