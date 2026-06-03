import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PatientHistoryPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/patient-history'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /patient history/i })).toBeVisible();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search patient/i).fill(query);
    await this.page.getByRole('button', { name: /search/i }).click();
  }

  async setDateRange(from: string, to: string) {
    const pickers = this.page.getByPlaceholder(/date/i);
    await pickers.nth(0).fill(from);
    await pickers.nth(1).fill(to);
  }
}
