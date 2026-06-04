import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DocumentReportsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/documents/reports'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Compliance & System Reports' })).toBeVisible();
  }

  async switchToCompletionReport() {
    await this.page.getByRole('tab', { name: /task completion rates/i }).click();
  }

  async switchToAuditLog() {
    await this.page.getByRole('tab', { name: /security audit trail/i }).click();
  }
}
