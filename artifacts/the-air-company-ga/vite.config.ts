import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

const airCompanyProspectTransform: Plugin = {
  name: 'air-company-prospect-transform',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('/src/App.tsx')) return null;

    const replacements: Array<[string, string]> = [
      ['"PROSPECT HVAC COMPANY"', '"The Air Company of GA"'],
      ['"PROSPECT HVAC"', '"The Air Company"'],
      ['"prospectcompany.com"', '"theaircompanyga.com"'],
      ['"(000) 000-0000"', '"(404) 583-7788"'],
      ['"TARGET SERVICE AREA"', '"Metro Atlanta"'],
      ['"20XX"', '"Local & family-owned"'],
      ['`Serving ${prospectConfig.serviceArea} since`', '`Serving ${prospectConfig.serviceArea}`'],
      ['"Kind words"', '"Verified highlights"'],
      ['"Comfortable"', '"Local"'],
      ['"company."', '"HVAC expertise."'],
      ['"Our upstairs was finally comfortable again by dinner. The technician found the issue quickly and took time to show me what he was doing."', '"Local and family-owned, serving residential and commercial HVAC customers across Metro Atlanta."'],
      ['"Marianne R."', '"Company profile"'],
      ['"Decatur, GA"', '"Official website"'],
      ['"MR"', '"GA"'],
      ['"Clear communication, thoughtful diagnosis, and professional HVAC service."', '"Licensed, insured and NATE-certified technicians, with same-day service when available."'],
      ['"Daniel K."', '"Service standards"'],
      ['"East Cobb, GA"', '"Official website"'],
      ['"DK"', '"HV"'],
      ['"The installation team treated our home like it was their own. Quiet, tidy, and our energy bill noticed the difference."', '"Heating and cooling repair, maintenance and installation for homes and businesses."'],
      ['"Priya S."', '"Service coverage"'],
      ['"Brookhaven, GA"', '"Official website"'],
      ['"PS"', '"AC"'],
      ['"Mon–Fri · 8:00am–5:00pm"', '"Call for current availability"'],
      ['"El equipo local de confort del oeste metropolitano de Georgia"', '"El equipo local de confort de Metro Atlanta"'],
      ['"en el oeste metropolitano de Georgia"', '"en Metro Atlanta"'],
      ['"Servicio HVAC confiable en el oeste metropolitano de Georgia. Encontramos la causa del problema y te la explicamos claramente."', '"Servicio HVAC confiable en Metro Atlanta. Encontramos la causa del problema y te la explicamos claramente."'],
      ['"Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia. Si estás cerca y no estás en la lista, llámanos — con gusto conversamos."', '"Nos enorgullece servir comunidades en toda el área metropolitana de Atlanta. Si estás cerca y no estás en la lista, consulta directamente con la empresa para confirmar cobertura actual."'],
      ['"Palabras amables"', '"Datos verificados"'],
      ['"Compañía"', '"Experiencia HVAC"'],
      ['"confortable."', '"local."'],
      ['"Lun–Vie · 8:00am–5:00pm"', '"Llama para confirmar disponibilidad"'],
    ];

    let next = code;
    for (const [from, to] of replacements) {
      next = next.split(from).join(to);
    }

    const originalCities = `        "Atlanta",\n        "Decatur",\n        "Marietta",\n        "Roswell",\n        "Smyrna",\n        "Sandy Springs",\n        "Brookhaven",\n        "Alpharetta",\n        "East Cobb",\n        "Dunwoody",\n        "Vinings",\n        "Tucker",`;
    const verifiedCities = `        "Atlanta",\n        "Sandy Springs",\n        "Marietta",\n        "Alpharetta",\n        "Brookhaven",\n        "Decatur",\n        "Smyrna",\n        "Tucker",\n        "Buckhead",\n        "Morningside",\n        "Virginia-Highland",\n        "Dunwoody",`;
    next = next.replace(originalCities, verifiedCities);

    next = next.replace(
      'import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";',
      'import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";\nimport { SelfClosingFunnel } from "@/components/self-closing-funnel";',
    );
    next = next.replace(
      '      <Footer lang={lang} />',
      '      <SelfClosingFunnel companyName={prospectConfig.companyName} website="theaircompanyga.com" />\n      <Footer lang={lang} />',
    );

    return { code: next, map: null };
  },
  transformIndexHtml(html) {
    return html
      .split('PROSPECT HVAC COMPANY')
      .join('The Air Company of GA')
      .split('Prospect HVAC')
      .join('The Air Company of GA');
  },
};

export default defineConfig({
  base: basePath,
  plugins: [
    airCompanyProspectTransform,
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
