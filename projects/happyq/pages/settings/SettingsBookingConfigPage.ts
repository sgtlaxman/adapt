import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsBookingConfigPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/settings/booking-config');
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', { name: /Booking Config/i }).first()
    ).toBeVisible({ timeout: 15000 });
  }

  async expectWarningVisible() {
    await expect(
      this.page.getByText(/Please select a specific location from the sidebar/i)
    ).toBeVisible();
  }

  async expectWeeklyScheduleVisible() {
    await expect(
      this.page.getByRole('heading', { name: /Standard Working Hours/i })
    ).toBeVisible();
  }
}
