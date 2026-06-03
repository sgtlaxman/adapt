import { test } from '@playwright/test';
import path from 'path';
import { DocumentsPage } from '../../pages/documents/DocumentsPage';

test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });

test.describe('Documents', () => {
  test('DOC-E2E-001: Documents page loads', async ({ page }) => {
    const docsPage = new DocumentsPage(page);
    await docsPage.goto();
    await docsPage.expectLoaded();
  });
});
