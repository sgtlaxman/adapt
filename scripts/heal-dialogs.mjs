/**
 * heal-dialogs.mjs — Auto-heals dialog class selectors.
 *
 * For each dialog:
 *   1. Auto-detects the trigger (page + button) from test files
 *   2. Navigates to the page, clicks the trigger, waits for dialog to open
 *   3. Extracts live placeholders, button labels, and option labels inside dialog
 *   4. Compares with fill(), submit(), cancel() selectors in the dialog class
 *   5. Patches mismatches and reports fixes
 *
 * Key learnings applied:
 *   - Dialog scope: all extraction stays inside getByRole('dialog')
 *   - shadcn FormLabel: switch to getByPlaceholder() — getByLabel() unreliable
 *   - submit/cancel: prefer first() to avoid multiple close buttons
 *   - Trigger auto-detected from test files (.e2e.ts)
 *
 * Usage:
 *   node scripts/heal-dialogs.mjs --project happyq
 *   node scripts/heal-dialogs.mjs --project happyq --role receptionist
 *   node scripts/heal-dialogs.mjs --project happyq --dialog PatientDialog
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
const dialogArg  = process.argv.indexOf('--dialog');

if (projectArg === -1 || !process.argv[projectArg + 1]) {
  console.error('\n❌  Usage: node scripts/heal-dialogs.mjs --project <name> [--role <role>] [--dialog <DialogName>]\n');
  process.exit(1);
}

const project     = process.argv[projectArg + 1];
const role        = roleArg   !== -1 ? process.argv[roleArg + 1]   : 'standard';
const dialogFilter = dialogArg !== -1 ? process.argv[dialogArg + 1] : null;

const projectDir  = path.join(ROOT, 'projects', project);
const pagesDir    = path.join(projectDir, 'pages');
const testsDir    = path.join(projectDir, 'tests');
const authFile    = path.join(projectDir, '.auth', `${role}.json`);
const envFile     = path.join(projectDir, '.env.local');

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

// ─── Auto-detect dialog triggers from test files ──────────────────────────────
//
//  Scans for patterns like:
//    const dialog = new PatientDialog(page);
//    ...
//    await listPage.goto();
//    ...
//    await listPage.clickAddPatient();   ← trigger method
//    await dialog.expectOpen();
//
//  Returns: Map<DialogClassName, { route, triggerMethod, pageClass }>

function buildDialogTriggerMap() {
  const map = new Map();
  if (!fs.existsSync(testsDir)) return map;

  const testFiles = [];
  function walkTests(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkTests(full);
      else if (entry.name.endsWith('.e2e.ts')) testFiles.push(full);
    }
  }
  walkTests(testsDir);

  for (const testFile of testFiles) {
    const lines = fs.readFileSync(testFile, 'utf-8').split('\n');

    // Build a simple model: find consecutive blocks that use both a Page and a Dialog
    let pageClass = null, pageVar = null, dialogClass = null, dialogVar = null;
    let lastGotoLine = -1, triggerMethod = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect: const xPage = new XxxPage(page)
      const pageM = line.match(/const\s+(\w+)\s*=\s*new\s+(\w+Page)\s*\(page\)/);
      if (pageM) { pageVar = pageM[1]; pageClass = pageM[2]; lastGotoLine = -1; triggerMethod = null; }

      // Detect: const dialog = new XxxDialog(page)
      const dlgM = line.match(/const\s+(\w+)\s*=\s*new\s+(\w+Dialog)\s*\(page\)/);
      if (dlgM) { dialogVar = dlgM[1]; dialogClass = dlgM[2]; }

      // Detect: await xPage.goto()
      if (pageVar && line.includes(`${pageVar}.goto()`)) lastGotoLine = i;

      // Detect trigger: await xPage.someMethod() between goto and expectOpen
      if (pageVar && lastGotoLine >= 0 && line.startsWith(`await ${pageVar}.`)) {
        const methodM = line.match(new RegExp(`await ${pageVar}\\.(\\w+)\\(`));
        if (methodM && !['goto', 'expectLoaded', 'expectAccessDenied'].includes(methodM[1])) {
          triggerMethod = methodM[1];
        }
      }

      // Detect: await dialog.expectOpen() — this finalizes the mapping
      if (dialogVar && line.includes(`${dialogVar}.expectOpen`) && pageClass && triggerMethod) {
        if (!map.has(dialogClass)) {
          const route = findRouteForPageClass(pageClass);
          if (route) {
            map.set(dialogClass, { route, triggerMethod, pageClass });
          }
        }
        // Reset for next block
        triggerMethod = null;
      }
    }
  }

  return map;
}

function findRouteForPageClass(pageClass) {
  let found = null;
  function walk(dir) {
    if (found) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (found) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'dialogs') walk(full);
      else if (entry.name === `${pageClass}.ts`) {
        const c = fs.readFileSync(full, 'utf-8');
        const m = c.match(/async goto\([^)]*\)\s*\{[^}]*\.goto\(['"]([^'"]+)['"]\)/);
        if (m) found = m[1];
      }
    }
  }
  walk(pagesDir);
  return found;
}

// ─── Find trigger button label from page class ────────────────────────────────

function findTriggerLabel(pageClass, triggerMethod) {
  let label = null;
  function walk(dir) {
    if (label) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (label) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'dialogs') walk(full);
      else if (entry.name === `${pageClass}.ts`) {
        const c = fs.readFileSync(full, 'utf-8');
        // Find the trigger method body
        const methodRe = new RegExp(`async ${triggerMethod}\\s*\\([^)]*\\)\\s*\\{([^}]*)\\}`, 'm');
        const m = c.match(methodRe);
        if (m) {
          // Extract button/role name from the method
          const nameMatch = m[1].match(/name:\s*(?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")/);
          if (nameMatch) label = nameMatch[1] || nameMatch[2] || nameMatch[3];
        }
      }
    }
  }
  walk(pagesDir);
  return label;
}

// ─── Find all dialog files ────────────────────────────────────────────────────

function findDialogFiles() {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('Dialog.ts') && !entry.name.startsWith('Base')) {
        if (!dialogFilter || entry.name === `${dialogFilter}.ts`) files.push(full);
      }
    }
  }
  if (fs.existsSync(pagesDir)) walk(pagesDir);
  return files;
}

// ─── Extract selectors from dialog file ──────────────────────────────────────

function extractDialogSelectors(content) {
  const info = { fillPlaceholders: [], fillLabels: [], submitButton: null, cancelButton: null };

  // getByPlaceholder('text') or getByPlaceholder(/text/i)
  const phRe = /getByPlaceholder\((?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")\)/g;
  let m;
  while ((m = phRe.exec(content)) !== null) {
    info.fillPlaceholders.push(m[1] || m[2] || m[3]);
  }

  // getByLabel('text')
  const labelRe = /getByLabel\((?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")\)/g;
  while ((m = labelRe.exec(content)) !== null) {
    info.fillLabels.push(m[1] || m[2] || m[3]);
  }

  // submit button
  const submitRe = /async submit[\s\S]*?getByRole\('button',\s*\{[^}]*name:\s*(?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")/;
  const submitM = content.match(submitRe);
  if (submitM) info.submitButton = submitM[1] || submitM[2] || submitM[3];

  // cancel button
  const cancelRe = /async cancel[\s\S]*?getByRole\('button',\s*\{[^}]*name:\s*(?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")/;
  const cancelM = content.match(cancelRe);
  if (cancelM) info.cancelButton = cancelM[1] || cancelM[2] || cancelM[3];

  return info;
}

// ─── Open dialog and extract live elements ────────────────────────────────────

async function openDialogAndExtract(page, route, triggerLabel) {
  try {
    await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 20000 });

    const url = page.url();
    if (url.includes('/auth')) return { status: 'AUTH_REDIRECT', elements: null };
    const body = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
    if (body.includes("don't have permission")) return { status: 'PERMISSION_DENIED', elements: null };

    await page.waitForTimeout(800);

    // Find and click the trigger button
    const triggerPattern = new RegExp(triggerLabel, 'i');
    const trigger = page.getByRole('button', { name: triggerPattern });

    const triggerCount = await trigger.count();
    if (triggerCount === 0) {
      return { status: `TRIGGER_NOT_FOUND: "${triggerLabel}"`, elements: null };
    }

    await trigger.first().click();

    // Wait for dialog
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    const dialogVisible = await dialog.count() > 0;
    if (!dialogVisible) return { status: 'DIALOG_DID_NOT_OPEN', elements: null };

    await page.waitForTimeout(500);

    // Extract elements INSIDE the dialog
    const elements = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;

      const inputs     = [...dialog.querySelectorAll('input, textarea')];
      const buttons    = [...dialog.querySelectorAll('[role="button"], button')];
      const selects    = [...dialog.querySelectorAll('select, [role="combobox"], [role="listbox"]')];

      return {
        placeholders: inputs.map(el => el.getAttribute('placeholder')).filter(Boolean),
        inputTypes: inputs.map(el => ({ type: el.getAttribute('type') || 'text', placeholder: el.getAttribute('placeholder'), name: el.getAttribute('name') })),
        buttons: buttons.map(el => (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()).filter(t => t && t.length < 50),
        selectLabels: selects.map(el => el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').filter(Boolean),
      };
    });

    // Close dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    return { status: 'OK', elements };
  } catch (e) {
    return { status: `ERROR: ${e.message.split('\n')[0]}`, elements: null };
  }
}

// ─── Patch dialog file ────────────────────────────────────────────────────────

function patchDialogFile(content, livePlaceholders, liveButtons) {
  let patched = content;
  let changes = 0;

  // 1. Replace getByLabel('Text') with getByPlaceholder() where a matching live
  //    placeholder exists — shadcn FormLabel is unreliable with getByLabel.
  //    Simple approach: find each getByLabel call, extract the label text,
  //    try to find a matching placeholder from live DOM.

  const lines = patched.split('\n');
  const patchedLines = lines.map(line => {
    const labelMatch = line.match(/getByLabel\((?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")\)/);
    if (!labelMatch) return line;
    const labelText = (labelMatch[1] || labelMatch[2] || labelMatch[3]).toLowerCase().replace(/\s*\(.*?\)/g, '').trim();
    const matchPh = livePlaceholders.find(ph => {
      const phNorm = ph.toLowerCase().replace(/\.\.\./g, '').trim();
      return phNorm.includes(labelText) || labelText.includes(phNorm.split(' ')[0]);
    });
    if (matchPh) {
      const replacement = `getByPlaceholder('${matchPh.replace(/'/g, "\\'")}')`;
      changes++;
      return line.replace(labelMatch[0], replacement);
    }
    return line;
  });
  patched = patchedLines.join('\n');

  // 2. Ensure button clicks inside the dialog use .first() to prevent
  //    strict mode violations from multiple matching buttons.
  patched = patched.split('\n').map(line => {
    if (line.includes("getByRole('button'") && line.includes('.click()') && !line.includes('.first()')) {
      return line.replace('.click()', '.first().click()');
    }
    return line;
  }).join('\n');

  // 3. If a button selector name doesn't appear in liveButtons, replace with
  //    the best matching action button from the live dialog.
  const nameMatch = patched.match(/getByRole\('button',\s*\{\s*name:\s*(?:\/([^/]+)\/i?|'([^']+)'|"([^"]+)")\s*\}\)/);
  if (nameMatch && liveButtons.length > 0) {
    const currentName = (nameMatch[1] || nameMatch[2] || nameMatch[3]).toLowerCase();
    const firstWord   = currentName.split(/\W/)[0];
    const alreadyWorks = liveButtons.some(b => b.toLowerCase().includes(firstWord));
    if (!alreadyWorks) {
      const actionBtn = liveButtons.find(b => /save|create|confirm|add|book|schedule|update|submit|invite/i.test(b));
      if (actionBtn) {
        const escaped = actionBtn.replace(/'/g, "\\'");
        const newSelector = `getByRole('button', { name: '${escaped}' })`;
        patched = patched.replace(nameMatch[0], newSelector);
        changes++;
      }
    }
  }

  return { patched, changes };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n[ADAPT] Healing dialog selectors for: ${project} | role: ${role}`);
if (dialogFilter) console.log(`[ADAPT] Dialog filter: ${dialogFilter}`);
console.log('');

// Build trigger map from test files
const triggerMap = buildDialogTriggerMap();
console.log(`[ADAPT] Auto-detected ${triggerMap.size} dialog trigger(s) from test files\n`);

const dialogFiles = findDialogFiles();
if (!dialogFiles.length) { console.error('❌  No dialog files found'); process.exit(1); }

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: authFile });
const page    = await context.newPage();

const results = { healed: [], correct: [], skipped: [], noTrigger: [] };

for (const filePath of dialogFiles) {
  const fileName   = path.basename(filePath, '.ts');
  const content    = fs.readFileSync(filePath, 'utf-8');
  const trigger    = triggerMap.get(fileName);

  if (!trigger) {
    console.log(`  ⏭️   ${fileName.padEnd(35)} no trigger detected from test files`);
    results.noTrigger.push(fileName);
    continue;
  }

  const triggerLabel = findTriggerLabel(trigger.pageClass, trigger.triggerMethod) || trigger.triggerMethod;

  const { status, elements } = await openDialogAndExtract(page, trigger.route, triggerLabel);

  if (status !== 'OK' || !elements) {
    console.log(`  🔒  ${fileName.padEnd(35)} ${status} (route: ${trigger.route}, trigger: "${triggerLabel}")`);
    results.skipped.push(fileName);
    continue;
  }

  const current   = extractDialogSelectors(content);
  const { patched, changes } = patchDialogFile(content, elements.placeholders, elements.buttons);

  if (changes > 0) {
    fs.writeFileSync(filePath, patched, 'utf-8');
    results.healed.push(fileName);
    console.log(`  🔧  ${fileName.padEnd(35)} ${changes} selector(s) patched`);
    console.log(`       Placeholders available: ${elements.placeholders.slice(0, 4).join(', ')}`);
    console.log(`       Buttons available:      ${elements.buttons.slice(0, 4).join(', ')}`);
  } else {
    results.correct.push(fileName);
    console.log(`  ✅  ${fileName.padEnd(35)} selectors look correct`);
    if (elements.placeholders.length) {
      console.log(`       Placeholders: ${elements.placeholders.slice(0, 4).join(', ')}`);
    }
  }
}

await browser.close();

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log('heal:dialogs Summary\n');
console.log(`  ✅  ${results.correct.length}   already correct`);
console.log(`  🔧  ${results.healed.length}   healed`);
console.log(`  🔒  ${results.skipped.length}   permission denied / trigger not found`);
console.log(`  ⏭️   ${results.noTrigger.length}   no trigger detected`);

if (results.noTrigger.length) {
  console.log('\n  No trigger detected (dialogs not referenced in test files):');
  results.noTrigger.forEach(d => console.log(`    ${d}`));
  console.log('\n  To fix: add a test that uses the dialog, or pass --dialog <name> with a manual route.');
}
console.log('');
