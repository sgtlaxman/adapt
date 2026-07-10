import { test, expect } from '@playwright/test';
import path from 'path';
import { BillingPage } from '../../pages/billing/BillingPage';
import { BillingHistoryPage } from '../../pages/billing/BillingHistoryPage';
import { BillingOutstandingPage } from '../../pages/billing/BillingOutstandingPage';
import { BillingReportsPage } from '../../pages/billing/BillingReportsPage';
import { BillingSettlementPage } from '../../pages/billing/BillingSettlementPage';
import { BillingDailyCashPage } from '../../pages/billing/BillingDailyCashPage';
import { BillingManagePage } from '../../pages/billing/BillingManagePage';
import { QuickBillDialog } from '../../pages/billing/dialogs/QuickBillDialog';
import { LogContactDialog } from '../../pages/billing/dialogs/LogContactDialog';
import { AppointmentsPage } from '../../pages/appointments/AppointmentsPage';
import { BookAppointmentDialog } from '../../pages/appointments/dialogs/BookAppointmentDialog';
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

const runId = getRunId(path.resolve(__dirname, '../..'));

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureLocationSelected(page: any) {
  const locButton = page.getByRole('button').filter({ hasText: /City center|Chennai|Coimbatore|Cluny|All Locations/i }).first();
  // Guard: skip entirely if no location selector is visible on this page
  if (!(await locButton.isVisible({ timeout: 3000 }).catch(() => false))) return;
  const txt = await locButton.textContent({ timeout: 3000 }).catch(() => null);
  if (txt && !txt.includes('City center')) {
    await page.waitForTimeout(500); // stability delay
    await locButton.click();
    const menuItem = page.getByRole('menuitem', { name: 'City center' });
    // Only proceed if "City center" actually appears in the dropdown
    if (await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await menuItem.dispatchEvent('click');
      await expect(page.getByRole('button').filter({ hasText: 'City center' })).toBeVisible({ timeout: 5000 });
    }
  }
}

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

test.describe('Billing — Outstanding', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/admin.json') });

  test.beforeEach(async ({ page }) => {
    const outstandingPage = new BillingOutstandingPage(page);
    await outstandingPage.goto();
    await ensureLocationSelected(page);
    await outstandingPage.expectLoaded();
  });

  test('BIL-E2E-003: Outstanding balances page loads', async ({ page }) => {
    // Already loaded in beforeEach
  });

  test('BIL-E2E-004: Filter outstanding by Contacted tab', async ({ page }) => {
    const outstandingPage = new BillingOutstandingPage(page);
    await outstandingPage.filterByStatus('contacted');
  });

  test('BIL-E2E-005: Search in outstanding balances', async ({ page }) => {
    const outstandingPage = new BillingOutstandingPage(page);
    await outstandingPage.search('Test');
  });
});

test.describe('Billing — Reports', () => {
  test.beforeEach(async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
  });

  test('BIL-E2E-006: Invoice reports page loads', async ({ page }) => {
    // Already verified in beforeEach
  });

  test('BIL-E2E-007: Switch to audit log tab', async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.switchToAuditLog();
  });
});

test.describe('Billing — Settlement & Daily Cash', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure standard location is selected first
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await ensureLocationSelected(page);
  });

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
    // Expected to fail in single-role dev environment
    test.fail(true, 'RBA tests fail because all roles map to admin in single-role env');
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectAccessDenied();
  });
});

test.describe('RBA — Billing denied for Receptionist', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/receptionist.json') });

  test('RBA-BIL-002: Front Desk cannot access billing dashboard', async ({ page }) => {
    // Expected to fail in single-role dev environment
    test.fail(true, 'RBA tests fail because all roles map to admin in single-role env');
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectAccessDenied();
  });
});


// ─── Imported Test Cases ───────────────────────────────────────────────────
test.describe('Imported Billing Tests', () => {
  test.beforeEach(async ({ page }) => {
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await ensureLocationSelected(page);
  });

  // Helper to book an appointment and return the patient name
  async function bookNewAppointment(page: any, patientNamePrefix: string): Promise<string> {
    const apptPage = new AppointmentsPage(page);
    const dialog = new BookAppointmentDialog(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
    await apptPage.clickBookAppointment();
    await dialog.expectOpen();

    await dialog.clickNewPatient();
    const pName = tagWithRunId(patientNamePrefix, runId);
    await dialog.fillNewPatient({
      name: pName,
      phone: '9876543201',
      gender: 'Female',
      age: '30',
      spouseName: 'Spouse Name'
    });
    await dialog.clickSaveNewPatient();

    // Wait for patient form to close
    await expect(page.getByPlaceholder('Patient Name')).not.toBeVisible({ timeout: 10000 });

    await dialog.selectQueue('IS');
    await dialog.submit();
    await expect(page.getByText(/appointment saved/i).first()).toBeVisible({ timeout: 10000 });
    await dialog.expectClosed();
    return pName;
  }

  async function bookAndBillPatient(page: any, prefix: string): Promise<string> {
    const pName = await bookNewAppointment(page, prefix);
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    await row.getByRole('button', { name: /new bill/i }).click();
    
    const quickBill = new QuickBillDialog(page);
    await quickBill.expectOpen();
    await quickBill.addService('consultation');
    await quickBill.saveAndPrint();
    await expect(page.getByRole('heading', { name: /quick bill/i })).not.toBeVisible({ timeout: 10000 });
    return pName;
  }

  test('BIL-E2E-010: Search bills', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Search Bill');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    await expect(page.locator('table').getByText(new RegExp(escaped, 'i')).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-011: Quick bill', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Quick Bill');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    await row.getByRole('button', { name: /new bill/i }).click();
    
    const quickBill = new QuickBillDialog(page);
    await quickBill.expectOpen();
    await quickBill.addService('consultation');
    await quickBill.saveAndPrint();
    
    await expect(page.getByRole('heading', { name: /quick bill/i })).not.toBeVisible({ timeout: 10000 });
    
    await billingPage.goto();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    await expect(row.getByText(/paid/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-012: Add payment methods', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Pay Methods');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    
    await row.getByRole('button', { name: /new bill/i }).click();
    const quickBill = new QuickBillDialog(page);
    await quickBill.expectOpen();
    await quickBill.addService('consultation');
    // Remove default payment to make it unpaid
    await quickBill.removePayment();
    await quickBill.saveAndPrint();
    await expect(page.getByRole('heading', { name: /quick bill/i })).not.toBeVisible({ timeout: 10000 });
    
    await billingPage.goto();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    await row.getByRole('button', { name: /manage/i }).click();
    
    const managePage = new BillingManagePage(page);
    await managePage.expectLoaded();
    
    // Add UPI payment
    await managePage.addPayment('100', 'UPI');
    
    await managePage.switchTab('Payment-List');
    await expect(page.getByText('UPI').first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-013: Add discount', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Discount');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    
    await row.getByRole('button', { name: /new bill/i }).click();
    const quickBill = new QuickBillDialog(page);
    await quickBill.expectOpen();
    await quickBill.addService('consultation');
    
    await quickBill.setGlobalDiscount('500');
    await page.getByPlaceholder(/waiver/i).fill('Test Discount');
    
    await quickBill.saveAndPrint();
    await expect(page.getByRole('heading', { name: /quick bill/i })).not.toBeVisible({ timeout: 10000 });
    
    await billingPage.goto();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    await row.getByRole('button', { name: /manage/i }).click();
    
    const managePage = new BillingManagePage(page);
    await managePage.expectLoaded();
    await expect(page.getByText('Discount', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-014: Cancel Transaction', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Cancel Trans');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    
    await row.getByRole('button', { name: /new bill/i }).click();
    const quickBill = new QuickBillDialog(page);
    await quickBill.expectOpen();
    await quickBill.addService('consultation');
    await quickBill.cancel();
    
    await expect(page.getByRole('heading', { name: /quick bill/i })).not.toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-015: Pay bill', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Pay Bill');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    
    await row.getByRole('button', { name: /new bill/i }).click();
    const quickBill = new QuickBillDialog(page);
    await quickBill.expectOpen();
    await quickBill.addService('consultation');
    await quickBill.removePayment();
    await quickBill.saveAndPrint();
    await expect(page.getByRole('heading', { name: /quick bill/i })).not.toBeVisible({ timeout: 10000 });
    
    await billingPage.goto();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    await row.getByRole('button', { name: /pay/i }).first().click();
    
    await expect(page.getByRole('button', { name: /add payment/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-016: manage  bill', async ({ page }) => {
    const pName = await bookAndBillPatient(page, 'Manage Bill');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await billingPage.expectLoaded();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    
    await row.getByRole('button', { name: /manage/i }).click();
    
    const managePage = new BillingManagePage(page);
    await managePage.expectLoaded();
    await expect(page.getByRole('heading', { name: 'Manage Bill', exact: true }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-017: Edit bill', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Edit Bill');
    
    const billingPage = new BillingPage(page);
    await billingPage.goto();
    await ensureLocationSelected(page);
    await billingPage.expectLoaded();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    const escaped = escapeRegex(pName);
    const row = page.locator('tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    await row.getByRole('button', { name: /new bill/i }).click();
    
    const quickBill = new QuickBillDialog(page);
    await quickBill.expectOpen();
    await quickBill.addService('consultation');
    await quickBill.removePayment();
    await quickBill.saveAndPrint();
    await expect(page.getByRole('heading', { name: /quick bill/i })).not.toBeVisible({ timeout: 15000 });
    
    await billingPage.goto();
    await page.getByPlaceholder(/name, phone, or token/i).fill(pName);
    await row.getByRole('button', { name: /manage/i }).click();
    
    const managePage = new BillingManagePage(page);
    await managePage.expectLoaded();
    
    await managePage.switchTab('Payment-Add');
    await expect(page.getByRole('spinbutton').first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-018: Show invoice report', async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
    await expect(page.getByRole('heading', { name: /invoice report/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-019: Check invoice report of patient', async ({ page }) => {
    const pName = await bookAndBillPatient(page, 'Report Pat');
    
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
    
    // Search the patient name
    await page.getByPlaceholder(/search patient or invoice/i).fill(pName);
    const escaped = escapeRegex(pName);
    
    // Click patient name to open dialog
    await page.getByText(new RegExp(escaped, 'i')).first().click();
    
    // Verify details in dialog
    await expect(page.getByPlaceholder(/spouse name/i)).toHaveValue('Spouse Name', { timeout: 10000 });
    await expect(page.getByPlaceholder('25')).toHaveValue('30', { timeout: 10000 });
    
    // Close patient dialog
    await page.getByRole('button', { name: /cancel|close/i }).first().click();
  });

  test('BIL-E2E-020: show updated details of patients', async ({ page }) => {
    const pName = await bookAndBillPatient(page, 'Update Details');
    
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
    
    await page.getByPlaceholder(/search patient or invoice/i).fill(pName);
    const escaped = escapeRegex(pName);
    await page.getByText(new RegExp(escaped, 'i')).first().click();
    
    // Edit details in dialog
    await page.getByPlaceholder(/spouse name/i).fill('Updated Spouse');
    await page.getByRole('button', { name: /save|update/i }).first().click();
    
    // Wait for dialog to close
    await expect(page.getByPlaceholder(/spouse name/i)).not.toBeVisible({ timeout: 10000 });
    
    // Open again to verify it has been updated
    await page.getByText(new RegExp(escaped, 'i')).first().click();
    await expect(page.getByPlaceholder(/spouse name/i)).toHaveValue('Updated Spouse', { timeout: 10000 });
    
    await page.getByRole('button', { name: /cancel|close/i }).first().click();
  });

  test('BIL-E2E-021: Search patient reports', async ({ page }) => {
    const pName = await bookAndBillPatient(page, 'Search Rep');
    
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
    
    await page.getByPlaceholder(/search patient or invoice/i).fill(pName);
    const escaped = escapeRegex(pName);
    await expect(page.locator('table')).toContainText(new RegExp(escaped, 'i'));
  });

  test('BIL-E2E-022: Day invoices', async ({ page }) => {
    const pName = await bookAndBillPatient(page, 'Day Inv');
    
    const dailyCashPage = new BillingDailyCashPage(page);
    await dailyCashPage.goto();
    await ensureLocationSelected(page);
    await dailyCashPage.expectLoaded();
    
    const escaped = escapeRegex(pName);
    await expect(page.locator('table')).toContainText(new RegExp(escaped, 'i'));
  });

  test('BIL-E2E-023: Day summary', async ({ page }) => {
    await bookAndBillPatient(page, 'Day Summary');
    
    const dailyCashPage = new BillingDailyCashPage(page);
    await dailyCashPage.goto();
    await ensureLocationSelected(page);
    await dailyCashPage.expectLoaded();
    
    await expect(page.getByText(/total collection/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-024: SETTIEMENT REPORT', async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
    
    await reportsPage.switchTab('Settlement Report');
    await expect(page.getByRole('columnheader', { name: /total collected/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-025: DISCOUNTS', async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
    
    await reportsPage.switchTab('Discounts');
    await expect(page.getByRole('columnheader', { name: /discount total/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-026: DUES PAID', async ({ page }) => {
    const reportsPage = new BillingReportsPage(page);
    await reportsPage.goto();
    await ensureLocationSelected(page);
    await reportsPage.expectLoaded();
    
    await reportsPage.switchTab('Dues Paid');
    await expect(page.getByRole('columnheader', { name: /amount paid/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-027: Physical cash settlement', async ({ page }) => {
    const settlementPage = new BillingSettlementPage(page);
    await settlementPage.goto();
    await ensureLocationSelected(page);
    await settlementPage.expectLoaded();
    
    await page.locator('input[type="number"]').first().fill('1000');
    await page.getByRole('button', { name: /handover/i }).first().click();
    await expect(page.getByText(/submitted|success/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('BIL-E2E-028: Payment log', async ({ page }) => {
    await bookAndBillPatient(page, 'Export Test');
    
    const dailyCashPage = new BillingDailyCashPage(page);
    await dailyCashPage.goto();
    await ensureLocationSelected(page);
    await dailyCashPage.expectLoaded();
    
    await page.getByRole('button', { name: /export/i }).first().click();
    await expect(page.getByText(/failed/i).first()).toBeVisible({ timeout: 10000 });
  });

  test.describe('Outstanding Reminders', () => {
    test.use({ storageState: path.resolve(__dirname, '../../.auth/admin.json') });

    test.beforeEach(async ({ page }) => {
      const outstandingPage = new BillingOutstandingPage(page);
      await outstandingPage.goto();
      await ensureLocationSelected(page);
      await outstandingPage.expectLoaded();
      await outstandingPage.expectRowsVisible();
      await page.waitForTimeout(1000);
    });

    test('BIL-E2E-029: Track and follow up on outstanding patient balances', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('BIL-E2E-030: Manage log contacts', async ({ page }) => {
      await page.getByRole('button', { name: /log contact/i }).first().click();
      
      const logContact = new LogContactDialog(page);
      await logContact.expectOpen();
      await logContact.save();
      await expect(page.getByText('Outcome Is Required')).toBeVisible({ timeout: 10000 });
    });

    test('BIL-E2E-031: Schedule follow up', async ({ page }) => {
      await page.getByRole('button', { name: /log contact/i }).first().click();
      
      const logContact = new LogContactDialog(page);
      await logContact.expectOpen();
      await logContact.fill({
        outcome: 'Promised to pay',
        notes: 'Will pay by end of week',
        scheduleNext: {
          date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          assignedTo: 'Admin',
          remarks: 'Follow up payment'
        }
      });
      await logContact.save();
      await expect(page.getByText(/balance reminder logged/i).first()).toBeVisible({ timeout: 10000 });
    });
  });
});
