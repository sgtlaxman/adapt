import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ExpiryTrackerPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/documents/expiry'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Unified Expiry Tracker' })).toBeVisible();
  }

  async filterByType(type: 'All' | 'Document' | 'Equipment') {
    await this.page.getByRole('button', { name: type }).click();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }

  async expectExpiredSection() {
    await expect(this.page.getByText(/expired/i).first()).toBeVisible();
  }
}
