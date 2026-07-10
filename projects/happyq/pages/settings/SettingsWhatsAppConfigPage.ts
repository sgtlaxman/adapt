import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsWhatsAppConfigPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/settings/whatsapp-config');
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', { name: /WhatsApp Configuration/i })
    ).toBeVisible({ timeout: 15000 });
  }

  async switchTab(tab: 'Templates' | 'Testing' | 'Logs') {
    await this.page.getByRole('tab', { name: tab }).click();
  }

  // Templates tab actions
  async clickNewTemplate() {
    await this.page.getByRole('button', { name: /New Template/i }).click();
  }

  async fillTemplateForm(data: {
    templateName: string;
    eventType: string;
    endpoint: string;
    channelId: string;
    templateJson: string;
  }) {
    await this.page.locator('label:has-text("Template Name") + input').fill(data.templateName);

    // Select Event Type
    await this.page.locator('div:has(label:has-text("Event Type")) + button[role="combobox"]').click();
    await this.page.getByRole('option', { name: new RegExp(data.eventType.replace(/_/g, '[_ ]'), 'i') }).first().click();

    await this.page.locator('label:has-text("API Endpoint") + input').fill(data.endpoint);
    await this.page.locator('label:has-text("Channel ID") + input').fill(data.channelId);
    await this.page.locator('label:has-text("Template JSON") + textarea').fill(data.templateJson);
  }

  async clickSave() {
    await this.page.getByRole('button', { name: /Save Configuration/i }).click();
    await this.waitForToast();
  }

  // Testing tab actions
  async fillTestingDetails(data: { template: string; recipientPhone: string }) {
    // Select Template to Test
    await this.page.locator('label:has-text("Select Template to Test") + button[role="combobox"]').click();
    const escaped = data.template.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    await this.page.getByRole('option', { name: new RegExp(escaped, 'i') }).first().click();

    // Fill Recipient Phone
    await this.page.locator('label:has-text("Recipient Phone") + div input').fill(data.recipientPhone);
  }

  async clickSendTestTemplate() {
    await this.page.getByRole('button', { name: /Send Test Template/i }).click();
  }
}
