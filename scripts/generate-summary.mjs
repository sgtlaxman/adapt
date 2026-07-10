import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const project = 'happyq';
const xlsxFile = path.join(ROOT, 'projects', project, 'data', 'HappyQ_Tests.xlsx');
const jsonFile = path.join(ROOT, 'projects', project, 'test-results.json');

if (!fs.existsSync(xlsxFile)) {
  console.error(`Spreadsheet not found: ${xlsxFile}`);
  process.exit(1);
}

// Helper to recursively find all E2E test files
function getE2eFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getE2eFiles(fullPath));
    } else if (file.endsWith('.e2e.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

// 1. Scan E2E test files for @placeholder stubs
const testsDir = path.join(ROOT, 'projects', project, 'tests');
const e2eFiles = getE2eFiles(testsDir);
const placeholders = [];

e2eFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.matchAll(/test\s*\(\s*['"`]([A-Za-z0-9-]+):?([^'"`]+@placeholder[^'"`]*)['"`]/g);
  const moduleName = path.basename(path.dirname(file));
  const displayModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  
  for (const match of matches) {
    placeholders.push({
      TEST_ID: match[1],
      MODULE: displayModule,
      TEST_NAME: match[2].replace('@placeholder', '').trim().replace(/^:\s*/, ''),
    });
  }
});

// 2. Read Playwright test results stats
let stats = { expected: 0, passed: 0, failed: 0, skipped: 0 };
if (fs.existsSync(jsonFile)) {
  try {
    const pwJson = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    if (pwJson.stats) {
      stats = {
        expected: pwJson.stats.expected || 0,
        passed: pwJson.stats.passed || 0,
        failed: pwJson.stats.failed || 0,
        skipped: pwJson.stats.skipped || 0
      };
    }
  } catch (err) {
    console.warn('Warning parsing test-results.json:', err);
  }
}

// 3. Format the Markdown Summary
const summaryMd = `
### 📊 ADAPT E2E Test Run Summary

* **Environment:** Staging
* **Total Tests Executed:** ${stats.expected}
* **Passed:** :white_check_mark: ${stats.passed}
* **Failed:** :x: ${stats.failed}
* **Skipped:** :black_right_pointing_double_triangle_with_bar: ${stats.skipped}

---

### ⏳ Pending Test Implementations (${placeholders.length} cases)

The following test cases are stubs/placeholders and are pending implementation:

| Test ID | Module | Title |
|---------|--------|-------|
${placeholders.map(p => `| \`${p.TEST_ID}\` | ${p.MODULE} | ${p.TEST_NAME.replace(' @placeholder', '')} |`).join('\n')}
`;

// 4. Output to GITHUB_STEP_SUMMARY if present, or stdout
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  fs.writeFileSync(summaryFile, summaryMd, { flag: 'a' });
  console.log(`Successfully appended job summary to ${summaryFile}`);
} else {
  console.log('\n--- GITHUB_STEP_SUMMARY MOCK ---');
  console.log(summaryMd);
  console.log('--------------------------------\n');
}
