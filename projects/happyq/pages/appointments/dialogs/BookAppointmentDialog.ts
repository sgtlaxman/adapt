import { Page, expect } from '@playwright/test';

export interface BookAppointmentData {
  patientName?: string;       // search existing patient
  queue: string;
  visitPurpose?: string;
  time?: string;
  status?: string;
  remarks?: string;
  notificationMethod?: 'None' | 'SMS' | 'WhatsApp';
  // New patient fields (if not selecting existing)
  newPatientName?: string;
  newPatientPhone?: string;
  newPatientAge?: string;
  newPatientGender?: 'Male' | 'Female' | 'Other';
}

/**
 * Handles the Book Appointment / Edit Appointment modal dialog.
 * Used from: Appointments page, Calendar view.
 */
export class BookAppointmentDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog').getByRole('heading', { name: /book appointment|update appointment/i })).toBeVisible();
  }

  async selectExistingPatient(name: string) {
    await this.page.getByRole('combobox', { name: /patient/i }).fill(name);
    await this.page.getByRole('option', { name: new RegExp(name, 'i') }).first().click();
  }

  async selectQueue(queue: string) {
    await this.page.getByRole('combobox', { name: /queue/i }).click();
    await this.page.getByRole('option', { name: queue }).click();
  }

  async selectVisitPurpose(purpose: string) {
    await this.page.getByRole('combobox', { name: /visit purpose/i }).fill(purpose);
    await this.page.getByRole('option', { name: new RegExp(purpose, 'i') }).first().click();
  }

  async setTime(time: string) {
    await this.page.getByRole('combobox', { name: /time/i }).fill(time);
  }

  async setRemarks(remarks: string) {
    await this.page.getByLabel(/remarks/i).fill(remarks);
  }

  async setNotificationMethod(method: 'None' | 'SMS' | 'WhatsApp') {
    await this.page.getByRole('radio', { name: method }).click();
  }

  async submit() {
    await this.page.getByRole('button', { name: /book appointment|update appointment/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /close/i }).click();
  }

  async expectClosed() {
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }
}
