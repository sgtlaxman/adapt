import fs from 'fs';
import path from 'path';

const RUN_ID_FILE = '.current-run-id';

/**
 * Generates a new Run ID in the format ADAPT-YYYYMMDD-HHmmss.
 * Writes it to .current-run-id in the project directory.
 * Called once during globalSetup.
 */
export function generateRunId(projectDir: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const runId = `ADAPT-${date}-${time}`;

  fs.writeFileSync(path.join(projectDir, RUN_ID_FILE), runId, 'utf-8');
  console.log(`\n[ADAPT] Run ID: ${runId}`);
  return runId;
}

/**
 * Reads the current Run ID from .current-run-id.
 * Called by tests to tag data they create.
 */
export function getRunId(projectDir: string): string {
  const filePath = path.join(projectDir, RUN_ID_FILE);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[ADAPT] Run ID file not found at ${filePath}. Was globalSetup run?`);
  }
  return fs.readFileSync(filePath, 'utf-8').trim();
}

/**
 * Tags a string value with the current Run ID.
 * e.g. tagWithRunId('John Doe', runId) → 'John Doe [ADAPT-20260603-1430]'
 */
export function tagWithRunId(value: string, runId: string): string {
  return `${value} [${runId}]`;
}

/**
 * Strips the Run ID tag from a string.
 * e.g. 'John Doe [ADAPT-20260603-1430]' → 'John Doe'
 */
export function stripRunId(value: string): string {
  return value.replace(/\s*\[ADAPT-\d{8}-\d{4,6}\]/g, '').trim();
}
