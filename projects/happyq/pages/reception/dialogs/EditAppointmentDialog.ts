import { Page, expect } from '@playwright/test';

export interface EditAppointmentData {
  time?: string;
  queue?: string;
  status?: string;
  visitPurpose?: string;
  remarks?: string;
}

/**
 * Handles the Edit Appointment modal dialog on the Reception page.
 */
export class EditAppointmentDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fill(data: EditAppointmentData) {
    const dialog = this.page.getByRole('dialog');
    if (data.time) {
      await dialog.locator('label:has-text("Time"), label:has-text("Slot")').locator('xpath=..').locator('button').first().click();
      await this.page.getByRole('option', { name: data.time }).click();
    }
    if (data.queue) {
      await dialog.locator('label:has-text("Queue")').locator('xpath=..').locator('button').first().click();
      await this.page.getByRole('option', { name: data.queue }).click();
    }
    if (data.status) {
      await dialog.locator('label:has-text("Status")').locator('xpath=..').locator('button').first().click();
      await this.page.getByRole('option', { name: data.status }).click();
    }
    if (data.visitPurpose) {
      await dialog.locator('label:has-text("Purpose")').locator('xpath=..').locator('button').first().click();
      const input = this.page.getByPlaceholder(/search clinical service|search by name/i).first();
      await input.waitFor({ state: 'visible' });
      await input.fill(data.visitPurpose);
      await this.page.getByRole('option').filter({ hasText: new RegExp(data.visitPurpose, 'i') }).first().click();
    }
    if (data.remarks) {
      await dialog.locator('label:has-text("Remarks")').locator('xpath=..').locator('textarea, input').first().fill(data.remarks);
    }
  }

  async save() {
    await this.page.getByRole('button', { name: /save changes/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
