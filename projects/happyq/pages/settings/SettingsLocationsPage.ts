import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsLocationsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/locations'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Locations' }).first()).toBeVisible();
  }

  async clickNewLocation() {
    await this.page.getByRole('button', { name: /new location/i }).click();
  }

  async fillLocationForm(data: { name: string; code?: string; phone?: string }) {
    await this.page.getByLabel('Location Name', { exact: true }).fill(data.name);
    if (data.code) await this.page.getByLabel('Location Code', { exact: true }).fill(data.code);
    if (data.phone) await this.page.getByLabel('Phone Number', { exact: true }).fill(data.phone);
  }

  async save() {
    await this.page.getByRole('button', { name: /Create New Location|Update Location|Save/i }).first().click();
    await this.waitForToast();
  }

  async searchLocation(query: string) {
    await this.page.getByPlaceholder('Search locations...').fill(query);
  }

  async expectLocationInList(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}

