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
    await this.page.locator('div:has(> label:text("Patient")) ~ button[role="combobox"]').click();
    const input = this.page.getByPlaceholder('Search by name or phone...');
    await input.waitFor({ state: 'visible' });
    await input.fill(name);
    await this.page.getByRole('option').filter({ hasText: new RegExp(name, 'i') }).first().click();
  }

  async selectQueue(queue: string) {
    await this.page.locator('label:text("Queue") ~ button[role="combobox"]').click();
    await this.page.getByRole('option', { name: queue }).click();
  }

  async selectVisitPurpose(purpose: string) {
    await this.page.locator('label:text("Visit Purpose") ~ button[role="combobox"]').click();
    const input = this.page.getByPlaceholder('Search by name, code or category...');
    await input.waitFor({ state: 'visible' });
    await input.fill(purpose);
    await this.page.getByRole('option').filter({ hasText: new RegExp(purpose, 'i') }).first().click();
  }

  async clickNewPatient() {
    await this.page.getByRole('button', { name: /new patient/i }).click();
  }

  async fillNewPatient(data: { name: string; phone: string; age?: string; spouseName?: string; gender?: 'Male' | 'Female' | 'Other' }) {
    await this.page.getByPlaceholder('Patient Name').fill(data.name);
    await this.page.getByPlaceholder('Mobile Number').fill(data.phone);
    if (data.age) {
      await this.page.getByPlaceholder('Age').fill(data.age);
    }
    if (data.spouseName) {
      await this.page.getByPlaceholder('Spouse Name').fill(data.spouseName);
    }
    if (data.gender) {
      await this.page.getByRole('radio', { name: data.gender, exact: true }).click();
    }
  }

  async clickSaveNewPatient() {
    await this.page.getByRole('button', { name: /save & select patient/i }).click();
  }

  async hasWhatsAppOption() {
    return await this.page.locator('#notify-whatsapp').isVisible();
  }

  async setTime(time: string) {
    await this.page.locator('label:text("Time") ~ button[role="combobox"]').click();
    await this.page.getByRole('option', { name: time }).click();
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
    // Scope to dialog to avoid matching other close buttons on the page
    await this.page.getByRole('dialog').getByRole('button', { name: /close/i }).first().click();
  }

  async expectClosed() {
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }
}
