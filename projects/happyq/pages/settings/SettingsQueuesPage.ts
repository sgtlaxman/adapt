import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsQueuesPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/queues'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Streamline your clinic management' })).toBeVisible();
  }

  async clickNewQueue() {
    await this.page.getByRole('button', { name: /new queue/i }).click();
  }

  async save() {
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.waitForToast();
  }
}
