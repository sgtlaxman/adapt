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
 */
export class PatientDialog {
  constructor(private page: Page) {}

  async expectOpen(mode: 'add' | 'edit' = 'add') {
    const title = mode === 'add' ? /add new patient/i : /edit patient/i;
    // Radix Dialog portals to body — use page-level role check
    await expect(this.page.getByRole('dialog').getByRole('heading', { name: title })).toBeVisible();
  }

  async fill(data: PatientFormData) {
    // Wait for dialog to be fully rendered
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });

    // Use nth selectors for Name and Phone to pick the ones inside the dialog
    // (avoids conflicts with any page-level labels of the same name)
    const dialog = this.page.getByRole('dialog');

    // Use placeholder selectors — shadcn FormLabel/FormControl htmlFor wiring is unreliable with getByLabel
    await dialog.getByPlaceholder('John Doe').fill(data.name);
    await dialog.getByPlaceholder('98765 43210').fill(data.phone);
    if (data.email)      await dialog.getByPlaceholder('john@example.com').fill(data.email);
    if (data.age)        await dialog.getByLabel('Age').fill(data.age);
    if (data.address)    await dialog.getByLabel(/address/i).fill(data.address);
    if (data.spouseName) await dialog.getByLabel(/spouse name/i).fill(data.spouseName);
    if (data.gender) {
      await dialog.getByLabel('Gender').click();
      // Use first() — option may appear in multiple listboxes
      await this.page.getByRole('option', { name: data.gender }).first().click();
    }
  }

  async submit() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save patient|update patient/i }).click();
  }

  async cancel() {
    await this.page.getByRole('dialog').getByRole('button', { name: /cancel/i }).click();
  }

  async expectClosed() {
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }
}
