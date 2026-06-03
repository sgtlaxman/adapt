import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DisplayPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/display'); }

  async expectLoaded() {
    await expect(this.page.locator('[class*="queue"], [class*="display"]').first()).toBeVisible({ timeout: 10000 });
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }
}
