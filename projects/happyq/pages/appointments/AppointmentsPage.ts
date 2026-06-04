import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AppointmentsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/appointments'); }

  async expectLoaded() {
    // Calendar has no h1 — wait for the Today button which is always visible on load
    await expect(this.page.getByRole('button', { name: /today/i })).toBeVisible({ timeout: 10000 });
  }

  async selectView(view: 'day' | 'week' | 'compact') {
    await this.page.getByRole('button', { name: new RegExp(view, 'i') }).click();
  }

  async clickToday() {
    await this.page.getByRole('button', { name: /today/i }).click();
  }

  async filterByQueue(queueName: string) {
    await this.page.getByRole('combobox').first().click();
    await this.page.getByText(queueName).click();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search by name or phone/i).fill(query);
  }

  async clickBookAppointment() {
    await this.page.getByRole('button', { name: /book appointment/i }).click();
  }
}
