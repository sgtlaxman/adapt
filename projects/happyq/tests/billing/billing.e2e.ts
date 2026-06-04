import { test } from '@playwright/test';
import path from 'path';
import { BillingPage } from '../../pages/billing/BillingPage';
import { BillingHistoryPage } from '../../pages/billing/BillingHistoryPage';
import { BillingOutstandingPage } from '../../pages/billing/BillingOutstandingPage';
import { BillingReportsPage } from '../../pages/billing/BillingReportsPage';
import { BillingSettlementPage } from '../../pages/billing/BillingSettlementPage';
import { BillingDailyCashPage } from '../../pages/billing/BillingDailyCashPage';

test.use({ storageState: path.resolve(__dirname, '../../.auth/accountant.json') });

test.describe('Billing — Dashboard', () => {
  test('BIL-E2E-001: Billing dashboard loads', async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
  });

  // TFC Admin (standard) has access to billing history
  test.describe('BIL-E2E-002 group', () => {
    test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });
    test('BIL-E2E-002: Billing history page loads', async ({ page }) => {
      const historyPage = new BillingHistoryPage(page);
      await historyPage.goto();
      await historyPage.expectLoaded();
    });
  });
});

// TODO: Outstanding balances needs specific permission — identify correct role and enable
// Currently skipped: permission denied for both standard and accountant roles
test.describe('Billing — Outstanding', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });
  test.skip(); // Remove skip once correct role is identified

  test('BIL-E2E-003: Outstanding balances page loads', async ({ page }) => {
    const outstandingPage = new BillingOutstandingPage(page);
    await outstandingPage.goto();
    await outstandingPage.expectLoaded();
  });

  test('BIL-E2E-004: Filter outstanding by Contacted tab', async ({ page }) => {
    const outstandingPage = new BillingOutstandingPage(page);
    await outstandingPage.goto();
    await outstandingPage.expectLoaded();
    await outstandingPage.filterByStatus('contacted');
  });

  test('BIL-E2E-005: Search in outstanding balances', async ({ page }) => {
    const outstandingPage = new BillingOutstandingPage(page);
    await outstandingPage.goto();
    await outstandingPage.expectLoaded();
    await outstandingPage.search('Test');
  });
});

test.describe('Billing — Reports', () => {
  test('BIL-E2E-006: Invoice reports page loads', async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await reportsPage.expectLoaded();
  });

  test('BIL-E2E-007: Switch to audit log tab', async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await reportsPage.expectLoaded();
    await reportsPage.switchToAuditLog();
  });
});

test.describe('Billing — Settlement & Daily Cash', () => {
  test('BIL-E2E-008: Settlement dashboard loads', async ({ page }) => {
    const settlementPage = new BillingSettlementPage(page);
    await settlementPage.goto();
    await settlementPage.expectLoaded();
  });

  test('BIL-E2E-009: Daily cash dashboard loads', async ({ page }) => {
    const dailyCashPage = new BillingDailyCashPage(page);
    await dailyCashPage.goto();
    await dailyCashPage.expectLoaded();
  });
});

test.describe('RBA — Billing denied for Doctor', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/doctor.json') });

  test('RBA-BIL-001: Clinician cannot access billing dashboard', async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectAccessDenied();
  });
});

test.describe('RBA — Billing denied for Receptionist', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/receptionist.json') });

  test('RBA-BIL-002: Front Desk cannot access billing dashboard', async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectAccessDenied();
  });
});
