/**
 * auth.setup.ts — Logs in once per role and saves storageState to .auth/<role>.json
 * Runs as a Playwright setup project before the main test suite.
 */

import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.resolve(__dirname, '../../.auth');
fs.mkdirSync(AUTH_DIR, { recursive: true });

const ROLES = [
  {
    role: 'standard',
    emailKey: 'TEST_USER_STANDARD_EMAIL',
    passwordKey: 'TEST_USER_STANDARD_PASSWORD',
  },
  {
    role: 'receptionist',
    emailKey: 'TEST_USER_RECEPTIONIST_EMAIL',
    passwordKey: 'TEST_USER_RECEPTIONIST_PASSWORD',
  },
  {
    role: 'doctor',
    emailKey: 'TEST_USER_DOCTOR_EMAIL',
    passwordKey: 'TEST_USER_DOCTOR_PASSWORD',
  },
  {
    role: 'accountant',
    emailKey: 'TEST_USER_ACCOUNTANT_EMAIL',
    passwordKey: 'TEST_USER_ACCOUNTANT_PASSWORD',
  },
  {
    role: 'admin',
    emailKey: 'TEST_USER_ADMIN_EMAIL',
    passwordKey: 'TEST_USER_ADMIN_PASSWORD',
  },
];

for (const { role, emailKey, passwordKey } of ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const email    = process.env[emailKey];
    const password = process.env[passwordKey];
    const authFile = path.join(AUTH_DIR, `${role}.json`);

    if (!email || !password) {
      console.warn(`[ADAPT] Skipping ${role} — ${emailKey} or ${passwordKey} not set in .env.local`);
      return;
    }

    // Log Supabase auth response to diagnose login failures
    page.on('response', async (response) => {
      if (response.url().includes('/auth/v1/token')) {
        const status = response.status();
        const body = await response.json().catch(() => ({}));
        console.log(`[AUTH] Supabase /token response status: ${status}`);
        if (status !== 200) console.log(`[AUTH] Error:`, JSON.stringify(body));
      }
    });

    await page.goto('/auth');

    // Login page defaults to Phone tab — click Email tab first
    await page.getByRole('tab', { name: /email/i }).click();

    // Scope all interactions to the active tab panel to avoid hidden Register tab fields
    const activePanel = page.locator('[role="tabpanel"][data-state="active"]');

    // Fill email
    await activePanel.getByPlaceholder('example@email.com').fill(email);

    // Fill password — scoped to active panel, force bypasses Radix animation checks
    const passwordInput = activePanel.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password, { force: true });

    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect away from /auth
    await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });

    // Save session to .auth/<role>.json
    await page.context().storageState({ path: authFile });
    console.log(`[ADAPT] Auth saved for role: ${role} → ${authFile}`);
  });
}
