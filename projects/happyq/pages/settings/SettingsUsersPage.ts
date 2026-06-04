import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsUsersPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/settings/users'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Users' })).toBeVisible();
  }

  async clickNewUser() {
    await this.page.getByRole('button', { name: /new user/i }).click();
  }

  async fillUserForm(data: { name: string; email: string; role: string }) {
    await this.page.getByLabel(/name/i).fill(data.name);
    await this.page.getByLabel(/email/i).fill(data.email);
    await this.page.getByRole('combobox', { name: /role/i }).click();
    await this.page.getByText(data.role).click();
  }

  async save() {
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.waitForToast();
  }

  async expectUserInList(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async expectAccessDenied() {
    await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });
  }
}
