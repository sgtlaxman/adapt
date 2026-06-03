import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ReceptionPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/reception'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /reception/i })).toBeVisible();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }

  async switchToTableView() {
    await this.page.getByRole('button', { name: /table/i }).click();
  }

  async switchToCardView() {
    await this.page.getByRole('button', { name: /card/i }).click();
  }

  async filterByQueue(queueName: string) {
    await this.page.getByRole('combobox').first().click();
    await this.page.getByText(queueName).click();
  }

  async expectPatientsVisible() {
    await expect(this.page.locator('table tbody tr, [class*="patient-card"]').first()).toBeVisible({ timeout: 10000 });
  }

  async expectAccessDenied() {
    await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });
  }
}
