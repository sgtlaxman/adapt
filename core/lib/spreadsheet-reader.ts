import * as XLSX from 'xlsx';
import path from 'path';

export interface TestCase {
  testId: string;
  module: string;
  screen: string;
  layer: string;
  priority: string;
  run: 'YES' | 'NO';
  testName: string;
  description: string;
  userRole: string;
  preconditions: string;
  testData: Record<string, any>;
  expectedResult: string;
  tags: string[];
}

export interface TestUser {
  role: string;
  emailEnvKey: string;
  passwordEnvKey: string;
}

export function loadActiveTests(spreadsheetPath: string): TestCase[] {
  const wb = XLSX.readFile(spreadsheetPath);

  const controlSheet = wb.Sheets['TEST_CONTROL'];
  if (!controlSheet) throw new Error('Sheet "TEST_CONTROL" not found');
  const controlRows = XLSX.utils.sheet_to_json(controlSheet, { defval: '' }) as Record<string, any>[];
  const activeIds = new Set(
    controlRows.filter((r) => r['RUN'] === 'YES').map((r) => r['TEST_ID'] as string)
  );

  const testSheet = wb.Sheets['E2E_TESTS'];
  if (!testSheet) throw new Error('Sheet "E2E_TESTS" not found');
  const testRows = XLSX.utils.sheet_to_json(testSheet, { defval: '' }) as Record<string, any>[];

  return testRows
    .filter((r) => activeIds.has(r['TEST_ID'] as string))
    .map((r) => ({
      testId: r['TEST_ID'],
      module: r['MODULE'],
      screen: r['SCREEN'],
      layer: r['LAYER'],
      priority: r['PRIORITY'],
      run: r['RUN'] as 'YES' | 'NO',
      testName: r['TEST_NAME'],
      description: r['DESCRIPTION'],
      userRole: r['USER_ROLE'] ?? 'STANDARD',
      preconditions: r['PRECONDITIONS'],
      testData: safeParseJson(r['TEST_DATA']),
      expectedResult: r['EXPECTED_RESULT'],
      tags: r['TAGS'] ? String(r['TAGS']).split(',').map((s) => s.trim()) : [],
    }));
}

export function loadTestUsers(spreadsheetPath: string): TestUser[] {
  const wb = XLSX.readFile(spreadsheetPath);
  const sheet = wb.Sheets['TEST_USERS'];
  if (!sheet) throw new Error('Sheet "TEST_USERS" not found');
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, any>[];
  return rows.map((r) => ({
    role: r['ROLE'],
    emailEnvKey: r['EMAIL_ENV_KEY'],
    passwordEnvKey: r['PASSWORD_ENV_KEY'],
  }));
}

function safeParseJson(str: string): Record<string, any> {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
