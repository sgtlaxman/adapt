import { test, expect } from '@playwright/test';
import path from 'path';
import { AppointmentsPage } from '../../pages/appointments/AppointmentsPage';
import { AppointmentHistoryPage } from '../../pages/appointments/AppointmentHistoryPage';
import { StatusLogsPage } from '../../pages/appointments/StatusLogsPage';
import { BookAppointmentDialog } from '../../pages/appointments/dialogs/BookAppointmentDialog';
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

test.use({ storageState: path.resolve(__dirname, '../../.auth/receptionist.json') });

const runId = getRunId(path.resolve(__dirname, '../..'));

test.describe('Appointments — Calendar', () => {
  test('APT-E2E-001: Appointments calendar loads', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
  });

  test('APT-E2E-002: Today button navigates to current date', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
    await apptPage.clickToday();
  });

  test('APT-E2E-003: Search filters appointments', async ({ page }) => {
    // Week view toggle not available in current app version — testing search instead
    const apptPage = new AppointmentsPage(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
    await apptPage.search('Test');
  });
});

test.describe('Appointments — Book Appointment', () => {
  test('APT-E2E-004: Book Appointment dialog opens', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    const dialog = new BookAppointmentDialog(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
    await apptPage.clickBookAppointment();
    await dialog.expectOpen();
  });

  test('APT-E2E-005: Cancel Book Appointment dialog', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    const dialog = new BookAppointmentDialog(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
    await apptPage.clickBookAppointment();
    await dialog.expectOpen();
    await dialog.cancel();
    await dialog.expectClosed();
  });
});

test.describe('Appointments — History', () => {
  test('APT-E2E-006: Appointment history page loads', async ({ page }) => {
    const historyPage = new AppointmentHistoryPage(page);
    await historyPage.goto();
    await historyPage.expectLoaded();
  });

  test('APT-E2E-007: Search in appointment history', async ({ page }) => {
    const historyPage = new AppointmentHistoryPage(page);
    await historyPage.goto();
    await historyPage.expectLoaded();
    await historyPage.search('Test');
  });
});

test.describe('Appointments — Status Logs', () => {
  test('APT-E2E-008: Status logs page loads', async ({ page }) => {
    const logsPage = new StatusLogsPage(page);
    await logsPage.goto();
    await logsPage.expectLoaded();
  });
});


// ─── Imported Test Cases ───────────────────────────────────────────────────
test.describe('Imported Appointments Tests', () => {
  test('APT-E2E-009: create Slot', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    const dialog = new BookAppointmentDialog(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
    await apptPage.clickBookAppointment();
    await dialog.expectOpen();

    // Create new patient
    await dialog.clickNewPatient();
    const pName = tagWithRunId('Slot Patient', runId);
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

    // Assert toast success "Appointment saved"
    await expect(page.getByText(/appointment saved/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('APT-E2E-010: Fill Form and booked', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    const dialog = new BookAppointmentDialog(page);
    await apptPage.goto();
    await apptPage.expectLoaded();
    await apptPage.clickBookAppointment();
    await dialog.expectOpen();

    // Create new patient named ARUN (using runId tag)
    await dialog.clickNewPatient();
    const pName = tagWithRunId('ARUN', runId);
    await dialog.fillNewPatient({
      name: pName,
      phone: '9876543208',
      gender: 'Male',
      age: '30'
    });
    await dialog.clickSaveNewPatient();

    // Wait for patient creation to complete and form to close
    await expect(page.getByPlaceholder('Patient Name')).not.toBeVisible({ timeout: 10000 });

    // Select Queue
    await dialog.selectQueue('IS');

    // Submit
    await dialog.submit();
    await dialog.expectClosed();

    // Assert calendar displays the patient name "Arun" (capitalized on badge via CSS)
    await expect(page.getByText(/arun/i).filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
  });

  test('APT-E2E-011: select primary location', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    await apptPage.goto();
    await apptPage.expectLoaded();

    // Click location selector trigger dropdown
    const locButton = page.getByRole('button').filter({ hasText: /City center|Chennai|All Locations/i });
    await locButton.click();

    // Select "Chennai" from dropdown
    await page.getByRole('menuitem', { name: 'Chennai' }).click();
    
    // Verify location changed to Chennai
    await expect(page.getByRole('button').filter({ hasText: 'Chennai' })).toBeVisible();

    // Select "City center" again
    await page.getByRole('button').filter({ hasText: 'Chennai' }).click();
    await page.getByRole('menuitem', { name: 'City center' }).click();

    // Verify location changed back to default
    await expect(page.getByRole('button').filter({ hasText: 'City center' })).toBeVisible();
  });

  test('APT-E2E-012: display what\'s app button', async ({ page }) => {
    const apptPage = new AppointmentsPage(page);
    const dialog = new BookAppointmentDialog(page);
    await apptPage.goto();
    await apptPage.expectLoaded();

    // Select "City center" location to ensure WhatsApp config is loaded
    const locButton = page.getByRole('button').filter({ hasText: /City center|Chennai|All Locations/i });
    await locButton.click();
    await page.getByRole('menuitem', { name: 'City center' }).click();

    await apptPage.clickBookAppointment();
    await dialog.expectOpen();

    // Assert that WhatsApp notification option is visible
    const whatsAppOption = page.locator('#notify-whatsapp');
    await expect(whatsAppOption).toBeVisible({ timeout: 5000 });
  });

  test('APT-E2E-013: Display patient  status', async ({ page }) => {
    const logsPage = new StatusLogsPage(page);
    await logsPage.goto();
    await logsPage.expectLoaded();
    // Assert that logs/timeline entries are loaded and displayed
    await logsPage.expectLogEntries();
  });

  test('APT-E2E-014: Search patient details', async ({ page }) => {
    const historyPage = new AppointmentHistoryPage(page);
    await historyPage.goto();
    await historyPage.expectLoaded();
    
    // Search for 'Test'
    await historyPage.search('Test');
    
    // Expect results to be visible
    await historyPage.expectResultsVisible();
  });

  test('APT-E2E-015: Click Go to Queue', async ({ page }) => {
    const historyPage = new AppointmentHistoryPage(page);
    await historyPage.goto();
    await historyPage.expectLoaded();

    // Expect results to be visible first
    await historyPage.expectResultsVisible();

    // Click the first "Go to Queue" button in the table actions
    const button = page.getByRole('button', { name: /go to queue/i }).first();
    await button.click();

    // Verify that navigation to the non-existent /queue route is attempted
    await expect(page).toHaveURL(/.*\/queue\?appointmentId=.*/, { timeout: 10000 });
  });
});
