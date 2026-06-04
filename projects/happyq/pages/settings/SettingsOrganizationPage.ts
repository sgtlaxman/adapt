import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsOrganizationPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/organization'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Organization' })).toBeVisible();
  }

  async fillForm(data: { name?: string; phone?: string; email?: string }) {
    if (data.name) await this.page.getByLabel(/org.*name|name/i).fill(data.name);
    if (data.phone) await this.page.getByLabel(/phone/i).fill(data.phone);
    if (data.email) await this.page.getByLabel(/email/i).fill(data.email);
  }

  async save() {
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.waitForToast();
  }
}
