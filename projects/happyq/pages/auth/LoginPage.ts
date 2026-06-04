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
    // Login page defaults to Phone tab — click Email tab first
    await this.page.getByRole('tab', { name: /email/i }).click();
    // Fill email — getByPlaceholder works (getByLabel conflicts with tab panel aria-label)
    await this.page.getByPlaceholder('example@email.com').fill(email);
    // Tab to password field and type — most reliable for shadcn/react-hook-form
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.type(password);
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
    // Check the Email tab is present — page defaults to Phone tab on load
    await expect(this.page.getByRole('tab', { name: /email/i })).toBeVisible();
  }
}
