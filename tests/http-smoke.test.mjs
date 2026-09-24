import assert from 'node:assert/strict';
import test from 'node:test';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8081';
const get = (path) => fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) });
test('health and deep navigation are distinct from missing assets', async () => {
  const health = await get('/healthz');
  assert.equal(health.status, 200);
  assert.equal(await health.text(), 'ok\n');
  const html = await (await get('/')).text();
  for (const path of ['/auth', '/history', '/dashboard', '/chat']) {
    assert.equal(await (await get(path)).text(), html);
  }
  for (const path of ['/missing.js', '/assets/missing', '/missing.png']) {
    assert.equal((await get(path)).status, 404);
  }
  const scripts = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map((match) => match[1]);
  assert.ok(scripts.length >= 2);
  for (const path of scripts) {
    const response = await get(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /immutable/);
    if (path.endsWith('.js')) {
      assert.match(response.headers.get('content-type'), /javascript/);
      const script = await response.text();
      assert.ok(script.includes('http://127.0.0.1:3001'));
      assert.ok(script.includes('http://127.0.0.1:3004'));
      assert.ok(!script.includes('sb_secret_'));
    }
  }
});
