import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsConsultantRoomPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/settings/consultant-room');
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', { name: /Consultant Room Configuration/i })
    ).toBeVisible({ timeout: 15000 });
  }

  async clickAddColumn() {
    await this.page.getByRole('button', { name: /Add Column/i }).click();
  }

  async fillColumnLabel(index: number, label: string) {
    const input = this.page.locator('input[placeholder="e.g. Queue-Waiting"]').nth(index);
    await input.fill(label);
  }

  async toggleStatus(colIndex: number, statusCode: string) {
    const lowerCheckbox = this.page.locator(`#col-${colIndex}-${statusCode.toLowerCase()}`);
    const upperCheckbox = this.page.locator(`#col-${colIndex}-${statusCode.toUpperCase()}`);
    
    // Wait for either checkbox to be attached to the DOM (up to 5s)
    await Promise.race([
      lowerCheckbox.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {}),
      upperCheckbox.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {})
    ]);

    if (await lowerCheckbox.count() > 0) {
      await lowerCheckbox.dispatchEvent('click');
    } else if (await upperCheckbox.count() > 0) {
      await upperCheckbox.dispatchEvent('click');
    } else {
      // Fallback: find a switch or checkbox whose associated label matches the status code.
      // This handles apps that use IDs other than #col-N-STATUS (e.g. UUIDs or 1-based indices).
      const statusRegex = new RegExp(statusCode, 'i');
      const byLabel = this.page.getByLabel(statusRegex);
      const byRole  = this.page.getByRole('switch', { name: statusRegex });
      const byCheck = this.page.getByRole('checkbox', { name: statusRegex });

      if (await byLabel.count() > 0) {
        await byLabel.last().dispatchEvent('click');
      } else if (await byRole.count() > 0) {
        await byRole.last().dispatchEvent('click');
      } else if (await byCheck.count() > 0) {
        await byCheck.last().dispatchEvent('click');
      } else {
        throw new Error(
          `Could not find status toggle for colIndex=${colIndex}, statusCode=${statusCode}. ` +
          `Tried: #col-${colIndex}-${statusCode.toLowerCase()}, #col-${colIndex}-${statusCode.toUpperCase()}, ` +
          `getByLabel(/${statusCode}/i), getByRole('switch'|'checkbox')`
        );
      }
    }
  }

  async clickSave() {
    await this.page.getByRole('button', { name: /Save Configuration/i }).click();
    await this.waitForToast();
  }
}
