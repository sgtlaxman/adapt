import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsSmsConfigPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/settings/sms-config');
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', { name: /SMS Configuration/i })
    ).toBeVisible({ timeout: 15000 });
  }

  async switchTab(tab: 'Configuration' | 'Testing' | 'SMS Types') {
    await this.page.getByRole('tab', { name: tab }).click();
  }

  // Configuration tab actions
  async clickNewConfiguration() {
    await this.page.getByRole('button', { name: /New Configuration/i }).click();
  }

  async fillConfigForm(data: {
    scope: 'global' | 'location';
    templateName: string;
    senderId: string;
    smsType: string;
    templateBody: string;
  }) {
    // Select Scope
    await this.page.locator('label:has-text("Configuration Scope") + button[role="combobox"]').click();
    if (data.scope === 'global') {
      await this.page.getByRole('option', { name: /Global/i }).first().click();
    } else {
      await this.page.getByRole('option', { name: /Specific to/i }).first().click();
    }

    await this.page.getByPlaceholder('e.g. Booking Confirmation').fill(data.templateName);
    await this.page.getByPlaceholder('e.g. SMSCOU').fill(data.senderId);

    // Select SMS Type
    await this.page.locator('label:has-text("SMS Type") + button[role="combobox"]').click();
    await this.page.getByRole('option', { name: new RegExp(data.smsType.replace(/_/g, '[_ ]'), 'i') }).first().click();

    await this.page.locator('label:has-text("Template Body (JSON)") + textarea').fill(data.templateBody);
  }

  async clickSave() {
    await this.page.getByRole('button', { name: /Save Configuration/i }).evaluate(el => (el as HTMLButtonElement).click());
    await this.waitForToast();
  }

  // SMS Types tab actions
  async clickNewSmsType() {
    await this.page.getByRole('button', { name: /New SMS Type/i }).click();
  }

  async fillSmsTypeForm(data: { name: string; eventCode: string; description?: string }) {
    await this.page.getByPlaceholder('e.g. Login OTP').fill(data.name);
    await this.page.getByPlaceholder('e.g. login_otp').fill(data.eventCode);
    if (data.description) {
      await this.page.getByPlaceholder('What is this SMS used for?').fill(data.description);
    }
  }

  async clickSaveSmsType() {
    await this.page.getByRole('button', { name: /Save SMS Type/i }).click();
    await this.waitForToast();
  }

  // Testing tab actions
  async fillTestingDetails(data: { eventType: string; testData: string }) {
    // Select Event Type
    await this.page.locator('label:has-text("Event Type") + button[role="combobox"]').click();
    await this.page.getByRole('option', { name: new RegExp(data.eventType.replace(/_/g, '[_ ]'), 'i') }).first().click();

    // Fill JSON text
    await this.page.locator('label:has-text("Test Data (JSON)") + textarea').fill(data.testData);
  }

  async clickVerifyConfig() {
    await this.page.getByRole('button', { name: /Verify Against Location Config/i }).click();
  }

  async clickSendTestSms() {
    await this.page.getByRole('button', { name: /Send Test SMS/i }).click();
  }
}
