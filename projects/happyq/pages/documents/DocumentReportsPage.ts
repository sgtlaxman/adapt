import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DocumentReportsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/documents/reports'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /document reports/i })).toBeVisible();
  }

  async switchToCompletionReport() {
    await this.page.getByRole('tab', { name: /completion report/i }).click();
  }

  async switchToAuditLog() {
    await this.page.getByRole('tab', { name: /audit log/i }).click();
  }
}
