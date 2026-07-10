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
    await expect(this.page.getByRole('heading', { name: /log balance contact/i })).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  async fill(data: LogContactData) {
    await this.page.getByRole('combobox').first().click();
    await this.page.getByRole('option', { name: data.outcome }).first().click();

    if (data.notes) {
      await this.page.locator('textarea').first().fill(data.notes);
    }

    if (data.scheduleNext) {
      await this.page.getByRole('switch', { name: /schedule next/i }).click();
      await this.page.locator('input[type="date"]').first().fill(data.scheduleNext.date);
      await this.page.getByPlaceholder(/staff \/ operator name/i).fill(data.scheduleNext.assignedTo);
      await this.page.locator('textarea').last().fill(data.scheduleNext.remarks);
    }
  }

  async save() {
    await this.page.getByRole('button', { name: /save log entry/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
