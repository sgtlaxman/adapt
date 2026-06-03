import { test } from '@playwright/test';
import path from 'path';
import { TasksPage } from '../../pages/tasks/TasksPage';

test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });

test.describe('Tasks — Dashboard', () => {
  test('TSK-E2E-001: Tasks dashboard loads', async ({ page }) => {
    const tasksPage = new TasksPage(page);
    await tasksPage.goto();
    await tasksPage.expectLoaded();
  });
});
