import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/billing');
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /billing/i })).toBeVisible();
  }

  async gotoHistory() {
    await this.page.goto('/billing/history');
  }

  async gotoOutstanding() {
    await this.page.goto('/billing/outstanding');
  }

  async expectAccessDenied() {
    await expect(
      this.page.getByText(/not authorized|access denied|permission/i).first()
    ).toBeVisible({ timeout: 8000 });
  }
}
