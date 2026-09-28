# Local production-build preview

Run commands from the repository root with Docker Linux containers enabled.
The frontend is independent of the separate Mentro server repository. Install
and check the app with Node 24 from `mentro/`: `npm ci`, `npm run format:check`,
`npm run lint`, `npm test`, `npm run build`.

Builds require explicit public `VITE_PROXY_URL`, `VITE_SUPABASE_URL`, and
`VITE_SUPABASE_PUBLISHABLE_KEY`. These values become public JavaScript. Never use
a secret/service-role key. Both publishable and legacy anon keys are supported.
`LOCAL_PREVIEW=true` rejects non-loopback destinations. Missing build config
fails instead of creating an unusable app. Development retains localhost:3001.

Compose fixes local destinations to API `http://127.0.0.1:3001` and test Auth
`http://127.0.0.1:3004`, with a dummy publishable key. It never loads an env file
into the image. These are browser addresses, not container service names.
Without the separate server and an explicitly isolated Auth fixture/service,
only static routes and unauthenticated UI are available. No production fallback
is attempted. Fixture Auth cannot prove real sign-in/history/RLS acceptance.

PowerShell:

```powershell
$env:MENTRO_WEB_REVISION = git rev-parse HEAD
docker compose up --build --detach --wait --wait-timeout 60
docker compose ps
npm run test:smoke
docker compose logs --tail 100
docker compose stop
docker compose start --wait --wait-timeout 60
docker compose down
```

On POSIX use `export MENTRO_WEB_REVISION=$(git rev-parse HEAD)` first.
Preview: <http://127.0.0.1:8081>. Health: `/healthz` is explicit process/static
readiness only; it does not assert API, Auth or history readiness. Initial
acceptance deadlines: startup/recovery 60 seconds, HTTP 10 seconds, stop 10
seconds. Browser viewports: 1440x900 and 390x844. No clock-sensitive changes.

The nginx runtime is uid/gid 101, read-only except a 16 MiB `/tmp` tmpfs; it has
128 MiB RAM, 0.5 CPU, 64 PIDs, all capabilities dropped, no-new-privileges, and
three rotated 10 MiB logs. Preview binds loopback. There are no local persistence
volumes; Auth/history remain external. Restart/recreate cannot migrate or erase
managed data. Hashed assets are immutable; HTML revalidates, unknown assets 404,
and extensionless client routes receive the app shell.

The image tag and OCI revision identify the source commit. Record local image ID
after building; do not promote an uncommitted development build. A future release
requires a selected host, actual isolated integration evidence, approved merge,
successful checks of merged main, immutable images, serialized deployment,
health verification and recovery instructions. No production deployment is
configured here. Restore a known frontend image only with its compatible public
API/Auth configuration; this does not restore database history.

CI `quality` and `container` run on every PR and main push without credentials.
Remote branch-protection enforcement is not assumed. See [validation](validation.md)
for baseline failures and acceptance status.
