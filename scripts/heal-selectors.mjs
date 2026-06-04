/**
 * heal-selectors.mjs — Auto-heals expectLoaded() heading selectors in page objects.
 *
 * Navigates to each page using the live app, extracts the real heading,
 * and patches the page object file if the selector doesn't match.
 *
 * Usage:
 *   node scripts/heal-selectors.mjs --project happyq
 *   node scripts/heal-selectors.mjs --project happyq --role accountant
 *   node scripts/heal-selectors.mjs --project happyq --module billing
 *
 * Requires: app must be running (BASE_URL in .env.local)
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ─── Parse Arguments ─────────────────────────────────────────────────────────

const projectArg = process.argv.indexOf('--project');
const roleArg    = process.argv.indexOf('--role');
const moduleArg  = process.argv.indexOf('--module');

if (projectArg === -1 || !process.argv[projectArg + 1]) {
  console.error('\n❌  Usage: node scripts/heal-selectors.mjs --project <name> [--role <role>] [--module <module>]\n');
  process.exit(1);
}

const project      = process.argv[projectArg + 1];
const role         = roleArg   !== -1 ? process.argv[roleArg + 1]   : 'standard';
const moduleFilter = moduleArg !== -1 ? process.argv[moduleArg + 1] : null;

const projectDir = path.join(ROOT, 'projects', project);
const pagesDir   = path.join(projectDir, 'pages');
const authFile   = path.join(projectDir, '.auth', `${role}.json`);
const envFile    = path.join(projectDir, '.env.local');

// ─── Load BASE_URL ────────────────────────────────────────────────────────────

let BASE_URL = 'http://localhost:5173';
if (fs.existsSync(envFile)) {
  const env = fs.readFileSync(envFile, 'utf-8');
  const match = env.match(/^BASE_URL=(.+)$/m);
  if (match) BASE_URL = match[1].trim();
}

// ─── Validate ─────────────────────────────────────────────────────────────────

if (!fs.existsSync(projectDir)) {
  console.error(`\n❌  Project not found: ${projectDir}\n`);
  process.exit(1);
}
if (!fs.existsSync(authFile)) {
  console.error(`\n❌  Auth file not found: ${authFile}`);
  console.error(`    Run: npm run test:${project} first to generate auth sessions\n`);
  process.exit(1);
}

// ─── Find Page Object Files ───────────────────────────────────────────────────

function findPageFiles() {
  const files = [];
  if (!fs.existsSync(pagesDir)) return files;

  for (const entry of fs.readdirSync(pagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'dialogs') continue;
    if (moduleFilter && entry.name.toLowerCase() !== moduleFilter.toLowerCase()) continue;

    const moduleDir = path.join(pagesDir, entry.name);
    for (const file of fs.readdirSync(moduleDir)) {
      if (file.endsWith('Page.ts') && file !== 'BasePage.ts') {
        files.push(path.join(moduleDir, file));
      }
    }
  }
  return files;
}

// ─── Extract route from goto() ────────────────────────────────────────────────

function extractRoute(content) {
  const match = content.match(/async goto\([^)]*\)\s*\{[^}]*\.goto\(['"]([^'"]+)['"]\)/);
  return match ? match[1] : null;
}

// ─── Extract current heading selector from expectLoaded() ─────────────────────

function extractCurrentHeading(content) {
  // Matches: this.page.getByRole('heading', { name: /text/i }) or { name: 'text' }
  const match = content.match(
    /expectLoaded[\s\S]*?getByRole\(['"]heading['"],\s*\{\s*name:\s*(?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")/
  );
  if (!match) return null;
  return match[1] || match[2] || match[3] || null;
}

// ─── Get real heading from live page ─────────────────────────────────────────

async function getRealHeading(page, route) {
  try {
    const url = BASE_URL + route;

    // Use networkidle to wait for React + data to fully render
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

    // Check if we were redirected to the auth page (session expired)
    const currentUrl = page.url();
    if (currentUrl.includes('/auth') || currentUrl.includes('/login')) {
      return { text: null, status: 'AUTH_REDIRECT - session expired, re-run auth setup' };
    }

    // Check if permission denied
    const body = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
    if (body.includes("don't have permission") || body.includes('Back to login')) {
      return { text: null, status: 'PERMISSION_DENIED' };
    }

    // Wait a little more for dynamic content (e.g. data fetches completing)
    await page.waitForTimeout(1000);

    // Try headings in priority order — skip the auth page marketing text
    const AUTH_MARKETING_TEXT = 'Streamline your clinic management';

    const heading = await page.evaluate((authText) => {
      const candidates = [
        document.querySelector('h1'),
        document.querySelector('h2'),
        document.querySelector('[class*="text-3xl"]'),
        document.querySelector('[class*="text-2xl"]'),
      ];

      for (const el of candidates) {
        if (!el) continue;
        const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
        // Skip auth page marketing text and empty/too-long strings
        if (text && text.length > 1 && text.length < 80 && text !== authText) return text;
      }
      return null;
    }, AUTH_MARKETING_TEXT);

    if (!heading) return { text: null, status: 'NO_HEADING' };
    return { text: heading, status: 'OK' };

  } catch (e) {
    return { text: null, status: `ERROR: ${e.message.split('\n')[0]}` };
  }
}

// ─── Patch expectLoaded() in page object file ─────────────────────────────────

function patchExpectLoaded(content, realText) {
  const escapedText = realText.replace(/'/g, "\\'");

  // Strategy: find the expectLoaded() method, then replace just the name: value.
  // Simpler than matching the full getByRole call with all parens.
  //
  // Matches inside expectLoaded():  name: /anything/i  or  name: 'anything'
  // Replaces with:                  name: 'Real Heading Text'

  let replaced = false;

  const patched = content.replace(
    /(async expectLoaded\(\)[^}]*?name:\s*)(\/[^\n/]+\/i?|'[^'\n]*'|"[^"\n]*")/,
    (full, before, _old) => {
      replaced = true;
      return `${before}'${escapedText}'`;
    }
  );

  return replaced ? patched : content;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n[ADAPT] Healing selectors for project: ${project}`);
console.log(`[ADAPT] Role: ${role} | Base URL: ${BASE_URL}`);
if (moduleFilter) console.log(`[ADAPT] Module filter: ${moduleFilter}`);
console.log('');

const pageFiles = findPageFiles();
if (pageFiles.length === 0) {
  console.error(`❌  No page object files found${moduleFilter ? ` for module: ${moduleFilter}` : ''}`);
  process.exit(1);
}

console.log(`[ADAPT] Found ${pageFiles.length} page object(s) to check\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: authFile });
const page    = await context.newPage();

const results = {
  healed:    [],
  correct:   [],
  skipped:   [],
  noRoute:   [],
  noHeading: [],
  errors:    [],
};

for (const filePath of pageFiles) {
  const fileName = path.basename(filePath);
  const content  = fs.readFileSync(filePath, 'utf-8');

  const route = extractRoute(content);
  if (!route) {
    results.noRoute.push(fileName);
    console.log(`  ⏭️   ${fileName.padEnd(35)} no goto() route found`);
    continue;
  }

  // Skip routes with dynamic params
  if (route.includes(':') || route.includes('{')) {
    results.skipped.push(fileName);
    console.log(`  ⏭️   ${fileName.padEnd(35)} dynamic route (${route}) — skipped`);
    continue;
  }

  const currentSelector = extractCurrentHeading(content);
  const { text: realText, status } = await getRealHeading(page, route);

  if (status === 'PERMISSION_DENIED') {
    results.skipped.push(fileName);
    console.log(`  🔒  ${fileName.padEnd(35)} permission denied at ${route}`);
    continue;
  }

  if (status !== 'OK' || !realText) {
    results.noHeading.push(fileName);
    console.log(`  ❓  ${fileName.padEnd(35)} no heading found at ${route} (${status})`);
    continue;
  }

  // Check if current selector already matches
  if (currentSelector) {
    const normalised = currentSelector.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const realNorm   = realText.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (realNorm.includes(normalised) || normalised.includes(realNorm)) {
      results.correct.push(fileName);
      console.log(`  ✅  ${fileName.padEnd(35)} "${realText}" — selector correct`);
      continue;
    }
  }

  // Patch the file
  const patched = patchExpectLoaded(content, realText);
  if (patched === content) {
    results.noHeading.push(fileName);
    console.log(`  ⚠️   ${fileName.padEnd(35)} could not patch — check expectLoaded() manually`);
    continue;
  }

  fs.writeFileSync(filePath, patched, 'utf-8');
  results.healed.push({ file: fileName, route, realText, old: currentSelector });
  console.log(`  🔧  ${fileName.padEnd(35)} "${currentSelector ?? '?'}" → "${realText}"`);
}

await browser.close();

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log('Heal Summary\n');
console.log(`  ✅  ${results.correct.length}   already correct`);
console.log(`  🔧  ${results.healed.length}   healed`);
console.log(`  🔒  ${results.skipped.filter(f => !f.includes('dynamic')).length}   permission denied (check role or permissions)`);
console.log(`  ⏭️   ${results.skipped.filter(f => f.includes('dynamic') || results.noRoute.includes(f)).length + results.noRoute.length}   skipped (dynamic route or no goto)`);
console.log(`  ❓  ${results.noHeading.length}   no heading found (needs manual fix)`);

if (results.healed.length > 0) {
  console.log('\n  Healed files:');
  results.healed.forEach(r => console.log(`    ${r.file} (${r.route}): "${r.old}" → "${r.realText}"`));
}

if (results.noHeading.length > 0) {
  console.log('\n  Needs manual fix:');
  results.noHeading.forEach(f => console.log(`    ${f}`));
  console.log(`    Run: npx playwright codegen ${BASE_URL}/<route>`);
}

console.log('');
