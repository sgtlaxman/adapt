import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ReceptionPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/reception'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Patient Management' })).toBeVisible();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search by name, phone, or token/i).fill(query);
    if (query.includes('[ADAPT-')) {
      // Use .first().toBeVisible() instead of toHaveCount(1) — the composite locator
      // 'div.rounded-lg.border-gray-200, tr' can match multiple nested DOM nodes for a
      // single patient card, so asserting an exact count of 1 is too strict.
      await expect(
        this.page.locator('main').locator('div.rounded-lg.border-gray-200, tr').filter({ hasText: query }).first()
      ).toBeVisible({ timeout: 10000 });
    }
  }

  async switchToTableView() {
    await this.page.getByRole('radio', { name: /table view/i }).click();
  }

  async switchToCardView() {
    await this.page.getByRole('radio', { name: /card view/i }).click();
  }

  async filterByQueue(queueName: string) {
    await this.page.getByRole('combobox').first().click();
    await this.page.getByRole('option', { name: queueName, exact: true }).click();
  }

  async expectPatientsVisible() {
    await expect(this.page.locator('table tbody tr, [class*="patient-card"]').first()).toBeVisible({ timeout: 10000 });
  }

  // expectAccessDenied() inherited from BasePage — uses HappyQ's exact permission message
}
