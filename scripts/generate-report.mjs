/**
 * generate-report.mjs — Generates a dated HTML test report from the Excel RESULTS sheet.
 *
 * Reads the RESULTS sheet from the project's testbook, builds a full
 * Playwright-themed HTML report using html-builder.mjs, and writes it to
 * projects/<name>/reports/.
 *
 * Usage:
 *   node scripts/generate-report.mjs --project happyq
 *   node scripts/generate-report.mjs --project happyq --run-id ADAPT-20260605-1430
 *   node scripts/generate-report.mjs --project happyq --open
 *
 * Output:
 *   projects/<name>/reports/report-YYYYMMDD-HHmm.html   ← dated
 *   projects/<name>/reports/report-latest.html           ← always latest
 */

import XLSX    from 'xlsx';
import fs      from 'fs';
import path    from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  getBaseHtml,
  createSection,
  createTable,
  createKpiGrid,
  createRunTimeline,
  createPill,
  createNote,
  escHtml,
  code,
} from './lib/html-builder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ─── Parse arguments ─────────────────────────────────────────────────────────

const projectArg = process.argv.indexOf('--project');
const runIdArg   = process.argv.indexOf('--run-id');
const openFlag   = process.argv.includes('--open');

if (projectArg === -1 || !process.argv[projectArg + 1]) {
  console.error('\n❌  Usage: node scripts/generate-report.mjs --project <name> [--run-id <id>] [--open]\n');
  process.exit(1);
}

const project    = process.argv[projectArg + 1];
const filterRunId = runIdArg !== -1 ? process.argv[runIdArg + 1] : null;

const projectDir   = path.join(ROOT, 'projects', project);
const label        = project.charAt(0).toUpperCase() + project.slice(1);
const xlsxFile     = path.join(projectDir, 'data', `${label}_Tests.xlsx`);
const jsonFile     = path.join(projectDir, 'test-results.json');
const reportsDir   = path.join(projectDir, 'reports');

fs.mkdirSync(reportsDir, { recursive: true });

// ─── Load E2E_TESTS metadata from Excel (for module/screen/role enrichment) ──

let e2eMeta = {};
if (fs.existsSync(xlsxFile)) {
  const wb      = XLSX.readFile(xlsxFile);
  const e2eSheet = wb.Sheets['E2E_TESTS'];
  if (e2eSheet) {
    e2eMeta = Object.fromEntries(
      XLSX.utils.sheet_to_json(e2eSheet, { defval: '' }).map(r => [r.TEST_ID, r])
    );
  }
}

// ─── Read Playwright JSON results ─────────────────────────────────────────────

if (!fs.existsSync(jsonFile)) {
  console.error(`\n❌  Playwright JSON results not found: ${jsonFile}`);
  console.error(`    Run tests first: npm run test:${project}\n`);
  process.exit(1);
}

const pwJson = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

// ─── Flatten Playwright JSON into a results array ─────────────────────────────

function flattenSuites(suites, parentTitle = '') {
  const rows = [];
  for (const suite of (suites || [])) {
    const suiteTitle = [parentTitle, suite.title].filter(Boolean).join(' › ');
    // Leaf specs
    for (const spec of (suite.specs || [])) {
      for (const test of (spec.tests || [])) {
        const result   = test.results?.[0] || {};
        const fullTitle = spec.title || '';
        // Extract TEST_ID from title: "AUTH-E2E-001: Valid login..."
        const idMatch  = fullTitle.match(/^([A-Z]{2,10}-[A-Z0-9]+-\d{3}):/);
        const testId   = idMatch ? idMatch[1] : fullTitle.slice(0, 20);
        const testName = idMatch ? fullTitle.slice(idMatch[0].length).trim() : fullTitle;
        const meta     = e2eMeta[testId] || {};
        const status   = result.status === 'passed' ? 'PASS'
                       : result.status === 'skipped' ? 'SKIP'
                       : result.status === 'failed'  ? 'FAIL' : 'SKIP';
        const error    = result.error?.message || '';

        rows.push({
          TEST_ID:        testId,
          TEST_NAME:      testName || meta.TEST_NAME || '',
          MODULE:         meta.MODULE  || deriveModule(suiteTitle),
          SCREEN:         meta.SCREEN  || '',
          USER_ROLE:      meta.USER_ROLE || '',
          STATUS:         status,
          ERROR_MESSAGE:  error.split('\n')[0].slice(0, 200),
          SCREENSHOT_PATH: result.attachments?.find(a => a.contentType?.includes('image'))?.path || '',
          RUN_DURATION_MS: result.duration || 0,
        });
      }
    }
    // Recurse into nested suites
    rows.push(...flattenSuites(suite.suites || [], suiteTitle));
  }
  return rows;
}

function deriveModule(suiteTitle) {
  const part = suiteTitle.split('›')[0].trim();
  return part.split(' ')[0] || 'Other';
}

// Filter out setup project tests
const allSuites = (pwJson.suites || []).filter(s => s.title !== 'setup');
const allResults = flattenSuites(allSuites);

if (!allResults.length) {
  console.error('\n❌  No test results found in JSON. Run tests first.\n');
  process.exit(1);
}

// Single run — use file modification time as run timestamp
const runAt   = new Date(fs.statSync(jsonFile).mtime).toISOString();
const runBy   = process.env.CI ? 'CI/CD Runner' : 'Local Dev';
const envLabel = process.env.ENV || 'local';

// Attach run metadata
allResults.forEach(r => {
  r.RUN_AT  = runAt;
  r.RUN_BY  = runBy;
  r.ENV     = envLabel;
});

// ─── Current run = all results from JSON ─────────────────────────────────────

const targetRunAt = runAt;
const targetRows  = allResults;
const sortedRuns  = [[runAt, allResults]]; // for timeline (single run from JSON)

// ─── Compute stats for target run ────────────────────────────────────────────

function getStats(rows) {
  const pass  = rows.filter(r => r.STATUS === 'PASS').length;
  const fail  = rows.filter(r => r.STATUS === 'FAIL').length;
  const skip  = rows.filter(r => r.STATUS === 'SKIP').length;
  const total = rows.length;
  const totalMs = rows.reduce((s, r) => s + (Number(r.RUN_DURATION_MS) || 0), 0);
  const env   = rows[0]?.ENV || 'local';
  const runBy = rows[0]?.RUN_BY || 'unknown';
  return { pass, fail, skip, total, totalMs, env, runBy };
}

const stats     = getStats(targetRows);
const passPct   = Math.round((stats.pass / stats.total) * 100) || 0;
const failPct   = Math.round((stats.fail / stats.total) * 100) || 0;
const skipPct   = 100 - passPct - failPct;
const durationS = (stats.totalMs / 1000).toFixed(1);

// ─── Run date/time label ──────────────────────────────────────────────────────

function formatRunDate(isoStr) {
  try { return new Date(isoStr).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return isoStr; }
}

const runDateLabel = formatRunDate(targetRunAt);
const runId = targetRows[0]?.RUN_AT ? targetRunAt.replace(/[:.]/g, '-').slice(0, 16) : 'run';

// ─── STATUS colour helper ─────────────────────────────────────────────────────

function statusPill(status) {
  if (status === 'PASS')  return createPill('passed',  'pass');
  if (status === 'FAIL')  return createPill('failed',  'fail');
  if (status === 'SKIP')  return createPill('skipped', 'skip');
  if (status === 'ERROR') return createPill('error',   'red');
  return createPill(status, 'gray');
}

function operationPill(userRole) {
  const map = {
    STANDARD:     ['blue',   'Standard'],
    RECEPTIONIST: ['cyan',   'Receptionist'],
    DOCTOR:       ['purple', 'Doctor'],
    ACCOUNTANT:   ['amber',  'Accountant'],
    ADMIN:        ['rose',   'Admin'],
  };
  const [cls, lbl] = map[String(userRole).toUpperCase()] || ['gray', userRole || '?'];
  return createPill(lbl, cls);
}

// ─── Section 1: KPI grid ──────────────────────────────────────────────────────

const kpiContent = createKpiGrid([
  { n: stats.pass,  label: 'Passed',  cls: 'n-pass' },
  { n: stats.fail,  label: 'Failed',  cls: 'n-fail' },
  { n: stats.skip,  label: 'Skipped', cls: 'n-skip' },
  { n: stats.total, label: 'Total',   cls: 'n-blue' },
  { n: `${durationS}s`, label: 'Duration', cls: '' },
  { n: stats.env,   label: 'Environment', cls: '' },
]);

// ─── Section 2: Test results table ───────────────────────────────────────────

// Group rows by MODULE for display
const byModule = {};
for (const row of targetRows) {
  const mod = row.MODULE || e2eMeta[row.TEST_ID]?.MODULE || 'Other';
  if (!byModule[mod]) byModule[mod] = [];
  byModule[mod].push(row);
}

let resultsHtml = '';
for (const [mod, rows] of Object.entries(byModule)) {
  const modPass = rows.filter(r => r.STATUS === 'PASS').length;
  const modFail = rows.filter(r => r.STATUS === 'FAIL').length;
  const summary = `${modPass}/${rows.length} passed`;
  const summaryPill = modFail > 0 ? createPill(summary, 'fail') : createPill(summary, 'pass');

  const tableRows = rows.map(row => {
    const meta  = e2eMeta[row.TEST_ID] || {};
    const durationLabel = row.RUN_DURATION_MS ? `${(Number(row.RUN_DURATION_MS)/1000).toFixed(1)}s` : '—';
    const errorCell = row.STATUS === 'FAIL' && row.ERROR_MESSAGE
      ? `<div style="color:var(--color-fail);font-size:11px;margin-top:4px;font-family:var(--font-mono)">${escHtml(String(row.ERROR_MESSAGE).slice(0, 120))}${row.ERROR_MESSAGE.length > 120 ? '…' : ''}</div>`
      : '';
    return [
      `<span class="test-id">${escHtml(row.TEST_ID || '')}</span>`,
      `<div class="test-name">${escHtml(row.TEST_NAME || meta.TEST_NAME || '')}</div>${errorCell}`,
      escHtml(row.SCREEN || meta.SCREEN || ''),
      operationPill(row.USER_ROLE || meta.USER_ROLE || ''),
      durationLabel,
      statusPill(row.STATUS),
    ];
  });

  const modTable = createTable(
    ['Test ID', 'Test Name / Error', 'Screen', 'Role', 'Duration', 'Status'],
    tableRows
  );

  resultsHtml += `
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:12px;font-weight:700;color:var(--color-text)">${escHtml(mod)}</span>
        ${summaryPill}
      </div>
      ${modTable}
    </div>`;
}

// ─── Section 3: Failed tests detail ──────────────────────────────────────────

const failedRows = targetRows.filter(r => r.STATUS === 'FAIL');
let errorsHtml = '';

if (failedRows.length > 0) {
  const errorTableRows = failedRows.map(row => [
    `<span class="test-id">${escHtml(row.TEST_ID || '')}</span>`,
    escHtml(row.TEST_NAME || ''),
    `<div style="font-family:var(--font-mono);font-size:11px;color:var(--color-fail);white-space:pre-wrap;word-break:break-all">${escHtml(String(row.ERROR_MESSAGE || 'No error message'))}</div>`,
    row.SCREENSHOT_PATH
      ? `<span style="color:var(--color-accent);font-size:11px">${escHtml(row.SCREENSHOT_PATH)}</span>`
      : '<span style="color:var(--color-text-dim)">—</span>',
  ]);
  errorsHtml = createTable(['Test ID', 'Test Name', 'Error Message', 'Screenshot'], errorTableRows);
} else {
  errorsHtml = `<div style="color:var(--color-pass);font-size:12px;padding:16px 0">✓ No failures in this run</div>`;
}

// ─── Section 4: Run history timeline ─────────────────────────────────────────

const timelineRuns = sortedRuns.slice(0, 10).map(([runAt, rows]) => {
  const s = getStats(rows);
  const isTarget = runAt === targetRunAt;
  return {
    label: formatRunDate(runAt).split(',')[0], // just the date
    labelColor: isTarget ? 'var(--color-accent)' : 'var(--color-text-muted)',
    pass: s.pass, fail: s.fail, skip: s.skip, total: s.total,
    description: `${s.env} · ${s.runBy}${isTarget ? ' ← this run' : ''}`,
  };
});

const timelineHtml = createRunTimeline(timelineRuns);

// ─── Build full page ──────────────────────────────────────────────────────────

const sidebarStats = [
  { n: stats.pass,  l: 'Passed',  cls: 'n-pass' },
  { n: stats.fail,  l: 'Failed',  cls: 'n-fail' },
  { n: stats.skip,  l: 'Skipped', cls: 'n-skip' },
  { n: stats.total, l: 'Total',   cls: 'n-blue' },
];

const sidebarNav = [
  { href: '#summary',  label: 'Summary',        dot: '#4a90d9', active: true },
  { href: '#results',  label: 'Test Results',   dot: '#4caf50' },
  { href: '#errors',   label: `Failures (${stats.fail})`, dot: stats.fail > 0 ? '#f44336' : '#888' },
  { href: '#history',  label: 'Run History',    dot: '#9c6ef5' },
];

const content = [
  createSection('summary',  'Run Summary',       kpiContent),
  createSection('results',  'Test Results',      resultsHtml),
  createSection('errors',   `Failures — ${stats.fail} test${stats.fail !== 1 ? 's' : ''}`, errorsHtml),
  createSection('history',  'Run History (last 10 runs)', timelineHtml),
];

const html = getBaseHtml({
  title:       `${label} Test Report`,
  subtitle:    `${runDateLabel} · ${stats.env}`,
  badgeText:   'DeepTree · ADAPT',
  sidebarStats,
  sidebarNav,
  topbarTitle: `ADAPT — ${label} Test Report`,
  topbarMeta:  `${runDateLabel} · ${stats.pass}/${stats.total} passed · ${durationS}s`,
  progress:    { pass: passPct, fail: failPct, skip: skipPct },
  content,
  cssPath:     null, // inline CSS for portability
});

// ─── Write output files ───────────────────────────────────────────────────────

// Sync results back to Excel workbook's RESULTS sheet
if (fs.existsSync(xlsxFile)) {
  try {
    const wb = XLSX.readFile(xlsxFile);
    let ws = wb.Sheets['RESULTS'];
    let existing = ws ? XLSX.utils.sheet_to_json(ws) : [];
    
    // Clean up empty initial placeholder row if present
    if (existing.length === 1 && !existing[0].TEST_ID) {
      existing = [];
    }
    
    // Append current run results
    const newRows = allResults.map(r => ({
      TEST_ID: r.TEST_ID,
      TEST_NAME: r.TEST_NAME,
      MODULE: r.MODULE,
      SCREEN: r.SCREEN,
      USER_ROLE: r.USER_ROLE,
      STATUS: r.STATUS,
      ACTUAL_RESULT: r.ACTUAL_RESULT ?? '',
      ERROR_MESSAGE: r.ERROR_MESSAGE ?? '',
      SCREENSHOT_PATH: r.SCREENSHOT_PATH ?? '',
      RUN_DURATION_MS: r.RUN_DURATION_MS ?? 0,
      RUN_AT: r.RUN_AT,
      RUN_BY: r.RUN_BY,
      ENV: r.ENV,
    }));
    
    const allRows = [...existing, ...newRows];
    wb.Sheets['RESULTS'] = XLSX.utils.json_to_sheet(allRows);
    if (!wb.SheetNames.includes('RESULTS')) wb.SheetNames.push('RESULTS');
    XLSX.writeFile(wb, xlsxFile);
    console.log(`[ADAPT] Excel RESULTS sheet successfully updated with ${newRows.length} records.`);
  } catch (err) {
    console.error(`[ADAPT] Failed to write results back to Excel: ${err.message}`);
  }
}

const timestamp    = new Date(targetRunAt).toISOString().replace(/[:.]/g, '-').slice(0, 16);
const datedFile    = path.join(reportsDir, `report-${timestamp}.html`);
const latestFile   = path.join(reportsDir, 'report-latest.html');

fs.writeFileSync(datedFile,  html, 'utf-8');
fs.writeFileSync(latestFile, html, 'utf-8');

// Also write to project docs/ so index.html link works
const docsDir = path.join(projectDir, 'docs');
fs.mkdirSync(docsDir, { recursive: true });

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n[ADAPT] Report generated for: ${project}`);
console.log(`        Run:     ${runDateLabel}`);
console.log(`        Results: ${stats.pass} passed · ${stats.fail} failed · ${stats.skip} skipped (${durationS}s)`);
console.log(`\n  📄  ${datedFile}`);
console.log(`  📄  ${latestFile}`);

if (openFlag) {
  try {
    execSync(`start "" "${latestFile}"`, { stdio: 'ignore' });
    console.log('\n  🌐  Opened in browser');
  } catch { /* ignore */ }
}

console.log('');
