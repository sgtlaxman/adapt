import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ConsultantPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/consultant'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Consultant Room', exact: true })).toBeVisible();
  }

  async filterByQueue(queueName: string) {
    await this.page.getByRole('combobox').first().click();
    await this.page.getByRole('option', { name: new RegExp(queueName, 'i') }).first().click();
  }

  async expectKanbanColumns() {
    await expect(this.page.locator('[class*="column"], [class*="kanban"]').first()).toBeVisible({ timeout: 10000 });
  }

  async expectAccessDenied() {
    await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });
  }
}
