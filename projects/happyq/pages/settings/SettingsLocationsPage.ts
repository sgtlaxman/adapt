import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsLocationsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/locations'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Streamline your clinic management' })).toBeVisible();
  }

  async clickNewLocation() {
    await this.page.getByRole('button', { name: /new location/i }).click();
  }

  async fillLocationForm(data: { name: string; code?: string; phone?: string }) {
    await this.page.getByLabel(/location name/i).fill(data.name);
    if (data.code) await this.page.getByLabel(/code/i).fill(data.code);
    if (data.phone) await this.page.getByLabel(/phone/i).fill(data.phone);
  }

  async save() {
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.waitForToast();
  }

  async searchLocation(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }

  async expectLocationInList(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
