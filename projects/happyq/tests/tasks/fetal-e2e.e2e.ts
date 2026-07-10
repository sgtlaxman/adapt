import { test, expect } from '@playwright/test';
import { loadActiveTests } from '../../../../core/lib/spreadsheet-reader';
import { writeResults, TestResult } from '../../../../core/lib/results-writer';
import path from 'path';

test.use({ storageState: path.resolve(__dirname, '../../.auth/admin.json') });

const spreadsheetPath = path.resolve(__dirname, '../../data/HappyQ_Tests.xlsx');
const testCases = loadActiveTests(spreadsheetPath);
const results: TestResult[] = [];

test.describe('End-to-End Playwright Tests (Fetal Clinic)', () => {
  // createDocumentIfMissing navigates, creates a category if missing, uploads a file,
  // and re-navigates — this regularly exceeds the default 60 s timeout in staging.
  test.describe.configure({ timeout: 120000 });

  test.afterAll(async () => {
    if (results.length > 0) {
      const env = process.env.ENV || 'local';
      writeResults(spreadsheetPath, results, env);
    }
  });

  for (const tc of testCases) {
    test(`${tc.testId}: ${tc.testName}`, async ({ page }) => {
      const start = Date.now();
      try {
        // Inject auth token in localStorage dynamically
        await page.addInitScript(() => {
          localStorage.setItem('onedrive_access_token', 'mock-access-token');
          localStorage.setItem('onedrive_refresh_token', 'mock-refresh-token');
        });

        await runE2EJourney(page, tc.testId, tc.testData);

        results.push({
          testId: tc.testId,
          testName: tc.testName,
          module: tc.module,
          screen: tc.screen,
          userRole: tc.userRole,
          status: 'PASS',
          actualResult: 'User journey completed successfully',
          durationMs: Date.now() - start,
        });
      } catch (err: any) {
        results.push({
          testId: tc.testId,
          testName: tc.testName,
          module: tc.module,
          screen: tc.screen,
          userRole: tc.userRole,
          status: 'FAIL',
          actualResult: '',
          durationMs: Date.now() - start,
          errorMessage: err.message,
        });
        throw err;
      }
    });
  }
});

async function markOverdueTasks(page: any) {
  await page.evaluate(async () => {
    // 1. Get auth token
    const tokenKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    if (!tokenKey) return;
    const sessionStr = localStorage.getItem(tokenKey);
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    const token = session.access_token;

    // 2. Resolve supabase url
    const projectId = tokenKey.split('-')[1];
    const supabaseUrl = `https://${projectId}.supabase.co`;
    const apiKey = 'sb_publishable_HgOAHeL1ESBGaP_CiSuS6Q_zX_jgg8U';

    await fetch(`${supabaseUrl}/rest/v1/rpc/mark_overdue_tasks`, {
      method: 'POST',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  });
  // Wait a small timeout for database to commit
  await page.waitForTimeout(1000);
}

async function ensureLocationSelected(page: any) {
  const locButton = page.getByRole('button').filter({ hasText: /City center|Chennai|Coimbatore|Cluny|All Locations/i }).first();
  if (await locButton.isVisible()) {
    const txt = await locButton.textContent();
    if (txt && !txt.includes('City center')) {
      await locButton.click();
      const menuItem = page.getByRole('menuitem', { name: 'City center' });
      // Only switch if "City center" is actually available in the dropdown
      if (await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        await menuItem.click();
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
      }
    }
  }
}

async function ensureCategoryExists(page: any, type: 'task' | 'document', name: string) {
  // Click "Manage Categories"
  await page.getByRole('button', { name: 'Manage Categories' }).click();
  await page.waitForTimeout(500);

  // Check if our category already exists
  const categoryItem = page.getByText(name).first();
  if (await categoryItem.isVisible()) {
    // Close categories modal using Radix Close button
    await page.getByRole('button', { name: 'Close' }).last().click();
    await page.waitForTimeout(500);
    return;
  }

  // Click Add New
  await page.getByRole('button', { name: 'Add New' }).click();
  await page.getByPlaceholder('e.g. Health & Safety').fill(name);
  await page.getByRole('button', { name: 'Save Category' }).click();
  await page.waitForTimeout(500);

  // Close categories modal
  await page.getByRole('button', { name: 'Close' }).last().click();
  await page.waitForTimeout(500);
}

async function createTaskIfMissing(page: any, title: string, daysAgo?: number) {
  await page.goto('/tasks');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await ensureLocationSelected(page);

  // Close any open details dialog
  const closeBtn = page.getByRole('button', { name: 'Close Details' });
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }

  const taskRow = page.getByText(title).first();
  if (await taskRow.isVisible()) {
    return;
  }

  // Open Add Task modal
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(500);

  // Ensure category exists
  await ensureCategoryExists(page, 'task', 'Compliance');

  // Fill title & desc
  await page.locator('#title').fill(title);
  await page.locator('#desc').fill('Auto-generated E2E task description');

  // Select category
  await page.locator('button:has-text("Select Category")').click();
  await page.getByRole('option', { name: 'Compliance' }).first().click();

  // Set start date
  if (daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateStr);
    
    // Toggle recurring switch to daily recurrence to generate past instances
    await page.getByRole('switch').first().click();
    await page.waitForTimeout(500);
  }

  // Click "Save Task"
  await page.getByRole('button', { name: 'Save Task' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function createDocumentIfMissing(page: any, title: string) {
  await page.goto('/documents');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await ensureLocationSelected(page);

  // Close any open details dialog
  const closeBtn = page.getByRole('button', { name: 'Close Detail' });
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }

  const docRow = page.getByText(new RegExp(title, 'i')).first();
  if (await docRow.isVisible()) {
    return;
  }

  // Open Add Document modal
  await page.getByRole('button', { name: 'Add Document' }).click();
  await page.waitForTimeout(500);

  // Ensure category exists
  await ensureCategoryExists(page, 'document', 'Compliance Docs');

  // Fill title & desc
  await page.locator('#doc-title').fill(title);
  await page.locator('#doc-desc').fill('Auto-generated E2E document description');

  // Select category
  await page.locator('button:has-text("Select Category")').click();
  await page.getByRole('option', { name: 'Compliance Docs' }).first().click();

  // Attach mock file
  const fileBuffer = Buffer.from('pdf mock content');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'document.pdf',
    mimeType: 'application/pdf',
    buffer: fileBuffer,
  });

  // Click "Save Document"
  await page.getByRole('button', { name: 'Save Document' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  // Verify the document appears in the list so callers can rely on it existing.
  await expect(page.getByText(new RegExp(title, 'i')).first()).toBeVisible({ timeout: 15000 });
}

async function runE2EJourney(page: any, testId: string, data: any) {
  const uniqSuffix = ' ' + Date.now();

  if (testId === 'TASK-E2E-001') {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await ensureLocationSelected(page);
    await expect(page.locator('h1').first()).toContainText('Tasks Dashboard');
  }

  if (testId === 'TASK-E2E-002') {
    const title = (data.task_title || 'Check fetal monitor calibration') + uniqSuffix;
    await createTaskIfMissing(page, title);

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await ensureLocationSelected(page);

    await page.getByText(title).first().click();
    await page.getByRole('button', { name: 'Mark Complete' }).click();
    
    // Toast notification visible
    await expect(page.locator('ol li, [role="status"], .sonner-toast').first()).toBeVisible({ timeout: 10000 });
  }

  if (testId === 'TASK-E2E-003') {
    const title = (data.task_title || 'Review emergency procedures') + uniqSuffix;
    await createTaskIfMissing(page, title, 3); // 3 days ago, recurring daily

    // Trigger Supabase RPC to mark the past instance as overdue
    await markOverdueTasks(page);

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await ensureLocationSelected(page);

    const badge = page.getByText('Overdue', { exact: true }).first();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveClass(/text-rose-700|bg-rose-50/);
  }

  if (testId === 'TASK-E2E-004' || testId === 'DOC-E2E-004') {
    const docTitle = (data.document_title || 'Ultrasound Service Agreement') + uniqSuffix;
    await createDocumentIfMissing(page, docTitle);

    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await ensureLocationSelected(page);

    await page.getByText(new RegExp(docTitle, 'i')).first().click();
    await page.locator('button:has(svg.lucide-pencil)').first().click();
    
    // Set expiry tomorrow
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (data.expiry_days_ahead || 1));
    const dateStr = expiryDate.toISOString().split('T')[0];
    
    await page.locator('input[type="date"]').fill(dateStr);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify auto-task created on tasks dashboard
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await ensureLocationSelected(page);
    await expect(page.getByText(new RegExp(docTitle, 'i')).first()).toBeVisible({ timeout: 10000 });
  }

  if (testId === 'DOC-E2E-001') {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await ensureLocationSelected(page);

    await page.getByRole('button', { name: 'Add Document' }).click();
    await page.waitForTimeout(500);
    
    await ensureCategoryExists(page, 'document', 'Compliance Docs');
    
    const title = (data.document_title || 'GE Voluson E10 Manual') + uniqSuffix;
    await page.locator('#doc-title').fill(title);
    await page.locator('#doc-desc').fill(data.description || 'Mock description');
    
    // Select category
    await page.locator('button:has-text("Select Category")').click();
    await page.getByRole('option', { name: 'Compliance Docs' }).first().click();
    
    // Attach mock file
    const fileBuffer = Buffer.from('pdf mock content');
    await page.locator('input[type="file"]').setInputFiles({
      name: data.file_name || 'ultrasound_manual.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer,
    });
    
    await page.getByRole('button', { name: 'Save Document' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(new RegExp(title, 'i')).first()).toBeVisible({ timeout: 10000 });
  }

  if (testId === 'DOC-E2E-002') {
    const docTitle = (data.document_title || 'GE Voluson E10 Manual') + uniqSuffix;
    await createDocumentIfMissing(page, docTitle);

    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await ensureLocationSelected(page);

    await page.getByText(new RegExp(docTitle, 'i')).first().click();
    
    // Expand version history
    await page.getByRole('button', { name: 'History' }).click();
    
    // Fill version (handle potential object cells from excel)
    const verVal = typeof data.new_version === 'string' ? data.new_version : 'v2.0';
    await page.locator('input[placeholder="e.g. v2.0"]').fill(verVal);
    
    // Attach file
    const fileBuffer = Buffer.from('new pdf content');
    await page.locator('input[type="file"]').first().setInputFiles({
      name: data.file_name || 'ultrasound_manual_v2.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer,
    });
    
    await page.locator('input[placeholder="Version change notes..."]').fill('Version E2E update');
    await page.getByRole('button', { name: 'Upload New Version' }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify updated version
    await expect(page.getByText(verVal).first()).toBeVisible({ timeout: 10000 });

    // Close detail dialog to clean up screen
    await page.getByRole('button', { name: 'Close Detail' }).click();
  }

  if (testId === 'DOC-E2E-003') {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await ensureLocationSelected(page);
    await expect(page.locator('h1').first()).toContainText('Compliance & Register');
  }

  if (testId === 'DOC-E2E-005') {
    const docTitle = (data.document_title || 'GE Voluson E10 Manual') + uniqSuffix;
    await createDocumentIfMissing(page, docTitle);

    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await ensureLocationSelected(page);

    await page.getByText(new RegExp(docTitle, 'i')).first().click();
    
    await page.locator('button:has(svg.lucide-pencil)').first().click();
    await page.getByRole('button', { name: 'Add Attribute' }).click();
    
    const keyInputs = await page.locator('input[placeholder="Key"]').all();
    await keyInputs[keyInputs.length - 1].fill('support_contact');
    
    const valueInputs = await page.locator('input[placeholder="Value"]').all();
    await valueInputs[valueInputs.length - 1].fill('GE Support');
    
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify metadata saved (dialog is still open in view mode)
    await expect(page.getByText('support_contact').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('GE Support').first()).toBeVisible({ timeout: 5000 });

    // Close detail dialog to clean up screen
    await page.getByRole('button', { name: 'Close Detail' }).click();
  }
}
