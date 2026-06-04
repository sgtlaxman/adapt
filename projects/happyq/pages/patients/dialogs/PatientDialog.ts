import { Page, expect } from '@playwright/test';

export interface PatientFormData {
  name: string;
  phone: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: string;
  address?: string;
  spouseName?: string;
  dateOfBirth?: string;
}

/**
 * Handles the Add New Patient / Edit Patient modal dialog.
 * Used from: Patients list page, Reception page.
 * All selectors scoped to getByRole('dialog') to avoid page-level conflicts.
 */
export class PatientDialog {
  constructor(private page: Page) {}

  private get dialog() {
    return this.page.getByRole('dialog');
  }

  async expectOpen(mode: 'add' | 'edit' = 'add') {
    const title = mode === 'add' ? /add new patient/i : /edit patient/i;
    await expect(this.dialog.getByRole('heading', { name: title })).toBeVisible();
  }

  async fill(data: PatientFormData) {
    await this.dialog.getByLabel('Name').fill(data.name);
    await this.dialog.getByLabel('Phone').fill(data.phone);
    if (data.email) await this.dialog.getByLabel(/email/i).fill(data.email);
    if (data.age) await this.dialog.getByLabel('Age').fill(data.age);
    if (data.address) await this.dialog.getByLabel(/address/i).fill(data.address);
    if (data.spouseName) await this.dialog.getByLabel(/spouse name/i).fill(data.spouseName);
    if (data.dateOfBirth) await this.dialog.getByLabel(/date of birth/i).fill(data.dateOfBirth);
    if (data.gender) {
      await this.dialog.getByLabel('Gender').click();
      await this.page.getByRole('option', { name: data.gender }).click();
    }
  }

  async submit() {
    await this.dialog.getByRole('button', { name: /save patient|update patient/i }).click();
  }

  async cancel() {
    await this.dialog.getByRole('button', { name: /cancel/i }).click();
  }

  async expectClosed() {
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }
}
