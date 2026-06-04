import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingSettlementPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/billing/settlement'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Daily Settlement' })).toBeVisible();
  }
}
