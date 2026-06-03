import { Page, expect } from '@playwright/test';

/**
 * Handles the Cancel Invoice confirmation dialog.
 * Used from: Billing page.
 */
export class CancelInvoiceDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fillReason(reason: string) {
    await this.page.getByLabel(/cancellation reason/i).fill(reason);
  }

  async selectRefundMode(mode: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Other') {
    await this.page.getByLabel(/refund payment mode/i).click();
    await this.page.getByRole('option', { name: mode }).click();
  }

  async confirm() {
    await this.page.getByRole('button', { name: /confirm cancellation/i }).click();
  }

  async goBack() {
    await this.page.getByRole('button', { name: /go back/i }).click();
  }
}
