import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DisplayPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/display'); }

  async expectLoaded() {
    // Display board has no h1 — wait for page container (toolbar or board)
    await expect(this.page.locator('main, [role="main"], #root > div').first()).toBeVisible({ timeout: 10000 });
  }

  async search(query: string) {
    await this.page.getByPlaceholder(/search/i).fill(query);
  }
}
