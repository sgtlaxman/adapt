const ADAPT_TAG = 'ADAPT-';

async function restGet(url: string, headers: Record<string, string>): Promise<any[]> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function restDelete(url: string, headers: Record<string, string>): Promise<void> {
  const res = await fetch(url, { method: 'DELETE', headers });
  if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status} ${await res.text()}`);
}

/**
 * Deletes all test data created by previous ADAPT runs.
 * Identifies records by the [ADAPT-YYYYMMDD-HHmm] tag in name/title fields.
 *
 * Uses the Supabase service role key — bypasses RLS.
 * MUST only be pointed at a test/staging instance, never production.
 *
 * Tables cleaned (in order to respect FK constraints):
 *   1. appointments              → cascade from patients
 *   2. patients                  → primary cleanup target
 *   3. tasks                     → standalone
 *   4. documents                 → standalone
 */
export async function cleanupAdaptData(supabaseUrl: string, serviceRoleKey: string): Promise<void> {
  const base = `${supabaseUrl}/rest/v1`;
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Prefer: 'return=minimal',
  };

  console.log('\n[ADAPT] Starting cleanup of previous run data...');

  const results: { table: string; deleted: number }[] = [];

  // 1. Patients tagged with ADAPT-
  const patients = await restGet(
    `${base}/patients?select=id&name=ilike.*${ADAPT_TAG}*`,
    headers
  ).catch((e) => { console.warn(`[ADAPT] Cleanup warning — patients fetch: ${e.message}`); return []; });

  if (patients.length > 0) {
    const ids = patients.map((p: any) => p.id);
    const idList = `(${ids.join(',')})`;

    // Delete appointments first (invoices cascade from appointments via FK)
    await restDelete(`${base}/appointments?patient_id=in.${idList}`, headers)
      .catch((e) => console.warn(`[ADAPT] Cleanup warning — appointments: ${e.message}`));

    // Delete patients
    await restDelete(`${base}/patients?id=in.${idList}`, headers)
      .catch((e) => console.warn(`[ADAPT] Cleanup warning — delete patients: ${e.message}`));

    results.push({ table: 'patients', deleted: ids.length });
  }

  // 2. Tasks
  const tasks = await restGet(
    `${base}/tasks?select=id&title=ilike.*${ADAPT_TAG}*`,
    headers
  ).catch((e) => { console.warn(`[ADAPT] Cleanup warning — tasks fetch: ${e.message}`); return []; });

  if (tasks.length > 0) {
    const idList = `(${tasks.map((t: any) => t.id).join(',')})`;
    await restDelete(`${base}/tasks?id=in.${idList}`, headers)
      .catch((e) => console.warn(`[ADAPT] Cleanup warning — delete tasks: ${e.message}`));
    results.push({ table: 'tasks', deleted: tasks.length });
  }

  // 3. Documents
  const docs = await restGet(
    `${base}/documents?select=id&title=ilike.*${ADAPT_TAG}*`,
    headers
  ).catch((e) => { console.warn(`[ADAPT] Cleanup warning — documents fetch: ${e.message}`); return []; });

  if (docs.length > 0) {
    const idList = `(${docs.map((d: any) => d.id).join(',')})`;
    await restDelete(`${base}/documents?id=in.${idList}`, headers)
      .catch((e) => console.warn(`[ADAPT] Cleanup warning — delete documents: ${e.message}`));
    results.push({ table: 'documents', deleted: docs.length });
  }

  if (results.length === 0) {
    console.log('[ADAPT] Cleanup complete — no previous run data found.');
  } else {
    console.log('[ADAPT] Cleanup complete:');
    results.forEach((r) => console.log(`  - ${r.table}: ${r.deleted} record(s) deleted`));
  }
}
