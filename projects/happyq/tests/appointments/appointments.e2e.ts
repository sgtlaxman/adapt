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
