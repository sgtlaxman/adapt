import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingHistoryPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/billing/history'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Billing History' })).toBeVisible();
  }
}
