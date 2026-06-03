/**
 * new-project.mjs — Scaffolds a new ADAPT project.
 *
 * Usage: node scripts/new-project.mjs --name <name>
 *    or: npm run new:project -- --name <name>
 *
 * Creates:
 *   projects/<name>/  folder structure
 *   playwright.config.ts, global-setup.ts, .env.example
 *   pages/BasePage.ts
 *   scripts/testdata/<name>.mjs  (blank test definition file)
 *   data/<Name>_Tests.xlsx       (via update-testbook)
 *   package.json test script entry
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ─── Parse --name argument ────────────────────────────────────────────────────

const nameArg = process.argv.indexOf('--name');
if (nameArg === -1 || !process.argv[nameArg + 1]) {
  console.error('\n❌  Usage: node scripts/new-project.mjs --name <projectname>\n');
  process.exit(1);
}

const name = process.argv[nameArg + 1].toLowerCase().trim();

if (!/^[a-z][a-z0-9-]+$/.test(name)) {
  console.error('\n❌  Project name must be lowercase letters, numbers, or hyphens (e.g. onlinebooking, my-app)\n');
  process.exit(1);
}

const projectDir = path.join(ROOT, 'projects', name);

if (fs.existsSync(projectDir)) {
  console.error(`\n❌  Project already exists: ${projectDir}\n`);
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const label = name.charAt(0).toUpperCase() + name.slice(1);   // e.g. onlinebooking → Onlinebooking
const PORT  = 5173;  // default dev port — user updates in .env

function mkdir(rel) {
  const full = path.join(projectDir, rel);
  fs.mkdirSync(full, { recursive: true });
  return full;
}

function write(rel, content) {
  const full = path.join(projectDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
  return full;
}

function copy(src, rel) {
  const full = path.join(projectDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.copyFileSync(src, full);
  return full;
}

const created = [];
const manual  = [];

// ─── 1. Create folder structure ───────────────────────────────────────────────

console.log(`\n[ADAPT] Scaffolding new project: ${name}\n`);

[
  'pages',
  'tests',
  'data',
  '.auth',
  'screenshots',
].forEach(d => { mkdir(d); });

created.push('projects/' + name + '/  (folder structure)');

// ─── 2. playwright.config.ts ─────────────────────────────────────────────────

write('playwright.config.ts', `import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:${PORT}';

export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  use: {
    baseURL: BASE_URL,
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
  },
  retries: 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  projects: [
    {
      name: 'setup',
      testMatch: /auth\\.setup\\.ts/,
    },
    {
      name: '${name}',
      dependencies: ['setup'],
    },
  ],
});
`);

created.push('projects/' + name + '/playwright.config.ts');

// ─── 3. global-setup.ts ───────────────────────────────────────────────────────

write('global-setup.ts', `import * as dotenv from 'dotenv';
import path from 'path';
import { generateRunId } from '../../core/lib/run-id';
import { cleanupAdaptData } from '../../core/lib/cleanup';

const PROJECT_DIR = __dirname;

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.join(PROJECT_DIR, '.env') });

  const cleanup = process.env.CLEANUP === 'true';

  if (cleanup) {
    const supabaseUrl    = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        '[ADAPT] CLEANUP=true but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env'
      );
    }

    await cleanupAdaptData(supabaseUrl, serviceRoleKey);
  } else {
    console.log('\\n[ADAPT] Cleanup skipped. Pass CLEANUP=true to delete previous run data.');
  }

  generateRunId(PROJECT_DIR);
}
`);

created.push('projects/' + name + '/global-setup.ts');

// ─── 4. .env.example ──────────────────────────────────────────────────────────

write('.env.example', `# Target environment URL
BASE_URL=http://localhost:${PORT}

# Slack webhook for test result notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# Test user credentials — add one pair per role defined in TEST_USERS sheet
# Example:
# TEST_USER_ADMIN_EMAIL=admin@test.${name}.com
# TEST_USER_ADMIN_PASSWORD=

# Supabase connection — used ONLY for cleanup (CLEANUP=true)
# Point this at your TEST/STAGING instance only — NEVER production
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Set to 'true' to delete all ADAPT-tagged data from previous runs before starting
CLEANUP=false

# Environment label written to the RESULTS sheet (local | staging | production)
ENV=local
`);

created.push('projects/' + name + '/.env.example');

// ─── 5. auth setup stub ───────────────────────────────────────────────────────

mkdir('tests/auth');
write('tests/auth/auth.setup.ts', `import path from 'path';
import { runAuthSetup } from '../../../../core/fixtures/auth.setup';

const SPREADSHEET = path.resolve(__dirname, '../../data/${label}_Tests.xlsx');
const AUTH_DIR    = path.resolve(__dirname, '../../.auth');
const ENV_PATH    = path.resolve(__dirname, '../../.env');
const LOGIN_URL   = (process.env.BASE_URL ?? 'http://localhost:${PORT}') + '/login';
//                                                                          ^^^^^^
//                                                   Update this to the correct login route

runAuthSetup(SPREADSHEET, AUTH_DIR, LOGIN_URL, ENV_PATH);
`);

created.push('projects/' + name + '/tests/auth/auth.setup.ts');

// ─── 6. BasePage.ts — copy from happyq ───────────────────────────────────────

const basePageSrc = path.join(ROOT, 'projects', 'happyq', 'pages', 'BasePage.ts');
if (fs.existsSync(basePageSrc)) {
  copy(basePageSrc, 'pages/BasePage.ts');
  created.push('projects/' + name + '/pages/BasePage.ts');
} else {
  console.warn('[ADAPT] Warning: could not find happyq/pages/BasePage.ts to copy');
}

// ─── 7. scripts/testdata/<name>.mjs ──────────────────────────────────────────

const testdataPath = path.join(ROOT, 'scripts', 'testdata', name + '.mjs');
fs.writeFileSync(testdataPath, `/**
 * ${label} test case definitions.
 *
 * Add rows to testControl and e2eTests for each module/screen.
 * After editing, run: npm run update:testbook -- --project ${name}
 *
 * TEST_ID format: MODULE-E2E-001  (e.g. HOME-E2E-001, AUTH-E2E-001)
 * RBA checks:     RBA-MODULE-001  (e.g. RBA-DASH-001)
 */

// ─── TEST_CONTROL ─────────────────────────────────────────────────────────────
// Controls which tests run. RUN: YES | NO per row.

export const testControl = [
  // Add rows here — one per test case
  // { TEST_ID: 'AUTH-E2E-001', MODULE: 'Auth', SCREEN: 'Login', LAYER: 'E2E', PRIORITY: 'P1', RUN: 'YES', NOTES: '' },
];

// ─── E2E_TESTS ────────────────────────────────────────────────────────────────
// Full test case definitions. TEST_DATA is the default — user can override in Excel.

export const e2eTests = [
  // Add rows here — one per test case, TEST_ID must match testControl
  // { TEST_ID: 'AUTH-E2E-001', MODULE: 'Auth', SCREEN: 'Login', TEST_NAME: 'Valid login redirects to app',
  //   USER_ROLE: 'STANDARD', DESCRIPTION: '...', PRECONDITIONS: '...', TEST_DATA: '{}', EXPECTED_RESULT: '...' },
];

// ─── TEST_USERS ───────────────────────────────────────────────────────────────
// One row per role. Add EMAIL_ENV_KEY and PASSWORD_ENV_KEY to .env

export const testUsers = [
  // { ROLE: 'STANDARD', EMAIL_ENV_KEY: 'TEST_USER_STANDARD_EMAIL', PASSWORD_ENV_KEY: 'TEST_USER_STANDARD_PASSWORD' },
];
`, 'utf-8');

created.push('scripts/testdata/' + name + '.mjs');

// ─── 8. Generate Excel via update-testbook ────────────────────────────────────

try {
  execSync(`node scripts/update-testbook.mjs --project ${name}`, {
    cwd: ROOT,
    stdio: 'pipe',
  });
  created.push('projects/' + name + '/data/' + label + '_Tests.xlsx');
} catch (e) {
  console.warn('[ADAPT] Warning: could not generate Excel — run manually: npm run update:testbook -- --project ' + name);
}

// ─── 9. Add npm script to package.json ───────────────────────────────────────

const pkgPath = path.join(ROOT, 'package.json');
const pkg     = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

if (!pkg.scripts[`test:${name}`]) {
  pkg.scripts[`test:${name}`]         = `playwright test --config=projects/${name}/playwright.config.ts`;
  pkg.scripts[`test:${name}:headed`]  = `playwright test --config=projects/${name}/playwright.config.ts --headed`;
  pkg.scripts[`test:${name}:report`]  = `playwright show-report projects/${name}/playwright-report`;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  created.push('package.json  (added test:' + name + ' scripts)');
}

// ─── 10. Print summary ────────────────────────────────────────────────────────

console.log('─'.repeat(60));
console.log(`✅  Project "${name}" scaffolded successfully!\n`);

console.log('📁  Created automatically:');
created.forEach(f => console.log(`    ✔  ${f}`));

console.log(`
📝  Manual steps remaining:
    1. Audit the app screens — routes, headings, buttons, forms, dialogs
    2. Create page objects       →  projects/${name}/pages/<module>/<Screen>Page.ts
    3. Create dialog classes     →  projects/${name}/pages/<module>/dialogs/<Dialog>Dialog.ts
    4. Write test files          →  projects/${name}/tests/<module>/<module>.e2e.ts
    5. Fill in test rows         →  scripts/testdata/${name}.mjs
    6. Update Excel              →  npm run update:testbook -- --project ${name}
    7. Update login route        →  projects/${name}/tests/auth/auth.setup.ts  (check LOGIN_URL)
    8. Fill in credentials       →  projects/${name}/.env  (copy from .env.example)
    9. Add GitHub Actions        →  .github/workflows/  (copy from happyq workflows)

🚀  To run tests:
    npm run test:${name}
    CLEANUP=true npm run test:${name}
`);
