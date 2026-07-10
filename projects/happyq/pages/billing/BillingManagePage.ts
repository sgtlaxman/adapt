import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingManagePage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto(appointmentId: string) {
    await this.page.goto(`/billing/manage/${appointmentId}`);
  }

  async expectLoaded() {
    await expect(this.page.getByRole('button', { name: /create invoice/i }).first()).toBeVisible({ timeout: 10000 });
  }

  async switchTab(tab: 'Invoice' | 'Payment-Add' | 'Payment-List' | 'Preview' | 'Refund') {
    // Map internal tab names to display labels on buttons
    const labelMap = {
      'Invoice': /create invoice/i,
      'Payment-Add': /add payment/i,
      'Payment-List': /payment history/i,
      'Preview': /preview & print/i,
      'Refund': /refund/i
    };
    await this.page.getByRole('button', { name: labelMap[tab] }).click();
  }

  async expectInvoiceTab() {
    await this.page.getByRole('button', { name: /create invoice/i }).first().click();
    await expect(this.page.getByRole('button', { name: /finalize & record payment/i }).first()).toBeVisible();
  }

  async addPayment(amount: string, method: string) {
    await this.switchTab('Payment-Add');
    const tab = this.page.locator('.min-h-\\[400px\\]');
    await tab.getByRole('spinbutton').first().fill(amount);
    await tab.getByRole('combobox').first().click();
    await this.page.getByRole('option').filter({ hasText: new RegExp(method, 'i') }).first().click();
    await tab.getByRole('button', { name: 'Add Payment', exact: true }).click();
    await this.waitForToast();
  }

  async clickBack() {
    await this.page.getByRole('button', { name: /back/i }).click();
  }
}
