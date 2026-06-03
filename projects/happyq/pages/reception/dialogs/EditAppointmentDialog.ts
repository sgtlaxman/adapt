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
    if (data.time) {
      await this.page.getByLabel(/time slot/i).click();
      await this.page.getByRole('option', { name: data.time }).click();
    }
    if (data.queue) {
      await this.page.getByLabel(/queue/i).click();
      await this.page.getByRole('option', { name: data.queue }).click();
    }
    if (data.status) {
      await this.page.getByLabel(/status/i).click();
      await this.page.getByRole('option', { name: data.status }).click();
    }
    if (data.visitPurpose) {
      await this.page.getByRole('combobox', { name: /visit purpose/i }).fill(data.visitPurpose);
      await this.page.getByRole('option', { name: new RegExp(data.visitPurpose, 'i') }).first().click();
    }
    if (data.remarks) await this.page.getByLabel(/remarks/i).fill(data.remarks);
  }

  async save() {
    await this.page.getByRole('button', { name: /save changes/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
