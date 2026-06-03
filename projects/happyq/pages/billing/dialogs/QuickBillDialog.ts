import { Page, expect } from '@playwright/test';

export interface QuickBillPayment {
  mode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Others';
  amount: string;
}

/**
 * Handles the Quick Bill modal dialog.
 * Used from: Billing page, Reception page.
 */
export class QuickBillDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async addService(serviceName: string) {
    await this.page.getByPlaceholder(/add service/i).fill(serviceName);
    await this.page.getByRole('option', { name: new RegExp(serviceName, 'i') }).first().click();
  }

  async addPayment(payment: QuickBillPayment) {
    await this.page.getByRole('button', { name: new RegExp(`\\+ ${payment.mode}`, 'i') }).click();
    const amountInputs = this.page.getByPlaceholder(/amount/i);
    await amountInputs.last().fill(payment.amount);
  }

  async setGlobalDiscount(amount: string) {
    await this.page.getByLabel(/discount/i).fill(amount);
  }

  async saveAndPrint() {
    await this.page.getByRole('button', { name: /save & print bill/i }).click();
    // Confirm in nested alert dialog
    await this.page.getByRole('button', { name: /confirm & print/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel transaction/i }).click();
  }
}
