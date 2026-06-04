import { test } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

test('debug login', async ({ page }) => {
  await page.goto('/auth');
  await page.screenshot({ path: 'screenshots/debug-01-loaded.png' });

  await page.getByRole('tab', { name: /email/i }).click();
  await page.screenshot({ path: 'screenshots/debug-02-tab-clicked.png' });

  await page.getByPlaceholder('example@email.com').fill(process.env.TEST_USER_STANDARD_EMAIL!);
  await page.getByPlaceholder('••••••••').fill(process.env.TEST_USER_STANDARD_PASSWORD!);
  await page.screenshot({ path: 'screenshots/debug-03-filled.png' });

  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'screenshots/debug-04-after-submit.png' });

  console.log('Current URL after submit:', page.url());
});
