import { Page, expect } from '@playwright/test';

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  defaultScreen?: string;
  isActive?: boolean;
}

/**
 * Handles the User Edit dialog on Settings > Users page.
 * Has 3 tabs: User Details, Assignments, Direct Permissions.
 */
export class UserEditDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fillUserDetails(data: UserFormData) {
    await this.switchTab('User Details');
    await this.page.getByLabel('Name').fill(data.name);
    await this.page.getByLabel('Email Address').fill(data.email);
    if (data.phone) await this.page.getByLabel(/phone/i).fill(data.phone);
    if (data.defaultScreen) {
      await this.page.getByLabel(/default screen/i).click();
      await this.page.getByRole('option', { name: data.defaultScreen }).click();
    }
    if (data.isActive !== undefined) {
      const toggle = this.page.getByRole('switch', { name: /active status/i });
      const isChecked = await toggle.isChecked();
      if (isChecked !== data.isActive) await toggle.click();
    }
  }

  async saveDetails() {
    await this.switchTab('User Details');
    await this.page.getByRole('button', { name: /save changes/i }).click();
  }

  async switchTab(tab: 'User Details' | 'Assignments' | 'Direct Permissions') {
    await this.page.getByRole('tab', { name: tab }).click();
  }

  async addAssignment(data: { roles?: string[]; locations?: string[] }) {
    await this.switchTab('Assignments');
    if (data.roles) {
      for (const role of data.roles) {
        await this.page.getByRole('combobox', { name: /roles/i }).click();
        await this.page.getByRole('option', { name: role }).click();
      }
    }
    if (data.locations) {
      for (const loc of data.locations) {
        await this.page.getByRole('combobox', { name: /locations/i }).click();
        await this.page.getByRole('option', { name: loc }).click();
      }
    }
    await this.page.getByRole('button', { name: /add assignment/i }).click();
  }

  async close() {
    await this.page.keyboard.press('Escape');
  }
}
