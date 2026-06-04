-- enable-test-user.sql
-- Enables email/password login for an existing Supabase user.
-- Used to prepare test users for ADAPT automation without creating new accounts.
--
-- Usage: Replace :email and :password below, then run against your local Supabase:
--   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -v email='user@example.com' -v password='YourPassword'
--
-- Or use the runner script:
--   node scripts/setup-test-users.mjs

DO $$
DECLARE
    v_email    TEXT := :'email';
    v_password TEXT := :'password';
BEGIN
    UPDATE auth.users
    SET
        encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
        email_confirmed_at = now()
    WHERE email = v_email;

    IF NOT FOUND THEN
        RAISE NOTICE 'No user found with email: %', v_email;
    ELSE
        RAISE NOTICE 'Password updated for: %', v_email;
    END IF;
END $$;
