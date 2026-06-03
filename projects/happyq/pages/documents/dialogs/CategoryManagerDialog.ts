import { Page, expect } from '@playwright/test';

/**
 * Handles the Category Manager dialog.
 * Used from: Documents page, Tasks page.
 */
export class CategoryManagerDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async clickAddNew() {
    await this.page.getByRole('button', { name: /add new/i }).click();
  }

  async fillCategory(data: { name: string; color?: string }) {
    await this.page.getByLabel(/name/i).fill(data.name);
    if (data.color) {
      // Color is a preset picker — click the matching color swatch
      await this.page.locator(`[data-color="${data.color}"], [title="${data.color}"]`).first().click();
    }
  }

  async saveCategory() {
    await this.page.getByRole('button', { name: /save category/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
