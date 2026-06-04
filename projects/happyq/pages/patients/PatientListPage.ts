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
    // level:1 avoids strict mode — CardTitles also contain "Patients" text
    await expect(this.page.getByRole('heading', { name: 'Patients', level: 1 })).toBeVisible();
  }

  async search(query: string) {
    // Use specific placeholder to avoid matching the global search bar
    await this.page.getByPlaceholder(/search by name, phone, or email/i).fill(query);
  }

  async clickAddPatient() {
    await this.page.getByRole('button', { name: /add patient/i }).click();
  }

  async expectPatientInList(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
