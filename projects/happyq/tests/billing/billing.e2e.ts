import { test } from '@playwright/test';
import path from 'path';
import { BillingPage } from '../../pages/billing/BillingPage';

// Billing module tests run as Billing role
test.use({ storageState: path.resolve(__dirname, '../../.auth/billing.json') });

test.describe('Billing', () => {
  test('BIL-E2E-001: Billing dashboard loads', async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
  });

  test('BIL-E2E-002: Billing history page loads', async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.gotoHistory();
    await billingPage.expectLoaded();
  });

  test('BIL-E2E-003: Outstanding balances page loads', async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.gotoOutstanding();
  });
});

// RBA — Clinician should not access Billing
test.describe('RBA — Billing access denied for Clinician', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/clinician.json') });

  test('RBA-BIL-001: Clinician cannot access billing dashboard', async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectAccessDenied();
  });
});
