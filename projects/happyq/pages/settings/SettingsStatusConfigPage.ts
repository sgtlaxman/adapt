import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsStatusConfigPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/settings/status-config');
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', { name: /Status Config/i }).first()
    ).toBeVisible({ timeout: 15000 });
  }

  async clickAddStatus() {
    await this.page.getByRole('button', { name: /Add Status/i }).click();
  }

  async fillStatusForm(data: { code: string; name: string; flowOrder?: number; displayOrder?: number }) {
    await this.page.locator('#statusCode').fill(data.code);
    await this.page.locator('#statusName').fill(data.name);
    if (data.flowOrder !== undefined) {
      await this.page.locator('#flowOrder').fill(String(data.flowOrder));
    }
    if (data.displayOrder !== undefined) {
      await this.page.locator('#displayOrder').fill(String(data.displayOrder));
    }
  }

  async clickCreate() {
    await this.page.getByRole('button', { name: 'Create Status', exact: true }).click();
    await this.waitForToast();
  }
}
