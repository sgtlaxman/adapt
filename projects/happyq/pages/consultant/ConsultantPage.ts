import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ConsultantPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/consultant'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /consultant room/i })).toBeVisible();
  }

  async filterByQueue(queueName: string) {
    const combobox = this.page.getByRole('combobox').first();
    // Skip if the desired queue is already selected to avoid click-timeout on Radix
    // checked options (aria-selected="true" / data-state="checked").
    const currentText = await combobox.textContent().catch(() => '');
    if (currentText && new RegExp(queueName, 'i').test(currentText)) return;
    await combobox.click();
    await this.page.getByRole('option', { name: new RegExp(queueName, 'i') }).first().click();
  }

  async expectKanbanColumns() {
    await expect(this.page.locator('[class*="column"], [class*="kanban"]').first()).toBeVisible({ timeout: 10000 });
  }

  async expectAccessDenied() {
    await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });
  }
}
