# Mentro WebApp container validation

## Current quality follow-up (2026-09-24)

The prior pilot snapshot below records the original failures. On the current task
branch, formatting and lint now pass without suppressing rules. The Results page
routes a missing analysis through React Router, keeps its hooks in a stable
component, initializes the chat summary without a render-time state update, and
cancels token requests when unmounted. Auth context and its hook live in separate
modules for Fast Refresh. Chart payloads use explicit types; the dashboard retry
path uses a request callback rather than a synchronous effect state update.

`npm run format:check`, `npm run lint`, `npm test` (15 tests across three files),
and `npm run build` passed from `mentro/` with the runbook's local public build
values. Two Results page regression tests cover a valid analysis and a direct
`/results` render with missing route state. The production build still reports a
large JavaScript chunk (about 6.5 MB); bundle splitting is separate work.

The exact committed-image smoke and remote PR checks are recorded in the PR
description after delivery. Authenticated browser chat awaits the separate
Mentro server's loopback fixture; actual isolated Supabase Auth/history and
two-user checks remain blocked. The existing Vercel preview failure needs its
own deployment-log diagnosis and does not establish a local container failure.

## Initial pilot snapshot (historical)

Snapshot for the local WebApp container pilot. Shared criteria are from
`hosting-ops/docs/migration-completion-gates.md`; this report records local
evidence separately from actual Auth and server integration.

## Tested snapshot

- Repository base: `ca295107ad93a40e3a88adc26d88564b9163efec`.
- The Docker pilot changes were uncommitted when this snapshot was checked. The
  local image ID was not recorded, so the base commit alone does not identify
  every build input.
- Host tools: Node.js `24.16`, Docker Engine `29.5.3`, Docker Compose `5.1.4`.
- Application install and build use `mentro/package-lock.json`; the image pins
  the Node and nginx base images by digest.
- The WebApp is a static frontend container. The separate Mentro server and an
  isolated Supabase Auth/history service were not part of the local Compose
  stack.

The runbook's preview uses the browser-facing loopback addresses
`http://127.0.0.1:3001` for the proxy API and `http://127.0.0.1:3004` for Auth.
These are explicit fixture destinations, not running services in this stack.
The image does not receive an env file or privileged key.

## Local results

Results below are from the active worktree validation snapshot; this document
edit did not rerun the checks.

| Check | Result | Evidence |
| --- | --- | --- |
| Install | PASS | `cd mentro; npm ci` completed with the committed lockfile. |
| Formatting | FAIL | `npm run format:check` still reports the baseline files `public/privacy.html` and `public/promo-tile.html`. `vitest.config.ts` has since been formatted. |
| Lint | FAIL | `npm run lint` reports 15 errors and 1 warning. Existing findings include `TrendChart` use of `any`, `AuthContext` Fast Refresh export, `chatClient` cause handling, `ResultsPage` conditional hooks and mutation, and the `Dashboard` dependency warning. These remain visible for separate review. |
| Tests | PASS | `npm test` runs 10 meaningful `build-environment.test.ts` tests and passes. The earlier baseline discovered zero tests; that baseline is superseded by these tests. |
| TypeScript and production build | PASS | `npm run build` completes TypeScript and Vite production builds with explicit local public configuration. Built JavaScript is approximately 6,498,430 bytes. |
| Container HTTP smoke | PASS | `npm run test:smoke` passed one test against the running image: explicit health, deep-route fallback, missing-asset 404s, MIME/cache behavior, and local public API/Auth URLs without a privileged-key marker. |
| Browser preview | PASS, limited | Desktop at 1440×900 rendered Home then Log In. Mobile at 390×844 reloaded Auth and Home. Browser console errors and warnings were empty. Login was not attempted because the isolated Auth service was unavailable. |
| Runtime and idle use | PASS | Container ran as uid/gid 101 with a read-only root and no application process in the static image. Stop/start returned healthy in under 60 seconds. Idle sample: about 5 MiB, 0% CPU, 3 PIDs. Compose config declares a 10-second stop grace, 128 MiB memory limit, 0.5 CPU, 64-PID limit, `/tmp` tmpfs, dropped capabilities, no-new-privileges, and rotated logs. |
| Remote CI | PENDING | PR checks have not completed for the final PR commit. The known formatting and lint baseline failures are expected to keep `quality` red unless separately resolved. |

## Shared repository gate

| Gate | Status | Evidence and remaining work |
| --- | --- | --- |
| S1 | BLOCKED | Locked install, configured build, runtime documentation, and digest-pinned image bases are present. A clean-checkout run and an exact image identity for the dirty local build were not recorded. |
| S2 | FAIL | Test and build checks pass, but formatting and lint fail on the listed existing findings. Keep them visible; do not weaken the checks to clear this gate. |
| S3 | BLOCKED | Health and stop/start recovery passed within 60 seconds. The measured shutdown duration against the configured 10-second grace period was not recorded. Health is for the static frontend only and does not establish API, Auth, or history readiness. |
| S4 | PASS | Runtime identity, read-only operation, and absence of an application process were inspected. Resource limits, tmpfs, capabilities, log rotation, and loopback binding are configured; idle use was sampled above. |
| S5 | BLOCKED | The production frontend build contains the configured browser-facing local API address, but no proxy server is running in this stack. Real API requests, preflight behavior, and end-to-end browser journeys remain unverified. |
| S6 | BLOCKED | Ten build-environment tests cover required public configuration and local-preview destination guards. The container smoke confirms local API/Auth URLs and no privileged-key marker in built JavaScript, but no service requests were observed because the server and Auth service were unavailable. |
| S7 | BLOCKED | `quality` and `container` are configured for pull requests and pushes to `main` without production credentials. Final PR CI is pending; branch-protection enforcement has not been checked. |
| S8 | PASS, local static service | [The container runbook](container-runbook.md) documents startup, health/log inspection, stop, restart, and recovery. The preview has no local persistence volume; Auth and history remain external. Start/recovery was observed, with the shutdown timing limitation noted under S3. |

## Mentro WebApp gates

| Gate | Status | Evidence and remaining work |
| --- | --- | --- |
| M4 | BLOCKED | The frontend's static routes render, but this repository's preview has no containerized Mentro server. A known-input analysis through the actual server, expected results, and chat completion remain unverified. |
| M5 | BLOCKED | No actual isolated Supabase service was available. Sign-in, session reload, history save/retrieve/delete, sign-out, and two-user isolation were not tested. |
| M6 | BLOCKED | Frontend configuration points to the explicit local proxy/Auth addresses, but neither service is running here. Auth headers, origins, streaming, and the delivered serving path through the actual server remain unverified. |

The PR should remain draft while S1–S3, S5, S7, M4–M6, and the existing S2
failures remain open. Local frontend fixtures and static-container checks do not
prove actual server behavior or Supabase Auth/history isolation.

## Integration follow-up

The real local Mentro server became available after the snapshot. In the browser,
`https://chatgpt.com/share/browser` was fetched through localhost3001 using the
server's controlled Chromium fixture. Results showed one prompt,100% delegation,
overall4/100 and seven estimated tokens; console errors/warnings were empty.
This passes the unauthenticated analysis portion of M4, not authenticated chat
or M5 history/isolation.

Integration inspection found that the existing chat client never sent a bearer
token. It now obtains the current session from the existing Supabase client,
attaches Authorization, and asks signed-out users to sign in before making a
request. Three additional regression tests cover token/end processing, signed-out
refusal and a server-rejected session. The suite now has13passing tests. The
same edit preserves the caught network error as cause; remaining baseline lint
is14errors/1warning. Two public HTML formatting failures remain.

The first PR CI container job passed and quality failed on those known baseline
files. Vercel's existing preview integration also reported failure; its build-log
connector was unavailable, so the cause remains unverified. No Vercel settings
were changed. Current commit/image/CI is maintained in the final PR handoff.
