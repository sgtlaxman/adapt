import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface PatientData {
  firstName: string;
  lastName: string;
  phone?: string;
  dob?: string;
}

export class PatientFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillForm(data: PatientData) {
    await this.page.getByLabel(/first name/i).fill(data.firstName);
    await this.page.getByLabel(/last name/i).fill(data.lastName);
    if (data.phone) await this.page.getByLabel(/phone/i).fill(data.phone);
    if (data.dob) await this.page.getByLabel(/date of birth|dob/i).fill(data.dob);
  }

  async submit() {
    await this.page.getByRole('button', { name: /save|submit/i }).click();
  }

  async expectSuccessToast() {
    await this.waitForToast();
  }

  async expectValidationError() {
    await expect(this.page.locator('.text-destructive').first()).toBeVisible();
  }
}
