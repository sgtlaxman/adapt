import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/auth');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /sign in|log in/i }).click();
  }

  async expectRedirectAfterLogin() {
    await this.page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
  }

  async expectErrorMessage() {
    const error = this.page.locator('[role="alert"], .text-destructive').first();
    await expect(error).toBeVisible({ timeout: 8000 });
  }

  async expectLoginPageVisible() {
    await expect(this.page.getByLabel(/email/i)).toBeVisible();
  }
}
