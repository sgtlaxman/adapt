import { Page, expect } from '@playwright/test';

/**
 * Handles the Schedule Follow-Up dialog on the Follow-Up page.
 */
export class MarkFollowUpDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fill(data: { date: string; assignedTo: string; remarks: string }) {
    await this.page.getByLabel(/follow-up date/i).fill(data.date);
    await this.page.getByLabel(/assigned to/i).fill(data.assignedTo);
    await this.page.getByLabel(/remarks/i).fill(data.remarks);
  }

  async schedule() {
    await this.page.getByRole('button', { name: /schedule follow-up/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
