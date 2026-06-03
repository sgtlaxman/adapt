/**
 * update-testbook.mjs — Smart merge engine for ADAPT test workbooks.
 *
 * Usage: node scripts/update-testbook.mjs --project <name>
 *
 * Merge rules:
 *   - New TEST_ID in script  → added as new row
 *   - Existing TEST_ID       → structural columns updated from script;
 *                              TEST_DATA, RUN, NOTES preserved from Excel
 *   - TEST_ID in Excel only  → kept, NOTES flagged as [OBSOLETE]
 *   - TEST_USERS sheet       → always replaced (no user edits expected)
 *   - RESULTS sheet          → never touched
 */

import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Parse --project argument ─────────────────────────────────────────────────

const projectArg = process.argv.indexOf('--project');
if (projectArg === -1 || !process.argv[projectArg + 1]) {
  console.error('\n❌  Usage: node scripts/update-testbook.mjs --project <name>\n');
  process.exit(1);
}
const project = process.argv[projectArg + 1].toLowerCase();

// ─── Resolve paths ────────────────────────────────────────────────────────────

const dataFile   = path.resolve(__dirname, `testdata/${project}.mjs`);
const projectLabel = project === 'happyq' ? 'HappyQ' : capitalise(project);
const excelFile    = path.resolve(__dirname, `../projects/${project}/data/${projectLabel}_Tests.xlsx`);

if (!fs.existsSync(dataFile)) {
  console.error(`\n❌  No test data file found at: ${dataFile}\n`);
  process.exit(1);
}

// ─── Load test data definitions ───────────────────────────────────────────────

const { testControl, e2eTests, testUsers } = await import(pathToFileURL(dataFile).href);

// ─── Merge helper ─────────────────────────────────────────────────────────────

/**
 * Merges script rows into existing Excel rows.
 * User-owned columns (TEST_DATA, RUN, NOTES) are preserved from Excel.
 * Structural columns are always updated from the script.
 * Rows in Excel but not in script are kept and flagged [OBSOLETE].
 */
function mergeSheet(scriptRows, existingRows, userOwnedCols) {
  const scriptMap  = new Map(scriptRows.map(r  => [r.TEST_ID, r]));
  const existingMap = new Map(existingRows.map(r => [r.TEST_ID, r]));

  const stats = { added: 0, updated: 0, preserved: 0, obsolete: 0 };
  const merged = [];

  // Process all script rows (maintains script order for new + existing)
  for (const scriptRow of scriptRows) {
    const existing = existingMap.get(scriptRow.TEST_ID);
    if (!existing) {
      // New row — add from script as-is
      merged.push({ ...scriptRow });
      stats.added++;
    } else {
      // Existing row — merge: script owns structural cols, user owns TEST_DATA/RUN/NOTES
      const mergedRow = { ...scriptRow };
      for (const col of userOwnedCols) {
        if (existing[col] !== undefined && existing[col] !== '') {
          mergedRow[col] = existing[col];
        }
      }
      merged.push(mergedRow);
      stats.updated++;
    }
  }

  // Flag rows in Excel that no longer exist in script
  for (const existingRow of existingRows) {
    if (!scriptMap.has(existingRow.TEST_ID)) {
      const notes = existingRow.NOTES ?? '';
      merged.push({
        ...existingRow,
        NOTES: notes.includes('[OBSOLETE]') ? notes : `[OBSOLETE] ${notes}`.trim(),
      });
      stats.obsolete++;
    }
  }

  return { rows: merged, stats };
}

// ─── Load or create workbook ──────────────────────────────────────────────────

let wb;
let existingControl = [];
let existingE2E     = [];

const isNew = !fs.existsSync(excelFile);

if (isNew) {
  console.log(`\n[ADAPT] No existing workbook found — creating fresh: ${excelFile}`);
  wb = XLSX.utils.book_new();
} else {
  console.log(`\n[ADAPT] Existing workbook found — merging: ${excelFile}`);
  wb = XLSX.readFile(excelFile);
  existingControl = wb.Sheets['TEST_CONTROL']
    ? XLSX.utils.sheet_to_json(wb.Sheets['TEST_CONTROL'], { defval: '' })
    : [];
  existingE2E = wb.Sheets['E2E_TESTS']
    ? XLSX.utils.sheet_to_json(wb.Sheets['E2E_TESTS'], { defval: '' })
    : [];
}

// ─── Merge TEST_CONTROL ───────────────────────────────────────────────────────

const controlResult = mergeSheet(
  testControl,
  existingControl,
  ['RUN', 'NOTES']           // user owns these two columns
);
wb.Sheets['TEST_CONTROL'] = XLSX.utils.json_to_sheet(controlResult.rows);
if (!wb.SheetNames.includes('TEST_CONTROL')) wb.SheetNames.push('TEST_CONTROL');

// ─── Merge E2E_TESTS ──────────────────────────────────────────────────────────

const e2eResult = mergeSheet(
  e2eTests,
  existingE2E,
  ['TEST_DATA', 'RUN', 'NOTES']   // user owns test data, run flag, notes
);
wb.Sheets['E2E_TESTS'] = XLSX.utils.json_to_sheet(e2eResult.rows);
if (!wb.SheetNames.includes('E2E_TESTS')) wb.SheetNames.push('E2E_TESTS');

// ─── Always replace TEST_USERS (no user edits expected) ──────────────────────

wb.Sheets['TEST_USERS'] = XLSX.utils.json_to_sheet(testUsers);
if (!wb.SheetNames.includes('TEST_USERS')) wb.SheetNames.push('TEST_USERS');

// ─── Ensure RESULTS sheet exists with headers (never overwrite data) ─────────

if (!wb.SheetNames.includes('RESULTS')) {
  wb.Sheets['RESULTS'] = XLSX.utils.json_to_sheet([{
    TEST_ID: '', TEST_NAME: '', MODULE: '', SCREEN: '', USER_ROLE: '',
    STATUS: '', ACTUAL_RESULT: '', ERROR_MESSAGE: '', SCREENSHOT_PATH: '',
    RUN_DURATION_MS: '', RUN_AT: '', RUN_BY: '', ENV: '',
  }]);
  wb.SheetNames.push('RESULTS');
}

// ─── Write workbook ───────────────────────────────────────────────────────────

fs.mkdirSync(path.dirname(excelFile), { recursive: true });
XLSX.writeFile(wb, excelFile);

// ─── Report ───────────────────────────────────────────────────────────────────

console.log(`\n✅  Testbook updated: ${excelFile}`);
console.log(`\n   TEST_CONTROL:`);
console.log(`     ${controlResult.stats.added}   row(s) added`);
console.log(`     ${controlResult.stats.updated}  row(s) updated (structural columns)`);
console.log(`     ${controlResult.stats.obsolete}   row(s) flagged [OBSOLETE]`);
console.log(`\n   E2E_TESTS:`);
console.log(`     ${e2eResult.stats.added}   row(s) added`);
console.log(`     ${e2eResult.stats.updated}  row(s) updated (TEST_DATA / RUN / NOTES preserved)`);
console.log(`     ${e2eResult.stats.obsolete}   row(s) flagged [OBSOLETE]`);
console.log(`\n   TEST_USERS: replaced (${testUsers.length} roles)`);
console.log(`   RESULTS:    untouched\n`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
