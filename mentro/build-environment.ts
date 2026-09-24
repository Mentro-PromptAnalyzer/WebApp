// VITE values are public. Never accept an elevated Supabase key in a browser build.
export function validateBuildEnvironment(env: Record<string, string>) {
  for (const name of ['VITE_PROXY_URL', 'VITE_SUPABASE_URL']) {
    const value = env[name];
    if (!value) throw new Error(`${name} is required for a production build`);
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error(`${name} must be an HTTP(S) URL without credentials`);
    }
    if (
      env.LOCAL_PREVIEW === 'true' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    ) {
      throw new Error(`${name} must target loopback in LOCAL_PREVIEW mode`);
    }
  }
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is required');
  if (key.startsWith('sb_publishable_')) return;
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
    if (payload.role === 'anon') return;
  } catch {
    // Invalid and elevated keys both fail closed below, without printing their value.
  }
  throw new Error('The browser requires a publishable key or legacy anon key');
}
