import { test, expect } from '@playwright/test';
import path from 'path';
import { ReceptionPage } from '../../pages/reception/ReceptionPage';
import { AppointmentsPage } from '../../pages/appointments/AppointmentsPage';
import { BookAppointmentDialog } from '../../pages/appointments/dialogs/BookAppointmentDialog';
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

test.use({ storageState: path.resolve(__dirname, '../../.auth/receptionist.json') });

const runId = 'SCRATCH-' + Date.now();

test('SCRATCH-017: Debug full transition sequence', async ({ page }) => {
  // Listen to network requests/responses
  page.on('request', req => {
    if (req.url().includes('updateAppointmentStatus') || req.url().includes('rpc')) {
      console.log(`[NET REQUEST] ${req.method()} ${req.url()}\nPayload: ${req.postData()}`);
    }
  });
  page.on('response', async res => {
    if (res.url().includes('updateAppointmentStatus') || res.url().includes('rpc')) {
      let body = '';
      try { body = await res.text(); } catch (e) {}
      console.log(`[NET RESPONSE] ${res.status()} ${res.url()}\nBody: ${body}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.stack || err.message}`);
  });
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  // 1. Book appointment
  const apptPage = new AppointmentsPage(page);
  const dialog = new BookAppointmentDialog(page);
  await apptPage.goto();
  await apptPage.expectLoaded();
  await apptPage.clickBookAppointment();
  await dialog.expectOpen();
  await dialog.clickNewPatient();
  const pName = tagWithRunId('Pending Debug', runId);
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

  // 2. Go to reception page and search
  const receptionPage = new ReceptionPage(page);
  await receptionPage.goto();
  await receptionPage.expectLoaded();
  await receptionPage.search(pName);

  const patientCard = page.locator('div.border-gray-200, tr').filter({ hasText: pName }).first();
  await expect(patientCard).toBeVisible();

  // Helper to transition and wait
  const transition = async (action: string, badge: string) => {
    console.log(`\n--- Transition to ${badge} ---`);
    const btn = patientCard.locator('div.mt-4 button, td button').filter({ hasText: action }).first();
    await btn.click();
    console.log(`Clicked ${action} button`);
    await expect(patientCard.getByText(new RegExp(`^${badge}$`, 'i')).first()).toBeVisible({ timeout: 10000 });
    console.log(`Successfully verified badge: ${badge}`);
  };

  // Run sequence
  await transition('Arrive', 'Arrived');
  await transition('Wait', 'Waiting');
  await transition('Call for Scan', 'Scanning');
  await transition('Mark Pending', 'Pending');
});
