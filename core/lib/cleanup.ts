import { createClient } from '@supabase/supabase-js';

const ADAPT_TAG = 'ADAPT-';

/**
 * Deletes all test data created by previous ADAPT runs.
 * Identifies records by the [ADAPT-YYYYMMDD-HHmm] tag in name/title fields.
 *
 * Uses the Supabase service role key — bypasses RLS.
 * MUST only be pointed at a test/staging instance, never production.
 *
 * Tables cleaned (in order to respect FK constraints):
 *   1. invoices + invoice_items  → cascade from appointments
 *   2. appointments              → cascade from patients
 *   3. patients                  → primary cleanup target
 *   4. tasks                     → standalone
 *   5. documents                 → standalone
 */
export async function cleanupAdaptData(supabaseUrl: string, serviceRoleKey: string): Promise<void> {
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('\n[ADAPT] Starting cleanup of previous run data...');

  const results: { table: string; deleted: number }[] = [];

  // 1. Patients (appointments, bills cascade via FK)
  const { data: patients, error: patErr } = await client
    .from('patients')
    .select('id, name')
    .ilike('name', `%${ADAPT_TAG}%`);

  if (patErr) {
    console.warn(`[ADAPT] Cleanup warning — patients: ${patErr.message}`);
  } else if (patients && patients.length > 0) {
    const ids = patients.map((p) => p.id);

    // Delete appointments first (invoices cascade from appointments)
    await client.from('appointments').delete().in('patient_id', ids);

    // Delete patients
    const { error: delErr } = await client.from('patients').delete().in('id', ids);
    if (delErr) console.warn(`[ADAPT] Cleanup warning — delete patients: ${delErr.message}`);
    else results.push({ table: 'patients', deleted: ids.length });
  }

  // 2. Tasks
  const { data: tasks, error: taskErr } = await client
    .from('tasks')
    .select('id')
    .ilike('title', `%${ADAPT_TAG}%`);

  if (taskErr) {
    console.warn(`[ADAPT] Cleanup warning — tasks: ${taskErr.message}`);
  } else if (tasks && tasks.length > 0) {
    await client.from('tasks').delete().in('id', tasks.map((t) => t.id));
    results.push({ table: 'tasks', deleted: tasks.length });
  }

  // 3. Documents
  const { data: docs, error: docErr } = await client
    .from('documents')
    .select('id')
    .ilike('title', `%${ADAPT_TAG}%`);

  if (docErr) {
    console.warn(`[ADAPT] Cleanup warning — documents: ${docErr.message}`);
  } else if (docs && docs.length > 0) {
    await client.from('documents').delete().in('id', docs.map((d) => d.id));
    results.push({ table: 'documents', deleted: docs.length });
  }

  // Summary
  if (results.length === 0) {
    console.log('[ADAPT] Cleanup complete — no previous run data found.');
  } else {
    console.log('[ADAPT] Cleanup complete:');
    results.forEach((r) => console.log(`  - ${r.table}: ${r.deleted} record(s) deleted`));
  }
}
