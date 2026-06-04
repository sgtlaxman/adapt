/**
 * setup-test-users.mjs
 * Enables email/password login for ADAPT test users.
 * Uses the email as the password, and converts phone users to email+phone users.
 *
 * Usage: node scripts/setup-test-users.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_URL    = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const TEST_USERS = [
  { email: 'julie@fetalclinic.in',     role: 'RECEPTIONIST' },
  { email: 'pons@fetalclinic.in',      role: 'STANDARD'     },
  { email: 'Ilavarasi@fetalclinic.in', role: 'ACCOUNTANT'   },
  { email: 'info@fetalclinic.in',      role: 'DOCTOR'       },
  { email: 'preetha@fetalclinic.in',   role: 'ADMIN'        },
];

console.log('\n[ADAPT] Setting up test users...\n');

let success = 0;
let failed  = 0;

for (const user of TEST_USERS) {
  const sql = `
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := '${user.email}';
    v_password TEXT := '${user.email}';
BEGIN
    SELECT user_id INTO v_user_id FROM core.cr_user WHERE email = v_email;

    IF v_user_id IS NOT NULL THEN
        UPDATE auth.users
        SET
            email = v_email,
            encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
            email_confirmed_at = now(),
            raw_app_meta_data = '{"provider":"email","providers":["email","phone"]}'::jsonb
        WHERE id = v_user_id;
        RAISE NOTICE 'OK: Updated %', v_email;
    ELSE
        RAISE EXCEPTION 'User not found in core.cr_user for email: %', v_email;
    END IF;
END $$;
`.trim();

  const tmpFile = path.join(__dirname, `.tmp-${user.role.toLowerCase()}.sql`);
  try {
    fs.writeFileSync(tmpFile, sql, 'utf-8');
    execSync(`psql "${DB_URL}" -f "${tmpFile}"`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`  ✅  ${user.role.padEnd(14)} ${user.email}`);
    success++;
  } catch (err) {
    const msg = err.stderr?.split('\n').find(l => l.includes('ERROR') || l.includes('EXCEPTION')) || err.message.split('\n')[0];
    console.log(`  ❌  ${user.role.padEnd(14)} ${user.email}  — ${msg}`);
    failed++;
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

console.log(`\n[ADAPT] Done — ${success} users updated, ${failed} failed.`);
if (success > 0) {
  console.log(`\n  Password for each user = their own email address`);
  console.log(`  Now run: npm run test:happyq\n`);
}
