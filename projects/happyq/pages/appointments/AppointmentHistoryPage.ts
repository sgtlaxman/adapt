import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AppointmentHistoryPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/appointment-history'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Search Appointment' })).toBeVisible();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }

  async filterByStatus(status: string) {
    await this.page.getByRole('combobox', { name: /status/i }).click();
    await this.page.getByText(status).click();
  }

  async expectResultsVisible() {
    await expect(this.page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
  }
}
