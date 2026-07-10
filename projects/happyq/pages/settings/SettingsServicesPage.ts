import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsServicesPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/services'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Services' }).first()).toBeVisible();
  }

  async clickNewService() {
    await this.page.getByRole('button', { name: /Add Service|new service/i }).click();
  }

  async fillServiceForm(data: { name: string; price?: string }) {
    const container = this.page.getByRole('dialog').first();
    await container.locator('input[name="name"]').fill(data.name);
    if (data.price) await container.locator('input[name="base_price"]').fill(data.price);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Create Service', exact: true }).click();
    await this.waitForToast();
  }
}

