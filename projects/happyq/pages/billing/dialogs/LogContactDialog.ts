import { Page, expect } from '@playwright/test';

export interface LogContactData {
  outcome: string;
  notes?: string;
  scheduleNext?: {
    date: string;
    assignedTo: string;
    remarks: string;
  };
}

/**
 * Handles the Log Contact dialog on the Billing Outstanding page.
 */
export class LogContactDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fill(data: LogContactData) {
    await this.page.getByLabel(/call outcome/i).click();
    await this.page.getByRole('option', { name: data.outcome }).click();

    if (data.notes) await this.page.getByLabel(/discussion notes/i).fill(data.notes);

    if (data.scheduleNext) {
      await this.page.getByRole('switch', { name: /schedule next follow-up/i }).click();
      await this.page.getByLabel(/next follow-up date/i).fill(data.scheduleNext.date);
      await this.page.getByLabel(/assign call to/i).fill(data.scheduleNext.assignedTo);
      await this.page.getByLabel(/call objective/i).fill(data.scheduleNext.remarks);
    }
  }

  async save() {
    await this.page.getByRole('button', { name: /save log entry/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
