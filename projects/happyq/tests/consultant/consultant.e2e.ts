import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';
import { ConsultantPage } from '../../pages/consultant/ConsultantPage';
import { AppointmentsPage } from '../../pages/appointments/AppointmentsPage';
import { BookAppointmentDialog } from '../../pages/appointments/dialogs/BookAppointmentDialog';
import { ReceptionPage } from '../../pages/reception/ReceptionPage';
import { SettingsConsultantRoomPage } from '../../pages/settings/SettingsConsultantRoomPage';
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

const runId = getRunId(path.resolve(__dirname, '../..'));

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureLocationSelected(page: Page) {
  const locButton = page.getByRole('button').filter({ hasText: /City center|Chennai|Coimbatore|Cluny|All Locations/i }).first();
  // Guard: skip entirely if no location selector is visible on this page
  if (!(await locButton.isVisible({ timeout: 3000 }).catch(() => false))) return;
  const txt = await locButton.textContent({ timeout: 3000 }).catch(() => null);
  if (txt && !txt.includes('City center')) {
    await locButton.click();
    const menuItem = page.getByRole('menuitem', { name: 'City center' });
    // Only proceed if "City center" actually appears in the dropdown
    if (await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await menuItem.dispatchEvent('click');
      await expect(page.getByRole('button').filter({ hasText: 'City center' })).toBeVisible({ timeout: 5000 });
    }
  }
}

async function createPatientAndStatus(browser: any, namePrefix: string, targetStatus: string): Promise<string> {
  const receptionistContext = await browser.newContext({
    storageState: path.resolve(__dirname, '../../.auth/receptionist.json'),
    viewport: { width: 1280, height: 800 }
  });
  const page = await receptionistContext.newPage();
  
  // Book appointment
  const apptPage = new AppointmentsPage(page);
  const dialog = new BookAppointmentDialog(page);
  await apptPage.goto();
  await apptPage.expectLoaded();
  await ensureLocationSelected(page);
  await apptPage.clickBookAppointment();
  await dialog.expectOpen();

  await dialog.clickNewPatient();
  const pName = tagWithRunId(namePrefix, runId);
  await dialog.fillNewPatient({
    name: pName,
    phone: '9876543209',
    gender: 'Female',
    age: '28'
  });
  await dialog.clickSaveNewPatient();

  await expect(page.getByPlaceholder('Patient Name')).not.toBeVisible({ timeout: 10000 });

  await dialog.selectQueue('IS');
  await dialog.submit();
  await dialog.expectClosed();
  await expect(page.getByText(/appointment saved/i).first()).toBeVisible({ timeout: 10000 });

  // Now, transition the patient status from BOOKED
  if (targetStatus !== 'Booked') {
    const receptionPage = new ReceptionPage(page);
    await receptionPage.goto();
    await receptionPage.expectLoaded();
    await ensureLocationSelected(page);
    await receptionPage.search(pName);

    const patientCard = page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: pName }).first();

    const transition = async (btnLabel: string, dialogConfirmBtnClass?: string, fill?: (d: any) => Promise<void>) => {
      const btn = patientCard.locator('div.mt-4 button, div.flex.flex-wrap button, td button').filter({ hasText: btnLabel }).first();
      await btn.click();
      const dlg = page.getByRole('dialog');
      if (await dlg.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (fill) await fill(dlg);
        const confirmBtn = dlg.locator(dialogConfirmBtnClass || 'button.font-bold').first();
        if (await confirmBtn.count() > 0) {
          await confirmBtn.click();
        } else {
          const allButtons = dlg.getByRole('button');
          const btnCount = await allButtons.count();
          await allButtons.nth(btnCount - 2).click();
        }
      }
      await expect(page.getByText(/Status updated successfully/i).first()).toBeVisible({ timeout: 8000 });
      await page.waitForTimeout(500);
    };

    if (['Arrived', 'Waiting', 'Scanning', 'Pending', 'Consultation', 'Completed'].includes(targetStatus)) {
      await transition('Arrive');
    }
    if (['Waiting', 'Scanning', 'Pending', 'Consultation', 'Completed'].includes(targetStatus)) {
      await transition('Wait');
    }
    if (['Scanning', 'Pending', 'Consultation', 'Completed'].includes(targetStatus)) {
      await transition('Call for Scan');
    }
    if (targetStatus === 'Pending') {
      await transition('Mark Pending');
    }
    if (targetStatus === 'Consultation') {
      await transition('Consult');
    }
    if (targetStatus === 'Completed') {
      await transition('Complete');
    }
  }

  await receptionistContext.close();
  return pName;
}

async function performConsultantStatusTransition(
  page: Page,
  pName: string,
  actionLabel: string,
  expectedBadgeText: string,
  fillDialog?: (dialog: Locator) => Promise<void>
) {
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[BROWSER EXCEPTION] ${err.message}`);
  });
  const patientCard = page.locator('main').locator('div.group, tr').filter({ hasText: pName }).first();
  const transitionButton = patientCard.locator('div.mt-4 button, div.flex.flex-wrap button, td button').filter({ hasText: actionLabel }).first();
  await transitionButton.click();

  const dialog = page.getByRole('dialog');
  let hasDialog = false;
  try {
    await dialog.waitFor({ state: 'visible', timeout: 2000 });
    hasDialog = true;
  } catch (e) {
    // No dialog appeared within 2s, which is expected for direct transitions
  }

  if (hasDialog) {
    if (fillDialog) {
      await fillDialog(dialog);
    }
    const confirmBtn = dialog.locator('button.font-bold').first();
    await confirmBtn.waitFor({ state: 'visible', timeout: 3000 });
    await confirmBtn.click();
  }

  // Wait for the status badge to update
  await expect(
    patientCard.getByText(new RegExp(`^${expectedBadgeText}$`, 'i')).first()
  ).toBeVisible({ timeout: 15000 });

  // Assert that success toast appeared
  await expect(
    page.getByText(/Status updated successfully|Patient reordered successfully/i).first()
  ).toBeVisible({ timeout: 10000 });
}

test.describe('Imported Consultant Tests', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/doctor.json') });

  test.beforeEach(async ({ page }) => {
    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);
  });

  test('CON-E2E-001: Display patient details', async ({ page, browser }) => {
    const pName = await createPatientAndStatus(browser, 'CON Details', 'Arrived');
    
    // We must refresh/navigate to the consultant page to see the newly arrived patient!
    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);
    
    // Check patient card displays on consultant page
    const card = page.locator('main').locator('div.group, tr').filter({ hasText: pName }).first();
    await expect(card).toBeVisible({ timeout: 15000 });
    
    // Assert patient card details
    await expect(card.getByText(pName).first()).toBeVisible();
    await expect(card.getByText(/Arrived/i).first()).toBeVisible();
    await expect(card.getByText(/IS/i).first()).toBeVisible(); // Queue Name
  });

  test('CON-E2E-002: Calender', async ({ page }) => {
    const datePickerBtn = page.locator('div.hidden.sm\\:block button').first();
    const initialText = await datePickerBtn.textContent();
    await datePickerBtn.click();
    
    // Select tomorrow in calendar
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayStr = String(tomorrow.getDate());
    
    await page.getByRole('gridcell', { name: dayStr, exact: true }).first().click();
    
    // Expect the date on datepicker button to change
    await expect(datePickerBtn).not.toHaveText(initialText || '', { timeout: 10000 });
  });

  test('CON-E2E-003: Select queue', async ({ page }) => {
    const consultantPage = new ConsultantPage(page);
    await consultantPage.filterByQueue('IS');
    
    const trigger = page.getByRole('combobox').first();
    await expect(trigger).toHaveText(/IS/i, { timeout: 10000 });
  });

  test('CON-E2E-004: Click wait', async ({ page, browser }) => {
    const pName = await createPatientAndStatus(browser, 'CON Wait', 'Arrived');
    
    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);
    
    // Select All Queues
    await consultantPage.filterByQueue('All Queues');
    
    await performConsultantStatusTransition(page, pName, 'Wait', 'Waiting');
  });

  test('CON-E2E-005: Click call for scan', async ({ page, browser }) => {
    const pName = await createPatientAndStatus(browser, 'CON Scan', 'Waiting');
    
    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);
    
    await consultantPage.filterByQueue('All Queues');
    
    await performConsultantStatusTransition(page, pName, 'Call for Scan', 'Scanning');
  });

  test('CON-E2E-006: Click pending', async ({ page, browser }) => {
    const pName = await createPatientAndStatus(browser, 'CON Pending', 'Scanning');
    
    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);
    
    await consultantPage.filterByQueue('All Queues');
    
    await performConsultantStatusTransition(page, pName, 'Mark Pending', 'Pending');
  });

  test('CON-E2E-007: Click consultant', async ({ page, browser }) => {
    const pName = await createPatientAndStatus(browser, 'CON Consult', 'Scanning');
    
    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);
    
    await consultantPage.filterByQueue('All Queues');
    
    await performConsultantStatusTransition(page, pName, 'Consult', 'Consultation');
  });

  test('CON-E2E-008: Click completed', async ({ page, browser }) => {
    const pName = await createPatientAndStatus(browser, 'CON Complete', 'Scanning');
    
    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);
    
    await consultantPage.filterByQueue('All Queues');
    
    await performConsultantStatusTransition(page, pName, 'Complete', 'Completed');
  });

  test('CON-E2E-009: Click followup', async ({ page, browser }) => {
    const pName = await createPatientAndStatus(browser, 'CON Followup', 'Scanning');

    const consultantPage = new ConsultantPage(page);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(page);

    await consultantPage.filterByQueue('All Queues');

    const patientCard = page.locator('main').locator('div.group, tr').filter({ hasText: pName }).first();
    const followUpBtn = patientCard.getByRole('button', { name: /Follow Up/i }).first();
    await followUpBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await dialog.locator('input[type="date"]').fill(dateStr);
    await dialog.locator('input[placeholder="Doctor / Staff Name"]').fill('Dr. Smith');
    await dialog.locator('textarea[placeholder="What Needs To Be Followed Up..."]').fill('Regular Follow Up Remarks');

    await dialog.getByRole('button', { name: /Schedule Follow-Up/i }).click();

    await expect(
      page.getByText(/Follow-up scheduled successfully/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CON-E2E-010: Create a Consultant room', async ({ browser }) => {
    const adminContext = await browser.newContext({
      storageState: path.resolve(__dirname, '../../.auth/admin.json'),
      viewport: { width: 1280, height: 800 }
    });
    const page = await adminContext.newPage();
    
    const settingsPage = new SettingsConsultantRoomPage(page);
    await settingsPage.goto();
    await settingsPage.expectLoaded();
    await ensureLocationSelected(page);

    const initialColumnsCount = await page.locator('input[placeholder="e.g. Queue-Waiting"]').count();
    await settingsPage.clickAddColumn();
    const newColumnsCount = initialColumnsCount + 1;
    const colIndex = initialColumnsCount;

    const testColName = tagWithRunId('Admin Col', runId);
    await settingsPage.fillColumnLabel(colIndex, testColName);
    await settingsPage.toggleStatus(colIndex, 'arrived');
    await settingsPage.clickSave();

    await expect(page.getByText(/Configuration saved successfully/i).first()).toBeVisible({ timeout: 10000 });
    
    await adminContext.close();
  });

  test('CON-E2E-011: Add a  column', async ({ browser }) => {
    const adminContext = await browser.newContext({
      storageState: path.resolve(__dirname, '../../.auth/admin.json'),
      viewport: { width: 1280, height: 800 }
    });
    const adminPage = await adminContext.newPage();
    
    const settingsPage = new SettingsConsultantRoomPage(adminPage);
    await settingsPage.goto();
    await settingsPage.expectLoaded();
    await ensureLocationSelected(adminPage);

    const initialColumnsCount = await adminPage.locator('input[placeholder="e.g. Queue-Waiting"]').count();
    await settingsPage.clickAddColumn();
    const colIndex = initialColumnsCount;

    const testColName = tagWithRunId('Verify Col', runId);
    await settingsPage.fillColumnLabel(colIndex, testColName);
    await settingsPage.toggleStatus(colIndex, 'arrived');
    await settingsPage.clickSave();

    await expect(adminPage.getByText(/Configuration saved successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Now log in as Doctor to verify that this column header is actually visible in the Consultant room!
    const doctorContext = await browser.newContext({
      storageState: path.resolve(__dirname, '../../.auth/doctor.json'),
      viewport: { width: 1280, height: 800 }
    });
    const doctorPage = await doctorContext.newPage();
    
    const consultantPage = new ConsultantPage(doctorPage);
    await consultantPage.goto();
    await consultantPage.expectLoaded();
    await ensureLocationSelected(doctorPage);

    // Verify column header matches the dynamic column name
    await expect(doctorPage.getByRole('heading', { name: testColName }).first()).toBeVisible({ timeout: 15000 });

    // Cleanup: delete the column
    await settingsPage.goto();
    await settingsPage.expectLoaded();
    await ensureLocationSelected(adminPage);

    // Wait for the column to load and be visible in settings
    await expect(async () => {
      const inputs = adminPage.locator('input[placeholder="e.g. Queue-Waiting"]');
      const count = await inputs.count();
      let found = false;
      for (let i = 0; i < count; i++) {
        if (await inputs.nth(i).inputValue() === testColName) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    }).toPass({ timeout: 10000 });

    const inputs = adminPage.locator('input[placeholder="e.g. Queue-Waiting"]');
    const count = await inputs.count();
    let targetIndex = -1;
    for (let i = 0; i < count; i++) {
      if (await inputs.nth(i).inputValue() === testColName) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex !== -1) {
      const deleteBtn = adminPage.locator('button.text-destructive').nth(targetIndex);
      adminPage.once('dialog', dialog => dialog.accept());
      await deleteBtn.click();
      await settingsPage.clickSave();
      await expect(adminPage.getByText(/Configuration saved successfully/i).first()).toBeVisible({ timeout: 10000 });
    } else {
      throw new Error(`Failed to find column to delete: ${testColName}`);
    }

    await doctorContext.close();
    await adminContext.close();
  });

});
