import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsServicesPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/services'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /services/i })).toBeVisible();
  }

  async clickNewService() {
    await this.page.getByRole('button', { name: /new service/i }).click();
  }

  async fillServiceForm(data: { name: string; price?: string }) {
    await this.page.getByLabel(/service name|name/i).fill(data.name);
    if (data.price) await this.page.getByLabel(/price/i).fill(data.price);
  }

  async save() {
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.waitForToast();
  }
}
