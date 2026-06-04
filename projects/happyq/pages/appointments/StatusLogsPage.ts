import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class StatusLogsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/status-logs'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Status Logs' })).toBeVisible();
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }

  async expectLogEntries() {
    await expect(this.page.locator('[class*="log"], [class*="timeline"]').first()).toBeVisible({ timeout: 10000 });
  }
}
