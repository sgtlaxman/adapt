import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingReportsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/billing/reports'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Invoice Report' })).toBeVisible();
  }

  async switchTab(tabName: string) {
    await this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click();
  }

  async switchToDayInvoices() {
    await this.switchTab('Day Invoices');
  }

  async switchToAuditLog() {
    await this.switchTab('Day Summary');
  }

  async downloadCsv() {
    await this.page.getByRole('button', { name: /download csv/i }).click();
  }
}
