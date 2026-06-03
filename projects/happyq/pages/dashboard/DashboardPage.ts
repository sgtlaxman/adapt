import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/dashboard'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  }

  async selectDate(date: string) {
    await this.page.getByRole('button', { name: /select date/i }).click();
    await this.page.getByText(date).click();
  }

  async expectStatCard(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }
}
