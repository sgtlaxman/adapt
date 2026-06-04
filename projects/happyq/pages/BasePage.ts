import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForToast(text?: string) {
    const toast = this.page.locator('[data-sonner-toast]');
    await toast.first().waitFor({ state: 'visible', timeout: 8000 });
    return toast;
  }

  async expectAccessDenied() {
    // HappyQ's PermissionGuard shows this exact message
    await expect(
      this.page.getByText("You don't have permission to access this page.")
    ).toBeVisible({ timeout: 8000 });
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}-${Date.now()}.png` });
  }
}
