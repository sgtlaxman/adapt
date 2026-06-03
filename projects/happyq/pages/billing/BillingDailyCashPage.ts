import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingDailyCashPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/billing/daily-cash'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /daily cash/i })).toBeVisible();
  }
}
