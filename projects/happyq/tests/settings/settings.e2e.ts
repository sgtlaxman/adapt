import { test } from '@playwright/test';
import path from 'path';
import { SettingsUsersPage } from '../../pages/settings/SettingsUsersPage';
import { SettingsPermissionsPage } from '../../pages/settings/SettingsPermissionsPage';
import { SettingsLocationsPage } from '../../pages/settings/SettingsLocationsPage';
import { SettingsServicesPage } from '../../pages/settings/SettingsServicesPage';
import { SettingsQueuesPage } from '../../pages/settings/SettingsQueuesPage';
import { UserEditDialog } from '../../pages/settings/dialogs/UserEditDialog';

test.use({ storageState: path.resolve(__dirname, '../../.auth/admin.json') });

test.describe('Settings — Locations', () => {
  test('SET-E2E-001: Locations settings page loads', async ({ page }) => {
    const locationsPage = new SettingsLocationsPage(page);
    await locationsPage.goto();
    await locationsPage.expectLoaded();
  });
});

test.describe('Settings — Users', () => {
  test('SET-E2E-002: Users settings page loads', async ({ page }) => {
    const usersPage = new SettingsUsersPage(page);
    await usersPage.goto();
    await usersPage.expectLoaded();
  });

    test('SET-E2E-003: Invite New User form is visible', async ({ page }) => {
    const usersPage = new SettingsUsersPage(page);
    await usersPage.goto();
    await usersPage.expectLoaded();
    // Users page has an inline Invite New User form, not a dialog
    await expect(page.getByText('Invite New User')).toBeVisible();
  });
});

test.describe('Settings — Permissions', () => {
  test('SET-E2E-004: Permissions page loads with matrix', async ({ page }) => {
    const permissionsPage = new SettingsPermissionsPage(page);
    await permissionsPage.goto();
    await permissionsPage.expectLoaded();
    await permissionsPage.expectPermissionsMatrixVisible();
  });
});

test.describe('Settings — Services', () => {
  test('SET-E2E-005: Services settings page loads', async ({ page }) => {
    const servicesPage = new SettingsServicesPage(page);
    await servicesPage.goto();
    await servicesPage.expectLoaded();
  });
});

test.describe('Settings — Queues', () => {
  test('SET-E2E-006: Queues settings page loads', async ({ page }) => {
    const queuesPage = new SettingsQueuesPage(page);
    await queuesPage.goto();
    await queuesPage.expectLoaded();
  });
});

test.describe('RBA — Settings denied for Front Desk', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/receptionist.json') });

  test('RBA-SET-001: Front Desk cannot access user settings', async ({ page }) => {
    const usersPage = new SettingsUsersPage(page);
    await usersPage.goto();
    await usersPage.expectAccessDenied();
  });
});

test.describe('RBA — Settings denied for Clinician', () => {
  test.use({ storageState: path.resolve(__dirname, '../../.auth/doctor.json') });

  test('RBA-SET-002: Clinician cannot access user settings', async ({ page }) => {
    const usersPage = new SettingsUsersPage(page);
    await usersPage.goto();
    await usersPage.expectAccessDenied();
  });
});

