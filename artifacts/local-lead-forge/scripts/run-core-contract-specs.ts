import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(here, '..', 'src');
const contractDirs = [path.join(srcRoot, 'ai'), path.join(srcRoot, 'lib')];

const unhandledRejections: unknown[] = [];
process.on('unhandledRejection', (reason) => {
  unhandledRejections.push(reason);
  console.error('Unhandled rejection from contract spec:', reason);
});

async function discoverSpecs(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.spec.ts'))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

const specs = (await Promise.all(contractDirs.map(discoverSpecs))).flat().sort();

if (specs.length < 10) {
  throw new Error(`Expected the LLF core contract suite, but discovered only ${specs.length} spec files.`);
}

let invokedExportedContracts = 0;

for (const specPath of specs) {
  const relative = path.relative(path.resolve(here, '..'), specPath).replaceAll(path.sep, '/');
  console.log(`Running ${relative}`);

  // Importing executes module-level assertions/IIFEs used by the newer specs.
  const moduleExports = await import(pathToFileURL(specPath).href);

  // Older framework-free specs export run* functions instead of invoking them.
  // Explicitly execute those exports so a successful import cannot create a false-green test.
  for (const [name, value] of Object.entries(moduleExports)) {
    if (!/^run[A-Z0-9_]/.test(name) || typeof value !== 'function') continue;
    invokedExportedContracts += 1;
    await (value as () => unknown | Promise<unknown>)();
    console.log(`  executed export ${name}`);
  }
}

// Give intentionally fire-and-forget async spec IIFEs one event-loop turn to settle
// and surface unhandled failures before the process can report success.
await new Promise<void>((resolve) => setTimeout(resolve, 25));

if (unhandledRejections.length > 0) {
  throw new Error(`${unhandledRejections.length} LLF contract spec promise(s) rejected.`);
}

console.log(`LLF CORE CONTRACT SPECS PASSED: ${specs.length} files, ${invokedExportedContracts} exported run* contract(s) invoked.`);
