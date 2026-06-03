import { test } from '@playwright/test';
import path from 'path';
import { DocumentsPage } from '../../pages/documents/DocumentsPage';
import { ExpiryTrackerPage } from '../../pages/documents/ExpiryTrackerPage';
import { DocumentReportsPage } from '../../pages/documents/DocumentReportsPage';

test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });

test.describe('Documents — Dashboard', () => {
  test('DOC-E2E-001: Documents page loads', async ({ page }) => {
    const docsPage = new DocumentsPage(page);
    await docsPage.goto();
    await docsPage.expectLoaded();
  });
});

test.describe('Documents — Expiry Tracker', () => {
  test('DOC-E2E-002: Expiry tracker page loads', async ({ page }) => {
    const expiryPage = new ExpiryTrackerPage(page);
    await expiryPage.goto();
    await expiryPage.expectLoaded();
  });

  test('DOC-E2E-003: Filter expiry tracker by Document type', async ({ page }) => {
    const expiryPage = new ExpiryTrackerPage(page);
    await expiryPage.goto();
    await expiryPage.expectLoaded();
    await expiryPage.filterByType('Document');
  });

  test('DOC-E2E-004: Filter expiry tracker by Equipment type', async ({ page }) => {
    const expiryPage = new ExpiryTrackerPage(page);
    await expiryPage.goto();
    await expiryPage.expectLoaded();
    await expiryPage.filterByType('Equipment');
  });
});

test.describe('Documents — Reports', () => {
  test('DOC-E2E-005: Document reports page loads', async ({ page }) => {
    const reportsPage = new DocumentReportsPage(page);
    await reportsPage.goto();
    await reportsPage.expectLoaded();
  });

  test('DOC-E2E-006: Switch to audit log tab', async ({ page }) => {
    const reportsPage = new DocumentReportsPage(page);
    await reportsPage.goto();
    await reportsPage.expectLoaded();
    await reportsPage.switchToAuditLog();
  });
});
