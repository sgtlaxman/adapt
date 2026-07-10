import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';
import { ReceptionPage } from '../../pages/reception/ReceptionPage';
import { AppointmentsPage } from '../../pages/appointments/AppointmentsPage';
import { BookAppointmentDialog } from '../../pages/appointments/dialogs/BookAppointmentDialog';
import { EditAppointmentDialog } from '../../pages/reception/dialogs/EditAppointmentDialog';
import { BillingManagePage } from '../../pages/billing/BillingManagePage';
import { PatientDialog } from '../../pages/patients/dialogs/PatientDialog';
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

test.use({ storageState: path.resolve(__dirname, '../../.auth/receptionist.json') });

const runId = getRunId(path.resolve(__dirname, '../..'));

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function bookNewAppointment(page: Page, namePrefix: string): Promise<string> {
  const apptPage = new AppointmentsPage(page);
  const dialog = new BookAppointmentDialog(page);
  await apptPage.goto();
  await apptPage.expectLoaded();
  await apptPage.clickBookAppointment();
  await dialog.expectOpen();

  // Create new patient
  await dialog.clickNewPatient();
  const pName = tagWithRunId(namePrefix, runId);
  await dialog.fillNewPatient({
    name: pName,
    phone: '9876543209',
    gender: 'Female',
    age: '28'
  });
  await dialog.clickSaveNewPatient();

  // Wait for patient creation to complete and form to close
  await expect(page.getByPlaceholder('Patient Name')).not.toBeVisible({ timeout: 10000 });

  // Select Queue
  await dialog.selectQueue('IS');

  // Submit
  await dialog.submit();
  await dialog.expectClosed();
  
  // Wait for the save notification
  await expect(page.getByText(/appointment saved/i).first()).toBeVisible({ timeout: 10000 });
  
  return pName;
}

async function performStatusTransition(
  page: Page,
  pName: string,
  actionLabel: string, 
  expectedBadgeText: string, 
  fillDialog?: (dialog: Locator) => Promise<void>,
  cardDisappears: boolean = false
) {
  const patientCard = page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName }).first();
  const transitionButton = patientCard.locator('div.mt-4 button, div.flex.flex-wrap button, td button').filter({ hasText: actionLabel }).first();
  await transitionButton.click();

  // Check if a modal/dialog opens.
  // Allow up to 2s for async React state update + dialog entry animation.
  // Must happen immediately after the click (before any long awaits) to avoid missing the dialog.
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
    if (fillDialog) {
      await fillDialog(dialog);
    }
    // Use button.font-bold to target the GenericStatusInfoDialog confirm button.
    // Radix DialogContent injects a Close (X) button as the very last DOM element
    // after all children, so .last() would click Close rather than Confirm.
    const confirmBtn = dialog.locator('button.font-bold').first();
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();
    } else {
      // Fallback: second-to-last button (before the Radix auto-injected Close button)
      const allButtons = dialog.getByRole('button');
      const btnCount = await allButtons.count();
      await allButtons.nth(btnCount - 2).click();
    }
  }

  if (cardDisappears) {
    // When the card leaves the list (e.g. no_show), wait for the card to disappear
    // (more reliable than catching a toast that can auto-dismiss before we assert it)
    await expect(
      page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName })
    ).toHaveCount(0, { timeout: 15000 });
    return;
  }

  // Assert the status badge on the card.
  // Target the Badge element directly: status badges have a background colour class (bg-*),
  // whereas action-button label spans do not — so [class*="bg-"] uniquely identifies the badge.
  const statusBadge = patientCard
    .locator('[class*="font-semibold"][class*="capitalize"][class*="bg-"]')
    .first();
  try {
    // Wait for the badge to reflect the expected status (up to 15s).
    // This also serves as the synchronisation point for the next transition:
    // the card won't show new action buttons until the badge has updated.
    await expect(statusBadge).toHaveText(new RegExp(`^${expectedBadgeText}$`, 'i'), { timeout: 15000 });
  } catch (error) {
    console.log(`[TEST DEBUG] Card HTML on failure:\n${await patientCard.innerHTML()}`);
    throw error;
  }

  // Assert that a success toast appeared
  await expect(
    page.getByText(/Status updated successfully|Patient reordered successfully/i).first()
  ).toBeVisible({ timeout: 10000 });
}


test.beforeEach(({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
});

test.describe('Reception — Queue', () => {
  test('REC-E2E-001: Reception page loads', async ({ page }) => {
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
  });

  test('REC-E2E-002: Switch to table view', async ({ page }) => {
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.switchToTableView();
  });

  test('REC-E2E-003: Switch to card view', async ({ page }) => {
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.switchToCardView();
  });

  test('REC-E2E-004: Search patient in reception', async ({ page }) => {
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search('Test');
  });
});

// TODO: RBA-REC-001 — Accountant has full access in current setup
// Skip until a role with explicit reception denial is configured
// test.describe('RBA — Reception denied for Accountant role', () => {
//   test('RBA-REC-001: Billing role cannot access reception', async ({ page }) => { ... });
// });


// ─── Imported Test Cases ───────────────────────────────────────────────────
test.describe('Imported Reception Tests', () => {
  test('REC-E2E-005: CREATE QUEUE CARD', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Create Card');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    await expect(page.getByText(pName, { exact: false }).first()).toBeVisible({ timeout: 15000 });
  });

  test('REC-E2E-006: EDIT QUEUE', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Edit Queue');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    const patientCard = page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName }).first();
    const header = patientCard.locator('.flex.items-start.justify-between');
    await header.locator('button').last().click();
    
    const editDialog = new EditAppointmentDialog(page);
    await editDialog.expectOpen();
    await editDialog.fill({ queue: 'SS' });
    await editDialog.save();
    
    await expect(patientCard.getByText('SS', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });

  test('REC-E2E-007: Display patient details', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Details');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    const patientCard = page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName }).first();
    await patientCard.getByText(/Token #|📞/i).first().click();
    
    // Assert Queue View details sidebar is visible and displays Queue name (default 'IS')
    await expect(page.getByRole('heading', { name: 'Queue View' })).toBeVisible();
    await expect(page.locator('aside').getByText('IS', { exact: true }).first()).toBeVisible();
  });

  test('REC-E2E-008: Select the queue', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Sel Queue');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    // Default: visible under All Queues
    await expect(page.getByText(pName, { exact: false }).first()).toBeVisible({ timeout: 10000 });
    
    // Filter by SS
    await receptionPage.filterByQueue('SS');
    
    // Verify NOT visible
    await expect(page.getByText(pName, { exact: false })).not.toBeVisible({ timeout: 10000 });
  });

  test('REC-E2E-009: Select view mode', async ({ page }) => {
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    
    await receptionPage.switchToTableView();
    await expect(page.getByRole('table')).toBeVisible();
    
    await receptionPage.switchToCardView();
    await expect(page.getByRole('table')).not.toBeVisible();
  });

  test('REC-E2E-010: Bill patient', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Bill');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    const patientCard = page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName }).first();
    const header = patientCard.locator('.flex.items-start.justify-between');
    await header.locator('button:has(svg.lucide-receipt), button[title="Bill Patient"]').first().click();
    
    const billingManage = new BillingManagePage(page);
    await billingManage.expectLoaded();
    
    // Switch to Create Invoice tab if not default, click Add Item
    await page.getByRole('button', { name: /add item/i }).click();
    
    // Click Search clinical service (first match)
    await page.locator('button:has-text("Search clinical service...")').first().click();
    await page.getByPlaceholder('Type service name or code...').fill('consultation');
    await page.getByRole('option').filter({ hasText: /consultation/i }).first().click();
    
    // Save & Preview
    await page.getByRole('button', { name: /save & preview/i }).click();
    
    // Expect generated invoice preview or print button
    await expect(page.getByRole('button', { name: /print/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('REC-E2E-011: Edit existing patient details', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Edit Patient');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    const patientCard = page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName }).first();
    // Click the patient name button (button.text-left wrapping the name) to open Edit Patient dialog
    await patientCard.locator('button.text-left').first().click();
    
    const patientDialog = new PatientDialog(page);
    await patientDialog.expectOpen('edit');
    
    const updatedName = tagWithRunId('Updated Patient', runId);
    await patientDialog.fill({
      name: updatedName,
      phone: '9876543209',
      gender: 'Female',
      age: '35'
    });
    await patientDialog.submit();
    await expect(page.getByText(/Patient updated successfully/i).first()).toBeVisible({ timeout: 10000 });
    await patientDialog.expectClosed();
    
    // Navigate back to reception so the page re-fetches with the updated patient name.
    // Searching immediately after the update races against the async query invalidation.
    await receptionPage.goto();
    await receptionPage.expectLoaded();

    // Search new name and assert
    await receptionPage.search(updatedName);
    await expect(page.getByText(updatedName, { exact: false }).first()).toBeVisible({ timeout: 10000 });

  });

  test('REC-E2E-012: Edit blank fields', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Blank Fields');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    const patientCard = page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName }).first();
    // Click the patient name button (button.text-left wrapping the name) to open Edit Patient dialog
    await patientCard.locator('button.text-left').first().click();
    
    const patientDialog = new PatientDialog(page);
    await patientDialog.expectOpen('edit');
    
    // Just click submit to keep existing and clear no mandatory info if any, or verify close
    await patientDialog.submit();
    await patientDialog.expectClosed();
  });

  test('REC-E2E-013: Click arrive', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Arrive Status');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    await performStatusTransition(page, pName, 'Arrive', 'Arrived');
  });

  test('REC-E2E-014: Click no show', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'No Show Status');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    // No Show: dialog opens to optionally capture reason (field is not required).
    // The patient card remains in the reception view with a "No Show" badge —
    // v_reception_display has no status filter.
    await performStatusTransition(page, pName, 'No Show', 'No Show', async (dialog) => {
      await dialog.locator('textarea').fill('Patient did not show up');
    });
  });

  test('REC-E2E-015: Click wait', async ({ page }) => {

    const pName = await bookNewAppointment(page, 'Wait Status');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    await performStatusTransition(page, pName, 'Arrive', 'Arrived');
    await performStatusTransition(page, pName, 'Wait', 'Waiting');
  });

  test('REC-E2E-016: Click call for scan', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Scan Status');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    await performStatusTransition(page, pName, 'Arrive', 'Arrived');
    await performStatusTransition(page, pName, 'Wait', 'Waiting');
    await performStatusTransition(page, pName, 'Call for Scan', 'Scanning');
  });

  test('REC-E2E-017: Click pending', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Pending Status');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    await performStatusTransition(page, pName, 'Arrive', 'Arrived');
    await performStatusTransition(page, pName, 'Wait', 'Waiting');
    await performStatusTransition(page, pName, 'Call for Scan', 'Scanning');
    await performStatusTransition(page, pName, 'Mark Pending', 'Pending');
  });

  test('REC-E2E-018: Click consultant', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Consult Status');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    await performStatusTransition(page, pName, 'Arrive', 'Arrived');
    await performStatusTransition(page, pName, 'Wait', 'Waiting');
    await performStatusTransition(page, pName, 'Call for Scan', 'Scanning');
    await performStatusTransition(page, pName, 'Consult', 'Consultation');
  });

  test('REC-E2E-019: Click completed', async ({ page }) => {
    const pName = await bookNewAppointment(page, 'Complete Status');
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await receptionPage.search(pName);
    
    await performStatusTransition(page, pName, 'Arrive', 'Arrived');
    await performStatusTransition(page, pName, 'Wait', 'Waiting');
    await performStatusTransition(page, pName, 'Call for Scan', 'Scanning');
    await performStatusTransition(page, pName, 'Complete', 'Completed');
  });
});
