import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsVisitPurposesPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/visit-purposes'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Visit Purposes' }).first()).toBeVisible();
  }

  async clickNewPurpose() {
    await this.page.getByRole('button', { name: /Add Purpose|new purpose/i }).click();
  }

  async save() {
    // Form submit button shows 'Create' when adding a new purpose
    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
    await this.waitForToast();
  }
}

