/**
 * check-prereqs.mjs — Validates that the environment is ready to run ADAPT.
 *
 * Checks:
 *   ✅ Node.js version >= 18
 *   ✅ @playwright/test installed
 *   ✅ Chromium browser binary exists
 *   ✅ Project .env.local exists (if --project passed)
 *   ✅ App is reachable at BASE_URL (if --project passed)
 *   ✅ Auth sessions exist (if --project passed)
 *   ⚠️  Docker running (optional — only needed for local Supabase)
 *
 * Usage:
 *   node scripts/check-prereqs.mjs                     # framework-level checks only
 *   node scripts/check-prereqs.mjs --project happyq    # + project-level checks
 *   node scripts/check-prereqs.mjs --project happyq --fix  # attempt auto-fixes
 */

import fs      from 'fs';
import path    from 'path';
import http    from 'http';
import https   from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, '..');

const projectArg = process.argv.indexOf('--project');
const project    = projectArg !== -1 ? process.argv[projectArg + 1] : null;
const autoFix    = process.argv.includes('--fix');

const results = [];
let   hasError = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pass(label, detail = '') {
  results.push({ icon: '✅', label, detail, level: 'pass' });
}
function warn(label, detail = '', fix = '') {
  results.push({ icon: '⚠️ ', label, detail, fix, level: 'warn' });
}
function fail(label, detail = '', fix = '') {
  results.push({ icon: '❌', label, detail, fix, level: 'fail' });
  hasError = true;
}

function run(cmd) {
  try { return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim(); }
  catch { return null; }
}

async function reachable(url, timeoutMs = 5000) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    try {
      const req = mod.get(url, { timeout: timeoutMs }, res => {
        resolve(res.statusCode < 500);
        res.destroy();
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    } catch { resolve(false); }
  });
}

// ─── 1. Node.js version ───────────────────────────────────────────────────────

const nodeVersion = process.version;  // e.g. "v22.1.0"
const nodeMajor   = parseInt(nodeVersion.slice(1).split('.')[0]);
if (nodeMajor >= 18) {
  pass(`Node.js ${nodeVersion}`, 'v18+ required');
} else {
  fail(`Node.js ${nodeVersion}`, 'v18 or higher is required', 'Download from https://nodejs.org');
}

// ─── 2. @playwright/test installed ───────────────────────────────────────────

const pwPkg = path.join(ROOT, 'node_modules', '@playwright', 'test', 'package.json');
if (fs.existsSync(pwPkg)) {
  const { version } = JSON.parse(fs.readFileSync(pwPkg, 'utf-8'));
  pass(`@playwright/test v${version}`, 'installed in node_modules');
} else {
  fail('@playwright/test not found', 'Run npm install first', 'npm install');
}

// ─── 3. Chromium browser binary ──────────────────────────────────────────────

const chromiumDirs = [
  path.join(process.env.LOCALAPPDATA || '', 'ms-playwright'),
  path.join(process.env.HOME || '', '.cache', 'ms-playwright'),
  path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'ms-playwright'),
];

let chromiumFound = false;
for (const dir of chromiumDirs) {
  if (fs.existsSync(dir)) {
    const entries = fs.readdirSync(dir).filter(e => e.startsWith('chromium'));
    if (entries.length > 0) { chromiumFound = true; break; }
  }
}

if (chromiumFound) {
  pass('Chromium browser', 'Playwright browser binary found');
} else {
  fail('Chromium browser not found', 'Playwright browser binary missing', 'npm run install:browsers');
}

// ─── 4. psql available (for setup-test-users) ────────────────────────────────

const psqlVersion = run('psql --version');
if (psqlVersion) {
  pass(`psql (${psqlVersion.split(' ').slice(0, 3).join(' ')})`, 'needed for setup-test-users');
} else {
  warn('psql not found', 'Required only for setup-test-users.mjs with Supabase', 'Install PostgreSQL client tools');
}

// ─── Project-level checks ────────────────────────────────────────────────────

if (project) {
  const projectDir = path.join(ROOT, 'projects', project);

  // 5. Project folder exists
  if (!fs.existsSync(projectDir)) {
    fail(`projects/${project}/ not found`, `Run: npm run new:project -- --name ${project}`);
  } else {
    pass(`projects/${project}/`, 'project folder exists');

    // 6. .env.local exists
    const envFile = path.join(projectDir, '.env.local');
    if (fs.existsSync(envFile)) {
      pass('.env.local exists', 'credentials file found');

      // 7. BASE_URL set
      const envContent = fs.readFileSync(envFile, 'utf-8');
      const baseUrlMatch = envContent.match(/^BASE_URL=(.+)$/m);
      if (baseUrlMatch && !baseUrlMatch[1].includes('localhost:5173')) {
        pass(`BASE_URL = ${baseUrlMatch[1].trim()}`, 'custom URL configured');
      } else if (baseUrlMatch) {
        warn(`BASE_URL = ${baseUrlMatch[1].trim()}`, 'using default — update for staging/prod');
      } else {
        fail('BASE_URL not set in .env.local', 'Add BASE_URL=http://localhost:PORT');
      }

      // 8. Credentials not empty
      const credKeys = ['STANDARD', 'RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT'];
      const missingCreds = credKeys.filter(role => {
        const emailKey = `TEST_USER_${role}_EMAIL`;
        return !envContent.match(new RegExp(`^${emailKey}=.+`, 'm'));
      });
      if (missingCreds.length === 0) {
        pass('Test user credentials', 'all roles have email set in .env.local');
      } else {
        fail(`Missing credentials for: ${missingCreds.join(', ')}`, 'Fill in .env.local with test user emails and passwords');
      }
    } else {
      fail('.env.local not found',
        `Copy the template and fill in credentials`,
        `cp projects/${project}/.env.example projects/${project}/.env.local`
      );
    }

    // 9. Auth sessions (.auth/*.json)
    const authDir = path.join(projectDir, '.auth');
    if (fs.existsSync(authDir)) {
      const sessions = fs.readdirSync(authDir).filter(f => f.endsWith('.json'));
      if (sessions.length > 0) {
        pass(`Auth sessions (${sessions.length})`, sessions.map(s => s.replace('.json', '')).join(', '));
      } else {
        warn('No auth sessions found', 'Run test suite once to generate sessions', `npm run test:${project}`);
      }
    } else {
      warn('.auth/ folder missing', 'Auth sessions not yet generated', `npm run test:${project}`);
    }

    // 10. Testbook exists
    const label   = project.charAt(0).toUpperCase() + project.slice(1);
    const xlsxFile = path.join(projectDir, 'data', `${label}_Tests.xlsx`);
    if (fs.existsSync(xlsxFile)) {
      const stat = fs.statSync(xlsxFile);
      pass(`${label}_Tests.xlsx`, `${Math.round(stat.size / 1024)}KB`);
    } else {
      fail(`${label}_Tests.xlsx not found`, 'Run update:testbook to generate it', `npm run update:testbook -- --project ${project}`);
    }

    // 11. App reachable
    const baseUrl = (() => {
      const envFile = path.join(projectDir, '.env.local');
      if (!fs.existsSync(envFile)) return null;
      const m = fs.readFileSync(envFile, 'utf-8').match(/^BASE_URL=(.+)$/m);
      return m ? m[1].trim() : null;
    })();

    if (baseUrl) {
      const up = await reachable(baseUrl);
      if (up) {
        pass(`App reachable at ${baseUrl}`);
      } else {
        warn(`App not reachable at ${baseUrl}`, 'Start your app before running tests or heal scripts');
      }
    }
  }
}

// ─── Docker (optional) ────────────────────────────────────────────────────────

const dockerRunning = run('docker info') !== null;
if (dockerRunning) {
  pass('Docker running', 'needed for local Supabase');
} else {
  warn('Docker not running', 'Only needed if using local Supabase — ignore for cloud Supabase');
}

// ─── Print results ────────────────────────────────────────────────────────────

const w = 42;
console.log(`\n${'─'.repeat(w)}`);
console.log(`ADAPT Prerequisite Check${project ? ` — ${project}` : ''}`);
console.log(`${'─'.repeat(w)}\n`);

for (const r of results) {
  const detail = r.detail ? `  ${r.detail}` : '';
  console.log(`  ${r.icon}  ${r.label}${detail}`);
  if (r.fix && r.level !== 'pass') {
    console.log(`         → ${r.fix}`);
  }
}

const passed  = results.filter(r => r.level === 'pass').length;
const warned  = results.filter(r => r.level === 'warn').length;
const failed  = results.filter(r => r.level === 'fail').length;

console.log(`\n${'─'.repeat(w)}`);
console.log(`  ${passed} passed · ${warned} warnings · ${failed} failed`);

if (failed > 0) {
  console.log(`\n  ❌  Fix the errors above before running tests.\n`);
  process.exit(1);
} else if (warned > 0) {
  console.log(`\n  ✅  Ready to run — review warnings above.\n`);
} else {
  console.log(`\n  ✅  All checks passed — ready to go!\n`);
}
