/**
 * heal-actions.mjs — Auto-heals action method selectors in page objects.
 *
 * Navigates to each page, extracts all visible interactive elements from the
 * live DOM, compares with selectors used in action methods, and patches mismatches.
 *
 * Covers: button names, tab names, radio labels (Radix ToggleGroup), placeholders.
 *
 * Usage:
 *   node scripts/heal-actions.mjs --project happyq
 *   node scripts/heal-actions.mjs --project happyq --role receptionist
 *   node scripts/heal-actions.mjs --project happyq --module reception
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
  console.error('\n❌  Usage: node scripts/heal-actions.mjs --project <name> [--role <role>] [--module <module>]\n');
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
  const match = fs.readFileSync(envFile, 'utf-8').match(/^BASE_URL=(.+)$/m);
  if (match) BASE_URL = match[1].trim();
}

if (!fs.existsSync(authFile)) {
  console.error(`\n❌  Auth file not found: ${authFile}\n    Run auth setup first.\n`);
  process.exit(1);
}

// ─── Selectors to look for in page methods ───────────────────────────────────

// Matches: getByRole('button', { name: /text/i }) or { name: 'text' }
const ROLE_RE = /getByRole\('(button|tab|radio|combobox)'(?:,\s*\{[^}]*name:\s*(?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")\s*\})?/g;
// Matches: getByPlaceholder(/text/i) or getByPlaceholder('text')
const PH_RE   = /getByPlaceholder\((?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")\)/g;

// ─── Extract selectors from a method ─────────────────────────────────────────

function extractSelectors(methodBody) {
  const selectors = [];

  let m;
  ROLE_RE.lastIndex = 0;
  while ((m = ROLE_RE.exec(methodBody)) !== null) {
    const role = m[1];
    const name = m[2] || m[3] || m[4] || null;
    selectors.push({ type: 'role', role, name, raw: m[0] });
  }

  PH_RE.lastIndex = 0;
  while ((m = PH_RE.exec(methodBody)) !== null) {
    const text = m[1] || m[2] || m[3];
    selectors.push({ type: 'placeholder', text, raw: m[0] });
  }

  return selectors;
}

// ─── Extract action methods from a page object file ──────────────────────────

function extractActionMethods(content) {
  const methods = [];
  // Match: async methodName(...) { ... }
  const methodRe = /async\s+(\w+)\s*\([^)]*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let m;
  while ((m = methodRe.exec(content)) !== null) {
    const name = m[1];
    const body = m[2];
    // Skip structural methods
    if (['goto', 'expectLoaded', 'expectAccessDenied', 'screenshot', 'waitForToast'].includes(name)) continue;
    // Skip if no interactive selectors
    if (!ROLE_RE.test(body) && !PH_RE.test(body)) continue;
    ROLE_RE.lastIndex = 0;
    methods.push({ name, body, selectors: extractSelectors(body) });
  }
  return methods;
}

// ─── Extract route from goto() ───────────────────────────────────────────────

function extractRoute(content) {
  const m = content.match(/async goto\([^)]*\)\s*\{[^}]*\.goto\(['"]([^'"]+)['"]\)/);
  return m ? m[1] : null;
}

// ─── Find page files ──────────────────────────────────────────────────────────

function findPageFiles() {
  const files = [];
  if (!fs.existsSync(pagesDir)) return files;
  for (const entry of fs.readdirSync(pagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'dialogs') continue;
    if (moduleFilter && entry.name.toLowerCase() !== moduleFilter.toLowerCase()) continue;
    for (const file of fs.readdirSync(path.join(pagesDir, entry.name))) {
      if (file.endsWith('Page.ts') && file !== 'BasePage.ts') {
        files.push(path.join(pagesDir, entry.name, file));
      }
    }
  }
  return files;
}

// ─── Get live elements from page ─────────────────────────────────────────────

async function getLiveElements(page, route) {
  try {
    await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 20000 });

    // Check for auth redirect or permission denied
    const url = page.url();
    if (url.includes('/auth')) return { status: 'AUTH_REDIRECT', elements: {} };
    const body = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
    if (body.includes("don't have permission")) return { status: 'PERMISSION_DENIED', elements: {} };

    await page.waitForTimeout(800);

    const elements = await page.evaluate(() => {
      const getText = el => (el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();

      return {
        buttons: [...document.querySelectorAll('[role="button"]:not([disabled]), button:not([disabled])')]
          .map(getText).filter(t => t && t.length < 60),
        tabs: [...document.querySelectorAll('[role="tab"]')]
          .map(getText).filter(t => t && t.length < 60),
        radios: [...document.querySelectorAll('[role="radio"]')]
          .map(el => el.getAttribute('aria-label') || getText(el)).filter(t => t && t.length < 60),
        placeholders: [...document.querySelectorAll('input[placeholder], textarea[placeholder]')]
          .map(el => el.getAttribute('placeholder')).filter(t => t && t.length < 80),
        comboboxes: [...document.querySelectorAll('[role="combobox"]')]
          .map(el => el.getAttribute('placeholder') || el.getAttribute('aria-label') || getText(el)).filter(t => t),
      };
    });

    return { status: 'OK', elements };
  } catch (e) {
    return { status: `ERROR: ${e.message.split('\n')[0]}`, elements: {} };
  }
}

// ─── Match selector to live elements ─────────────────────────────────────────

function findBestMatch(selector, liveElements) {
  const candidates = liveElements[selector.role + 's'] || liveElements.buttons || [];
  if (!candidates.length) return null;

  const searchText = (selector.name || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
  if (!searchText) return null;

  // Exact match
  const exact = candidates.find(c => c.toLowerCase() === searchText);
  if (exact) return { text: exact, confidence: 'exact' };

  // Contains match
  const contains = candidates.find(c => c.toLowerCase().includes(searchText) || searchText.includes(c.toLowerCase()));
  if (contains) return { text: contains, confidence: 'contains' };

  // Word overlap
  const words = searchText.split(' ').filter(w => w.length > 2);
  const scored = candidates.map(c => {
    const cWords = c.toLowerCase().split(' ');
    const overlap = words.filter(w => cWords.some(cw => cw.includes(w) || w.includes(cw))).length;
    return { text: c, score: overlap };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  return scored[0] ? { text: scored[0].text, confidence: 'fuzzy' } : null;
}

// ─── Patch a selector in file content ────────────────────────────────────────

function patchSelector(content, methodName, oldSelector, newText, selectorType, role) {
  const escapedText = newText.replace(/'/g, "\\'");

  if (selectorType === 'role') {
    // Replace: getByRole('button', { name: /text/i }) → getByRole('button', { name: 'New Text' })
    // Also fix role type if needed (button → radio for ToggleGroup)
    const patched = content.replace(
      new RegExp(`(async ${methodName}[\\s\\S]*?)getByRole\\('(?:button|tab|radio|combobox)',\\s*\\{[^}]*name:\\s*(?:\\/[^/]+\\/i?|'[^']*'|"[^"]*")\\s*\\}`, 'm'),
      (full, before) => `${before}getByRole('${role}', { name: '${escapedText}' }`
    );
    return patched;
  }

  if (selectorType === 'placeholder') {
    const patched = content.replace(
      new RegExp(`(async ${methodName}[\\s\\S]*?)getByPlaceholder\\((?:\\/[^/]+\\/i?|'[^']*'|"[^"]*")\\)`, 'm'),
      (full, before) => `${before}getByPlaceholder('${escapedText}')`
    );
    return patched;
  }

  return content;
}

// ─── Detect correct role from live elements ───────────────────────────────────

function detectRole(text, liveElements) {
  if (liveElements.radios?.some(r => r === text || r.toLowerCase().includes(text.toLowerCase()))) return 'radio';
  if (liveElements.tabs?.some(t => t === text || t.toLowerCase().includes(text.toLowerCase())))   return 'tab';
  if (liveElements.comboboxes?.some(c => c === text || c.toLowerCase().includes(text.toLowerCase()))) return 'combobox';
  return 'button';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n[ADAPT] Healing action selectors for: ${project} | role: ${role}`);
if (moduleFilter) console.log(`[ADAPT] Module filter: ${moduleFilter}`);
console.log('');

const pageFiles = findPageFiles();
if (!pageFiles.length) { console.error('❌  No page files found'); process.exit(1); }

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: authFile });
const page    = await context.newPage();

const results = { healed: [], correct: [], skipped: [], errors: [] };

for (const filePath of pageFiles) {
  const fileName = path.basename(filePath);
  const content  = fs.readFileSync(filePath, 'utf-8');
  const route    = extractRoute(content);

  if (!route || route.includes(':')) {
    console.log(`  ⏭️   ${fileName.padEnd(40)} no route / dynamic`);
    results.skipped.push(fileName);
    continue;
  }

  const methods = extractActionMethods(content);
  if (!methods.length) {
    console.log(`  ⏭️   ${fileName.padEnd(40)} no action methods`);
    results.skipped.push(fileName);
    continue;
  }

  const { status, elements } = await getLiveElements(page, route);

  if (status !== 'OK') {
    console.log(`  🔒  ${fileName.padEnd(40)} ${status}`);
    results.skipped.push(fileName);
    continue;
  }

  let fileContent    = content;
  let fileChanged    = false;
  const methodReport = [];

  for (const method of methods) {
    for (const sel of method.selectors) {
      const searchText = sel.name || sel.text || '';
      const liveList   = sel.type === 'placeholder'
        ? elements.placeholders
        : (elements[sel.role + 's'] || elements.buttons || []);

      // Check if current selector already works (text exists in live elements)
      const alreadyWorks = liveList.some(item =>
        item.toLowerCase().includes(searchText.toLowerCase()) ||
        searchText.toLowerCase().includes(item.toLowerCase())
      );

      if (alreadyWorks) {
        methodReport.push({ method: method.name, sel: searchText, status: '✅' });
        continue;
      }

      // Find best match
      const match = findBestMatch(sel, elements);

      if (!match) {
        methodReport.push({ method: method.name, sel: searchText, status: '❓', note: `no match — available: ${liveList.slice(0,3).join(', ')}` });
        continue;
      }

      // Detect correct role (catches button → radio, etc.)
      const correctRole = sel.type === 'role'
        ? detectRole(match.text, elements)
        : sel.role;

      // Patch the file
      const patched = patchSelector(fileContent, method.name, sel.raw, match.text, sel.type, correctRole);

      if (patched !== fileContent) {
        fileContent = patched;
        fileChanged = true;
        const roleChanged = correctRole !== sel.role ? ` (role: ${sel.role}→${correctRole})` : '';
        methodReport.push({ method: method.name, sel: searchText, status: '🔧', note: `"${searchText}" → "${match.text}"${roleChanged} [${match.confidence}]` });
        results.healed.push({ file: fileName, method: method.name, from: searchText, to: match.text });
      } else {
        methodReport.push({ method: method.name, sel: searchText, status: '⚠️', note: 'could not patch — check manually' });
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }

  const hasIssues  = methodReport.some(r => r.status !== '✅');
  const hasHealed  = methodReport.some(r => r.status === '🔧');
  const icon       = hasHealed ? '🔧' : hasIssues ? '⚠️' : '✅';
  console.log(`  ${icon}  ${fileName.padEnd(40)} ${route}`);

  for (const r of methodReport) {
    if (r.status !== '✅') {
      console.log(`       ${r.status}  ${r.method}()  ${r.note || ''}`);
    }
  }
}

await browser.close();

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log('heal:actions Summary\n');
console.log(`  🔧  ${results.healed.length}   selectors healed`);
console.log(`  ⏭️   ${results.skipped.length}   files skipped`);
if (results.healed.length) {
  console.log('\n  Healed:');
  results.healed.forEach(r => console.log(`    ${r.file} → ${r.method}(): "${r.from}" → "${r.to}"`));
}
console.log('');
