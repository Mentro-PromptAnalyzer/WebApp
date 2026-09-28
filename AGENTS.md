# Mentro WebApp workflow

The application and lockfile live in `mentro/`. The Express server is a separate
repository, `Mentro-PromptAnalyzer/server`. Never recreate a nested server here.
Keep analysis framework-independent, auth state in AuthContext, and Supabase calls
behind its existing client. Build-time public configuration is validated in
`mentro/build-environment.ts`; API consumers share `src/lib/apiConfig.ts`.

Use Node 24 and `npm ci` in `mentro/`, then `npm run format:check`, `npm run lint`,
`npm test`, and `npm run build`. Build variables and container commands are in
[the runbook](docs/container-runbook.md). From the repository root,
`npm run test:smoke` tests the actual running image.

CI jobs are `quality` and `container`; all required checks must pass before
readiness. Baseline failures stay visible; do not suppress rules or zero-test
failures. Use task branches and separate PRs; the user merges. Keep a draft PR
when required checks or isolated Auth/history verification are blocked.

No Docker deployment pipeline is enabled. Existing hosting is unchanged. Never
put privileged keys into VITE variables, run against production data for tests,
or interpret fixture results as proof of real Auth or row-level security.
