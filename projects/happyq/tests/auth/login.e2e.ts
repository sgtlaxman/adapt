import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Auth tests always perform a real login — no saved session reuse
test.describe('Auth — Login', () => {
  test('AUTH-E2E-001: Valid login redirects to app', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_STANDARD_EMAIL!,
      process.env.TEST_USER_STANDARD_PASSWORD!
    );
    await loginPage.expectRedirectAfterLogin();
  });

  test('AUTH-E2E-002: Invalid password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.TEST_USER_STANDARD_EMAIL!, 'wrong-password');
    await loginPage.expectErrorMessage();
  });

  test('AUTH-E2E-003: Login page is accessible at /auth', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectLoginPageVisible();
  });
});
