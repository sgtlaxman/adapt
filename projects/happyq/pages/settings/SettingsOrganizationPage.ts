import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsOrganizationPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/organization'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Organization' }).first()).toBeVisible();
  }

  async fillForm(data: { name?: string; phone?: string; email?: string }) {
    if (data.name) await this.page.getByPlaceholder('Enter clinic or organization name').fill(data.name);
    if (data.phone) await this.page.getByPlaceholder('Enter phone number').fill(data.phone);
    if (data.email) await this.page.getByPlaceholder('organization@example.com').fill(data.email);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save Organization Details' }).click();
    await this.waitForToast();
  }
}

