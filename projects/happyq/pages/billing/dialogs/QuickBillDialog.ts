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
    await this.page.getByRole('combobox').filter({ hasText: /add service/i }).first().click();
    const input = this.page.getByPlaceholder(/search by name/i);
    await input.waitFor({ state: 'visible' });
    await input.fill(serviceName);
    await this.page.getByRole('option').filter({ hasText: new RegExp(serviceName, 'i') }).first().click();
  }

  async addPayment(payment: QuickBillPayment) {
    await this.page.getByRole('button', { name: new RegExp(`\\+ ${payment.mode}`, 'i') }).click();
    const amountInputs = this.page.getByPlaceholder(/amount/i);
    await amountInputs.last().fill(payment.amount);
  }

  async setGlobalDiscount(amount: string) {
    await this.page.getByRole('dialog').locator('span').filter({ hasText: /^Discount \(₹\)/ }).locator('..').locator('input').fill(amount);
  }

  async saveAndPrint() {
    await this.page.getByRole('button', { name: /save & print bill/i }).click();
    // Only click Confirm & Print if the confirmation dialog appears (for unpaid/partially paid bills)
    const confirmBtn = this.page.getByRole('button', { name: /confirm & print/i });
    try {
      await confirmBtn.waitFor({ state: 'visible', timeout: 3000 });
      await confirmBtn.click();
    } catch (e) {
      // No confirmation needed (bill is fully paid, saved directly)
    }
    // Wait for the success toast to ensure the database write completed
    await expect(this.page.getByText(/Invoice generated successfully/i).first()).toBeVisible({ timeout: 15000 });
  }

  async removePayment() {
    const selectTrigger = this.page.getByRole('combobox').filter({ hasText: 'Cash' }).first();
    const paymentRow = selectTrigger.locator('..').locator('..');
    await paymentRow.locator('button').last().click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel transaction/i }).click();
  }
}
