import { describe, expect, it } from 'vitest';
import { validateBuildEnvironment } from './build-environment';

const local = {
  LOCAL_PREVIEW: 'true',
  VITE_PROXY_URL: 'http://127.0.0.1:3001',
  VITE_SUPABASE_URL: 'http://127.0.0.1:3004',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_fixture',
};

describe('public build configuration', () => {
  it('accepts explicit local destinations', () => {
    expect(() => validateBuildEnvironment(local)).not.toThrow();
  });
  it.each(['VITE_PROXY_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'])(
    'rejects missing %s instead of silently selecting a destination',
    (name) => expect(() => validateBuildEnvironment({ ...local, [name]: '' })).toThrow()
  );
  it.each(['VITE_PROXY_URL', 'VITE_SUPABASE_URL'])('rejects hosted %s for local runs', (name) => {
    expect(() => validateBuildEnvironment({ ...local, [name]: 'https://example.com' })).toThrow(
      /loopback/
    );
  });
  it.each([
    'sb_secret_do_not_publish',
    'invalid',
    `x.${Buffer.from('{"role":"service_role"}').toString('base64url')}.x`,
  ])('rejects elevated or malformed keys without exposing their values', (key) => {
    expect(() =>
      validateBuildEnvironment({ ...local, VITE_SUPABASE_PUBLISHABLE_KEY: key })
    ).toThrow(/publishable key/);
  });
  it('retains legacy anon key compatibility', () => {
    const key = `x.${Buffer.from('{"role":"anon"}').toString('base64url')}.x`;
    expect(() =>
      validateBuildEnvironment({ ...local, VITE_SUPABASE_PUBLISHABLE_KEY: key })
    ).not.toThrow();
  });
});
