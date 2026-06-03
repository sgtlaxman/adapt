import { test } from '@playwright/test';
import path from 'path';
import { PatientListPage } from '../../pages/patients/PatientListPage';
import { PatientFormPage } from '../../pages/patients/PatientFormPage';

// Reuse saved session for Standard user
test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });

test.describe('Patients', () => {
  test('PAT-E2E-001: Patient list page loads', async ({ page }) => {
    const listPage = new PatientListPage(page);
    await listPage.goto();
    await listPage.expectLoaded();
  });

  test('PAT-E2E-002: Search filters patient list', async ({ page }) => {
    const listPage = new PatientListPage(page);
    await listPage.goto();
    await listPage.expectLoaded();
    await listPage.search('Test');
  });

  test('PAT-E2E-003: Add Patient button is visible', async ({ page }) => {
    const listPage = new PatientListPage(page);
    await listPage.goto();
    await listPage.expectLoaded();
    await listPage.clickAddPatient();
  });
});
