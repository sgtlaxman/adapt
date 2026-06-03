import { chromium } from '@playwright/test';
import path from 'path';
import { loadTestUsers } from '../lib/spreadsheet-reader';
import * as dotenv from 'dotenv';

/**
 * Logs in once per role and saves storageState to .auth/<role>.json.
 * Called as a Playwright setup project before the main test suite runs.
 *
 * Usage: import and call runAuthSetup(spreadsheetPath, authDir, loginUrl) from
 * your project's auth.setup.ts fixture.
 */
export async function runAuthSetup(
  spreadsheetPath: string,
  authDir: string,
  loginUrl: string,
  envPath: string
): Promise<void> {
  dotenv.config({ path: envPath });

  const users = loadTestUsers(spreadsheetPath);
  const browser = await chromium.launch();

  for (const user of users) {
    const email = process.env[user.emailEnvKey];
    const password = process.env[user.passwordEnvKey];

    if (!email || !password) {
      console.warn(`Skipping role ${user.role} — env vars not set (${user.emailEnvKey}, ${user.passwordEnvKey})`);
      continue;
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(loginUrl);
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });

    const storageFile = path.join(authDir, `${user.role.toLowerCase()}.json`);
    await context.storageState({ path: storageFile });
    await context.close();

    console.log(`Auth saved for role: ${user.role} → ${storageFile}`);
  }

  await browser.close();
}
