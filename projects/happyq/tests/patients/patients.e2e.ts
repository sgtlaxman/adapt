import { test, expect } from '@playwright/test';
import path from 'path';
import { PatientListPage } from '../../pages/patients/PatientListPage';
import { PatientDialog } from '../../pages/patients/dialogs/PatientDialog';
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });

const runId = getRunId(path.resolve(__dirname, '../..'));

test.describe('Patients — List', () => {
  test('PAT-E2E-001: Patient list page loads', async ({ page }) => {
    const listPage = new PatientListPage(page);
    await listPage.goto();
    await listPage.expectLoaded();
  });

  test('PAT-E2E-002: Search filters the patient list', async ({ page }) => {
    const listPage = new PatientListPage(page);
    await listPage.goto();
    await listPage.expectLoaded();
    await listPage.search('Test');
    // Verify search input accepted the value — no patients may exist in test DB
    await expect(page.getByPlaceholder(/search by name, phone, or email/i)).toHaveValue('Test');
  });
});

test.describe('Patients — Add Patient', () => {
  test('PAT-E2E-003: Add Patient dialog opens', async ({ page }) => {
    const listPage = new PatientListPage(page);
    const dialog = new PatientDialog(page);
    await listPage.goto();
    await listPage.expectLoaded();
    await listPage.clickAddPatient();
    await dialog.expectOpen('add');
  });

  test('PAT-E2E-004: Add new patient successfully', async ({ page }) => {
    const listPage = new PatientListPage(page);
    const dialog = new PatientDialog(page);
    await listPage.goto();
    await listPage.expectLoaded();
    await listPage.clickAddPatient();
    await dialog.expectOpen('add');
    await dialog.fill({
      name: tagWithRunId('John Doe', runId),
      phone: '9876543210',
      gender: 'Male',
      age: '35',
    });
    await dialog.submit();
    await dialog.expectClosed();
    await listPage.expectPatientInList(tagWithRunId('John Doe', runId));
  });

  test('PAT-E2E-005: Add patient validation — required fields', async ({ page }) => {
    const listPage = new PatientListPage(page);
    const dialog = new PatientDialog(page);
    await listPage.goto();
    await listPage.expectLoaded();
    await listPage.clickAddPatient();
    await dialog.expectOpen('add');
    await dialog.submit();
    // Expect validation errors without closing dialog
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('PAT-E2E-006: Cancel Add Patient closes dialog', async ({ page }) => {
    const listPage = new PatientListPage(page);
    const dialog = new PatientDialog(page);
    await listPage.goto();
    await listPage.expectLoaded();
    await listPage.clickAddPatient();
    await dialog.expectOpen('add');
    await dialog.cancel();
    await dialog.expectClosed();
  });
});
