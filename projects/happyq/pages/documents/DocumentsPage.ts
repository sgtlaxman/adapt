import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DocumentsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/documents');
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Compliance & Register' })).toBeVisible();
  }
}
