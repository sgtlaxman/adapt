/**
 * generator.mjs — Generates page objects, dialog classes, test stubs,
 * testdata rows, and a TODO verification report from scanner output.
 */

import fs from 'fs';
import path from 'path';

// ── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Generate all ADAPT assets from scan data.
 *
 * @param {string}     projectDir   Absolute path to the new project folder
 * @param {string}     projectName  e.g. 'onlinebooking'
 * @param {ScanResult} scanData     Output from scanProject()
 * @returns {{ files: string[], testdataRows: object, reportLines: string[] }}
 */
export function generateAll(projectDir, projectName, scanData) {
  const { modules, dialogs } = scanData;
  const created   = [];
  const allControl = [];
  const allE2E     = [];
  const reportSections = [];

  // ── 1. Page Objects ─────────────────────────────────────────────────────────

  for (const mod of modules) {
    for (const route of mod.routes) {
      const result = generatePageObject(projectDir, mod, route);
      if (result) {
        created.push(result.file);
        reportSections.push(result.report);
      }
    }
  }

  // ── 2. Dialog Classes ───────────────────────────────────────────────────────

  for (const dialog of dialogs) {
    const result = generateDialogClass(projectDir, dialog);
    if (result) {
      created.push(result.file);
      reportSections.push(result.report);
    }
  }

  // ── 3. Test Files ───────────────────────────────────────────────────────────

  for (const mod of modules) {
    const result = generateTestFile(projectDir, mod, dialogs);
    if (result) {
      created.push(result.file);
      allControl.push(...result.controlRows);
      allE2E.push(...result.e2eRows);
    }
  }

  // ── 4. TODO Report ──────────────────────────────────────────────────────────

  const reportFile = generateTodoReport(projectDir, projectName, reportSections);
  created.push(reportFile);

  return { files: created, testdataRows: { testControl: allControl, e2eTests: allE2E } };
}

// ── Page Object Generator ─────────────────────────────────────────────────────

function generatePageObject(projectDir, mod, route) {
  const className = toPascalCase(route.componentName || route.path) + 'Page';
  const fileName  = className + '.ts';
  const dir       = path.join(projectDir, 'pages', mod.module.toLowerCase());
  const filePath  = path.join(dir, fileName);
  const { elements } = route;

  const methods   = [];
  const report    = { className, route: route.path, selectors: [] };

  // goto() — HIGH confidence from route path
  methods.push(`  async goto() { await this.page.goto('${route.path}'); }`);
  report.selectors.push({ method: 'goto()', confidence: 'HIGH', note: 'Route path — confirmed' });

  // expectLoaded() — MEDIUM confidence from first heading found
  const heading = elements.headings?.[0];
  if (heading) {
    methods.push(
      `  async expectLoaded() {\n` +
      `    // ⚠️  VERIFY: check this heading matches the real app\n` +
      `    await expect(this.page.getByRole('heading', { name: /${escapeRegex(heading)}/i })).toBeVisible();\n` +
      `  }`
    );
    report.selectors.push({ method: 'expectLoaded()', confidence: 'MEDIUM', note: `Guessed from heading: "${heading}"` });
  } else {
    methods.push(
      `  async expectLoaded() {\n` +
      `    // ❌  TODO: add the correct heading or landmark selector\n` +
      `    // await expect(this.page.getByRole('heading', { name: /page name/i })).toBeVisible();\n` +
      `    throw new Error('expectLoaded() not implemented — run: npx playwright codegen ${route.path}');\n` +
      `  }`
    );
    report.selectors.push({ method: 'expectLoaded()', confidence: 'LOW', note: 'No heading found — manual required' });
  }

  // expectAccessDenied() — standard, always same
  methods.push(
    `  async expectAccessDenied() {\n` +
    `    // ⚠️  VERIFY: check the exact text shown when access is denied\n` +
    `    await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });\n` +
    `  }`
  );
  report.selectors.push({ method: 'expectAccessDenied()', confidence: 'MEDIUM', note: 'Standard pattern — verify error text matches app' });

  // Search method — from placeholder
  const searchPlaceholder = elements.placeholders?.find(p => /search|find|filter/i.test(p));
  if (searchPlaceholder) {
    methods.push(
      `  async search(query: string) {\n` +
      `    // ⚠️  VERIFY: placeholder text matches real app\n` +
      `    await this.page.getByPlaceholder('${searchPlaceholder}').fill(query);\n` +
      `  }`
    );
    report.selectors.push({ method: 'search()', confidence: 'MEDIUM', note: `Placeholder: "${searchPlaceholder}"` });
  }

  // Button methods — from extracted button labels
  for (const btn of (elements.buttons ?? []).slice(0, 5)) {
    const methodName = 'click' + toPascalCase(btn);
    methods.push(
      `  async ${methodName}() {\n` +
      `    // ⚠️  VERIFY: button label matches real app\n` +
      `    await this.page.getByRole('button', { name: /${escapeRegex(btn)}/i }).click();\n` +
      `  }`
    );
    report.selectors.push({ method: `${methodName}()`, confidence: 'MEDIUM', note: `Button label: "${btn}"` });
  }

  // Generate file
  const content =
`import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ${className} extends BasePage {
  constructor(page: Page) { super(page); }

${methods.join('\n\n')}
}
`;

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    file: path.relative(path.join(projectDir, '..', '..'), filePath).replace(/\\/g, '/'),
    report,
  };
}

// ── Dialog Class Generator ────────────────────────────────────────────────────

function generateDialogClass(projectDir, dialog) {
  const className = dialog.name.endsWith('Dialog') ? dialog.name : dialog.name + 'Dialog';
  const fileName  = className + '.ts';
  const dir       = path.join(projectDir, 'pages', dialog.module, 'dialogs');
  const filePath  = path.join(dir, fileName);
  const { fields, buttons } = dialog;
  const report    = { className, module: dialog.module, selectors: [] };

  // Build interface from labels
  const interfaceFields = [];
  for (const label of (fields.labels ?? [])) {
    const fieldName = toCamelCase(label.replace(/\s*\(.*?\)/g, '')); // remove "(Optional)"
    interfaceFields.push(`  ${fieldName}?: string;  // Label: "${label}"`);
  }
  for (const ph of (fields.placeholders ?? [])) {
    const fieldName = toCamelCase(ph.replace(/\.\.\.$/, ''));
    if (!interfaceFields.find(f => f.includes(fieldName))) {
      interfaceFields.push(`  ${fieldName}?: string;  // Placeholder: "${ph}"`);
    }
  }

  // Build fill() method body
  const fillLines = [];
  for (const label of (fields.labels ?? []).slice(0, 6)) {
    const fieldName = toCamelCase(label.replace(/\s*\(.*?\)/g, ''));
    fillLines.push(
      `    // ⚠️  VERIFY: label matches real app\n` +
      `    if (data.${fieldName}) await this.page.getByLabel('${label}').fill(data.${fieldName});`
    );
    report.selectors.push({ method: `fill() → ${fieldName}`, confidence: 'MEDIUM', note: `Label: "${label}"` });
  }
  for (const ph of (fields.placeholders ?? []).slice(0, 3)) {
    const fieldName = toCamelCase(ph.replace(/\.\.\.$/, ''));
    if (!fields.labels?.find(l => l.toLowerCase() === fieldName.toLowerCase())) {
      fillLines.push(
        `    // ⚠️  VERIFY: placeholder matches real app\n` +
        `    if (data.${fieldName}) await this.page.getByPlaceholder('${ph}').fill(data.${fieldName});`
      );
      report.selectors.push({ method: `fill() → ${fieldName}`, confidence: 'MEDIUM', note: `Placeholder: "${ph}"` });
    }
  }

  // Primary action button
  const actionBtn = buttons.find(b => /save|submit|confirm|create|add|book|schedule|update/i.test(b));
  const actionMethod = actionBtn
    ? `getByRole('button', { name: /${escapeRegex(actionBtn)}/i })`
    : `getByRole('button', { name: /save|submit|confirm/i })`;

  report.selectors.push({ method: 'submit()', confidence: actionBtn ? 'MEDIUM' : 'LOW', note: actionBtn ? `Button: "${actionBtn}"` : 'No action button found — manual required' });
  report.selectors.push({ method: 'expectOpen()', confidence: 'HIGH', note: 'Standard dialog pattern' });

  const content =
`import { Page, expect } from '@playwright/test';

export interface ${className}Data {
${interfaceFields.length ? interfaceFields.join('\n') : '  // TODO: add form field properties'}
}

/**
 * Handles the ${dialog.name} modal dialog.
 * ⚠️  Verify all selectors using: npx playwright codegen <url>
 */
export class ${className} {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fill(data: ${className}Data) {
${fillLines.length ? fillLines.join('\n') : '    // TODO: add form field interactions'}
  }

  async submit() {
    // ⚠️  VERIFY: confirm this button label matches the real app
    await this.page.${actionMethod}.click();
  }

  async cancel() {
    // ⚠️  VERIFY: confirm cancel/close button label
    await this.page.getByRole('button', { name: /cancel|close|go back/i }).click();
  }

  async expectClosed() {
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }
}
`;

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    file: path.relative(path.join(projectDir, '..', '..'), filePath).replace(/\\/g, '/'),
    report,
  };
}

// ── Test File Generator ───────────────────────────────────────────────────────

function generateTestFile(projectDir, mod, dialogs) {
  if (!mod.routes.length) return null;

  const dir      = path.join(projectDir, 'tests', mod.module.toLowerCase());
  const filePath = path.join(dir, mod.module.toLowerCase() + '.e2e.ts');

  const imports     = [];
  const testBlocks  = [];
  const controlRows = [];
  const e2eRows     = [];
  let   testNum     = 1;

  // Collect page imports
  for (const route of mod.routes) {
    const className = toPascalCase(route.componentName || route.path) + 'Page';
    imports.push(`import { ${className} } from '../../pages/${mod.module.toLowerCase()}/${className}';`);
  }

  // Collect matching dialog imports
  const modDialogs = dialogs.filter(d => d.module.toLowerCase() === mod.module.toLowerCase());
  for (const d of modDialogs) {
    const cn = d.name.endsWith('Dialog') ? d.name : d.name + 'Dialog';
    imports.push(`import { ${cn} } from '../../pages/${mod.module.toLowerCase()}/dialogs/${cn}';`);
  }

  // Generate test blocks per route
  for (const route of mod.routes) {
    const className  = toPascalCase(route.componentName || route.path) + 'Page';
    const screenName = toPascalCase(route.path.split('/').filter(Boolean).pop() || 'home');
    const testId     = `${mod.prefix}-E2E-${String(testNum++).padStart(3, '0')}`;
    const testName   = `${screenName} page loads`;

    testBlocks.push(
`test.describe('${mod.module} — ${screenName}', () => {
  test('${testId}: ${testName}', async ({ page }) => {
    const pg = new ${className}(page);
    await pg.goto();
    await pg.expectLoaded();
  });

  // TODO: Add more journey tests for ${screenName}
  // e.g. search, create, edit, delete flows
});`
    );

    controlRows.push({
      TEST_ID: testId, MODULE: mod.module, SCREEN: screenName,
      LAYER: 'E2E', PRIORITY: 'P1', RUN: 'YES', NOTES: '',
    });
    e2eRows.push({
      TEST_ID: testId, MODULE: mod.module, SCREEN: screenName,
      TEST_NAME: testName, USER_ROLE: 'STANDARD',
      DESCRIPTION: `${screenName} loads and heading is visible`,
      PRECONDITIONS: `Logged in`, TEST_DATA: '{}',
      EXPECTED_RESULT: `${screenName} heading visible`,
    });
  }

  // RBA stub
  const rbaId = `RBA-${mod.prefix}-001`;
  testBlocks.push(
`// TODO: Add RBA tests if this module is role-restricted
// test.describe('RBA — ${mod.module} access denied for <Role>', () => {
//   test.use({ storageState: path.resolve(__dirname, '../../.auth/<role>.json') });
//   test('${rbaId}: <Role> cannot access ${mod.module}', async ({ page }) => {
//     const pg = new ${toPascalCase(mod.routes[0]?.componentName || mod.module)}Page(page);
//     await pg.goto();
//     await pg.expectAccessDenied();
//   });
// });`
  );

  const content =
`import { test } from '@playwright/test';
import path from 'path';
${[...new Set(imports)].join('\n')}

// TODO: Update storageState to the correct role for this module
test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });

${testBlocks.join('\n\n')}
`;

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    file: path.relative(path.join(projectDir, '..', '..'), filePath).replace(/\\/g, '/'),
    controlRows,
    e2eRows,
  };
}

// ── TODO Report Generator ─────────────────────────────────────────────────────

function generateTodoReport(projectDir, projectName, sections) {
  const now = new Date().toISOString().slice(0, 10);

  let totalHigh = 0, totalMedium = 0, totalLow = 0;
  for (const s of sections) {
    for (const sel of (s.selectors ?? [])) {
      if (sel.confidence === 'HIGH')   totalHigh++;
      if (sel.confidence === 'MEDIUM') totalMedium++;
      if (sel.confidence === 'LOW')    totalLow++;
    }
  }

  const lines = [
    `# ADAPT — Selector Verification Report`,
    `## Project: ${projectName}`,
    `## Generated: ${now}`,
    ``,
    `> Work through this report screen by screen after scaffolding.`,
    `> For each ⚠️ or ❌ item run: \`npx playwright codegen <BASE_URL><route>\``,
    ``,
    `---`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total selectors generated | ${totalHigh + totalMedium + totalLow} |`,
    `| ✅ High confidence (no action needed) | ${totalHigh} |`,
    `| ⚠️ Medium confidence (verify against running app) | ${totalMedium} |`,
    `| ❌ Low confidence (manual selector required) | ${totalLow} |`,
    ``,
    `---`,
    ``,
    `## How to Verify a Selector`,
    ``,
    `\`\`\`bash`,
    `# 1. Start the app`,
    `npm run dev   # inside the ${projectName} project`,
    ``,
    `# 2. Run Playwright codegen for the screen`,
    `npx playwright codegen http://localhost:5173/your-route`,
    ``,
    `# 3. Click the element in the browser`,
    `#    Playwright writes the selector automatically`,
    ``,
    `# 4. Copy the selector into the page object`,
    ``,
    `# 5. Run just that test to confirm`,
    `npm run test:${projectName} -- --grep "Screen Name"`,
    `\`\`\``,
    ``,
    `---`,
    ``,
    `## Screens`,
    ``,
  ];

  for (const s of sections) {
    if (!s.route && !s.module) continue;
    const title = s.route ? `${s.className} → \`${s.route}\`` : `${s.className} (Dialog — ${s.module})`;
    lines.push(`### ${title}`, ``);
    lines.push(`| Method | Confidence | Note | Done? |`);
    lines.push(`|--------|------------|------|-------|`);
    for (const sel of (s.selectors ?? [])) {
      const icon = sel.confidence === 'HIGH' ? '✅' : sel.confidence === 'MEDIUM' ? '⚠️' : '❌';
      lines.push(`| \`${sel.method}\` | ${icon} ${sel.confidence} | ${sel.note} | [ ] |`);
    }
    lines.push(``);
  }

  const filePath = path.join(projectDir, 'TODO_REPORT.md');
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

  return path.relative(path.join(projectDir, '..', '..'), filePath).replace(/\\/g, '/');
}

// ── String Helpers ────────────────────────────────────────────────────────────

function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase())
    .replace(/Page$/, '');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
