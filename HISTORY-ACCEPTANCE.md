# Mentro history provider acceptance

The WebApp writes `AnalysisResult` JSON to `public.chat_histories` and reads it for
History, Dashboard, and Results. That JSON includes original user prompt text.
The live Supabase project `anmsstuexchqyghqoipt` had no `chat_histories` on
2026-09-27. This migration is reviewable source, not permission to apply it to
that project.

## Review before migration

1. Decide how long prompt content is retained, whether a user can delete all
   history, and how account deletion and backups handle it. Update user-facing
   privacy text before enabling saved history. The proposed foreign key deletes
   active rows when an Auth user is deleted; backups may retain earlier copies.
2. Approve an isolated Supabase target and its provider cost. Create two
   separate test Auth users there. Do not reuse the live project or credentials.
3. Record a database recovery point and confirm that the target Data API exposes
   `public` and that `authenticated` has table access. Review the SQL in
   `supabase/migrations/20260928002512_create_chat_histories.sql`.

## Apply and validate in isolation

Apply the migration through the Supabase migration workflow. Confirm the table,
index, RLS, policies, and grants with database metadata or advisors. From
`mentro/`, install from the lockfile and run `npm run test:provider-history` with
these protected environment variable names:

`SUPABASE_TEST_URL`, `SUPABASE_TEST_PUBLISHABLE_KEY`,
`SUPABASE_TEST_USER_A_EMAIL`, `SUPABASE_TEST_USER_A_PASSWORD`,
`SUPABASE_TEST_USER_B_EMAIL`, `SUPABASE_TEST_USER_B_PASSWORD`, and
`SUPABASE_TEST_WRITES_APPROVED=isolated-only`.

The runner refuses the known live Mentro URL, signs in both real users, writes
two histories, checks JSON round-trip, owner reads, cross-user and anonymous
denial, spoofed ownership rejection, forbidden update, and owner cleanup. It
does not print credentials or analysis content. Use only disposable test users.
Record the target reference, migration version, exact result, and cleanup result.

Separately verify the WebApp's authenticated browser journey: sign in as each
user, analyze a controlled prompt through the actual inference path, reload
History and Dashboard, re-open Results, delete one entry, and confirm it stays
deleted on reload. Verify that the other user sees none of the first user's
history. Record the API image SHA, WebApp deployment SHA, and isolated project
reference. A database test alone does not validate inference or the UI.

## Production sequence and recovery

After isolated acceptance and privacy review, schedule the live migration and
take a verified provider recovery point. Check again that `chat_histories` is
absent, apply the exact reviewed SQL once, inspect grants/RLS, then perform a
small authorized user journey. Keep the frontend history flow unavailable until
those checks pass. If application behavior fails, stop new history writes and
restore the previous frontend/API image; preserve rows for investigation. Dropping
the table destroys stored prompt content, so only do that after an explicit
data retention/export decision. A container rollback does not reverse the DDL.
