import { Page, expect } from '@playwright/test';

export interface CompleteFollowUpData {
  outcome: string;
  notes?: string;
  scheduleNext?: {
    date: string;
    assignedTo: string;
    remarks: string;
  };
}

/**
 * Handles the Complete Follow-Up dialog on the Follow-Up page.
 */
export class CompleteFollowUpDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fill(data: CompleteFollowUpData) {
    await this.page.getByLabel(/outcome/i).click();
    await this.page.getByRole('option', { name: data.outcome }).click();

    if (data.notes) await this.page.getByLabel(/follow-up notes/i).fill(data.notes);

    if (data.scheduleNext) {
      await this.page.getByRole('switch', { name: /schedule another follow-up/i }).click();
      await this.page.getByLabel(/next follow-up date/i).fill(data.scheduleNext.date);
      await this.page.getByLabel(/assigned to/i).fill(data.scheduleNext.assignedTo);
      await this.page.getByLabel(/remarks/i).fill(data.scheduleNext.remarks);
    }
  }

  async confirm() {
    await this.page.getByRole('button', { name: /mark as completed|complete & schedule/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
