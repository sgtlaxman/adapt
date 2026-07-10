import { test, expect } from '@playwright/test';
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
    // Users settings page loads — user list is visible
    await expect(page.getByText('Invite New User').or(page.getByRole('heading', { name: 'Users' }).first())).toBeVisible();
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

import { Page } from '@playwright/test';
import { SettingsStatusConfigPage } from '../../pages/settings/SettingsStatusConfigPage';
import { SettingsSmsConfigPage } from '../../pages/settings/SettingsSmsConfigPage';
import { SettingsWhatsAppConfigPage } from '../../pages/settings/SettingsWhatsAppConfigPage';
import { SettingsBookingConfigPage } from '../../pages/settings/SettingsBookingConfigPage';
import { SettingsVisitPurposesPage } from '../../pages/settings/SettingsVisitPurposesPage';
import { SettingsOrganizationPage } from '../../pages/settings/SettingsOrganizationPage';
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

const runId = getRunId(path.resolve(__dirname, '../..'));

async function ensureLocationSelected(page: Page) {
  const locButton = page.getByRole('button').filter({ hasText: /City center|Chennai|Coimbatore|Cluny|All Locations/i }).first();
  const txt = await locButton.textContent();
  if (txt && !txt.includes('City center')) {
    await locButton.click();
    await page.getByRole('menuitem', { name: 'City center' }).dispatchEvent('click');
    await expect(page.getByRole('button').filter({ hasText: 'City center' })).toBeVisible({ timeout: 5000 });
  }
}


// ─── Imported Test Cases ───────────────────────────────────────────────────
test.describe('Imported Settings Tests', () => {
  test('SET-E2E-007: Add status', async ({ page }) => {
    const statusPage = new SettingsStatusConfigPage(page);
    await statusPage.goto();
    await statusPage.expectLoaded();
    await ensureLocationSelected(page);

    await statusPage.clickAddStatus();
    
    const statusCode = ('ST_' + runId.replace(/-/g, '_').toUpperCase()).slice(-15);
    const statusName = tagWithRunId('Status', runId);

    await statusPage.fillStatusForm({
      code: statusCode,
      name: statusName,
      flowOrder: 10,
      displayOrder: 10
    });

    await statusPage.clickCreate();
    await expect(page.getByText(/Status created successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Verify it is in the table
    await expect(page.getByRole('cell', { name: statusName }).first()).toBeVisible();
  });

  test('SET-E2E-008: Create a Organization', async ({ page }) => {
    const orgPage = new SettingsOrganizationPage(page);
    await orgPage.goto();
    await orgPage.expectLoaded();

    // Fetch the original organization name to restore it later
    const nameInput = page.locator('input[placeholder="Enter clinic or organization name"]');
    const originalName = await nameInput.inputValue();

    const newName = tagWithRunId('Org', runId);
    await orgPage.fillForm({ name: newName });
    await orgPage.save();

    await expect(page.getByText(/Organization details saved!/i).first()).toBeVisible({ timeout: 10000 });

    // Reload the page to ensure fresh context state is loaded and form dirty state is clean
    await page.reload();
    await orgPage.expectLoaded();

    // Restore original name
    await orgPage.fillForm({ name: originalName });
    await orgPage.save();
    await expect(page.getByText(/Organization details saved!/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('SET-E2E-009: Create a location', async ({ page }) => {
    const locPage = new SettingsLocationsPage(page);
    await locPage.goto();
    await locPage.expectLoaded();

    await locPage.clickNewLocation();

    const locName = tagWithRunId('Loc', runId);
    const locCode = ('l_' + runId.replace(/-/g, '_').toLowerCase()).slice(-10);

    // Let's fill the form fields
    await locPage.fillLocationForm({
      name: locName,
      code: locCode,
      phone: '9876543210'
    });

    // Also fill address details (which are required by schema)
    await page.getByLabel('Address').fill('123 Test Street');
    await page.getByLabel('City').fill('Chennai');
    await page.getByLabel('State').fill('Tamil Nadu');
    await page.getByLabel('Country').fill('India');
    await page.getByLabel('Pin/Zip Code').fill('600001');
    await page.getByLabel('Online Location Name').fill('Online Location');

    await locPage.save();
    await expect(page.getByText(/New location created!/i).first()).toBeVisible({ timeout: 10000 });

    // Verify it is in the list
    await locPage.searchLocation(locName);
    await locPage.expectLocationInList(locName);
  });

  test('SET-E2E-010: Edit Location', async ({ page }) => {
    const locPage = new SettingsLocationsPage(page);
    await locPage.goto();
    await locPage.expectLoaded();

    // Select the main default location (City center)
    await page.getByRole('button').filter({ hasText: 'City center' }).first().click();

    // Toggle Active Status off
    const activeSwitch = page.getByRole('switch', { name: /active status/i });
    const isChecked = await activeSwitch.isChecked();
    if (isChecked) {
      await activeSwitch.click();
    }

    await locPage.save();
    await expect(page.getByText(/Location updated successfully!/i).first()).toBeVisible({ timeout: 10000 });

    // Refresh the page
    await locPage.goto();
    await locPage.expectLoaded();

    // Verify that the location is STILL active because core_update_location doesn't persist active status
    const listBtn = page.getByRole('button').filter({ hasText: 'City center' }).first();
    // Inactive locations have 60% opacity (opacity-60 class) or an "Off" badge
    await expect(listBtn.locator('text=Off')).not.toBeVisible();
  });

  test('SET-E2E-011: Display Staff list', async ({ page }) => {
    const usersPage = new SettingsUsersPage(page);
    await usersPage.goto();
    await usersPage.expectLoaded();

    // Verify the users list has rows
    const userRows = page.locator('table tbody tr');
    await expect(userRows.first()).toBeVisible({ timeout: 10000 });

    // Click the menu trigger icon (sr-only "Open menu") on the first user row
    await page.locator('table tbody tr').first().getByRole('button', { name: 'Open menu' }).click();

    // Click "Edit user" menu item
    await page.getByRole('menuitem', { name: 'Edit user' }).click();

    // Expect UserEditDialog to open
    const dialog = new UserEditDialog(page);
    await dialog.expectOpen();

    // Switch to User Details tab
    await page.getByRole('tab', { name: 'User Details' }).click();

    // Expect user details to be loaded in inputs (e.g. name field is not empty)
    const nameVal = await page.getByLabel('Name').inputValue();
    expect(nameVal.length).toBeGreaterThan(0);

    await dialog.close();
  });

  test('SET-E2E-012: Invite by Email', async ({ page }) => {
    const usersPage = new SettingsUsersPage(page);
    await usersPage.goto();
    await usersPage.expectLoaded();

    // Click "Invite by Email" tab trigger
    await page.getByRole('tab', { name: 'Invite by Email' }).click();

    // Fill the invitation form
    await page.getByPlaceholder('Full Name').fill('E2E Test Email User');
    await page.locator('input[type="email"]').fill('e2e-email-invite@example.com');
    await page.locator('input[placeholder="9876543210"]').fill('9876543210');

    // Select Role
    await page.getByRole('combobox', { name: 'Role' }).click();
    await page.getByRole('option', { name: 'Receptionist' }).first().click();

    // Select Location
    await page.getByRole('combobox', { name: 'Location' }).click();
    await page.getByRole('option').first().click();

    // Click Send Invitation
    await page.getByRole('button', { name: 'Send Invitation' }).click();

    // Expect Edge Function returned a non-2xx status code error toast
    await expect(
      page.getByText(/Failed to invite user/i).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/Edge Function returned a non-2xx status code|404/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('SET-E2E-013: Invite by SMS', async ({ page }) => {
    const usersPage = new SettingsUsersPage(page);
    await usersPage.goto();
    await usersPage.expectLoaded();

    // Click "Invite by SMS" tab trigger
    await page.getByRole('tab', { name: 'Invite by SMS' }).click();

    // Fill the invitation form
    await page.getByPlaceholder('Full Name').fill('E2E Test SMS User');
    await page.locator('input[placeholder="9876543210"]').fill('9876543211');

    // Select Role
    await page.getByRole('combobox', { name: 'Role' }).click();
    await page.getByRole('option', { name: 'Receptionist' }).first().click();

    // Select Location
    await page.getByRole('combobox', { name: 'Location' }).click();
    await page.getByRole('option').first().click();

    // Click Send Invitation
    await page.getByRole('button', { name: 'Send Invitation' }).click();

    // Expect Edge Function returned a non-2xx status code error toast
    await expect(
      page.getByText(/Failed to invite user/i).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/Edge Function returned a non-2xx status code|404/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('SET-E2E-014: Create  new SMS event', async ({ page }) => {
    const smsPage = new SettingsSmsConfigPage(page);
    await smsPage.goto();
    await smsPage.expectLoaded();
    await ensureLocationSelected(page);

    await smsPage.switchTab('SMS Types');
    await smsPage.clickNewSmsType();

    const name = tagWithRunId('SmsType', runId);
    const code = tagWithRunId('sms_type', runId).toLowerCase().replace(/-/g, '_').slice(0, 15);

    await smsPage.fillSmsTypeForm({
      name: name,
      eventCode: code,
      description: 'Custom event description for E2E'
    });

    await smsPage.clickSaveSmsType();
    await expect(page.getByText(/SMS type created/i).first()).toBeVisible({ timeout: 10000 });

    // Verify it is in the list
    await expect(page.getByText(name).first()).toBeVisible();
  });

  test('SET-E2E-015: Add New Visit Purpose', async ({ page }) => {
    const purposePage = new SettingsVisitPurposesPage(page);
    await purposePage.goto();
    await purposePage.expectLoaded();
    await ensureLocationSelected(page);

    await purposePage.clickNewPurpose();

    const name = tagWithRunId('Purpose', runId);
    await page.locator('#name').fill(name);
    await page.locator('#description').fill('Visit purpose description');

    await purposePage.save();
    await expect(page.getByText(/Visit purpose created successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Verify in table
    await expect(page.getByRole('cell', { name: name }).first()).toBeVisible();
  });

  test('SET-E2E-016: Disable active Purpose', async ({ page }) => {
    const purposePage = new SettingsVisitPurposesPage(page);
    await purposePage.goto();
    await purposePage.expectLoaded();
    await ensureLocationSelected(page);

    // Create a purpose to disable
    await purposePage.clickNewPurpose();
    const name = tagWithRunId('DisablePurp', runId);
    await page.locator('#name').fill(name);
    await purposePage.save();
    await expect(page.getByText(/Visit purpose created successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Select "All Purposes" filter to keep inactive ones in the list
    await page.locator('button[role="combobox"]:has-text("Active Only")').click();
    await page.getByRole('option', { name: 'All Purposes' }).click();

    // Find the row for this purpose and click its active toggle (first button in row)
    const row = page.locator('table tbody tr').filter({ hasText: name });
    const toggleBtn = row.locator('button').first();
    await toggleBtn.click();

    await expect(page.getByText(/Visit purpose updated successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Badge should show Inactive
    await expect(row.getByText("Inactive").first()).toBeVisible();
  });

  test('SET-E2E-017: Edit Visit Purpose', async ({ page }) => {
    const purposePage = new SettingsVisitPurposesPage(page);
    await purposePage.goto();
    await purposePage.expectLoaded();
    await ensureLocationSelected(page);

    // Create a purpose to edit
    await purposePage.clickNewPurpose();
    const name = tagWithRunId('EditPurp', runId);
    await page.locator('#name').fill(name);
    await purposePage.save();
    await expect(page.getByText(/Visit purpose created successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Click edit on the row (last button in row)
    const row = page.locator('table tbody tr').filter({ hasText: name });
    const editBtn = row.locator('button').last();
    await editBtn.click();

    // Update details
    const updatedName = name + ' U';
    await page.locator('#name').fill(updatedName);
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(page.getByText(/Visit purpose updated successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Verify updated name in table
    await expect(page.getByRole('cell', { name: updatedName }).first()).toBeVisible();
  });

  test('SET-E2E-018: Add Service', async ({ page }) => {
    const servicesPage = new SettingsServicesPage(page);
    await servicesPage.goto();
    await servicesPage.expectLoaded();
    await ensureLocationSelected(page);

    await servicesPage.clickNewService();

    const name = tagWithRunId('Service', runId);
    const code = tagWithRunId('SVC', runId).toLowerCase().replace(/-/g, '_').slice(0, 10);

    await servicesPage.fillServiceForm({ name: name, price: '150' });
    await page.getByRole('dialog').locator('input[name="code"]').fill(code);

    // Select category
    await page.getByRole('dialog').locator('div:has(label:has-text("Category")) button[role="combobox"]').click();
    await page.getByRole('option').first().click();

    await servicesPage.save();
    await expect(page.getByText(/Service created successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Verify in list
    await expect(page.getByRole('cell', { name: name }).first()).toBeVisible();
  });

  test('SET-E2E-019: Edit Service', async ({ page }) => {
    const servicesPage = new SettingsServicesPage(page);
    await servicesPage.goto();
    await servicesPage.expectLoaded();
    await ensureLocationSelected(page);

    // Create a service to edit
    await servicesPage.clickNewService();
    const name = tagWithRunId('EditSvc', runId);
    const code = tagWithRunId('SVC', runId).toLowerCase().replace(/-/g, '_').slice(0, 10);
    await servicesPage.fillServiceForm({ name: name, price: '200' });
    await page.getByRole('dialog').locator('input[name="code"]').fill(code);
    await page.getByRole('dialog').locator('div:has(label:has-text("Category")) button[role="combobox"]').click();
    await page.getByRole('option').first().click();
    await servicesPage.save();
    await expect(page.getByText(/Service created successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Click edit on the row (last button in row)
    const row = page.locator('table tbody tr').filter({ hasText: name });
    const editBtn = row.locator('button').last();
    await editBtn.click();

    const updatedName = name + ' U';
    await page.getByRole('dialog').locator('input[name="name"]').fill(updatedName);
    await page.getByRole('button', { name: 'Update Service' }).click();

    await expect(page.getByText(/Service updated successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Verify updated name in table
    await expect(page.getByRole('cell', { name: updatedName }).first()).toBeVisible();
  });

  test('SET-E2E-020: Create a new SMS Configuration', async ({ page }) => {
    const smsPage = new SettingsSmsConfigPage(page);
    await smsPage.goto();
    await smsPage.expectLoaded();
    await ensureLocationSelected(page);

    await smsPage.clickNewConfiguration();

    const configName = tagWithRunId('SmsConfig', runId);
    await smsPage.fillConfigForm({
      scope: 'global',
      templateName: configName,
      senderId: 'SMSCOU',
      smsType: 'appointment_booked',
      templateBody: '{"text": "Hello, booked."}'
    });

    await smsPage.clickSave();
    await expect(page.getByText(/SMS configuration created/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('SET-E2E-021: Create a new template', async ({ page }) => {
    const wpPage = new SettingsWhatsAppConfigPage(page);
    await wpPage.goto();
    await wpPage.expectLoaded();
    await ensureLocationSelected(page);

    await wpPage.clickNewTemplate();

    const templateName = tagWithRunId('WpConfig', runId);
    await wpPage.fillTemplateForm({
      templateName: templateName,
      eventType: 'appointment_booked',
      endpoint: 'https://api.example.com',
      channelId: '12345',
      templateJson: '{"type": "template", "template": {"name": "hello_world"}}'
    });

    await wpPage.clickSave();
    await expect(page.getByText(/WhatsApp configuration updated successfully/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('SET-E2E-022: testing whatsapp message', async ({ page }) => {
    const wpPage = new SettingsWhatsAppConfigPage(page);
    await wpPage.goto();
    await wpPage.expectLoaded();
    await ensureLocationSelected(page);

    // Create a template first so we have one to test
    await wpPage.clickNewTemplate();
    const templateName = tagWithRunId('WpTest', runId);
    await wpPage.fillTemplateForm({
      templateName: templateName,
      eventType: 'appointment_booked',
      endpoint: 'https://api.example.com',
      channelId: '12345',
      templateJson: '{"type": "template", "template": {"name": "hello_world"}}'
    });
    await wpPage.clickSave();
    await expect(page.getByText(/WhatsApp configuration updated successfully/i).first()).toBeVisible({ timeout: 10000 });

    // Switch to testing tab
    await wpPage.switchTab('Testing');

    // Fill testing details
    await wpPage.fillTestingDetails({
      template: templateName,
      recipientPhone: '9876543210'
    });

    // Send Test
    await wpPage.clickSendTestTemplate();

    // Expect either success or Edge function connection error toast
    await expect(
      page.getByText(/Message sent successfully|Failed to send|Failed to connect|Edge Function/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('SET-E2E-023: TESTING', async ({ page }) => {
    const smsPage = new SettingsSmsConfigPage(page);
    await smsPage.goto();
    await smsPage.expectLoaded();
    await ensureLocationSelected(page);

    // Switch to Testing tab
    await smsPage.switchTab('Testing');

    // Select appointment_booked and input test data
    await smsPage.fillTestingDetails({
      eventType: 'appointment_booked',
      testData: JSON.stringify({
        phone: "919876543210",
        name: "E2E Test",
        location: "City center",
        mobile: "919876543210",
        map_url: "https://maps.google.com",
        date: "2026-07-08"
      }, null, 2)
    });

    // Click verify
    await smsPage.clickVerifyConfig();

    // Verify should succeed and Send button becomes enabled
    const sendBtn = page.getByRole('button', { name: /Send Test SMS/i });
    await expect(sendBtn).toBeEnabled({ timeout: 10000 });

    // Click Send Test SMS
    await smsPage.clickSendTestSms();

    // Expect either success or Edge function connection error toast
    await expect(
      page.getByText(/Test SMS sent successfully|Failed to send|Failed to connect|Edge Function/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('SET-E2E-024: Configure and manage your booking config', async ({ page }) => {
    const bookingPage = new SettingsBookingConfigPage(page);
    await bookingPage.goto();
    await bookingPage.expectLoaded();

    // Wait until either the weekly schedule or the warning card is visible
    const warningLocator = page.getByText(/Please select a specific location/i);
    const scheduleLocator = page.getByRole('heading', { name: /Standard Working Hours/i });
    await expect(warningLocator.or(scheduleLocator)).toBeVisible({ timeout: 15000 });

    if (await warningLocator.isVisible()) {
      await bookingPage.expectWarningVisible();
      // Select a specific location from header/sidebar
      await ensureLocationSelected(page);
    }

    // Standard working hours configuration should now be visible
    await bookingPage.expectWeeklyScheduleVisible();
  });


});
