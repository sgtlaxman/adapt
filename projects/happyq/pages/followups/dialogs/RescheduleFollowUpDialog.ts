import { Page, expect } from '@playwright/test';

/**
 * Handles the Reschedule Follow-Up dialog on the Follow-Up page.
 */
export class RescheduleFollowUpDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fill(data: { date: string; assignedTo: string; remarks?: string }) {
    await this.page.getByLabel(/new follow-up date/i).fill(data.date);
    await this.page.getByLabel(/assigned to/i).fill(data.assignedTo);
    if (data.remarks) await this.page.getByLabel(/reason for rescheduling/i).fill(data.remarks);
  }

  async confirm() {
    await this.page.getByRole('button', { name: /reschedule/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
