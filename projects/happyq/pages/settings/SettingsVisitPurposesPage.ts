import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsVisitPurposesPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/visit-purposes'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Visit Purpose' })).toBeVisible();
  }

  async clickNewPurpose() {
    await this.page.getByRole('button', { name: /new purpose/i }).click();
  }

  async save() {
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.waitForToast();
  }
}

