import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PatientListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/patients');
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Patients' })).toBeVisible();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }

  async clickAddPatient() {
    await this.page.getByRole('button', { name: /add patient/i }).click();
  }

  async expectPatientInList(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
