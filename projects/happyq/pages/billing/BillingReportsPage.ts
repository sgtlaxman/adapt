import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingReportsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/billing/reports'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Invoice Report' })).toBeVisible();
  }

  async switchToDayInvoices() {
    await this.page.getByRole('tab', { name: /day invoices/i }).click();
  }

  async switchToAuditLog() {
    await this.page.getByRole('tab', { name: /day invoices/i }).click();
  }

  async downloadCsv() {
    await this.page.getByRole('button', { name: /download csv/i }).click();
  }
}
