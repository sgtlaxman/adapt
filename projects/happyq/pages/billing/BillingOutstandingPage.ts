import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingOutstandingPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/billing/outstanding'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Balance Reminders' })).toBeVisible();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search patient, phone, or invoice/i).fill(query);
  }

  async filterByStatus(status: string) {
    await this.page.getByRole('combobox').filter({ hasText: /All Contacts|Contacted|Not Yet/i }).first().click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).first().click();
  }

  async expectRowsVisible() {
    await expect(this.page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
  }
}
