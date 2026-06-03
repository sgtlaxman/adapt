import * as XLSX from 'xlsx';

export type TestStatus = 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';

export interface TestResult {
  testId: string;
  testName: string;
  module: string;
  screen: string;
  userRole: string;
  status: TestStatus;
  actualResult: string;
  durationMs: number;
  errorMessage?: string;
  screenshotPath?: string;
}

export function writeResults(spreadsheetPath: string, results: TestResult[], env: string): void {
  const wb = XLSX.readFile(spreadsheetPath);

  let ws = wb.Sheets['RESULTS'];
  const existing = ws ? (XLSX.utils.sheet_to_json(ws) as any[]) : [];

  const now = new Date().toISOString();
  const runner = process.env.CI ? 'CI/CD Runner' : 'Local Dev';

  const newRows = results.map((r) => ({
    TEST_ID: r.testId,
    TEST_NAME: r.testName,
    MODULE: r.module,
    SCREEN: r.screen,
    USER_ROLE: r.userRole,
    STATUS: r.status,
    ACTUAL_RESULT: r.actualResult,
    ERROR_MESSAGE: r.errorMessage ?? '',
    SCREENSHOT_PATH: r.screenshotPath ?? '',
    RUN_DURATION_MS: r.durationMs,
    RUN_AT: now,
    RUN_BY: runner,
    ENV: env,
  }));

  const allRows = [...existing, ...newRows];
  wb.Sheets['RESULTS'] = XLSX.utils.json_to_sheet(allRows);
  if (!wb.SheetNames.includes('RESULTS')) wb.SheetNames.push('RESULTS');
  XLSX.writeFile(wb, spreadsheetPath);
}
