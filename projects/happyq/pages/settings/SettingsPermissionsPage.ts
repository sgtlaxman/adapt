import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsPermissionsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/permissions'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Streamline your clinic management' })).toBeVisible();
  }

  async expectPermissionsMatrixVisible() {
    await expect(this.page.locator('table').first()).toBeVisible({ timeout: 10000 });
  }

  async save() {
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.waitForToast();
  }
}
