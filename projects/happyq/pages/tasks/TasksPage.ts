import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TasksPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/tasks');
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Tasks Dashboard' })).toBeVisible();
  }
}
