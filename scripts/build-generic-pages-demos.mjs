import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = path.join(repoRoot, "artifacts/hvac-prospect-template");
const manifestPath = path.join(repoRoot, "artifacts/prospect-configs/published-generic-demos.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const restorePaths = [
  "artifacts/hvac-prospect-template/src/App.tsx",
  "artifacts/hvac-prospect-template/index.html",
  "artifacts/hvac-prospect-template/public/robots.txt",
];

const run = (cmd, args, options = {}) => execFileSync(cmd, args, { cwd: repoRoot, stdio: "inherit", ...options });

for (const item of manifest) {
  if (!item?.slug || !item?.route) throw new Error("Each generic Pages demo requires slug and route");
  const outDir = path.join("/tmp/llf-generic-pages", item.route);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  try {
    run("node", ["artifacts/hvac-prospect-template/scripts/apply-prospect-config.mjs", item.slug]);
    run("pnpm", ["--dir", "artifacts/hvac-prospect-template", "run", "typecheck"]);
    run("node", ["artifacts/hvac-prospect-template/scripts/validate-prospect-demo.mjs", item.slug]);
    run("pnpm", ["exec", "vite", "build", "--config", "vite.config.ts"], {
      cwd: templateRoot,
      env: { ...process.env, PORT: "3000", BASE_PATH: `/${item.route}/` },
    });
    fs.cpSync(path.join(templateRoot, "dist/public"), outDir, { recursive: true });
    console.log(`Built and staged generic demo ${item.slug} -> /${item.route}/`);
  } finally {
    run("git", ["checkout", "--", ...restorePaths]);
  }
}
