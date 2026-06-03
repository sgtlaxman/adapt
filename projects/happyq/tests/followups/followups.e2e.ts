import { test } from '@playwright/test';
import path from 'path';
import { FollowUpsPage } from '../../pages/followups/FollowUpsPage';

test.use({ storageState: path.resolve(__dirname, '../../.auth/standard.json') });

test.describe('Follow-Ups — Dashboard', () => {
  test('FOL-E2E-001: Follow-up dashboard loads', async ({ page }) => {
    const followUpsPage = new FollowUpsPage(page);
    await followUpsPage.goto();
    await followUpsPage.expectLoaded();
  });

  test('FOL-E2E-002: Stat cards are visible', async ({ page }) => {
    const followUpsPage = new FollowUpsPage(page);
    await followUpsPage.goto();
    await followUpsPage.expectLoaded();
    await followUpsPage.expectStatCard('Due Today');
    await followUpsPage.expectStatCard('Overdue');
  });

  test('FOL-E2E-003: Filter by Scheduled tab', async ({ page }) => {
    const followUpsPage = new FollowUpsPage(page);
    await followUpsPage.goto();
    await followUpsPage.expectLoaded();
    await followUpsPage.filterByTab('Scheduled');
  });

  test('FOL-E2E-004: Filter by Completed tab', async ({ page }) => {
    const followUpsPage = new FollowUpsPage(page);
    await followUpsPage.goto();
    await followUpsPage.expectLoaded();
    await followUpsPage.filterByTab('Completed');
  });
});
