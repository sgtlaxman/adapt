import { test } from '@playwright/test';
import path from 'path';
import { ReceptionPage } from '../../pages/reception/ReceptionPage';

test.use({ storageState: path.resolve(__dirname, '../../.auth/receptionist.json') });

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
