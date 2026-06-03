import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class FollowUpsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/follow-ups'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /follow.up/i })).toBeVisible();
  }

  async expectStatCard(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async filterByTab(tab: 'All' | 'Scheduled' | 'Rescheduled' | 'Completed') {
    await this.page.getByRole('tab', { name: tab }).click();
  }

  async expectTableVisible() {
    await expect(this.page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
  }
}
