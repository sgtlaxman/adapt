import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingManagePage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto(appointmentId: string) {
    await this.page.goto(`/billing/manage/${appointmentId}`);
  }

  async expectLoaded() {
    await expect(this.page.locator('[role="tablist"]')).toBeVisible({ timeout: 10000 });
  }

  async switchTab(tab: 'Invoice' | 'Payment-Add' | 'Payment-List' | 'Preview' | 'Refund') {
    await this.page.getByRole('tab', { name: new RegExp(tab, 'i') }).click();
  }

  async expectInvoiceTab() {
    await this.page.getByRole('tab', { name: /invoice/i }).click();
    await expect(this.page.getByRole('button', { name: /create invoice/i })).toBeVisible();
  }

  async addPayment(amount: string, method: string) {
    await this.switchTab('Payment-Add');
    await this.page.getByPlaceholder(/amount/i).fill(amount);
    await this.page.getByRole('combobox', { name: /method/i }).click();
    await this.page.getByText(method).click();
    await this.page.getByRole('button', { name: /add payment/i }).click();
    await this.waitForToast();
  }

  async clickBack() {
    await this.page.getByRole('button', { name: /back/i }).click();
  }
}
