import * as dotenv from 'dotenv';
import path from 'path';
import { generateRunId } from '../../core/lib/run-id';
import { cleanupAdaptData } from '../../core/lib/cleanup';

const PROJECT_DIR = __dirname;

/**
 * Playwright globalSetup — runs once before the entire test suite.
 *
 * Steps:
 *   1. If CLEANUP=true → delete all ADAPT-tagged records from previous runs
 *   2. Generate a new Run ID for this session
 */
export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.join(PROJECT_DIR, '.env') });

  const cleanup = process.env.CLEANUP === 'true';

  if (cleanup) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        '[ADAPT] CLEANUP=true but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env'
      );
    }

    await cleanupAdaptData(supabaseUrl, serviceRoleKey);
  } else {
    console.log('\n[ADAPT] Cleanup skipped. Pass CLEANUP=true to delete previous run data.');
  }

  generateRunId(PROJECT_DIR);
}
